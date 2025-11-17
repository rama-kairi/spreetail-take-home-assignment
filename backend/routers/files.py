"""API routes for file management."""

import uuid
from typing import List, Optional

from database import File, Summary, Thread, get_db
from database.models import FileModel, FileUploadResponse
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from fastapi import File as FastAPIFile
from services.background import (
    load_threads_from_json,
    process_threads_background,
    task_manager,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
) -> FileUploadResponse:
    """Upload JSON file with email threads for processing.

    Args:
        background_tasks: FastAPI background tasks.
        file: Uploaded JSON file.
        db: Database session.

    Returns:
        FileUploadResponse with file information.
    """
    # Generate file ID
    file_id: str = f"file-{uuid.uuid4().hex[:12]}"

    # Save uploaded file temporarily
    file_path: str = f"/tmp/{file_id}.json"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        # Load threads from JSON to get count
        threads: List = await load_threads_from_json(file_path)

        # Create file record in database
        file_db = File(
            file_id=file_id,
            file_name=file.filename or "unknown.json",
            total_threads=len(threads),
        )
        db.add(file_db)
        db.commit()
        db.refresh(file_db)

        # Register task for background processing
        task_id: str = f"task-{uuid.uuid4().hex[:12]}"
        task_manager.register_task(task_id, len(threads))

        # ALWAYS process in background to avoid blocking the HTTP response
        # This ensures the file appears immediately in the UI
        background_tasks.add_task(
            process_threads_background, threads, task_id, file_db.id
        )

        return FileUploadResponse(
            file_id=file_id,
            file_name=file.filename or "unknown.json",
            total_threads=len(threads),
            status="processing",
            message=f"Processing {len(threads)} threads in background",
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")


@router.get("/", response_model=List[FileModel])
async def get_files(db: Session = Depends(get_db)) -> List[FileModel]:
    """Get all uploaded files with progress information.

    Args:
        db: Database session.

    Returns:
        List of FileModel with progress tracking.
    """
    files_db: List[File] = db.query(File).order_by(File.uploaded_at.desc()).all()
    files: List[FileModel] = []

    for file_db in files_db:
        # Count threads with summaries (processed threads)
        processed_count = (
            db.query(func.count(Summary.id))
            .join(Thread)
            .filter(Thread.file_id == file_db.id)
            .scalar()
            or 0
        )

        # Calculate progress percentage
        progress = (
            (processed_count / file_db.total_threads * 100)
            if file_db.total_threads > 0
            else 0.0
        )

        files.append(
            FileModel(
                id=file_db.file_id,
                file_name=file_db.file_name,
                total_threads=file_db.total_threads,
                processed_threads=processed_count,
                uploaded_at=file_db.uploaded_at.isoformat(),
                created_at=file_db.created_at.isoformat(),
                updated_at=file_db.updated_at.isoformat(),
                progress=round(progress, 2),
            )
        )

    return files


@router.get("/{file_id}", response_model=FileModel)
async def get_file(file_id: str, db: Session = Depends(get_db)) -> FileModel:
    """Get specific file by ID with progress information.

    Args:
        file_id: File identifier.
        db: Database session.

    Returns:
        FileModel with progress tracking.

    Raises:
        HTTPException: If file not found.
    """
    file_db: Optional[File] = db.query(File).filter(File.file_id == file_id).first()

    if not file_db:
        raise HTTPException(status_code=404, detail="File not found")

    # Count threads with summaries (processed threads)
    processed_count = (
        db.query(func.count(Summary.id))
        .join(Thread)
        .filter(Thread.file_id == file_db.id)
        .scalar()
        or 0
    )

    # Calculate progress percentage
    progress = (
        (processed_count / file_db.total_threads * 100)
        if file_db.total_threads > 0
        else 0.0
    )

    return FileModel(
        id=file_db.file_id,
        file_name=file_db.file_name,
        total_threads=file_db.total_threads,
        processed_threads=processed_count,
        uploaded_at=file_db.uploaded_at.isoformat(),
        created_at=file_db.created_at.isoformat(),
        updated_at=file_db.updated_at.isoformat(),
        progress=round(progress, 2),
    )


@router.delete("/{file_id}")
async def delete_file(file_id: str, db: Session = Depends(get_db)) -> dict:
    """Delete a file and all associated threads.

    Args:
        file_id: File identifier.
        db: Database session.

    Returns:
        Success message.

    Raises:
        HTTPException: If file not found.
    """
    file_db: Optional[File] = db.query(File).filter(File.file_id == file_id).first()

    if not file_db:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete file (cascade will delete threads, messages, and summaries)
    db.delete(file_db)
    db.commit()

    return {"message": "File deleted successfully"}
