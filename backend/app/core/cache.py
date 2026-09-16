import hashlib
import json
import logging
import time
from typing import Any

import redis
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_memory_cache: dict[str, tuple[float, str]] = {}
client = None

try:
    _candidate = redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=1)
    _candidate.ping()
    client = _candidate
    logger.info("Redis cache connected successfully.")
except Exception:
    client = None
    logger.info("Redis not available; using in-memory TTL cache.")


def _key(prefix: str, value: str) -> str:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return f"weathergpt:{prefix}:{digest}"


def get_json(prefix: str, value: str) -> Any | None:
    raw = get_text(prefix, value)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def set_json(prefix: str, value: str, data: Any, ttl: int) -> None:
    try:
        set_text(prefix, value, json.dumps(data), ttl)
    except Exception as exc:
        logger.warning("Cache serialize failed: %s", exc)


def get_text(prefix: str, value: str) -> str | None:
    k = _key(prefix, value)
    if client:
        try:
            return client.get(k)
        except Exception:
            pass

    # In-memory fallback
    item = _memory_cache.get(k)
    if item:
        expiry, data = item
        if time.time() < expiry:
            return data
        else:
            _memory_cache.pop(k, None)
    return None


def set_text(prefix: str, value: str, data: str, ttl: int) -> None:
    k = _key(prefix, value)
    if client:
        try:
            client.setex(k, ttl, data)
            return
        except Exception:
            pass

    # In-memory fallback with TTL
    _memory_cache[k] = (time.time() + ttl, data)

