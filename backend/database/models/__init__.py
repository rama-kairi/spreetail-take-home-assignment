"""Pydantic models for data validation and type safety.

This module re-exports all models for backward compatibility.
"""

# Enums
from database.models.enums import SenderType, SummaryStatus

# File models
from database.models.file import FileModel, FileUploadResponse

# Message models
from database.models.message import MessageModel

# Thread models
from database.models.thread import ThreadModel, ThreadsResponseModel

# Context models
from database.models.context import (
    ConfidenceScoresModel,
    CRMContextModel,
    ExtractedContextModel,
)

# Summary models
from database.models.summary import (
    ApproveSummaryRequest,
    CreateSummaryRequest,
    RejectSummaryRequest,
    SummaryContentModel,
    SummaryModel,
    UpdateSummaryRequest,
)

__all__ = [
    # Enums
    "SenderType",
    "SummaryStatus",
    # File models
    "FileModel",
    "FileUploadResponse",
    # Message models
    "MessageModel",
    # Thread models
    "ThreadModel",
    "ThreadsResponseModel",
    # Context models
    "CRMContextModel",
    "ConfidenceScoresModel",
    "ExtractedContextModel",
    # Summary models
    "SummaryContentModel",
    "SummaryModel",
    "CreateSummaryRequest",
    "UpdateSummaryRequest",
    "ApproveSummaryRequest",
    "RejectSummaryRequest",
]
