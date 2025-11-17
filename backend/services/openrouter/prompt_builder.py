"""Prompt building utilities for OpenRouter API."""

from typing import List, Optional

from database.models import MessageModel, ThreadModel
from services.openrouter.message_formatter import format_messages_for_summarization


def create_summarization_prompt(
    thread: ThreadModel,
    chunk_messages: Optional[List[MessageModel]] = None,
    is_chunk: bool = False,
    previous_summary: Optional[str] = None,
) -> str:
    """Create summarization prompt for OpenRouter.

    Args:
        thread: Thread model with metadata.
        chunk_messages: Optional subset of messages to process.
        is_chunk: Whether this is a chunk of a larger thread.
        previous_summary: Previous summary if processing chunks.

    Returns:
        Formatted prompt string.
    """
    messages_to_format: List[MessageModel] = (
        chunk_messages if chunk_messages is not None else thread.messages
    )
    messages_text: str = format_messages_for_summarization(messages_to_format)

    base_prompt: str = f"""You are a customer experience specialist summarizing email threads between customers and support staff. Your role is to provide accurate, concise summaries that help teams quickly understand customer issues and their resolution status.

CRITICAL: This is a specific thread about Order {thread.order_id} for {thread.product}. Analyze the ACTUAL messages below and create a UNIQUE summary based on what was ACTUALLY said in this conversation. Do NOT use generic templates or placeholder text.

Thread Context:
- Topic: {thread.topic}
- Subject: {thread.subject}
- Order ID: {thread.order_id}
- Product: {thread.product}
- Initiated By: {thread.initiated_by}
- Total Messages: {len(thread.messages)}

"""

    if is_chunk and previous_summary:
        base_prompt += f"""Previous Summary:
{previous_summary}

"""

    base_prompt += f"""Email Messages:
{messages_text}

Analyze this specific email thread carefully and provide a detailed, unique summary. Pay attention to:
- The specific issue reported by the customer
- Key details mentioned (order numbers, ticket IDs, etc.)
- The resolution path taken
- Any unique aspects of this particular case

IMPORTANT: Do NOT include a timeline section in the summary. Users can view the timeline in the Messages tab.

EXTRACTION REQUIREMENTS:

**Issue Summary:**
Provide a clear 2-3 sentence summary of what happened in this conversation. Include actual details from the messages.

**Key Details:**
- Order ID: {thread.order_id}
- Product: {thread.product}
- Extract customer_name and customer_email if mentioned
- Extract order_date and order_status if mentioned
- List ticket_ids if referenced

**Context Extraction:**
- issue_type: Classify the issue (e.g., damaged product, late delivery, wrong variant, return/refund request, defective item, missing item, billing issue, cancellation request)
- customer_sentiment: Analyze tone - 'positive', 'neutral', or 'negative'
- urgency_level: Assess urgency - 'low', 'medium', 'high', or 'urgent'
  * If resolved, urgency should be 'low' or 'medium'
  * If unresolved with urgent language, mark as 'high' or 'urgent'
- customer_intent: What does the customer want? (refund, replacement, return, exchange, credit, tracking update, status inquiry, cancellation, explanation)
- key_phrases: Extract 3-5 important phrases from the conversation

**Resolution Status:**
- Field value: Choose one - 'resolved', 'partially resolved', 'pending', or 'escalated'
- Base this on the final state of the conversation

**Confidence Scores (0-100):**
Provide confidence scores for: issue_type, customer_sentiment, urgency_level, customer_intent, resolution_status
- 90-100: Very clear from messages
- 70-89: Clear with minor ambiguity
- 50-69: Somewhat clear
- Below 50: Unclear or conflicting

**Full Summary Text:**
Create a markdown-formatted summary with these sections:

## Issue Summary
[2-3 sentences with actual details]

## Key Details
- **Order ID**: [value]
- **Product**: [value]
- **Customer Name**: [if available]
- **Customer Email**: [if available]
- **Order Date**: [if mentioned]
- **Order Status**: [if mentioned]
- **Ticket IDs**: [if any]

## Resolution Status
[Write a descriptive explanation of the current status with context]
- If resolved: Explain what was done to resolve it and when
- If partially resolved: Explain what's been addressed and what remains open
- If pending: Explain what's waiting and what needs to happen next
- If escalated: Explain why and to whom
Include specific details like what support offered, what customer agreed to, next steps, etc.

Keep it concise and factual. Do NOT include Timeline or Action Items sections."""

    return base_prompt


def get_system_message() -> str:
    """Get the system message for OpenRouter API.

    Returns:
        System message string.
    """
    return "You are an expert customer experience specialist who creates accurate, concise summaries of customer support conversations. Your goal is to extract key information, sentiment, urgency, and customer intent from actual conversation text to help support teams quickly understand issues and their resolution status. Do NOT use default values - analyze the real customer messages carefully."
