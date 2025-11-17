"""API routes for summary management and workflow operations."""

import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Message, SessionLocal, Summary, Thread, get_db
from database.models import (
    ApproveSummaryRequest,
    MessageModel,
    RejectSummaryRequest,
    SummaryContentModel,
    SummaryModel,
    SummaryStatus,
    ThreadModel,
    UpdateSummaryRequest,
)
from services.openrouter import OpenRouterService

router = APIRouter(prefix="/api/summaries", tags=["summaries"])


@router.post("/threads/{thread_id}/summarize", response_model=SummaryModel)
async def create_summary(
    thread_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> SummaryModel:
    """Generate summary for a thread.

    Args:
        thread_id: Thread identifier.
        background_tasks: FastAPI background tasks.
        db: Database session.

    Returns:
        SummaryModel instance.

    Raises:
        HTTPException: If thread not found or summary generation fails.
    """
    # Get thread from database
    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.thread_id == thread_id).first()
    )

    if not thread_db:
        raise HTTPException(status_code=404, detail="Thread not found")

    # Check if summary already exists
    existing_summary: Optional[Summary] = (
        db.query(Summary).filter(Summary.thread_id == thread_db.id).first()
    )

    # Get messages
    messages_db = (
        db.query(Message)
        .filter(Message.thread_id == thread_db.id)
        .order_by(Message.timestamp)
        .all()
    )

    # Convert to ThreadModel
    messages: List[dict] = [
        {
            "id": msg.message_id,
            "sender": msg.sender.value,
            "timestamp": msg.timestamp,
            "body": msg.body,
        }
        for msg in messages_db
    ]

    thread_model = ThreadModel(
        thread_id=thread_db.thread_id,
        topic=thread_db.topic,
        subject=thread_db.subject,
        initiated_by=thread_db.initiated_by.value,
        order_id=thread_db.order_id,
        product=thread_db.product,
        messages=[MessageModel(**msg) for msg in messages],
    )

    try:
        # Generate summary using OpenRouter service
        openrouter_service = OpenRouterService()
        summary_result = await openrouter_service.summarize_thread(thread_model)

        # Create or update summary in database
        if existing_summary:
            summary_db = existing_summary
            summary_db.original_summary = summary_result.full_summary_text
            summary_db.edited_summary = None  # Reset edited summary on regenerate
            summary_db.status = SummaryStatus.PENDING
            summary_db.structured_data_json = summary_result.model_dump_json()
            summary_db.updated_at = datetime.utcnow()
        else:
            summary_db = Summary(
                thread_id=thread_db.id,
                summary_id=f"SUM-{thread_db.thread_id}-{int(datetime.utcnow().timestamp())}",
                original_summary=summary_result.full_summary_text,
                status=SummaryStatus.PENDING,
                structured_data_json=summary_result.model_dump_json(),
            )
            db.add(summary_db)

        db.commit()
        db.refresh(summary_db)

        thread_db: Optional[Thread] = (
            db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
        )
        thread_id: str = thread_db.thread_id if thread_db else "unknown"

        # Parse structured_data_json if available
        structured_data: Optional[SummaryContentModel] = None
        if summary_db.structured_data_json:
            try:
                structured_data_dict = json.loads(summary_db.structured_data_json)
                structured_data = SummaryContentModel(**structured_data_dict)
            except (json.JSONDecodeError, ValueError):
                pass

        return SummaryModel(
            id=summary_db.summary_id,
            thread_id=thread_id,
            original_summary=summary_db.original_summary,
            edited_summary=summary_db.edited_summary,
            status=summary_db.status.value,
            approved_by=summary_db.approved_by,
            approved_at=summary_db.approved_at.isoformat() if summary_db.approved_at else None,
            remarks=summary_db.remarks,
            rejection_reason=summary_db.rejection_reason,
            created_at=summary_db.created_at.isoformat(),
            updated_at=summary_db.updated_at.isoformat(),
            structured_data=structured_data,
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error generating summary: {str(e)}"
        )


