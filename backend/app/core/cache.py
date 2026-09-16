import hashlib
import json
import logging
from typing import Any

import redis
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

try:
    client = redis.from_url(settings.redis_url, decode_responses=True)
except Exception:
    client = None


def _key(prefix: str, value: str) -> str:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return f"weathergpt:{prefix}:{digest}"


def get_json(prefix: str, value: str) -> Any | None:
    if not client:
        return None
    try:
        raw = client.get(_key(prefix, value))
        return json.loads(raw) if raw else None
    except Exception as exc:
        logger.warning("Redis read failed: %s", exc)
        return None


def set_json(prefix: str, value: str, data: Any, ttl: int) -> None:
    if not client:
        return
    try:
        client.setex(_key(prefix, value), ttl, json.dumps(data))
    except Exception as exc:
        logger.warning("Redis write failed: %s", exc)


def get_text(prefix: str, value: str) -> str | None:
    if not client:
        return None
    try:
        return client.get(_key(prefix, value))
    except Exception as exc:
        logger.warning("Redis read failed: %s", exc)
        return None


def set_text(prefix: str, value: str, data: str, ttl: int) -> None:
    if not client:
        return
    try:
        client.setex(_key(prefix, value), ttl, data)
    except Exception as exc:
        logger.warning("Redis write failed: %s", exc)
