from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "WeatherGPT"
    environment: str = "development"
    # Secrets MUST come from backend/.env or the container environment.
    openweather_api_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    database_url: str = "postgresql+psycopg://weathergpt:weathergpt@db:5432/weathergpt"

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            # Render and other cloud providers output postgres:// or postgresql://.
            # SQLAlchemy 2 with psycopg 3 requires postgresql+psycopg://.
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v
    redis_url: str = "redis://redis:6379/0"
    cors_origins: str = "http://localhost:3000"
    default_language: str = "en"
    supported_languages: str = "en,hi,ta,te,bn,mr,gu,kn,ml,pa,or"
    weather_cache_ttl: int = 300
    llm_cache_ttl: int = 900
    alert_poll_seconds: int = 60
    alert_temperature_c: float = 45.0
    alert_rainfall_mm: float = 100.0
    weather_timeout_seconds: int = 10

    model_config = SettingsConfigDict(
        env_file=(".env", "/app/.env"),
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_list(self):
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def languages(self):
        return [item.strip() for item in self.supported_languages.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # Gracefully migrate old local .env files using retired Groq model names.
    if settings.groq_model in {"llama-3.1-8b-instant", "llama-3.3-70b-versatile"}:
        settings.groq_model = "openai/gpt-oss-20b"
    return settings


# Backwards-compatible import for existing modules.
settings = get_settings()
