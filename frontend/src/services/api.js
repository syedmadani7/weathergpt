const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
let sessionId = localStorage.getItem("weathergpt_session") || null;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function queryWeather(query, language = "en", location = null) {
  const data = await request("/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, location, language, session_id: sessionId })
  });
  sessionId = data.session_id;
  localStorage.setItem("weathergpt_session", sessionId);
  return data;
}

export async function getWeather(location) {
  return request(`/weather?location=${encodeURIComponent(location)}`);
}

export async function getStatus() {
  return request("/status");
}

export function createAlertSocket(onMessage) {
  const wsBase = API_BASE.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/ws`);
  ws.onmessage = (event) => {
    try { onMessage(JSON.parse(event.data)); } catch (_) {}
  };
  return ws;
}
