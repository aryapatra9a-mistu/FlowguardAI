
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/api/ai",
    tags=["TrustGuard AI"]
)


class TransactionRiskInput(BaseModel):

    amount: float = Field(gt=0)

    transaction_count_1h: int = Field(ge=0)

    failed_attempts_24h: int = Field(ge=0)

    new_device: bool = False


@router.post("/predict-risk")
def predict_risk(data: TransactionRiskInput):

    score = 0
    reasons = []

    # Large transaction
    if data.amount > 20000:

        score += 25
        reasons.append("Large transaction amount")

    # High transaction frequency
    if data.transaction_count_1h >= 5:

        score += 30
        reasons.append("Unusual transaction frequency")

    # Repeated payment failures
    if data.failed_attempts_24h >= 3:

        score += 30
        reasons.append("Multiple failed payment attempts")

    # New device
    if data.new_device:

        score += 15
        reasons.append("Unrecognized device")

    score = min(score, 100)

    # Risk classification
    if score >= 70:

        level = "High"
        action = "review"

    elif score >= 40:

        level = "Medium"
        action = "review"

    else:

        level = "Low"
        action = "allow"

    return {
        "model": "TrustGuard",
        "risk_score": score,
        "risk_level": level,
        "action": action,
        "reasons": reasons
    }
