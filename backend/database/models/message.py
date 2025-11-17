"""Message-related Pydantic models."""

from pydantic import BaseModel, Field

from database.models.enums import SenderType


class MessageModel(BaseModel):
    """Pydantic model for email message."""

    id: str = Field(..., description="Unique message identifier")
    sender: SenderType = Field(..., description="Message sender type")
    timestamp: str = Field(..., description="Message timestamp in ISO format")
    body: str = Field(..., description="Message body content")

    class Config:
        """Pydantic config."""

        use_enum_values = True
