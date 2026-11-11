
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship

from database import Base


# ==================================================
# USER MODEL
# ==================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    # Stores user-specific settings as JSON text
    settings = Column(
        Text,
        nullable=True
    )

    # One user can have multiple transactions
    transactions = relationship(
        "Transaction",
        back_populates="owner"
    )


# ==================================================
# TRANSACTION MODEL
# ==================================================

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transaction_id = Column(
        String,
        unique=True,
        index=True
    )

    customer_name = Column(String)

    amount = Column(Float)

    payment_method = Column(String)

    status = Column(
        String,
        default="Pending"
    )

    risk_score = Column(
        Float,
        default=0
    )

    risk_level = Column(
        String,
        default="Low"
    )

    # Link transaction to its owner
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    owner = relationship(
        "User",
        back_populates="transactions"
    )
