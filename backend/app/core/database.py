import logging
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
is_sqlite = "sqlite" in settings.database_url
connect_args = {"check_same_thread": False} if is_sqlite else {}
engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class WeatherQuery(Base):
    __tablename__ = "weather_queries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(String(128), index=True)
    query: Mapped[str] = mapped_column(Text)
    location: Mapped[str] = mapped_column(String(200), default="")
    language: Mapped[str] = mapped_column(String(10), default="en")
    mode: Mapped[str] = mapped_column(String(30), default="query")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    severity: Mapped[str] = mapped_column(String(20))
    location: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    temperature_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    rainfall_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class HistoricalWeather(Base):
    __tablename__ = "historical_weather"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location: Mapped[str] = mapped_column(String(200), index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    temperature_c: Mapped[float] = mapped_column(Float)
    rainfall_mm: Mapped[float] = mapped_column(Float, default=0.0)
    source: Mapped[str] = mapped_column(String(100), default="OpenWeatherMap")


def init_db() -> None:
    """Create tables on startup; suitable for the demo's automatic initialization."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as exc:
        logger.error("Database initialization failed or postponed: %s", exc)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
