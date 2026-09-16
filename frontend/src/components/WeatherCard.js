import React from "react";
import Icon from "./Icon";

function weatherIcon(description = "") {
  const text = description.toLowerCase();
  if (text.includes("rain") || text.includes("drizzle") || text.includes("storm")) return "rain";
  if (text.includes("cloud") || text.includes("overcast")) return "cloud";
  return "sun";
}

function fmt(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(digits);
}

export default function WeatherCard({ weather, forecast, simplified = false }) {
  if (!weather) return null;
  const items = (forecast?.items || []).slice(0, 3);
  const updated = weather.timestamp ? new Date(weather.timestamp) : new Date();
  const source = weather.source || forecast?.source || "WeatherGPT";
  return (
    <div className="weather-card">
      <div className="weather-card__top">
        <div>
          <div className="eyebrow">CURRENT WEATHER</div>
          <h3>{weather.location || "Your location"}</h3>
          <p className="muted">{updated.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })} · {updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="weather-card__condition">
          <Icon name={weatherIcon(weather.description)} size={38} strokeWidth={1.5} />
          <span>{weather.description || "Weather"}</span>
        </div>
      </div>

      <div className="weather-card__hero">
        <div className="weather-temp">{fmt(weather.temperature, 0)}<span>°C</span></div>
        <div className="weather-feels">Feels like {fmt(weather.feels_like, 0)}°</div>
      </div>

      {!simplified ? (
        <div className="weather-stats">
          <div><Icon name="humidity" /><span><b>{fmt(weather.humidity)}%</b><small>Humidity</small></span></div>
          <div><Icon name="wind" /><span><b>{fmt(weather.wind_speed, 1)} m/s</b><small>Wind speed</small></span></div>
          <div><Icon name="rain" /><span><b>{fmt(weather.rain_1h, 1)} mm</b><small>Rain · 1 hour</small></span></div>
        </div>
      ) : (
        <div className="simple-summary">
          <p><strong>{Number(weather.temperature) >= 35 ? "☀️ HOT" : Number(weather.temperature) <= 20 ? "🧥 COOL" : "🌤️ MILD"}</strong> day — {fmt(weather.temperature, 0)} degrees.</p>
          <p>💦 Feels like {fmt(weather.feels_like, 0)} degrees.</p>
          <p>💧 Air humidity is {fmt(weather.humidity)}%.</p>
          <p>🌤️ Sky is {weather.description || "mixed"}.</p>
          <p>🌬️ Wind is around {fmt(weather.wind_speed, 1)} m/s.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="forecast-block">
          <div className="section-label">3-DAY FORECAST</div>
          <div className="forecast-grid">
            {items.map((item, index) => (
              <div className="forecast-day" key={`${item.time}-${index}`}>
                <span className="forecast-day__name">{index === 0 ? "Today" : index === 1 ? "Tomorrow" : "Day 3"}</span>
                <Icon name={weatherIcon(item.description)} size={23} />
                <strong>{fmt(item.temperature, 0)}°</strong>
                <span className="muted">{item.description || "—"}</span>
                <span className="rain-chance">{Math.round(Number(item.rain_probability || 0) * 100)}% rain</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="weather-card__footer">
        <span><Icon name="shield" size={14} /> Source: {source}</span>
        {source.toLowerCase().includes("demo") && <span className="fallback-badge">Demo fallback</span>}
      </div>
    </div>
  );
}
