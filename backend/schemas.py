
from pydantic import BaseModel, Field, ConfigDict


class TransactionCreate(BaseModel):
    transaction_id: str = Field(
        min_length=1,
        max_length=100
    )

    customer_name: str = Field(
        min_length=1,
        max_length=150
    )

    amount: float = Field(
        gt=0
    )

    payment_method: str = Field(
        min_length=1,
        max_length=50
    )


class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    customer_name: str
    amount: float
    payment_method: str
    status: str
    risk_score: float
    risk_level: str

    model_config = ConfigDict(
        from_attributes=True
    )
