"""Context extraction Pydantic models."""

from typing import List, Optional

from pydantic import BaseModel, Field


class CRMContextModel(BaseModel):
    """Pydantic model for CRM context extraction."""

    order_id: str = Field(..., description="Order ID")
    product: str = Field(..., description="Product name")
    customer_name: Optional[str] = Field(None, description="Customer name if available")
    customer_email: Optional[str] = Field(
        None, description="Customer email if available"
    )
    order_date: Optional[str] = Field(None, description="Order date if available")
    order_status: Optional[str] = Field(None, description="Order status if available")
    ticket_ids: List[str] = Field(
        default_factory=list, description="Ticket IDs mentioned"
    )


class ConfidenceScoresModel(BaseModel):
    """Pydantic model for confidence scores of AI extractions."""

    issue_type: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score (0-100) for issue type extraction",
    )
    customer_sentiment: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score (0-100) for customer sentiment extraction",
    )
    urgency_level: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score (0-100) for urgency level extraction",
    )
    customer_intent: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score (0-100) for customer intent extraction",
    )
    resolution_status: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Confidence score (0-100) for resolution status extraction",
    )


class ExtractedContextModel(BaseModel):
    """Pydantic model for extracted context from thread."""

    issue_type: str = Field(
        ...,
        description="Type of issue (e.g., damaged product, late delivery, wrong variant, return/refund request, address confusion, defective item, missing item, billing issue, cancellation request, etc.)",
    )
    customer_sentiment: str = Field(
        ..., description="Customer sentiment (positive, neutral, negative)"
    )
    urgency_level: str = Field(
        ..., description="Urgency level (low, medium, high, urgent)"
    )
    customer_intent: str = Field(
        ...,
        description="What the customer is seeking (refund, replacement, return, exchange, credit, tracking update, status inquiry, cancellation, repair, explanation, apology, etc.)",
    )
    key_phrases: List[str] = Field(
        default_factory=list, description="Key phrases extracted from conversation"
    )
