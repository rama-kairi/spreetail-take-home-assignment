"""Server-Sent Events (SSE) routes for real-time updates."""

import asyncio
import json
from typing import Dict, Optional

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import File, Summary, Thread, get_db
from services.background import task_manager

router = APIRouter(prefix="/api/events", tags=["events"])

# Store active SSE connections
_active_connections: Dict[str, asyncio.Queue] = {}


async def event_generator(file_id: Optional[str] = None, task_id: Optional[str] = None):
    """Generate SSE events for file processing updates.

    Args:
        file_id: Optional file ID to filter events.
        task_id: Optional task ID to filter events.
    """
    connection_id = f"{file_id or 'all'}_{task_id or 'all'}"
    queue: asyncio.Queue = asyncio.Queue()
    _active_connections[connection_id] = queue

    try:
        # Send initial connection event
        yield f"data: {json.dumps({'type': 'connected', 'connection_id': connection_id})}\n\n"

        # Keep connection alive and send updates
        last_processed_count = {}
        while True:
            try:
                # Check for updates every 1 second
                await asyncio.sleep(1)

                # Get database session using dependency injection pattern
                db: Session = next(get_db())

                try:
                    if file_id:
                        # Get specific file progress
                        file_db = db.query(File).filter(File.file_id == file_id).first()
                        if file_db:
                            processed_count = (
                                db.query(func.count(Summary.id))
                                .join(Thread)
                                .filter(Thread.file_id == file_db.id)
                                .scalar()
                                or 0
                            )

                            progress = (
                                (processed_count / file_db.total_threads * 100)
                                if file_db.total_threads > 0
                                else 0.0
                            )

                            # Only send update if changed
                            if last_processed_count.get(file_id) != processed_count:
                                last_processed_count[file_id] = processed_count

                                event_data = {
                                    "type": "file_progress",
                                    "file_id": file_id,
                                    "processed_threads": processed_count,
                                    "total_threads": file_db.total_threads,
                                    "progress": round(progress, 2),
                                    "status": "completed" if progress >= 100 else "processing",
                                }
                                yield f"data: {json.dumps(event_data)}\n\n"
                    else:
                        # Get all files progress
                        files_db = db.query(File).all()
                        for file_db in files_db:
                            processed_count = (
                                db.query(func.count(Summary.id))
                                .join(Thread)
                                .filter(Thread.file_id == file_db.id)
                                .scalar()
                                or 0
                            )

                            if last_processed_count.get(file_db.file_id) != processed_count:
                                last_processed_count[file_db.file_id] = processed_count

                                progress = (
                                    (processed_count / file_db.total_threads * 100)
                                    if file_db.total_threads > 0
                                    else 0.0
                                )

                                event_data = {
                                    "type": "file_progress",
                                    "file_id": file_db.file_id,
                                    "processed_threads": processed_count,
                                    "total_threads": file_db.total_threads,
                                    "progress": round(progress, 2),
                                    "status": "completed" if progress >= 100 else "processing",
                                }
                                yield f"data: {json.dumps(event_data)}\n\n"

                    # Send task status updates if task_id provided
                    if task_id:
                        task_status = task_manager.get_task_status(task_id)
                        if task_status:
                            event_data = {
                                "type": "task_status",
                                "task_id": task_id,
                                **task_status,
                            }
                            yield f"data: {json.dumps(event_data)}\n\n"

                finally:
                    db.close()

            except asyncio.CancelledError:
                break
            except Exception as e:
                error_data = {
                    "type": "error",
                    "message": str(e),
                }
                yield f"data: {json.dumps(error_data)}\n\n"

    except Exception as e:
        error_data = {
            "type": "error",
            "message": str(e),
        }
        yield f"data: {json.dumps(error_data)}\n\n"
    finally:
        # Clean up connection
        _active_connections.pop(connection_id, None)


@router.get("/stream")
async def stream_events(
    request: Request,
    file_id: Optional[str] = None,
    task_id: Optional[str] = None,
):
    """Stream Server-Sent Events for real-time updates.

    Args:
        request: FastAPI request object.
        file_id: Optional file ID to filter events.
        task_id: Optional task ID to filter events.

    Returns:
        StreamingResponse with SSE events.
    """
    return StreamingResponse(
        event_generator(file_id=file_id, task_id=task_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering for nginx
        },
    )
