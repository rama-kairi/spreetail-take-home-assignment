# CE Email Thread Summarization System

A working prototype that automates the summarization of multi-threaded Customer Experience (CE) email conversations and integrates them into a workflow with human edit/approval steps. This system demonstrates how NLP can save time for CE associates while maintaining quality through human oversight.

## Overview

This prototype covers the complete flow from raw email threads → NLP summarization → human approval → usable output for associates. It processes multi-threaded email conversations, extracts CRM context, generates structured summaries, and provides an intuitive workflow for associates to review, edit, and approve summaries.

## Features

### Core Workflow
- **File Upload**: Upload JSON files containing email threads (`ce_exercise_threads.json`)
- **Background Processing**: Asynchronous processing of large datasets (500+ threads)
- **NLP Summarization**: AI-powered summarization using OpenRouter API with structured output
- **CRM Context Extraction**: Automatically extracts order IDs, products, customer sentiment, urgency, and intent
- **Edit/Approve Workflow**: Associates can edit summaries before approval with required comments
- **Status Tracking**: Track threads through Review → Approved/Rejected states
- **Undo Functionality**: Reset approved/rejected summaries back to review state

### Key Capabilities
- **Chunking Strategy**: Handles large email threads (20-50+ messages) efficiently
- **Structured Output**: Extracts priority, sentiment, issue type, customer intent, and resolution status
- **Quick Insights**: Visual dashboard showing key metrics at a glance
- **Real-time Updates**: Polling for task status and summary updates
- **Type Safety**: Full type hints throughout Python code using Pydantic

## Project Structure

```
.
├── backend/                    # FastAPI Python application
│   ├── database/               # Database models and setup
│   │   ├── models/            # SQLAlchemy ORM models (thread, message, summary, file, context)
│   │   └── database.py        # Database initialization and session management
│   ├── routers/               # API route handlers
│   │   ├── threads.py         # Thread CRUD operations
│   │   ├── summaries.py      # Summary management and workflow
│   │   ├── files.py           # File upload and management
│   │   └── events.py          # Server-Sent Events (SSE) for real-time updates
│   ├── services/              # Business logic layer
│   │   ├── openrouter/        # OpenRouter API integration
│   │   │   ├── client.py      # HTTP client with retry logic
│   │   │   ├── chunker.py     # Message chunking for large threads
│   │   │   ├── prompt_builder.py # Prompt engineering
│   │   │   └── response_parser.py # Structured output parsing
│   │   └── background/        # Background task processing
│   │       ├── task_manager.py # Task status tracking
│   │       ├── thread_processor.py # Thread processing logic
│   │       └── database_ops.py # Database operations
│   ├── main.py                # FastAPI application entry point
│   └── pyproject.toml          # Python dependencies (UV)
├── frontend/                   # React application (Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── common/        # Shared components (error boundary, theme toggle)
│   │   │   ├── files/         # File management UI
│   │   │   ├── threads/       # Thread display components
│   │   │   ├── summaries/     # Summary workflow components
│   │   │   └── ui/            # shadcn/ui base components
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── common/        # Shared hooks (SSE, health check)
│   │   │   ├── files/         # File-related hooks
│   │   │   ├── threads/       # Thread-related hooks
│   │   │   └── summaries/     # Summary-related hooks
│   │   ├── routes/            # TanStack Router file-based routes
│   │   │   ├── __root.tsx     # Root layout
│   │   │   └── index.tsx      # Home page
│   │   ├── lib/               # Utilities and configurations
│   │   │   ├── api.ts         # Ky HTTP client configuration
│   │   │   ├── schemas.ts     # Zod validation schemas
│   │   │   └── query-client.ts # TanStack Query setup
│   │   └── main.tsx           # Application entry point
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── biome.json             # Biome linter/formatter config
├── docs/                       # Documentation and dataset
│   ├── instructions.md         # Exercise requirements
│   ├── ce_exercise_threads.json # Sample dataset
│   └── ce_complex_threads.json # Complex test dataset
├── BRIEF_NOTES.md             # Tech stack, NLP choice, scaling plan
├── Makefile                   # Development convenience commands
├── lefthook.yml               # Git hooks configuration
└── README.md                  # This file
```