@router.get("/", response_model=list[SummaryModel])
async def get_summaries(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[SummaryModel]:
    """Get all summaries, optionally filtered by status.

    Args:
        status: Optional status filter (pending, approved, rejected).
        db: Database session.

    Returns:
        List of SummaryModel instances.
    """
    query = db.query(Summary)

    if status:
        try:
            status_enum = SummaryStatus(status)
            query = query.filter(Summary.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    summaries_db = query.all()
    summaries: List[SummaryModel] = []

    for summary_db in summaries_db:
        thread_db: Optional[Thread] = (
            db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
        )
        thread_id: str = thread_db.thread_id if thread_db else "unknown"

        # Parse structured_data_json if available
        structured_data: Optional[SummaryContentModel] = None
        if summary_db.structured_data_json:
            try:
                structured_data_dict = json.loads(summary_db.structured_data_json)
                structured_data = SummaryContentModel(**structured_data_dict)
            except (json.JSONDecodeError, ValueError):
                pass

        summaries.append(
            SummaryModel(
                id=summary_db.summary_id,
                thread_id=thread_id,
                original_summary=summary_db.original_summary,
                edited_summary=summary_db.edited_summary,
                status=summary_db.status.value,
                approved_by=summary_db.approved_by,
                approved_at=summary_db.approved_at.isoformat()
                if summary_db.approved_at
                else None,
                remarks=summary_db.remarks,
                rejection_reason=summary_db.rejection_reason,
                created_at=summary_db.created_at.isoformat(),
                updated_at=summary_db.updated_at.isoformat(),
                structured_data=structured_data,
            )
        )

    return summaries


@router.get("/{summary_id}", response_model=SummaryModel)
async def get_summary(
    summary_id: str,
    db: Session = Depends(get_db),
) -> SummaryModel:
    """Get a specific summary by ID.

    Args:
        summary_id: Summary identifier.
        db: Database session.

    Returns:
        SummaryModel instance.

    Raises:
        HTTPException: If summary not found.
    """
    summary_db: Optional[Summary] = (
        db.query(Summary).filter(Summary.summary_id == summary_id).first()
    )

    if not summary_db:
        raise HTTPException(status_code=404, detail="Summary not found")

    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
    )
    thread_id: str = thread_db.thread_id if thread_db else "unknown"

    # Parse structured_data_json if available
    structured_data: Optional[SummaryContentModel] = None
    if summary_db.structured_data_json:
        try:
            structured_data_dict = json.loads(summary_db.structured_data_json)
            structured_data = SummaryContentModel(**structured_data_dict)
        except (json.JSONDecodeError, ValueError):
            pass

    return SummaryModel(
        id=summary_db.summary_id,
        thread_id=thread_id,
        original_summary=summary_db.original_summary,
        edited_summary=summary_db.edited_summary,
        status=summary_db.status.value,
        approved_by=summary_db.approved_by,
        approved_at=summary_db.approved_at.isoformat() if summary_db.approved_at else None,
        remarks=summary_db.remarks,
        rejection_reason=summary_db.rejection_reason,
        created_at=summary_db.created_at.isoformat(),
        updated_at=summary_db.updated_at.isoformat(),
        structured_data=structured_data,
    )


@router.put("/{summary_id}", response_model=SummaryModel)
async def update_summary(
    summary_id: str,
    request: UpdateSummaryRequest,
    db: Session = Depends(get_db),
) -> SummaryModel:
    """Update (edit) a summary.

    Args:
        summary_id: Summary identifier.
        request: Update request with edited summary.
        db: Database session.

    Returns:
        Updated SummaryModel instance.

    Raises:
        HTTPException: If summary not found.
    """
    summary_db: Optional[Summary] = (
        db.query(Summary).filter(Summary.summary_id == summary_id).first()
    )

    if not summary_db:
        raise HTTPException(status_code=404, detail="Summary not found")

    summary_db.edited_summary = request.edited_summary
    summary_db.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(summary_db)

    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
    )
    thread_id: str = thread_db.thread_id if thread_db else "unknown"

    # Parse structured_data_json if available
    structured_data: Optional[SummaryContentModel] = None
    if summary_db.structured_data_json:
        try:
            structured_data_dict = json.loads(summary_db.structured_data_json)
            structured_data = SummaryContentModel(**structured_data_dict)
        except (json.JSONDecodeError, ValueError):
            pass

    return SummaryModel(
        id=summary_db.summary_id,
        thread_id=thread_id,
        original_summary=summary_db.original_summary,
        edited_summary=summary_db.edited_summary,
        status=summary_db.status.value,
        approved_by=summary_db.approved_by,
        approved_at=summary_db.approved_at.isoformat() if summary_db.approved_at else None,
        remarks=summary_db.remarks,
        rejection_reason=summary_db.rejection_reason,
        created_at=summary_db.created_at.isoformat(),
        updated_at=summary_db.updated_at.isoformat(),
        structured_data=structured_data,
    )


