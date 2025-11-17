# Backend API Documentation

## Overview

This FastAPI backend provides a complete API for summarizing customer experience email threads using OpenRouter API with chunking support for large conversations.

## Architecture

### Key Components

1. **Pydantic Models** (`models.py`): Type-safe data models for validation
2. **Database Models** (`database.py`): SQLAlchemy ORM models with SQLite
3. **OpenRouter Service** (`services/openrouter.py`): Handles API calls with chunking
4. **Background Tasks** (`services/background_tasks.py`): Processes large uploads asynchronously
5. **API Routes** (`routers/`): RESTful endpoints for threads and summaries

### Features

- **Type Safety**: Full type hints throughout Python code
- **Chunking Strategy**: Handles large email threads (20-50+ messages) by processing in chunks
- **Background Processing**: Large JSON uploads (500+ threads) processed asynchronously
- **Structured Summarization**: Extracts CRM context, sentiment, urgency, and resolution status
- **Workflow Management**: Edit, approve, and reject summaries with status tracking

## Environment Variables

Copy the `.env.example` file from the project root to `.env` in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=x-ai/grok-4-fast
```

**Note:** The `.env` file should be in the project root directory, not in the `backend/` directory.

## Database

Uses SQLite (`ce_summarization.db`) for local development. Database is automatically initialized on startup.

**Note**: For production, migrate to PostgreSQL and use connection pooling.

## API Endpoints

### Threads

- `GET /api/threads` - List all threads
- `GET /api/threads/{thread_id}` - Get specific thread
- `POST /api/threads/upload` - Upload JSON file with threads
- `GET /api/threads/task/{task_id}/status` - Check background task status

### Summaries

- `POST /api/summaries/threads/{thread_id}/summarize` - Generate summary
- `GET /api/summaries` - List all summaries (optional status filter)
- `GET /api/summaries/{summary_id}` - Get specific summary
- `PUT /api/summaries/{summary_id}` - Update (edit) summary
- `POST /api/summaries/{summary_id}/approve` - Approve summary
- `POST /api/summaries/{summary_id}/reject` - Reject summary

## Background Processing

For large uploads (50+ threads), processing happens in the background using FastAPI's `BackgroundTasks`.

**Production Note**: For production-ready environments, replace with:
- **Kafka** for message queuing
- **Redis** for job state management
- **Celery** or similar for distributed task processing

## Chunking Strategy

Large email threads are processed in chunks:
- Default: 10 messages per chunk
- Each chunk is summarized incrementally
- Final chunk produces the complete summary
- Handles threads with 20-50+ messages efficiently

## Running the Server

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

## TODO: Authentication

Authentication endpoints are marked with TODO comments. Current implementation uses placeholder "system" user for approvals.
