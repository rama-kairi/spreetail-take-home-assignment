"""Summary-related Pydantic models."""

from typing import List, Optional

from pydantic import BaseModel, Field

from database.models.context import (
    ConfidenceScoresModel,
    CRMContextModel,
    ExtractedContextModel,
)
from database.models.enums import SummaryStatus


class SummaryContentModel(BaseModel):
    """Pydantic model for structured summary content."""

    issue_summary: str = Field(
        ..., description="Brief summary of the issue (2-3 sentences)"
    )
    key_details: CRMContextModel = Field(..., description="Key CRM details")
    context_extraction: ExtractedContextModel = Field(
        ..., description="Extracted context information"
    )
    resolution_status: str = Field(
        ...,
        description="Resolution status (resolved, partially resolved, pending, escalated)",
    )
    full_summary_text: str = Field(
        ..., description="Full formatted summary text for display"
    )
    confidence_scores: Optional[ConfidenceScoresModel] = Field(
        None, description="Confidence scores for AI extractions (0-100)"
    )


class SummaryModel(BaseModel):
    """Pydantic model for summary."""

    id: str = Field(..., description="Unique summary identifier")
    thread_id: str = Field(..., description="Associated thread ID")
    original_summary: str = Field(..., description="Original AI-generated summary")
    edited_summary: Optional[str] = Field(
        None, description="Edited summary by human reviewer"
    )
    status: SummaryStatus = Field(..., description="Summary status")
    approved_by: Optional[str] = Field(
        None, description="User who approved the summary"
    )
    approved_at: Optional[str] = Field(
        None, description="Approval timestamp in ISO format"
    )
    remarks: Optional[str] = Field(None, description="Remarks/notes for approval")
    rejection_reason: Optional[str] = Field(None, description="Reason for rejection")
    created_at: str = Field(..., description="Creation timestamp in ISO format")
    updated_at: str = Field(..., description="Last update timestamp in ISO format")
    structured_data: Optional[SummaryContentModel] = Field(
        None, description="Structured summary data"
    )

    class Config:
        """Pydantic config."""

        use_enum_values = True


class CreateSummaryRequest(BaseModel):
    """Pydantic model for create summary request."""

    thread_id: str = Field(..., description="Thread ID to summarize")


class UpdateSummaryRequest(BaseModel):
    """Pydantic model for update summary request."""

    edited_summary: str = Field(..., description="Edited summary text")


class ApproveSummaryRequest(BaseModel):
    """Pydantic model for approve summary request."""

    remarks: str = Field(..., description="Required remarks/notes for approval")


class RejectSummaryRequest(BaseModel):
    """Pydantic model for reject summary request."""

    reason: str = Field(..., description="Reason for rejection")
