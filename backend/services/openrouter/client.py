"""HTTP client for OpenRouter API with rate limit handling."""

import asyncio
import time
from typing import Any, Dict, List, Optional

import httpx

from services.openrouter.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    OPENROUTER_MODEL,
)


class OpenRouterClient:
    """HTTP client for OpenRouter API with rate limit handling."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: str = OPENROUTER_BASE_URL,
    ) -> None:
        """Initialize OpenRouter client.

        Args:
            api_key: OpenRouter API key. Defaults to environment variable.
            model: Model name to use. Defaults to environment variable.
            base_url: Base URL for OpenRouter API.
        """
        self.api_key: str = api_key or OPENROUTER_API_KEY
        self.model: str = model or OPENROUTER_MODEL
        self.base_url: str = base_url
        self.client: httpx.AsyncClient = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",  # Optional: for tracking
            },
            timeout=60.0,
            limits=httpx.Limits(
                max_keepalive_connections=20,  # Keep connections alive for reuse
                max_connections=20,  # Max concurrent connections
            ),
        )

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.client.aclose()

    async def call_api(
        self,
        messages: List[dict[str, str]],
        temperature: float = 0.7,
        max_retries: int = 3,
        response_format: Optional[dict] = None,
    ) -> str:
        """Call OpenRouter API with retry logic and rate limit handling.

        Args:
            messages: List of message dictionaries with 'role' and 'content'.
            temperature: Temperature for generation.
            max_retries: Maximum number of retry attempts.
            response_format: Optional response format specification for structured output.
                           Use JSON schema format for guaranteed structured responses.

        Returns:
            Generated text response.

        Raises:
            Exception: If API call fails after retries.
        """
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }

        # Add response_format if provided for structured output
        if response_format:
            payload["response_format"] = response_format

        for attempt in range(max_retries):
            try:
                response = await self.client.post("/chat/completions", json=payload)

                # Check for rate limit headers
                # rate_limit_remaining = response.headers.get("x-ratelimit-remaining")
                rate_limit_reset = response.headers.get("x-ratelimit-reset")

                if response.status_code == 429:
                    # Rate limited - check reset time
                    if rate_limit_reset:
                        reset_time = int(rate_limit_reset)
                        wait_time = max(1, reset_time - int(time.time()))
                        if wait_time > 0:
                            await asyncio.sleep(wait_time)
                            continue
                    else:
                        # Exponential backoff if no reset time provided
                        wait_time = (2**attempt) + (attempt * 0.5)
                        await asyncio.sleep(wait_time)
                        continue

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 and attempt < max_retries - 1:
                    # Rate limited - wait and retry
                    wait_time = (2**attempt) + (attempt * 0.5)
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"OpenRouter API error: {str(e)}") from e
            except httpx.HTTPError as e:
                if attempt < max_retries - 1:
                    wait_time = (2**attempt) + (attempt * 0.5)
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"OpenRouter API error: {str(e)}") from e

        raise Exception("OpenRouter API call failed after retries")
