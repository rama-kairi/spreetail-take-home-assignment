"""API routes for thread management."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import File, Message, Thread, get_db
from database.models import (
    MessageModel,
    ThreadModel,
    ThreadsResponseModel,
)

router = APIRouter(prefix="/api/threads", tags=["threads"])


@router.get("/", response_model=ThreadsResponseModel)
async def get_threads(
    file_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> ThreadsResponseModel:
    """Get threads, optionally filtered by file_id.

    Args:
        file_id: Optional file ID to filter threads by.
        db: Database session.

    Returns:
        ThreadsResponseModel containing filtered threads.
    """
    # Build query - filter by file_id if provided
    query = db.query(Thread)
    if file_id:
        # Find the File record by file_id (string identifier)
        file_db = db.query(File).filter(File.file_id == file_id).first()
        if file_db:
            # Filter threads by the File's internal ID
            query = query.filter(Thread.file_id == file_db.id)
        else:
            # File not found, return empty list
            return ThreadsResponseModel(
                version="v2",
                generated_at="2025-09-15T10:39:29",
                description=f"CE email threads for file {file_id}",
                threads=[],
            )

    threads_db: List[Thread] = query.all()
    threads: List[ThreadModel] = []

    for thread_db in threads_db:
        messages_db: List[Message] = (
            db.query(Message)
            .filter(Message.thread_id == thread_db.id)
            .order_by(Message.timestamp)
            .all()
        )

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

        threads.append(thread_model)

    # Note: Summaries are fetched separately via /api/summaries endpoint
    # Frontend should merge summaries with threads based on thread_id

    return ThreadsResponseModel(
        version="v2",
        generated_at="2025-09-15T10:39:29",
        description="CE email threads loaded from database",
        threads=threads,
    )


@router.get("/{thread_id}", response_model=ThreadModel)
async def get_thread(
    thread_id: str,
    db: Session = Depends(get_db),
) -> ThreadModel:
    """Get a specific thread by ID.

    Args:
        thread_id: Thread identifier.
        db: Database session.

    Returns:
        ThreadModel instance.

    Raises:
        HTTPException: If thread not found.
    """
    thread_db: Optional[Thread] = (
        db.query(Thread).filter(Thread.thread_id == thread_id).first()
    )

    if not thread_db:
        raise HTTPException(status_code=404, detail="Thread not found")

    messages_db: List[Message] = (
        db.query(Message)
        .filter(Message.thread_id == thread_db.id)
        .order_by(Message.timestamp)
        .all()
    )

    messages: List[dict] = [
        {
            "id": msg.message_id,
            "sender": msg.sender.value,
            "timestamp": msg.timestamp,
            "body": msg.body,
        }
        for msg in messages_db
    ]

    return ThreadModel(
        thread_id=thread_db.thread_id,
        topic=thread_db.topic,
        subject=thread_db.subject,
        initiated_by=thread_db.initiated_by.value,
        order_id=thread_db.order_id,
        product=thread_db.product,
        messages=[MessageModel(**msg) for msg in messages],
    )


@router.get("/task/{task_id}/status")
async def get_task_status(task_id: str) -> dict:
    """Get status of background processing task.

    Args:
        task_id: Task identifier.

    Returns:
        Task status dictionary.

    Raises:
        HTTPException: If task not found.
    """
    status: Optional[dict] = task_manager.get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")

    return status