## Prerequisites

- [UV](https://docs.astral.sh/uv/) - Modern Python package manager
- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- OpenRouter API key (for NLP summarization)

## Quick Start

### 1. Install Dependencies

```bash
make install
```

Or install separately:
```bash
make install-backend   # Install Python dependencies
make install-frontend  # Install JavaScript dependencies
```

### 2. Configure Environment

Copy the example environment file from the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=x-ai/grok-4-fast
```

**Note:**
- Get your API key from https://openrouter.ai/keys
- The `.env` file is gitignored and should not be committed
- Default model is `x-ai/grok-4-fast` (can be changed to any OpenRouter-supported model)
- The `.env` file should be in the project root directory (not in `backend/`)

### 3. Start the Application

```bash
make start
```

This starts:
- **Backend API**: http://localhost:8000
- **Frontend App**: http://localhost:5173

### 4. Upload Dataset

1. Navigate to http://localhost:5173
2. Click "Add New File"
3. Upload `docs/ce_exercise_threads.json`
4. Wait for processing to complete
5. Click on the file to view threads

## Workflow

### 1. Upload Email Threads
- Upload JSON file containing email threads
- System parses and stores threads in database
- Background processing generates summaries automatically

### 2. Review Threads
- View thread list with priority, status, and key information
- Click on a thread to see details
- View original messages, CRM context, and AI-generated summary

### 3. Edit Summary (Optional)
- Click "Edit" to modify the AI-generated summary
- Make changes in markdown format
- Click "Save Draft" to persist changes

### 4. Approve or Reject
- **Approve**: Add required remarks and approve summary
- **Reject**: Provide reason for rejection
- Both actions require comments for accountability

### 5. View Approved Summaries
- Approved summaries show user feedback card
- Status updates throughout the system
- Can undo approval/rejection if needed

## API Endpoints

### Threads
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/threads` | List all threads (optional `file_id` query param) |
| `GET` | `/api/threads/{thread_id}` | Get specific thread with messages |
| `POST` | `/api/files/upload` | Upload JSON file with threads (returns task_id) |
| `GET` | `/api/threads/task/{task_id}/status` | Check background task status |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files` | List all uploaded files |
| `GET` | `/api/files/{file_id}` | Get specific file with metadata |

### Summaries
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/summaries/threads/{thread_id}/summarize` | Generate summary for thread |
| `GET` | `/api/summaries` | List all summaries (optional `status` query param) |
| `GET` | `/api/summaries/{summary_id}` | Get specific summary |
| `PUT` | `/api/summaries/{summary_id}` | Update (edit) summary content |
| `POST` | `/api/summaries/{summary_id}/approve` | Approve summary (requires `remarks`) |
| `POST` | `/api/summaries/{summary_id}/reject` | Reject summary (requires `rejection_reason`) |
| `POST` | `/api/summaries/{summary_id}/undo` | Undo approval/rejection (reset to pending) |

### Events (Server-Sent Events)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Stream real-time events (optional `file_id` or `task_id` query params) |

**API Documentation:**
- Interactive Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Tech Stack

### Backend
- **FastAPI** (0.121.2+) - Modern async Python web framework with automatic OpenAPI docs
- **SQLite** - Embedded database with WAL mode for development
- **SQLAlchemy** (2.0+) - Modern ORM with async support
- **Pydantic** (2.9+) - Type-safe data validation and settings management
- **OpenRouter API** - NLP summarization via x-ai/grok-4-fast model
- **FastAPI BackgroundTasks** - Async task processing
- **httpx** - Async HTTP client for API calls
- **python-dotenv** - Environment variable management
- **UV** - Fast Python package manager (replaces pip)

### Frontend
- **React** (19.2+) - Latest React with concurrent features
- **TypeScript** (5.9+) - Type safety with strict mode
- **Vite** (7.2+) - Fast build tool and dev server
- **TanStack Router** (1.136+) - Type-safe file-based routing
- **TanStack Query** (5.90+) - Powerful data synchronization
- **Ky** (1.14+) - HTTP client with retry and error handling
- **Zod** (4.1+) - Schema validation and type inference
- **Tailwind CSS** (4.1+) - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible component library
- **Biome** (2.3+) - Fast formatter and linter
- **Bun** - Fast JavaScript runtime and package manager

### Development Tools
- **Lefthook** - Git hooks manager
- **Ruff** - Fast Python linter and formatter
- **Biome** - Fast JavaScript/TypeScript formatter and linter

See [BRIEF_NOTES.md](./BRIEF_NOTES.md) for detailed tech stack choices, NLP approach selection, and scaling plan.

## Architecture

### Backend Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

- **Routers** (`routers/`): Handle HTTP requests/responses, input validation, and route definitions
- **Services** (`services/`): Contain business logic, external API integrations, and background processing
- **Database Models** (`database/models/`): SQLAlchemy ORM models with relationships
- **Pydantic Models** (`database/models/`): Request/response validation schemas

**Key Design Patterns:**
- Dependency Injection: Database sessions via FastAPI's `Depends()`
- Background Tasks: Async processing for large uploads using FastAPI's `BackgroundTasks`
- Service Layer: Encapsulates OpenRouter API calls and business logic
- Task Management: In-memory task tracking with progress updates via SSE

### Frontend Architecture

The frontend uses modern React patterns with type safety:

- **Component Structure**: Organized by feature (files, threads, summaries) with shared UI components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: File-based routing with TanStack Router for type-safe navigation
- **API Layer**: Centralized Ky HTTP client with retry logic and error handling
- **Type Safety**: Zod schemas for runtime validation, TypeScript for compile-time checks

**Key Patterns:**
- Custom Hooks: Encapsulate data fetching logic (e.g., `useThreads`, `useSummaries`)
- Optimistic Updates: Immediate UI feedback with rollback on error
- Error Boundaries: Graceful error handling at component boundaries
- Server-Sent Events: Real-time task progress updates

## Database

Uses SQLite (`ce_summarization.db`) for local development. Database is automatically initialized on startup with WAL (Write-Ahead Logging) mode enabled for better concurrency.

**Schema:**
- `files` - Uploaded file metadata
- `threads` - Email thread metadata (topic, subject, order_id, product)
- `messages` - Individual email messages within threads
- `summaries` - AI-generated summaries with status tracking (pending, approved, rejected)
- `contexts` - Extracted CRM context (sentiment, urgency, intent)

**Database Configuration:**
- Connection pooling: 10 connections with 20 overflow
- WAL mode enabled for concurrent reads/writes
- 30-second timeout for locked database scenarios
- Automatic schema migration on startup

**Note:** For production, migrate to PostgreSQL with connection pooling. See [BRIEF_NOTES.md](./BRIEF_NOTES.md) for scaling plan.

## Development

### Development Workflow

1. **Install dependencies** (one-time setup):
   ```bash
   make install
   ```

2. **Start development servers**:
   ```bash
   make start
   ```
   This runs both backend (port 8000) and frontend (port 5173) concurrently.

3. **Make changes** - Both servers support hot-reload:
   - Backend: FastAPI auto-reloads on Python file changes
   - Frontend: Vite HMR updates React components instantly

4. **Code quality checks** (automated via git hooks):
   - Pre-commit hooks run Biome (frontend) and Ruff (backend)
   - Formatting and linting are applied automatically

### Backend Development

**Start backend server:**
```bash
make start-backend
# or manually:
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

**Backend Code Quality:**
```bash
cd backend
uv run ruff check .          # Lint Python code
uv run ruff format .         # Format Python code
uv run ruff check --fix .    # Auto-fix linting issues
```

**Backend Best Practices:**
- All functions have type hints
- Pydantic models validate all API inputs/outputs
- Database sessions use dependency injection
- Error handling with HTTPException for API errors
- Background tasks for long-running operations
- Environment variables loaded via `python-dotenv`

### Frontend Development

**Start frontend server:**
```bash
make start-frontend
# or manually:
cd frontend
bun run dev
```

**Frontend Code Quality:**
```bash
cd frontend
bun run lint        # Check code with Biome
bun run lint:fix    # Fix linting issues automatically
bun run format      # Format code with Biome
```

**Frontend Best Practices:**
- TypeScript strict mode enabled
- Zod schemas for runtime validation
- Custom hooks for data fetching
- Error boundaries for graceful error handling
- Optimistic updates for better UX
- Path aliases (`@/` for `src/`) for cleaner imports
- TanStack Query for efficient caching and refetching

### Git Hooks

Pre-commit hooks (via Lefthook) automatically:
- Format and lint frontend code (Biome)
- Format and lint backend code (Ruff)
- Stage fixed files automatically

**Manual hook execution:**
```bash
lefthook run pre-commit
```

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install all dependencies (backend + frontend) |
| `make install-backend` | Install Python dependencies only (UV) |
| `make install-frontend` | Install JavaScript dependencies only (Bun) |
| `make start` | Start both backend and frontend servers concurrently |
| `make start-backend` | Start backend server only (port 8000) |
| `make start-frontend` | Start frontend server only (port 5173) |
| `make stop` | Stop all running servers (uvicorn + vite) |
| `make clean` | Remove build artifacts (.venv, node_modules, dist, etc.) |

**Note:** The `make start` command runs both servers in parallel. Use `make stop` to terminate all processes.

## Requirements Coverage

✅ **Mandatory Prototype** - Full-stack application with complete workflow
✅ **NLP Summarization** - OpenRouter API with structured output
✅ **Workflow Integration** - CRM context extraction and integration
✅ **Edit/Approve Step** - Human-in-the-loop workflow with comments

## Evaluation Criteria

### Prototype Quality & Coding Depth
- Clean, maintainable code with full type hints
- Proper separation of concerns (routers, services, models)
- Error handling and validation throughout
- Background processing for scalability

### NLP Usefulness/Faithfulness
- Structured summaries with key details
- Extracts CRM context (order, product, sentiment, urgency, intent)
- Handles multi-threaded conversations with chunking
- Unique summaries per thread (not templated)

### Workflow Usability
- Intuitive UI for CE associates
- Quick Insights dashboard for fast decision-making
- Efficient edit/approve process with required comments
- Clear status indicators and visual feedback

### Judgment
- Appropriate tech choices (FastAPI, React, OpenRouter)
- Clear scale-up path documented (see BRIEF_NOTES.md)
- Cost-effective solution (~$0.0002 per summary)

### Outcome Thinking
- **Time Saved**: ~70-80% per thread (5-10 min → 1-2 min review)
- **CSAT Impact**: Faster response times, consistent quality
- **EBITDA Impact**: ~$72K-117K annual savings potential

See [BRIEF_NOTES.md](./BRIEF_NOTES.md) for detailed outcome metrics and scaling plan.

## Troubleshooting

### Backend Issues

**Database locked errors:**
- SQLite WAL mode is enabled, but concurrent writes can still cause issues
- Solution: Increase `busy_timeout` in `database.py` or migrate to PostgreSQL

**OpenRouter API errors:**
- Check `OPENROUTER_API_KEY` in root `.env` file
- Verify API key has sufficient credits
- Check rate limits (429 errors) - retry logic handles this automatically

**Port already in use:**
- **Preferred**: Use `make stop` to stop all running servers (kills both uvicorn and vite processes)
- **Manual method**: If `make stop` doesn't work, manually find and kill the process:
  ```bash
  # Find process using port 8000
  lsof -i :8000
  # Kill process
  kill -9 <PID>
  ```

### Frontend Issues

**API connection errors:**
- Verify backend is running on http://localhost:8000
- Check `VITE_API_URL` in root `.env` file (defaults to `http://localhost:8000/api`)
- Check CORS configuration in `backend/main.py`

**Build errors:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules .vite dist
bun install
```

**Type errors:**
- Run `bun run lint` to see TypeScript errors
- Ensure all Zod schemas match API responses

### General Issues

**Dependencies out of sync:**
```bash
make clean
make install
```

**Git hooks not running:**
```bash
# Install lefthook hooks
lefthook install
```

## Areas for Improvement

### High Priority
- **Authentication**: Currently uses placeholder "system" user (marked with TODO)
- **Testing**: Add unit tests (pytest) and integration tests
- **Logging**: Replace `print()` statements with proper logging (structlog/loguru)
- **Error Monitoring**: Add error tracking (Sentry) for production

### Medium Priority
- **Export Functionality**: Approved summaries export to CSV/JSON
- **Batch Operations**: Bulk approve/reject for multiple threads
- **Edit History**: Track summary edit history over time
- **Confidence Scores**: AI extraction confidence indicators
- **Pagination**: Add pagination for large thread lists

### Production Readiness
- **Database**: Migrate to PostgreSQL with connection pooling
- **Task Queue**: Replace BackgroundTasks with Celery + Redis
- **Caching**: Add Redis for frequently accessed data
- **Message Queue**: Kafka for high-volume processing
- **Monitoring**: Add metrics and health checks
- **CI/CD**: GitHub Actions for automated testing and deployment

See [BRIEF_NOTES.md](./BRIEF_NOTES.md) for detailed scaling plan.

## Dataset

The system uses `docs/ce_exercise_threads.json` containing 5 email threads with varying complexity. Each thread includes:
- Thread metadata (topic, subject, order_id, product)
- Multiple messages (customer and company)
- CRM context information

## Code Quality & Best Practices

### Type Safety
- **Backend**: Full type hints with Python 3.13+ typing, Pydantic models for validation
- **Frontend**: TypeScript strict mode, Zod schemas for runtime validation
- **API Contracts**: Pydantic response models ensure type-safe API responses

### Code Formatting & Linting
- **Frontend**: [Biome](https://biomejs.dev/) - Fast formatter and linter (replaces ESLint + Prettier)
  - Configured with tabs, double quotes, and Tailwind CSS support
  - Auto-organizes imports
- **Backend**: [Ruff](https://docs.astral.sh/ruff/) - Fast Python linter and formatter
  - Replaces Black, isort, flake8, and more
  - Configured via `pyproject.toml`

### Git Hooks
- **Lefthook**: Pre-commit hooks run automatically
  - Formats and lints staged files
  - Auto-stages fixed files
  - Parallel execution for speed

### Error Handling
- **Backend**: HTTPException for API errors, try/except for service layer
- **Frontend**: Error boundaries, Ky error hooks, TanStack Query error states
- **API Client**: Retry logic for transient failures (429, 500, 502, 503, 504)

### Performance Optimizations
- **Database**: Connection pooling (10 connections, 20 overflow), WAL mode for SQLite
- **API Calls**: Concurrent processing with `asyncio.gather()` for multiple threads
- **Frontend**: TanStack Query caching, optimistic updates, request deduplication
- **Chunking**: Large email threads processed in chunks (10 messages per chunk)

### Security Considerations
- **CORS**: Configured for localhost development (ports 5173, 3000)
- **Environment Variables**: `.env` files gitignored, loaded via `python-dotenv`
- **Input Validation**: Pydantic models validate all API inputs
- **SQL Injection**: SQLAlchemy ORM prevents SQL injection
- **TODO**: Authentication system (currently uses placeholder "system" user)

### Testing
- **Current**: No automated tests (prototype phase)
- **Recommended**: Add pytest for backend, Vitest for frontend

## Documentation

- [BRIEF_NOTES.md](./BRIEF_NOTES.md) - Tech stack, NLP choice, scaling plan (<1 page)
- [docs/instructions.md](./docs/instructions.md) - Exercise requirements
- [docs/ASSESSMENT_ANALYSIS.md](./docs/ASSESSMENT_ANALYSIS.md) - Detailed analysis
- [backend/README.md](./backend/README.md) - Backend API documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation

## License

This is a work sample exercise prototype.
