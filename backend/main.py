
from enum import Enum

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    Query
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from database import engine, Base, get_db

from models import Transaction, User

from schemas import (
    TransactionCreate,
    TransactionResponse
)

from auth import router as auth_router, get_current_user

from payment import router as payment_router

from fraud_ai import router as fraud_router

from settings import router as settings_router


# ==================================================
# CREATE DATABASE TABLES
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="FlowGuard AI",
    description="Financial Fraud Detection Backend",
    version="1.4.0"
)


# ==================================================
# CORS CONFIGURATION
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://flowguardai-cl1e.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# REGISTER ROUTERS
# ==================================================

app.include_router(auth_router)

app.include_router(payment_router)

app.include_router(fraud_router)

app.include_router(settings_router)


# ==================================================
# TRANSACTION STATUS
# ==================================================

class TransactionStatus(str, Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"
    FAILED = "Failed"
    BLOCKED = "Blocked"


class TransactionStatusUpdate(BaseModel):
    status: TransactionStatus


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to FlowGuard AI Backend",
        "status": "running"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health_check(
    db: Session = Depends(get_db)
):
    try:
        db.query(Transaction.id).first()

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )


# ==================================================
# CREATE TRANSACTION
# ==================================================

@app.post(
    "/api/transactions",
    response_model=TransactionResponse
)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_transaction = db.query(
        Transaction
    ).filter(
        Transaction.transaction_id == transaction.transaction_id
    ).first()

    if existing_transaction:
        raise HTTPException(
            status_code=400,
            detail="Transaction ID already exists"
        )

    new_transaction = Transaction(
        transaction_id=transaction.transaction_id,
        customer_name=transaction.customer_name,
        amount=transaction.amount,
        payment_method=transaction.payment_method,
        status="Pending",
        risk_score=0,
        risk_level="Low",
        user_id=current_user.id
    )

    try:
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to create transaction"
        )

    return new_transaction


# ==================================================
# GET ALL USER TRANSACTIONS
# ==================================================

@app.get(
    "/api/transactions",
    response_model=list[TransactionResponse]
)
def get_transactions(
    risk_level: str | None = Query(default=None),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    )

    if risk_level:
        query = query.filter(
            Transaction.risk_level.ilike(risk_level)
        )

    if status:
        query = query.filter(
            Transaction.status.ilike(status)
        )

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            or_(
                Transaction.transaction_id.ilike(search_value),
                Transaction.customer_name.ilike(search_value)
            )
        )

    transactions = query.order_by(
        Transaction.id.desc()
    ).all()

    return transactions


# ==================================================
# GET SINGLE USER TRANSACTION
# ==================================================

@app.get(
    "/api/transactions/{transaction_id}",
    response_model=TransactionResponse
)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction


# ==================================================
# UPDATE TRANSACTION STATUS
# ==================================================

@app.patch("/api/transactions/{transaction_id}/status")
def update_transaction_status(
    transaction_id: str,
    data: TransactionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    if transaction.payment_method in ["Razorpay", "PayPal"]:
        raise HTTPException(
            status_code=403,
            detail=(
                "Payment provider transactions can only "
                "be updated through verified payment processing."
            )
        )

    if transaction.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update transaction with status {transaction.status}"
        )

    transaction.status = data.status.value

    try:
        db.commit()
        db.refresh(transaction)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update transaction status"
        )

    return {
        "message": "Transaction status updated successfully",
        "transaction_id": transaction.transaction_id,
        "status": transaction.status
    }


# ==================================================
# DASHBOARD STATISTICS
# ==================================================

@app.get("/api/dashboard")
def dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    user_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    )

    total_transactions = user_transactions.count()

    total_amount = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id == current_user.id
    ).scalar()

    high_risk_transactions = user_transactions.filter(
        Transaction.risk_level == "High"
    ).count()

    medium_risk_transactions = user_transactions.filter(
        Transaction.risk_level == "Medium"
    ).count()

    low_risk_transactions = user_transactions.filter(
        Transaction.risk_level == "Low"
    ).count()

    average_risk_score = db.query(
        func.coalesce(func.avg(Transaction.risk_score), 0)
    ).filter(
        Transaction.user_id == current_user.id
    ).scalar()

    completed_transactions = user_transactions.filter(
        Transaction.status == "Completed"
    ).count()

    pending_transactions = user_transactions.filter(
        Transaction.status == "Pending"
    ).count()

    failed_transactions = user_transactions.filter(
        Transaction.status == "Failed"
    ).count()

    blocked_transactions = user_transactions.filter(
        Transaction.status == "Blocked"
    ).count()

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        },

        "total_transactions": total_transactions,

        "total_amount": float(total_amount or 0),

        "fraud_detected": high_risk_transactions,

        "high_risk_transactions": high_risk_transactions,

        "medium_risk_transactions": medium_risk_transactions,

        "low_risk_transactions": low_risk_transactions,

        "average_risk_score": round(
            float(average_risk_score or 0), 2
        ),

        "completed_transactions": completed_transactions,

        "pending_transactions": pending_transactions,

        "failed_transactions": failed_transactions,

        "blocked_transactions": blocked_transactions
    }
