"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import events, files, summaries, threads

app = FastAPI(
    title="CE Email Thread Summarization API",
    version="0.1.0",
    description="API for summarizing customer experience email threads with workflow management",
)

# Configure CORS to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event() -> None:
    """Initialize database on application startup."""
    init_db()


# Include routers
app.include_router(events.router)
app.include_router(files.router)
app.include_router(threads.router)
app.include_router(summaries.router)


@app.get("/")
async def read_root() -> dict[str, str]:
    """Root endpoint.

    Returns:
        Welcome message.
    """
    return {"message": "CE Email Thread Summarization API"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        Health status.
    """
    return {"status": "healthy"}
