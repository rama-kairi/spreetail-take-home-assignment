"""Configuration constants for OpenRouter service."""

import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "x-ai/grok-4-fast")
OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

# Chunking configuration
MAX_TOKENS_PER_CHUNK: int = 8000  # Conservative limit for smaller models
MESSAGES_PER_CHUNK: int = 10  # Process 10 messages at a time for large threads