@router.post("/{summary_id}/approve", response_model=SummaryModel)
async def approve_summary(
    summary_id: str,
    request: ApproveSummaryRequest,
    db: Session = Depends(get_db),
) -> SummaryModel:
    """Approve a summary.

    TODO: Add authentication to get current user for approved_by field.

    Args:
        summary_id: Summary identifier.
        request: Approve request with required remarks.
        db: Database session.

    Returns:
        Approved SummaryModel instance.

    Raises:
        HTTPException: If summary not found.
    """
    summary_db: Optional[Summary] = (
        db.query(Summary).filter(Summary.summary_id == summary_id).first()
    )

    if not summary_db:
        raise HTTPException(status_code=404, detail="Summary not found")

    # TODO: Get current authenticated user
    approved_by: str = "system"  # Placeholder

    summary_db.status = SummaryStatus.APPROVED
    summary_db.approved_by = approved_by
    summary_db.approved_at = datetime.utcnow()
    summary_db.remarks = request.remarks
    summary_db.rejection_reason = None  # Clear rejection reason if it exists
    summary_db.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(summary_db)

    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
    )
    thread_id: str = thread_db.thread_id if thread_db else "unknown"

    # Parse structured_data_json if available
    structured_data: Optional[SummaryContentModel] = None
    if summary_db.structured_data_json:
        try:
            structured_data_dict = json.loads(summary_db.structured_data_json)
            structured_data = SummaryContentModel(**structured_data_dict)
        except (json.JSONDecodeError, ValueError):
            pass

    return SummaryModel(
        id=summary_db.summary_id,
        thread_id=thread_id,
        original_summary=summary_db.original_summary,
        edited_summary=summary_db.edited_summary,
        status=summary_db.status.value,
        approved_by=summary_db.approved_by,
        approved_at=summary_db.approved_at.isoformat() if summary_db.approved_at else None,
        remarks=summary_db.remarks,
        rejection_reason=summary_db.rejection_reason,
        created_at=summary_db.created_at.isoformat(),
        updated_at=summary_db.updated_at.isoformat(),
        structured_data=structured_data,
    )


@router.post("/{summary_id}/reject", response_model=SummaryModel)
async def reject_summary(
    summary_id: str,
    request: RejectSummaryRequest,
    db: Session = Depends(get_db),
) -> SummaryModel:
    """Reject a summary.

    Args:
        summary_id: Summary identifier.
        request: Reject request with reason.
        db: Database session.

    Returns:
        Rejected SummaryModel instance.

    Raises:
        HTTPException: If summary not found.
    """
    summary_db: Optional[Summary] = (
        db.query(Summary).filter(Summary.summary_id == summary_id).first()
    )

    if not summary_db:
        raise HTTPException(status_code=404, detail="Summary not found")

    summary_db.status = SummaryStatus.REJECTED
    summary_db.rejection_reason = request.reason
    summary_db.remarks = None  # Clear remarks if it exists
    summary_db.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(summary_db)

    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
    )
    thread_id: str = thread_db.thread_id if thread_db else "unknown"

    # Parse structured_data_json if available
    structured_data: Optional[SummaryContentModel] = None
    if summary_db.structured_data_json:
        try:
            structured_data_dict = json.loads(summary_db.structured_data_json)
            structured_data = SummaryContentModel(**structured_data_dict)
        except (json.JSONDecodeError, ValueError):
            pass

    return SummaryModel(
        id=summary_db.summary_id,
        thread_id=thread_id,
        original_summary=summary_db.original_summary,
        edited_summary=summary_db.edited_summary,
        status=summary_db.status.value,
        approved_by=summary_db.approved_by,
        approved_at=summary_db.approved_at.isoformat() if summary_db.approved_at else None,
        remarks=summary_db.remarks,
        rejection_reason=summary_db.rejection_reason,
        created_at=summary_db.created_at.isoformat(),
        updated_at=summary_db.updated_at.isoformat(),
        structured_data=structured_data,
    )


@router.post("/{summary_id}/undo", response_model=SummaryModel)
async def undo_summary_action(
    summary_id: str,
    db: Session = Depends(get_db),
) -> SummaryModel:
    """Undo approval/rejection and reset summary status to pending.

    Args:
        summary_id: Summary identifier.
        db: Database session.

    Returns:
        SummaryModel instance with status reset to pending.

    Raises:
        HTTPException: If summary not found.
    """
    summary_db: Optional[Summary] = (
        db.query(Summary).filter(Summary.summary_id == summary_id).first()
    )

    if not summary_db:
        raise HTTPException(status_code=404, detail="Summary not found")

    # Reset to pending status and clear approval/rejection data
    summary_db.status = SummaryStatus.PENDING
    summary_db.approved_by = None
    summary_db.approved_at = None
    summary_db.remarks = None
    summary_db.rejection_reason = None
    summary_db.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(summary_db)

    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.id == summary_db.thread_id).first()
    )
    thread_id: str = thread_db.thread_id if thread_db else "unknown"

    # Parse structured_data_json if available
    structured_data: Optional[SummaryContentModel] = None
    if summary_db.structured_data_json:
        try:
            structured_data_dict = json.loads(summary_db.structured_data_json)
            structured_data = SummaryContentModel(**structured_data_dict)
        except (json.JSONDecodeError, ValueError):
            pass

    return SummaryModel(
        id=summary_db.summary_id,
        thread_id=thread_id,
        original_summary=summary_db.original_summary,
        edited_summary=summary_db.edited_summary,
        status=summary_db.status.value,
        approved_by=summary_db.approved_by,
        approved_at=summary_db.approved_at.isoformat() if summary_db.approved_at else None,
        remarks=summary_db.remarks,
        rejection_reason=summary_db.rejection_reason,
        created_at=summary_db.created_at.isoformat(),
        updated_at=summary_db.updated_at.isoformat(),
        structured_data=structured_data,
    )
