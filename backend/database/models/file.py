"""File-related Pydantic models."""

from pydantic import BaseModel, Field


class FileModel(BaseModel):
    """Pydantic model for uploaded file."""

    id: str = Field(..., description="Unique file identifier")
    file_name: str = Field(..., description="Original file name")
    total_threads: int = Field(..., description="Total number of threads in file")
    processed_threads: int = Field(..., description="Number of threads with summaries")
    uploaded_at: str = Field(..., description="Upload timestamp in ISO format")
    created_at: str = Field(..., description="Creation timestamp in ISO format")
    updated_at: str = Field(..., description="Last update timestamp in ISO format")
    progress: float = Field(..., description="Processing progress percentage (0-100)")


class FileUploadResponse(BaseModel):
    """Pydantic model for file upload response."""

    file_id: str = Field(..., description="File identifier")
    file_name: str = Field(..., description="File name")
    total_threads: int = Field(..., description="Total threads in file")
    status: str = Field(..., description="Upload status")
    message: str = Field(..., description="Status message")
