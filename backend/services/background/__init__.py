"""Background task processing for large email thread uploads.

Note: For production-ready environments, this should use Kafka for message queuing
and Redis for job state management. For now, we use FastAPI BackgroundTasks
for simplicity in the prototype.
"""

import asyncio
import os
from typing import Dict, List, Optional

from database.models import ThreadModel

from services.background.database_ops import prepare_thread_in_db
from services.background.json_loader import load_threads_from_json
from services.background.task_manager import BackgroundTaskManager
from services.background.thread_processor import process_thread_with_api
from services.openrouter import OpenRouterService

# Global task manager instance
task_manager: BackgroundTaskManager = BackgroundTaskManager()

# Configuration for concurrent processing
# Default to 2 concurrent workers for SQLite (reduced to avoid database locks)
# For PostgreSQL, can increase to 3-5. Set MAX_WORKERS environment variable to override
DEFAULT_MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "2"))


async def process_threads_background(
    threads_data: List[ThreadModel],
    task_id: str,
    file_id: Optional[int] = None,
    max_concurrent_api_calls: int = 5,
) -> None:
    """Process threads in background with truly concurrent API calls.

    Strategy:
    1. First, prepare all threads in DB (fast, sequential to avoid DB locks)
    2. Then, make ALL API calls concurrently using httpx (no waiting)
    3. As each API response arrives, immediately save to DB
    4. Update progress as each completes

    Args:
        threads_data: List of thread models to process.
        task_id: Task identifier for tracking.
        file_id: Optional file ID to associate threads with.
        max_concurrent_api_calls: Max concurrent API calls (httpx handles connection pooling).

    Note: Task should already be registered before calling this function.
    """
    try:
        print(
            f"Starting background processing for {len(threads_data)} threads (task: {task_id})"
        )

        # Step 1: Prepare all threads in database first (fast, can be sequential)
        # This avoids DB locks during API calls
        print("Preparing threads in database...")
        thread_db_ids: Dict[str, Optional[int]] = {}
        for thread_model in threads_data:
            thread_db_id = await prepare_thread_in_db(thread_model, file_id)
            thread_db_ids[thread_model.thread_id] = thread_db_id
            if thread_db_id is None:
                print(
                    f"Warning: Failed to prepare thread {thread_model.thread_id} in DB"
                )

        prepared_count = sum(1 for tid in thread_db_ids.values() if tid is not None)
        print(f"Prepared {prepared_count}/{len(threads_data)} threads in database")

        # Step 2: Make ALL API calls concurrently using httpx
        # httpx.AsyncClient handles connection pooling and concurrency automatically
        print("Starting concurrent API calls...")
        async with OpenRouterService() as openrouter_service:
            # Create tasks for all API calls - they will run concurrently
            api_tasks = [
                process_thread_with_api(
                    thread_model=thread_model,
                    thread_db_id=thread_db_ids.get(thread_model.thread_id),
                    task_id=task_id,
                    openrouter_service=openrouter_service,
                    task_manager=task_manager,
                )
                for thread_model in threads_data
                if thread_db_ids.get(thread_model.thread_id) is not None
            ]

            # Process all API calls concurrently - httpx handles the concurrency
            # Results are written to DB as each API response arrives
            results = await asyncio.gather(*api_tasks, return_exceptions=True)

            # Count successes and failures
            success_count = sum(1 for r in results if isinstance(r, tuple) and r[0])
            failure_count = len(results) - success_count

            print(
                f"Completed processing: {success_count} succeeded, {failure_count} failed"
            )

            # Mark task as completed
            if failure_count == 0:
                task_manager.complete_task(task_id, success=True)
            else:
                print(
                    f"Task {task_id} completed with {failure_count} failures out of {len(threads_data)} threads"
                )
                task_manager.complete_task(
                    task_id, success=True
                )  # Still mark as success if any completed

    except Exception as e:
        import traceback

        error_msg = f"Background task error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        task_manager.complete_task(task_id, success=False)


# Re-export for backward compatibility
__all__ = [
    "task_manager",
    "load_threads_from_json",
    "process_threads_background",
    "BackgroundTaskManager",
]
