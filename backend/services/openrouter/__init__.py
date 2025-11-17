"""OpenRouter API service for email thread summarization with chunking support."""

import json
from typing import Dict, List, Optional

from database.models import MessageModel, SummaryContentModel, ThreadModel
from services.openrouter.chunker import chunk_messages
from services.openrouter.client import OpenRouterClient
from services.openrouter.config import MESSAGES_PER_CHUNK
from services.openrouter.prompt_builder import create_summarization_prompt, get_system_message
from services.openrouter.response_parser import parse_summary_response
from services.openrouter.schema_generator import generate_json_schema_response_format


class OpenRouterService:
    """Service for interacting with OpenRouter API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> None:
        """Initialize OpenRouter service.

        Args:
            api_key: OpenRouter API key. Defaults to environment variable.
            model: Model name to use. Defaults to environment variable.
            base_url: Base URL for OpenRouter API.
        """
        from services.openrouter.config import OPENROUTER_BASE_URL
        self.client = OpenRouterClient(
            api_key=api_key, model=model, base_url=base_url or OPENROUTER_BASE_URL
        )

    async def __aenter__(self):
        """Async context manager entry."""
        await self.client.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.client.__aexit__(exc_type, exc_val, exc_tb)

    async def summarize_thread(
        self, thread: ThreadModel, use_chunking: bool = True
    ) -> SummaryContentModel:
        """Summarize an email thread using OpenRouter API.

        Handles large threads by chunking messages and processing incrementally.
        Uses structured output with JSON schema for guaranteed valid responses.

        Args:
            thread: Thread model to summarize.
            use_chunking: Whether to use chunking for large threads.

        Returns:
            SummaryContentModel with structured summary data.
        """
        # Generate JSON schema response format for structured output
        response_format: Dict = generate_json_schema_response_format(
            model_class=SummaryContentModel,
            schema_name="email_thread_summary",
            strict=True,
        )

        # For small threads, process all at once
        if not use_chunking or len(thread.messages) <= MESSAGES_PER_CHUNK:
            prompt: str = create_summarization_prompt(thread)
            # Use system message to emphasize extraction requirements
            messages: List[dict[str, str]] = [
                {
                    "role": "system",
                    "content": get_system_message(),
                },
                {"role": "user", "content": prompt}
            ]
            response_text: str = await self.client.call_api(
                messages=messages,
                response_format=response_format,
            )
            return parse_summary_response(response_text, thread)

        # For large threads, process in chunks
        chunks: List[List[MessageModel]] = chunk_messages(thread.messages)
        accumulated_summary: Optional[str] = None

        for i, chunk in enumerate(chunks):
            is_last_chunk: bool = i == len(chunks) - 1
            prompt = create_summarization_prompt(
                thread,
                chunk_messages=chunk,
                is_chunk=not is_last_chunk,
                previous_summary=accumulated_summary,
            )

            # Use system message to emphasize extraction requirements
            messages = [
                {
                    "role": "system",
                    "content": get_system_message(),
                },
                {"role": "user", "content": prompt}
            ]
            response_text = await self.client.call_api(
                messages=messages,
                response_format=response_format,
            )

            if is_last_chunk:
                # Final chunk - parse full summary
                return parse_summary_response(response_text, thread)
            else:
                # Intermediate chunk - extract summary for next iteration
                # With structured output, JSON parsing should always succeed
                try:
                    chunk_data = json.loads(response_text)
                    accumulated_summary = chunk_data.get("full_summary_text", response_text)
                except json.JSONDecodeError:
                    # Should not happen with structured output, but fallback just in case
                    accumulated_summary = response_text

        # Fallback (should not reach here)
        return parse_summary_response(response_text, thread)
