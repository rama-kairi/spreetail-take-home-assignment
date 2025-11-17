"""Message formatting utilities for OpenRouter prompts."""

from typing import List

from database.models import MessageModel


def format_messages_for_summarization(
    messages: List[MessageModel],
) -> str:
    """Format thread messages for summarization prompt.

    Args:
        messages: List of messages to format.

    Returns:
        Formatted message string.
    """
    formatted: List[str] = []
    for msg in messages:
        sender_label: str = "Customer" if msg.sender == "customer" else "Support"
        formatted.append(f"[{sender_label}] {msg.timestamp}\n{msg.body}\n")

    return "\n".join(formatted)
