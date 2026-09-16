# WeatherGPT Frontend Delivery

This package contains the refreshed WeatherGPT frontend and small compatibility updates for the existing backend.

## Design

- Human-designed light interface inspired by familiar productivity/chat applications without copying a branded UI.
- Three-area desktop layout: chat history, conversation, live alerts.
- Responsive tablet/mobile navigation.
- Weather cards with current conditions, three forecast slots, source/fallback labeling.
- Detailed and simplified weather views.
- Voice push-to-talk UI with Indian locale codes.
- 11-language selector: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia.
- Location modal with state → district → city flow and five recent locations.
- Settings panel with language, units, notification, accessibility and data controls.
- Local chat history and pinned-chat presentation.
- Accessible labels, focus-friendly controls, responsive typography and keyboard-friendly composer.

## Backend compatibility updates

- API keys are no longer embedded in Python source defaults.
- Groq model default remains `openai/gpt-oss-20b`.
- Backend language name maps include all 11 frontend languages.
- `backend/.env.example` includes the expected variables.

## Run

1. Create `backend/.env` from `backend/.env.example`.
2. Put the real OpenWeatherMap and Groq keys in `backend/.env` only.
3. Run:

```powershell
docker compose up -d --build
```

4. Open `http://localhost:3000`.
5. Backend health: `http://localhost:8000/health`.

The frontend does not contain API secrets. `REACT_APP_API_URL` defaults to `http://localhost:8000`.
