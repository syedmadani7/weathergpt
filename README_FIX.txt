WeatherGPT Auto Fix
===================

This patch fixes the problems seen in the logs/screenshots:
1. Groq llama-3.1-8b-instant deprecation/model_not_found -> openai/gpt-oss-20b.
2. Old `from app.core.config import settings` imports are supported again.
3. Tamil/Hindi/Bengali/Marathi/Gujarati responses are explicitly generated in the selected language.
4. Translation has an LLM path plus deterministic fallback.
5. The API passes the selected language into LLMRouter.
6. Docker Compose reads backend/.env where backend API keys belong.
7. Duplicate ChatInterface query event listeners are removed.

IMPORTANT:
- This patch does NOT contain your API keys.
- Keep your existing backend/.env. Do not replace it with .env.example.
- If your backend/.env contains GROQ_MODEL=llama-3.1-8b-instant, the code automatically maps that deprecated value to openai/gpt-oss-20b.

Apply:
1. Extract this zip into your existing WeatherGPT project folder and allow overwrite.
2. Keep your existing backend/.env with OPENWEATHER_API_KEY and GROQ_API_KEY.
3. Run:
   docker compose down
   docker compose build --no-cache backend frontend
   docker compose up -d
4. Check:
   docker compose ps
   docker compose logs backend --tail=80
5. Open http://localhost:3000
6. Select Tamil and ask: இன்று சென்னையில் வானிலை எப்படி இருக்கும்?

If Docker build fails with `lookup auth.docker.io: no such host`, that is a Docker/network/DNS problem, not a code problem. Retry after Docker Desktop has internet access.
