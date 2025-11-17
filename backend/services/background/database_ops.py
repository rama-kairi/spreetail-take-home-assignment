"""Database operations for background processing."""

import asyncio
import json
import uuid
from typing import Optional

from database import Message, SessionLocal, Summary, Thread
from database.models import MessageModel, SummaryContentModel, SummaryStatus, ThreadModel
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session


async def prepare_thread_in_db(
    thread_model: ThreadModel,
    file_id: Optional[int],
) -> Optional[int]:
    """Prepare thread in database (create thread and messages).

    Returns thread DB ID or None if failed.
    """
    max_retries = 5
    retry_delay = 0.5

    for attempt in range(max_retries):
        db: Session = SessionLocal()
        try:
            # Check if thread already exists
            existing_thread: Optional[Thread] = (
                db.query(Thread)
                .filter(Thread.thread_id == thread_model.thread_id)
                .first()
            )

            if existing_thread:
                thread_db: Thread = existing_thread
                if file_id:
                    thread_db.file_id = file_id
                # Clear existing messages
                db.query(Message).filter(Message.thread_id == thread_db.id).delete()
            else:
                # Create new thread
                thread_db = Thread(
                    file_id=file_id,
                    thread_id=thread_model.thread_id,
                    topic=thread_model.topic,
                    subject=thread_model.subject,
                    initiated_by=thread_model.initiated_by,
                    order_id=thread_model.order_id,
                    product=thread_model.product,
                )
                db.add(thread_db)
                db.flush()

            # Add messages
            for msg_model in thread_model.messages:
                message_db = Message(
                    thread_id=thread_db.id,
                    message_id=msg_model.id,
                    sender=msg_model.sender,
                    timestamp=msg_model.timestamp,
                    body=msg_model.body,
                )
                db.add(message_db)

            db.commit()
            thread_db_id = thread_db.id
            db.close()
            return thread_db_id

        except OperationalError as e:
            db.rollback()
            db.close()
            if "database is locked" in str(e).lower() and attempt < max_retries - 1:
                wait_time = retry_delay * (2**attempt)
                await asyncio.sleep(wait_time)
                continue
            print(f"Error preparing thread {thread_model.thread_id} in DB: {str(e)}")
            return None
        except Exception as e:
            db.rollback()
            db.close()
            print(f"Error preparing thread {thread_model.thread_id} in DB: {str(e)}")
            return None

    return None


async def save_summary_to_db(
    thread_db_id: int,
    summary_content: SummaryContentModel,
    thread_model: ThreadModel,
) -> bool:
    """Save summary to database.

    Returns True if successful, False otherwise.
    """
    max_retries = 5
    retry_delay = 0.5

    for attempt in range(max_retries):
        db: Session = SessionLocal()
        try:
            # Check if summary exists
            existing_summary: Optional[Summary] = (
                db.query(Summary).filter(Summary.thread_id == thread_db_id).first()
            )

            summary_id: str = f"sum-{thread_model.thread_id}-{uuid.uuid4().hex[:8]}"

            if existing_summary:
                existing_summary.original_summary = summary_content.full_summary_text
                existing_summary.structured_data_json = json.dumps(
                    summary_content.model_dump()
                )
                existing_summary.summary_id = summary_id
            else:
                summary_db = Summary(
                    thread_id=thread_db_id,
                    summary_id=summary_id,
                    original_summary=summary_content.full_summary_text,
                    status=SummaryStatus.PENDING,
                    structured_data_json=json.dumps(summary_content.model_dump()),
                )
                db.add(summary_db)

            db.commit()
            db.close()
            return True

        except OperationalError as e:
            db.rollback()
            db.close()
            if "database is locked" in str(e).lower() and attempt < max_retries - 1:
                wait_time = retry_delay * (2**attempt)
                await asyncio.sleep(wait_time)
                continue
            print(f"Error saving summary for thread {thread_model.thread_id}: {str(e)}")
            return False
        except Exception as e:
            db.rollback()
            db.close()
            print(f"Error saving summary for thread {thread_model.thread_id}: {str(e)}")
            return False

    return False
