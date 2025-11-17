"""Message chunking utilities for large threads."""

from typing import List

from database.models import MessageModel
from services.openrouter.config import MESSAGES_PER_CHUNK


def chunk_messages(
    messages: List[MessageModel], chunk_size: int = MESSAGES_PER_CHUNK
) -> List[List[MessageModel]]:
    """Split messages into chunks for processing.

    Args:
        messages: List of messages to chunk.
        chunk_size: Number of messages per chunk.

    Returns:
        List of message chunks.
    """
    chunks: List[List[MessageModel]] = []
    for i in range(0, len(messages), chunk_size):
        chunks.append(messages[i : i + chunk_size])
    return chunks
