"""Thread processing logic for background tasks."""

from typing import Optional, Tuple

from database.models import SummaryContentModel, ThreadModel
from services.openrouter import OpenRouterService
from services.background.database_ops import save_summary_to_db
from services.background.task_manager import BackgroundTaskManager


async def process_thread_with_api(
    thread_model: ThreadModel,
    thread_db_id: Optional[int],
    task_id: str,
    openrouter_service: OpenRouterService,
    task_manager: BackgroundTaskManager,
) -> Tuple[bool, Optional[str]]:
    """Process a single thread: call API and save result.

    This function is called concurrently for all threads.

    Args:
        thread_model: Thread model to process.
        thread_db_id: Database ID of the thread.
        task_id: Task identifier for tracking.
        openrouter_service: OpenRouter service instance.
        task_manager: Task manager instance.

    Returns:
        Tuple of (success: bool, error_message: Optional[str]).
    """
    if thread_db_id is None:
        error_msg = f"Failed to prepare thread {thread_model.thread_id} in database"
        await task_manager.increment_progress(task_id, increment=1, increment_failed=1)
        return (False, error_msg)

    try:
        # Generate summary via API (this happens concurrently for all threads)
        summary_content: SummaryContentModel = (
            await openrouter_service.summarize_thread(thread_model)
        )

        # Save summary to DB immediately when API response arrives
        success = await save_summary_to_db(thread_db_id, summary_content, thread_model)

        if success:
            await task_manager.increment_progress(task_id, increment=1)
            return (True, None)
        else:
            error_msg = f"Failed to save summary for thread {thread_model.thread_id}"
            await task_manager.increment_progress(
                task_id, increment=1, increment_failed=1
            )
            return (False, error_msg)

    except Exception as e:
        error_msg = f"Error processing thread {thread_model.thread_id}: {str(e)}"
        print(error_msg)
        await task_manager.increment_progress(task_id, increment=1, increment_failed=1)
        return (False, error_msg)
