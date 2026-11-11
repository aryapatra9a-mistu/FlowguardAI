
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import get_current_user


router = APIRouter(
    prefix="/api/settings",
    tags=["User Settings"]
)


class SettingsUpdate(BaseModel):
    profile: dict = Field(default_factory=dict)
    preferences: dict = Field(default_factory=dict)
    payment: dict = Field(default_factory=dict)
    appearance: dict = Field(default_factory=dict)


def get_safe_settings(data):
    """
    Only retain supported, non-bank settings.
    Never store bank account numbers or IFSC codes here.
    """

    return {
        "profile": {
            "phone": str(data.get("profile", {}).get("phone", "")),
            "state": str(data.get("profile", {}).get("state", "")),
            "city": str(data.get("profile", {}).get("city", ""))
        },
        "preferences": data.get("preferences", {}),
        "payment": {
            "method": data.get("payment", {}).get("method", "upi"),
            "upiId": str(data.get("payment", {}).get("upiId", "")),
            "paypalEmail": str(
                data.get("payment", {}).get("paypalEmail", "")
            )
        },
        "appearance": data.get("appearance", {})
    }


@router.get("/")
def get_settings(
    current_user: User = Depends(get_current_user)
):
    try:
        saved = json.loads(current_user.settings or "{}")
    except (json.JSONDecodeError, TypeError):
        saved = {}

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        },
        "settings": saved
    }


@router.put("/")
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    safe_settings = get_safe_settings(data.model_dump())

    try:
        current_user.settings = json.dumps(safe_settings)
        db.commit()
        db.refresh(current_user)

        return {
            "message": "Settings saved successfully",
            "settings": safe_settings
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save settings"
        )
