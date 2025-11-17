"""Task manager for background processing."""

import asyncio
from datetime import datetime
from typing import Dict, Optional


class BackgroundTaskManager:
    """Manager for background processing tasks."""

    def __init__(self) -> None:
        """Initialize task manager."""
        self.active_tasks: Dict[str, dict] = {}  # Track active tasks
        self._lock: asyncio.Lock = asyncio.Lock()  # Lock for thread-safe updates
        # TODO: In production, use Redis for distributed task tracking

    def register_task(self, task_id: str, total_items: int) -> None:
        """Register a new background task.

        Args:
            task_id: Unique task identifier.
            total_items: Total number of items to process.
        """
        self.active_tasks[task_id] = {
            "status": "processing",
            "total": total_items,
            "processed": 0,
            "failed": 0,
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None,
        }

    def update_task_progress(
        self, task_id: str, processed: int, failed: int = 0
    ) -> None:
        """Update task progress.

        Args:
            task_id: Task identifier.
            processed: Number of items processed.
            failed: Number of items failed.
        """
        if task_id in self.active_tasks:
            self.active_tasks[task_id]["processed"] = processed
            self.active_tasks[task_id]["failed"] = failed

    async def increment_progress(
        self, task_id: str, increment: int = 1, increment_failed: int = 0
    ) -> None:
        """Atomically increment task progress (thread-safe).

        Args:
            task_id: Task identifier.
            increment: Number to increment processed count by.
            increment_failed: Number to increment failed count by.
        """
        async with self._lock:
            if task_id in self.active_tasks:
                self.active_tasks[task_id]["processed"] = (
                    self.active_tasks[task_id].get("processed", 0) + increment
                )
                if increment_failed > 0:
                    self.active_tasks[task_id]["failed"] = (
                        self.active_tasks[task_id].get("failed", 0) + increment_failed
                    )

    def complete_task(self, task_id: str, success: bool = True) -> None:
        """Mark task as completed.

        Args:
            task_id: Task identifier.
            success: Whether task completed successfully.
        """
        if task_id in self.active_tasks:
            self.active_tasks[task_id]["status"] = "completed" if success else "failed"
            self.active_tasks[task_id]["completed_at"] = datetime.utcnow().isoformat()

    def get_task_status(self, task_id: str) -> Optional[dict]:
        """Get task status.

        Args:
            task_id: Task identifier.

        Returns:
            Task status dictionary or None if not found.
        """
        return self.active_tasks.get(task_id)
