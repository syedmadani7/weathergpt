# WeatherGPT Frontend

A human-designed, responsive WeatherGPT interface for conversational weather intelligence.

## Included

- ChatGPT-style three-area desktop layout
- Local chat history, pinned chats and new-chat flow
- Current weather and 3-day forecast cards using the existing `/query` response
- Live WebSocket alert panel using `/ws`
- 11 Indian-language selector
- Browser voice input and read-aloud
- State → district → city location picker with recent locations
- Detailed / Simple weather view
- Settings and accessibility preferences
- Responsive mobile navigation
- Favicon and WeatherGPT branding

## Run

From the project root:

```powershell
docker compose up -d --build
```

Then open `http://localhost:3000`. The frontend expects the backend at `http://localhost:8000` unless `REACT_APP_API_URL` is changed.

Secrets belong in `backend/.env`; never put weather or Groq API keys in the React frontend.
