
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

from fastapi import (
    APIRouter,
    HTTPException,
    Depends
)

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import Transaction, User
from auth import get_current_user


# ==================================================
# ENVIRONMENT CONFIGURATION
# ==================================================

load_dotenv(Path(__file__).resolve().parent / ".env")

PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox").lower()
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")

if PAYPAL_MODE != "sandbox":
    raise RuntimeError(
        "This integration is configured for Sandbox only."
    )

if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
    raise RuntimeError(
        "PayPal Sandbox credentials are missing from backend/.env"
    )

PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"

DEMO_AMOUNT = "1.00"
DEMO_CURRENCY = "USD"


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/api/payments",
    tags=["PayPal Sandbox Payments"]
)


# ==================================================
# REQUEST SCHEMAS
# ==================================================

class OrderRequest(BaseModel):
    customer_name: str = Field(
        min_length=1,
        max_length=150
    )


class CaptureRequest(BaseModel):
    order_id: str = Field(
        min_length=1,
        max_length=100
    )


# ==================================================
# PAYPAL CONFIGURATION
# ==================================================

@router.get("/paypal-config")
def get_paypal_config():
    return {
        "client_id": PAYPAL_CLIENT_ID,
        "currency": DEMO_CURRENCY,
        "mode": "sandbox"
    }


# ==================================================
# GET PAYPAL ACCESS TOKEN
# ==================================================

def get_paypal_access_token():

    try:
        response = requests.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            auth=(
                PAYPAL_CLIENT_ID,
                PAYPAL_CLIENT_SECRET
            ),
            headers={
                "Accept": "application/json",
                "Accept-Language": "en_US"
            },
            data={
                "grant_type": "client_credentials"
            },
            timeout=30
        )

        response.raise_for_status()

        return response.json()["access_token"]

    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail="Unable to authenticate with PayPal Sandbox"
        )


# ==================================================
# PAYPAL API REQUEST HELPER
# ==================================================

def paypal_request(
    method,
    endpoint,
    access_token,
    payload=None
):

    try:
        response = requests.request(
            method=method,
            url=f"{PAYPAL_BASE_URL}{endpoint}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json=payload,
            timeout=30
        )

        if not response.ok:
            try:
                error_data = response.json()
            except ValueError:
                error_data = response.text[:1000]

            raise HTTPException(
                status_code=502,
                detail={
                    "message": "PayPal Sandbox API request failed",
                    "paypal_status": response.status_code,
                    "paypal_error": error_data
                }
            )

        return (
            response.json()
            if response.content
            else {}
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to PayPal Sandbox"
        )


# ==================================================
# CREATE PAYPAL ORDER
# ==================================================

@router.post("/create-order")
def create_order(
    data: OrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    access_token = get_paypal_access_token()

    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": DEMO_CURRENCY,
                    "value": DEMO_AMOUNT
                }
            }
        ],
        "payment_source": {
            "paypal": {
                "experience_context": {
                    "brand_name": "FlowGuard AI",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "PAY_NOW"
                }
            }
        }
    }

    order = paypal_request(
        "POST",
        "/v2/checkout/orders",
        access_token,
        order_payload
    )

    order_id = order.get("id")

    if not order_id:
        raise HTTPException(
            status_code=502,
            detail="PayPal did not return an order ID"
        )

    # Find PayPal approval link.
    # Depending on the PayPal checkout flow,
    # the link can be "approve" or "payer-action".

    approval_url = next(
        (
            link.get("href")
            for link in order.get("links", [])
            if link.get("rel") in (
                "approve",
                "payer-action"
            )
        ),
        None
    )

    if not approval_url:
        returned_links = [
            {
                "rel": link.get("rel"),
                "href": link.get("href")
            }
            for link in order.get("links", [])
        ]

        raise HTTPException(
            status_code=502,
            detail={
                "message": "PayPal approval URL was not returned",
                "order_id": order_id,
                "returned_links": returned_links
            }
        )

    # Save transaction with logged-in user's ID.

    try:
        transaction = Transaction(
            transaction_id=order_id,
            customer_name=data.customer_name,
            amount=1.00,
            payment_method="PayPal",
            status="Pending",
            risk_score=0,
            risk_level="Low",
            user_id=current_user.id
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not save PayPal transaction"
        )

    return {
        "order_id": order_id,
        "approval_url": approval_url,
        "client_id": PAYPAL_CLIENT_ID,
        "amount": DEMO_AMOUNT,
        "currency": DEMO_CURRENCY,
        "mode": "sandbox"
    }


# ==================================================
# CAPTURE PAYPAL ORDER
# ==================================================

@router.post("/capture-order")
def capture_order(
    data: CaptureRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Find the transaction belonging to this user only.

    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == data.order_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    if transaction.payment_method != "PayPal":
        raise HTTPException(
            status_code=400,
            detail="This is not a PayPal transaction"
        )

    if transaction.status == "Completed":
        return {
            "status": "Completed",
            "transaction_id": transaction.transaction_id,
            "message": "Payment was already captured"
        }

    if transaction.status != "Pending":
        raise HTTPException(
            status_code=409,
            detail="Transaction is not pending"
        )

    access_token = get_paypal_access_token()

    # Capture the order through PayPal's server API.

    result = paypal_request(
        "POST",
        f"/v2/checkout/orders/{data.order_id}/capture",
        access_token,
        {}
    )

    if result.get("id") != data.order_id:
        raise HTTPException(
            status_code=400,
            detail="PayPal order ID mismatch"
        )

    if result.get("status") != "COMPLETED":
        return {
            "status": "Pending",
            "message": "PayPal payment has not completed"
        }

    purchase_units = result.get("purchase_units", [])

    if not purchase_units:
        raise HTTPException(
            status_code=400,
            detail="PayPal purchase details are missing"
        )

    captures = (
        purchase_units[0]
        .get("payments", {})
        .get("captures", [])
    )

    valid_capture = any(
        capture.get("status") == "COMPLETED"
        and capture.get("amount", {}).get("currency_code")
        == DEMO_CURRENCY
        and capture.get("amount", {}).get("value")
        == DEMO_AMOUNT
        for capture in captures
    )

    if not valid_capture:
        raise HTTPException(
            status_code=400,
            detail="PayPal capture amount or currency mismatch"
        )

    try:
        transaction.status = "Completed"

        db.commit()
        db.refresh(transaction)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Payment captured but transaction update failed"
        )

    return {
        "status": "Completed",
        "transaction_id": transaction.transaction_id,
        "message": "PayPal Sandbox payment captured successfully"
    }
