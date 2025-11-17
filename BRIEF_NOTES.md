# Brief Notes: CE Email Thread Summarization System

## Tech Stack

**Backend:** FastAPI (Python) with SQLite, Pydantic for type safety, SQLAlchemy ORM
**Frontend:** React 19 + Vite + TypeScript, TanStack Router & Query, Tailwind CSS + shadcn/ui
**NLP:** OpenRouter API (x-ai/grok-4-fast) via custom service layer
**Deployment:** Local development setup with hot-reload

## NLP Approach Selection

**Chosen:** OpenRouter API with structured output

**Rationale:**
- Fast iteration without model hosting complexity
- Structured JSON extraction (CRM context, sentiment, urgency, intent)
- Chunking strategy handles large threads (20-50+ messages)
- Cost-effective: ~$0.0002 per summary
- Easy to swap models via OpenRouter

**Alternative Considered:** Self-hosted OSS models (Llama/Mistral)
**Why Not:** Higher setup complexity, GPU requirements, lower quality for prototype timeline

## Scaling Plan

**Current (Prototype):**
- SQLite for persistence
- FastAPI BackgroundTasks for async processing
- In-memory task tracking
- Server-Sent Events (SSE) for real-time updates

**Short-term (MVP):**
- Migrate to PostgreSQL with connection pooling
- Replace BackgroundTasks with Celery + Redis
- Add rate limiting and caching
- Implement proper authentication

**Medium-term (Production):**
- Kafka for message queuing
- Redis for distributed job state
- Fine-tuned model for cost optimization
- Multi-tenant architecture
- Analytics dashboard

**Long-term (Enterprise):**
- Self-hosted OSS model for privacy-sensitive cases
- A/B testing for prompts
- Integration with actual CRM systems
- Real-time streaming updates

## Outcome Metrics

**Time Saved:** ~70-80% per thread (5-10 min → 1-2 min review)
**CSAT Impact:** Faster response times, consistent quality
**EBITDA Impact:** ~$72K-117K annual savings (8-13 hours/day × $25/hour × 250 days)
**Revenue Optimization:** AI guidance prioritizes replacements/exchanges over refunds, protecting margins while maintaining customer satisfaction
