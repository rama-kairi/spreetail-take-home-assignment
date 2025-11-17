"""Response parsing utilities for OpenRouter API."""

import json
import logging

from pydantic import ValidationError

from database.models import (
    CRMContextModel,
    ExtractedContextModel,
    SummaryContentModel,
    ThreadModel,
)
from services.openrouter.text_processor import remove_timeline_section

logger = logging.getLogger(__name__)


def parse_summary_response(
    response_text: str, thread: ThreadModel
) -> SummaryContentModel:
    """Parse API response into SummaryContentModel.

    With structured output enabled via JSON schema, the API guarantees valid JSON
    that conforms to the schema. This function directly validates with Pydantic.

    Args:
        response_text: Raw response text from API (should be valid JSON).
        thread: Original thread model (used for fallback only).

    Returns:
        Parsed and validated SummaryContentModel.
    """
    try:
        # Parse JSON - with structured output, this should always succeed
        data: dict = json.loads(response_text.strip())

        # Direct Pydantic validation - schema enforcement means this should always work
        summary = SummaryContentModel(**data)

        # Post-processing: Remove timeline sections if they somehow got included
        summary.full_summary_text = remove_timeline_section(summary.full_summary_text)

        return summary

    except json.JSONDecodeError as e:
        # This should never happen with structured output enabled
        logger.error(f"JSON decode error (should not occur with structured output): {e}")
        logger.error(f"Response text: {response_text[:500]}")
        return _create_fallback_summary(response_text, thread)

    except ValidationError as e:
        # This should never happen if JSON schema is correct
        logger.error(f"Pydantic validation error (schema mismatch): {e}")
        logger.error(f"Response data: {response_text[:500]}")
        return _create_fallback_summary(response_text, thread)

    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error parsing response: {e}")
        return _create_fallback_summary(response_text, thread)


def _create_fallback_summary(response_text: str, thread: ThreadModel) -> SummaryContentModel:
    """Create a basic fallback summary when parsing fails.

    This should rarely be used with structured output enabled.

    Args:
        response_text: Raw response text.
        thread: Original thread model.

    Returns:
        Basic SummaryContentModel with fallback values.
    """
    logger.warning("Using fallback summary - structured output may not be enabled")

    cleaned_response = remove_timeline_section(response_text)

    return SummaryContentModel(
        issue_summary=cleaned_response[:500] if len(cleaned_response) > 500 else cleaned_response,
        key_details=CRMContextModel(
            order_id=thread.order_id,
            product=thread.product,
        ),
        context_extraction=ExtractedContextModel(
            issue_type=thread.topic,
            customer_sentiment="neutral",
            urgency_level="medium",
            customer_intent="status inquiry",
        ),
        resolution_status="pending",
        full_summary_text=cleaned_response,
    )
