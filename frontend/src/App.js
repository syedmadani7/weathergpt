import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChatInterface from "./components/ChatInterface";
import AlertDisplay from "./components/AlertDisplay";
import LanguageSelector, { LANGUAGES } from "./components/LanguageSelector";
import { createAlertSocket, getStatus } from "./services/api";
import LocationPicker from "./components/LocationPicker";

const LOCATIONS = ["Chennai", "Madurai", "Coimbatore", "Bengaluru", "Hyderabad", "Delhi", "Mumbai", "Kolkata", "Pune", "Ahmedabad", "Kochi"];
const langLabel = (code) => LANGUAGES.find((x) => x[0] === code)?.[1] || "English";

function Icon({ children }) { return <span className="ui-icon" aria-hidden="true">{children}</span>; }

export default function App() {
  const [language, setLanguage] = useState(localStorage.getItem("weathergpt_language") || "en");
  const [location, setLocation] = useState(localStorage.getItem("weathergpt_location") || "Chennai");
  const [alerts, setAlerts] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("weathergpt_history") || "[]"));
  const [search, setSearch] = useState("");
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  useEffect(() => { localStorage.setItem("weathergpt_language", language); }, [language]);
  useEffect(() => { localStorage.setItem("weathergpt_location", location); }, [location]);
  useEffect(() => { getStatus().then(setStatus).catch(() => setStatus(null)); }, []);
  useEffect(() => {
    const socket = createAlertSocket((data) => { if (data?.type === "alert") setAlerts((current) => [data, ...current].slice(0, 8)); });
    return () => { try { socket.close(); } catch (_) {} };
  }, []);

  const startNewChat = () => { localStorage.removeItem("weathergpt_messages"); window.location.reload(); };
  const chooseLocation = useCallback((value) => setLocation(value), []);
  const addHistory = (title) => { if (!title) return; const item = { title, location, time: Date.now() }; const next = [item, ...history.filter((h) => h.title !== title)].slice(0, 12); setHistory(next); localStorage.setItem("weathergpt_history", JSON.stringify(next)); };
  const filteredHistory = useMemo(() => history.filter((h) => h.title.toLowerCase().includes(search.toLowerCase())), [history, search]);
  const today = filteredHistory.slice(0, 4);
  const older = filteredHistory.slice(4);

  return <div className="app">
    <aside className={`sidebar ${sidebarOpen ? "" : "sidebar-hidden"}`}>
      <div className="brand"><div className="brand-mark"><span>☁</span><i /></div><div><strong>WeatherGPT</strong><small>AI Weather Intelligence</small></div><button className="sidebar-collapse" onClick={() => setSidebarOpen(false)}>×</button></div>
      <button className="new-chat" onClick={startNewChat}><span>＋</span> New chat <kbd>Ctrl K</kbd></button>
      <div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats" /><kbd>⌘F</kbd></div>
      <button className="locations-title" onClick={() => setLocation(location)}><span>⌖</span><span>Locations</span><em>{Math.min(5, LOCATIONS.length)} saved</em></button>
      <div className="saved-locations">{LOCATIONS.slice(0, 5).map((loc) => <button key={loc} className={loc === location ? "selected" : ""} onClick={() => chooseLocation(loc)}><span>○</span>{loc}</button>)}</div>
      <div className="history-scroll">
        <div className="history-group"><label>Pinned</label>{today.slice(0, 1).map((h) => <button key={h.time} className="history-item pinned" onClick={() => addHistory(h.title)}><span>★</span><div>{h.title}<small>{new Date(h.time).toLocaleDateString()}</small></div></button>)}{today.length === 0 && <button className="history-item pinned"><span>★</span><div>Chennai weather today<small>Just now</small></div></button>}</div>
        <div className="history-group"><label>Today</label>{today.map((h) => <button key={h.time} className="history-item" onClick={() => addHistory(h.title)}><div>{h.title}<small>{new Date(h.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div></button>)}{today.length === 0 && <button className="history-item" onClick={() => addHistory("Chennai weather today")}><div>Chennai weather today<small>Now</small></div></button>}</div>
        <div className="history-group"><label>Previous days</label>{older.slice(0, 5).map((h) => <button key={h.time} className="history-item" onClick={() => addHistory(h.title)}><div>{h.title}<small>{new Date(h.time).toLocaleDateString()}</small></div></button>)}<button className="history-item"><div>Madurai weekend weather<small>Yesterday</small></div></button></div>
      </div>
      <div className="profile"><div className="avatar">WG</div><div><strong>WeatherGPT user</strong><small>Guest session</small></div><button onClick={() => setSettingsOpen(true)} aria-label="Settings">⚙</button></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="topbar-title"><button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button><div><strong>Weather assistant</strong><span><i /> {status?.weather_api_configured ? "Live weather" : "Weather service setup needed"}</span></div></div><div className="topbar-actions"><button className="location-chip" onClick={() => setLocationPickerOpen(true)}><Icon>⌖</Icon>{location}<b>›</b></button><LanguageSelector language={language} onChange={setLanguage} /><button className="top-icon" onClick={() => setAlertsOpen(!alertsOpen)} aria-label="Alerts">♢{alerts.length > 0 && <em>{alerts.length}</em>}</button><button className="top-icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">⚙</button></div></header>
      <div className="workspace"><section className="chat-area"><ChatInterface language={language} location={location} onLocationChange={(loc) => { setLocation(loc); addHistory(`${loc} weather`); }} onOpenLocation={() => setLocationPickerOpen(true)} /></section><AlertDisplay alerts={alerts} open={alertsOpen} onToggle={() => setAlertsOpen(!alertsOpen)} /></div>
    </main>

    {locationPickerOpen && <LocationPicker value={location} onChange={(loc) => { setLocation(loc); addHistory(`${loc} weather`); }} onClose={() => setLocationPickerOpen(false)} />}
    {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><div className="settings-modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">Preferences</div><h2>Settings</h2></div><button onClick={() => setSettingsOpen(false)}>×</button></div><div className="settings-list"><div><b>Language</b><span>{langLabel(language)}</span><LanguageSelector language={language} onChange={setLanguage} /></div><div><b>Temperature</b><span>Celsius (°C)</span><button className="setting-control">°C</button></div><div><b>Voice language</b><span>{langLabel(language)}</span><button className="setting-control">Auto</button></div><div><b>Notifications</b><span>Severe weather alerts</span><button className="toggle on"><i /></button></div><div><b>Accessibility</b><span>Readable text and keyboard focus</span><button className="toggle on"><i /></button></div><div><b>Default location</b><span>{location}</span><button className="setting-control">Change</button></div></div><div className="modal-foot">WeatherGPT · {status?.groq_configured ? "AI connected" : "AI setup needed"}</div></div></div>}
  </div>;
}
