# WeatherGPT — integrated multilingual build

This build fixes three major runtime problems:

1. **Weather API loading**: backend secrets are loaded only from `backend/.env`; no API key is hard-coded in Python. Fallback weather is never cached, so a temporary provider failure cannot poison the next live request.
2. **Indian-language location detection**: common city names are recognized from English and Indian-script queries, so `இன்று சென்னையில்...` resolves to Chennai instead of defaulting to Delhi.
3. **11-language answers**: the Groq prompt explicitly targets the selected language and preserves weather values. If Groq is unavailable, the backend has localized deterministic fallbacks.

Supported response/voice languages:
English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia.

## Run

From the project root:

```powershell
# If backend/.env already exists, keep it and verify the values.
# Otherwise:
Copy-Item .\backend\.env.example .\backend\.env
notepad .\backend\.env

# Use your real keys in backend/.env:
# OPENWEATHER_API_KEY=...
# GROQ_API_KEY=...
# GROQ_MODEL=openai/gpt-oss-20b

docker compose down
docker compose up -d --build
docker compose ps
```

Check configuration without printing secrets:

```powershell
docker compose exec backend python -c "from app.core.config import get_settings; s=get_settings(); print('OPENWEATHER:', bool(s.openweather_api_key)); print('GROQ:', bool(s.groq_api_key)); print('MODEL:', s.groq_model); print('LANGUAGES:', s.languages)"
```

Expected:

```text
OPENWEATHER: True
GROQ: True
MODEL: openai/gpt-oss-20b
LANGUAGES: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
```

Then open `http://localhost:3000`.

## If old demo data still appears

The updated weather service does not cache fallback responses. Restart the stack so the new backend code is loaded:

```powershell
docker compose down
docker compose up -d --build
docker compose logs backend --tail=100
```

The UI will clearly label fallback data. A live response should show `OpenWeatherMap` as the provider.

## Security

Never place OpenWeatherMap or Groq secrets in React source files or frontend environment variables. Browser-exposed React variables are not secret. Keep keys in `backend/.env` and do not commit that file.
