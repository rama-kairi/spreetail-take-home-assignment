"""Thread-related Pydantic models."""

from typing import List

from pydantic import BaseModel, Field

from database.models.enums import SenderType
from database.models.message import MessageModel


class ThreadModel(BaseModel):
    """Pydantic model for email thread."""

    thread_id: str = Field(..., description="Unique thread identifier")
    topic: str = Field(..., description="Thread topic/category")
    subject: str = Field(..., description="Email subject line")
    initiated_by: SenderType = Field(..., description="Who initiated the thread")
    order_id: str = Field(..., description="Associated order ID")
    product: str = Field(..., description="Product name")
    messages: List[MessageModel] = Field(..., description="List of messages in thread")

    class Config:
        """Pydantic config."""

        use_enum_values = True


class ThreadsResponseModel(BaseModel):
    """Pydantic model for threads response."""

    version: str = Field(..., description="Data version")
    generated_at: str = Field(..., description="Generation timestamp")
    description: str = Field(..., description="Description of the dataset")
    threads: List[ThreadModel] = Field(..., description="List of email threads")
