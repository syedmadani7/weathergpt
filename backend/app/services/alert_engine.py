import asyncio
import logging
from datetime import datetime, timezone
from app.core.config import get_settings
from app.services.weather_api import WeatherService

logger = logging.getLogger(__name__)
settings = get_settings()


class AlertEngine:
    def __init__(self):
        self.weather = WeatherService()
        self.clients = set()
        self.locations = ["Delhi", "Chennai", "Mumbai"]

    async def register(self, websocket):
        self.clients.add(websocket)

    def unregister(self, websocket):
        self.clients.discard(websocket)

    async def broadcast(self, payload: dict):
        dead = []
        for ws in list(self.clients):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.clients.discard(ws)

    async def evaluate(self, location: str) -> dict | None:
        weather = await self.weather.current(location)
        temp = float(weather.get("temperature") or 0)
        rain = float(weather.get("rain_1h") or 0)
        severity = None
        if temp >= settings.alert_temperature_c:
            severity = "red"
            message = f"Extreme heatwave detected! Temperature: {temp:.1f}°C"
        elif rain >= settings.alert_rainfall_mm:
            severity = "red"
            message = f"Extreme rainfall detected! Rainfall: {rain:.1f} mm"
        elif temp >= 42:
            severity = "orange"
            message = f"Very high temperature: {temp:.1f}°C. Take heat precautions."
        elif temp >= 40:
            severity = "yellow"
            message = f"High temperature: {temp:.1f}°C. Stay hydrated."
        else:
            return None

        return {
            "type": "alert", "severity": severity, "location": location,
            "message": message, "timestamp": datetime.now(timezone.utc).isoformat(),
            "temperature_c": temp, "rainfall_mm": rain,
        }

    async def monitor(self):
        while True:
            try:
                for location in self.locations:
                    alert = await self.evaluate(location)
                    if alert:
                        await self.broadcast(alert)
            except Exception as exc:
                logger.warning("Alert monitor error: %s", exc)
            await asyncio.sleep(settings.alert_poll_seconds)
