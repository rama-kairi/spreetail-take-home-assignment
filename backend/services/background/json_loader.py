"""JSON loading utilities for background processing."""

import json
from typing import List

from database.models import MessageModel, ThreadModel


async def load_threads_from_json(file_path: str) -> List[ThreadModel]:
    """Load threads from JSON file.

    Args:
        file_path: Path to JSON file.

    Returns:
        List of ThreadModel instances.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        data: dict = json.load(f)

    threads: List[ThreadModel] = []
    for thread_data in data.get("threads", []):
        messages: List[MessageModel] = [
            MessageModel(**msg) for msg in thread_data.get("messages", [])
        ]
        thread_model = ThreadModel(
            thread_id=thread_data["thread_id"],
            topic=thread_data["topic"],
            subject=thread_data["subject"],
            initiated_by=thread_data["initiated_by"],
            order_id=thread_data["order_id"],
            product=thread_data["product"],
            messages=messages,
        )
        threads.append(thread_model)

    return threads
