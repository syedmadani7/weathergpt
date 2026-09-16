"""
Minimal WIS2 integration seam.

WIS2/Global Services can be added here when an operational WIS2 broker/catalog
is supplied. The application deliberately does not hard-code an unofficial
endpoint. The demo uses OpenWeatherMap plus simulated monitoring.
"""


class WIS2Client:
    async def latest_alerts(self) -> list[dict]:
        return []
