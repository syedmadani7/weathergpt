import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db, User, WeatherQuery
from app.models.llm_router import LLMRouter, LANG_NAMES
from app.services.alert_engine import AlertEngine
from app.services.weather_api import WeatherService
from app.utils.helpers import extract_location

router = APIRouter()
weather = WeatherService()
llm = LLMRouter()
alerts = AlertEngine()
settings = get_settings()


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    location: str | None = None
    language: str = "en"
    session_id: str | None = None


@router.api_route("/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "ok", "service": "WeatherGPT"}



@router.get("/status")
async def status():
    return {
        "service": "WeatherGPT",
        "weather_provider": "OpenWeatherMap",
        "weather_api_configured": bool(settings.openweather_api_key),
        "groq_configured": bool(settings.groq_api_key),
        "groq_model": settings.groq_model,
        "supported_languages": settings.languages,
    }


@router.get("/weather")
async def current_weather(location: str = "Delhi"):
    return await weather.current(location)


@router.get("/forecast")
async def weather_forecast(location: str = "Delhi"):
    return await weather.forecast(location)


@router.post("/query")
async def query_weather(payload: QueryRequest, db: Session = Depends(get_db)):
    language = payload.language if payload.language in LANG_NAMES else "en"
    session_id = payload.session_id or str(uuid.uuid4())
    if not db.query(User).filter(User.session_id == session_id).first():
        db.add(User(session_id=session_id, language=language))
        db.commit()

    location = extract_location(payload.query, payload.location)
    current = await weather.current(location)
    forecast = await weather.forecast(location)
    mode = llm.choose_mode(payload.query)
    answer, sources = await llm.answer(payload.query, current, forecast, mode, language)

    db.add(WeatherQuery(session_id=session_id, query=payload.query, location=location, language=language, mode=mode))
    db.commit()

    return {
        "response": answer,
        "sources": sources,
        "mode": mode,
        "location": location,
        "weather": current,
        "forecast": forecast,
        "provider": current.get("source"),
        "fallback": current.get("fallback", False),
        "session_id": session_id,
    }


@router.get("/alerts/check")
async def check_alert(location: str = "Delhi"):
    return {"alert": await alerts.evaluate(location)}
