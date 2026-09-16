from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.alert_engine import AlertEngine

router = APIRouter()
alert_engine = AlertEngine()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await alert_engine.register(websocket)
    try:
        await websocket.send_json({
            "type": "status",
            "message": "WeatherGPT alert stream connected."
        })
        while True:
            # Keep the connection alive and allow a simple client ping.
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_engine.unregister(websocket)
    except Exception:
        alert_engine.unregister(websocket)
