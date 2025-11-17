.PHONY: help install install-backend install-frontend start start-backend start-frontend stop clean

help:
	@echo "Available commands:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo "  make install-backend  - Install backend dependencies only"
	@echo "  make install-frontend - Install frontend dependencies only"
	@echo "  make start            - Start both backend and frontend servers"
	@echo "  make start-backend    - Start backend server only"
	@echo "  make start-frontend   - Start frontend server only"
	@echo "  make stop             - Stop all running servers"
	@echo "  make clean            - Clean all build artifacts and dependencies"

install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && uv sync

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && bun install

start:
	@echo "Starting both backend and frontend servers..."
	@make start-backend & make start-frontend

start-backend:
	@echo "Starting backend server on http://localhost:8000"
	cd backend && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

start-frontend:
	@echo "Starting frontend server..."
	cd frontend && bun run dev

stop:
	@echo "Stopping all servers..."
	@lsof -ti :8000 | xargs kill -9 || true
	@lsof -ti :5173 | xargs kill -9 || true

clean:
	@echo "Cleaning build artifacts..."
	cd backend && rm -rf .venv __pycache__ .pytest_cache
	cd frontend && rm -rf node_modules dist .vite bun.lockb
