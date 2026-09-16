import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from app.core.cache import get_json, set_json
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

MOCK_WEATHER = {
    "Delhi": {"lat": 28.6139, "lon": 77.2090, "temperature": 32.0, "feels_like": 34.0, "humidity": 55, "description": "clear sky", "wind_speed": 3.1, "rain_1h": 0.0},
    "Chennai": {"lat": 13.0827, "lon": 80.2707, "temperature": 31.0, "feels_like": 35.0, "humidity": 72, "description": "partly cloudy", "wind_speed": 4.2, "rain_1h": 0.0},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "temperature": 29.0, "feels_like": 33.0, "humidity": 78, "description": "light rain", "wind_speed": 5.0, "rain_1h": 3.0},
}


class WeatherService:
    def __init__(self):
        self.base = "https://api.openweathermap.org/data/2.5"

    @staticmethod
    def _mock(location: str, reason: str = "Weather provider unavailable") -> dict[str, Any]:
        key = next((k for k in MOCK_WEATHER if k.lower() in location.lower()), "Delhi")
        item = MOCK_WEATHER[key].copy()
        item.update({
            "location": location,
            "source": "WeatherGPT demo fallback",
            "fallback": True,
            "fallback_reason": reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        return item

    async def _request(self, path: str, params: dict[str, Any]) -> dict[str, Any] | None:
        if not settings.openweather_api_key:
            logger.warning("OpenWeatherMap API key is not configured")
            return None
        params = {**params, "appid": settings.openweather_api_key, "units": "metric"}
        try:
            async with httpx.AsyncClient(timeout=settings.weather_timeout_seconds) as client:
                response = await client.get(f"{self.base}/{path}", params=params)
                if response.status_code >= 400:
                    logger.warning("OpenWeatherMap returned HTTP %s: %s", response.status_code, response.text[:300])
                    return None
                return response.json()
        except Exception as exc:
            logger.warning("OpenWeatherMap request failed: %s", exc)
            return None

    @staticmethod
    def _parse_current(raw: dict[str, Any], location: str) -> dict[str, Any]:
        return {
            "location": raw.get("name") or location,
            "temperature": raw.get("main", {}).get("temp"),
            "feels_like": raw.get("main", {}).get("feels_like"),
            "humidity": raw.get("main", {}).get("humidity"),
            "description": raw.get("weather", [{}])[0].get("description", ""),
            "wind_speed": raw.get("wind", {}).get("speed", 0),
            "rain_1h": raw.get("rain", {}).get("1h", 0),
            "lat": raw.get("coord", {}).get("lat"),
            "lon": raw.get("coord", {}).get("lon"),
            "source": "OpenWeatherMap",
            "fallback": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def current(self, location: str) -> dict[str, Any]:
        cache_key = location.lower().strip()
        cached = get_json("weather:v2", cache_key)
        if cached and not cached.get("fallback"):
            return cached

        raw = await self._request("weather", {"q": f"{location},IN" if "," not in location else location})
        if raw:
            data = self._parse_current(raw, location)
            set_json("weather:v2", cache_key, data, settings.weather_cache_ttl)
            return data

        # Never cache fallback data. Once the API/network recovers, the next request
        # immediately attempts the live provider again.
        return self._mock(location, "Live weather data could not be reached right now")

    async def forecast(self, location: str) -> dict[str, Any]:
        raw = await self._request("forecast", {"q": f"{location},IN" if "," not in location else location})
        if not raw:
            current = await self.current(location)
            return {
                "location": location,
                "source": current["source"],
                "fallback": current.get("fallback", True),
                "items": [
                    {"time": "Today", "temperature": current["temperature"], "description": current["description"], "rain_probability": 0.10},
                    {"time": "Tomorrow", "temperature": current["temperature"] + 1, "description": "partly cloudy", "rain_probability": 0.20},
                    {"time": "Day 3", "temperature": current["temperature"] - 1, "description": "cloudy", "rain_probability": 0.30},
                ],
            }

        items = []
        for entry in raw.get("list", [])[:24]:
            items.append({
                "time": entry.get("dt_txt"),
                "temperature": entry.get("main", {}).get("temp"),
                "description": entry.get("weather", [{}])[0].get("description", ""),
                "rain_probability": entry.get("pop", 0),
            })
        return {"location": raw.get("city", {}).get("name") or location, "source": "OpenWeatherMap", "fallback": False, "items": items}
