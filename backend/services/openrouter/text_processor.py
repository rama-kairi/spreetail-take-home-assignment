"""Text processing utilities for cleaning summary text."""

import re


def remove_timeline_section(text: str) -> str:
    """Remove timeline sections from summary text.

    Args:
        text: Summary text that may contain timeline sections.

    Returns:
        Text with timeline sections removed.
    """
    # Remove ## Timeline or # Timeline sections
    # Match from "## Timeline" or "# Timeline" to next ## or end of text
    text = re.sub(
        r'##?\s*Timeline\s*\n.*?(?=\n##|\Z)',
        '',
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Also remove any lines that start with timeline-related patterns
    lines = text.split('\n')
    filtered_lines = []
    skip_until_next_section = False

    for i, line in enumerate(lines):
        # Check if this is a timeline section header
        if re.match(r'^##?\s*(Timeline|Chronology|Sequence)', line, re.IGNORECASE):
            skip_until_next_section = True
            continue

        # If we hit a new section header, stop skipping
        if skip_until_next_section and re.match(r'^##\s+', line):
            skip_until_next_section = False

        # Skip lines while in timeline section
        if skip_until_next_section:
            continue

        filtered_lines.append(line)

    return '\n'.join(filtered_lines).strip()
