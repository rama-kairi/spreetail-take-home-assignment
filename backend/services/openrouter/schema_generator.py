"""JSON Schema generation utilities for structured output with OpenRouter."""

from typing import Any, Dict, Type

from pydantic import BaseModel


def generate_json_schema_response_format(
    model_class: Type[BaseModel],
    schema_name: str,
    strict: bool = True,
) -> Dict[str, Any]:
    """Generate OpenRouter-compatible JSON schema response format from Pydantic model.

    Args:
        model_class: Pydantic model class to generate schema from.
        schema_name: Name for the schema (used by OpenRouter for identification).
        strict: Whether to enforce strict schema adherence (recommended: True).

    Returns:
        Response format dictionary compatible with OpenRouter API.
    """
    # Generate JSON schema from Pydantic model
    json_schema = model_class.model_json_schema()

    # Remove $defs and flatten schema for better compatibility
    # OpenRouter expects a clean schema without reference definitions
    schema = _flatten_schema(json_schema)

    # Construct OpenRouter response format
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": schema_name,
            "strict": strict,
            "schema": schema,
        },
    }

    return response_format


def _flatten_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Flatten JSON schema by resolving $ref references.

    OpenRouter works best with flattened schemas without $defs/$ref.

    Args:
        schema: JSON schema with potential $ref references.

    Returns:
        Flattened schema without $ref references.
    """
    if "$defs" in schema:
        defs = schema.pop("$defs")
        schema = _resolve_refs(schema, defs)

    return schema


def _resolve_refs(obj: Any, defs: Dict[str, Any]) -> Any:
    """Recursively resolve $ref references in schema.

    Args:
        obj: Schema object or value to process.
        defs: Dictionary of definitions to resolve references from.

    Returns:
        Object with all $ref references resolved.
    """
    if isinstance(obj, dict):
        if "$ref" in obj:
            # Extract reference path (e.g., "#/$defs/ModelName")
            ref_path = obj["$ref"]
            if ref_path.startswith("#/$defs/"):
                ref_name = ref_path.split("/")[-1]
                if ref_name in defs:
                    # Replace $ref with actual definition
                    return _resolve_refs(defs[ref_name].copy(), defs)
            return obj
        else:
            # Recursively process all values in dictionary
            return {key: _resolve_refs(value, defs) for key, value in obj.items()}
    elif isinstance(obj, list):
        # Recursively process all items in list
        return [_resolve_refs(item, defs) for item in obj]
    else:
        return obj
