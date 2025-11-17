"""Enum definitions for data models."""

from enum import Enum


class SenderType(str, Enum):
    """Enum for message sender type."""

    CUSTOMER = "customer"
    COMPANY = "company"


class SummaryStatus(str, Enum):
    """Enum for summary status."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
