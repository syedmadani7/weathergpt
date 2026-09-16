import React, { useState } from "react";

const severityMeta = {
  red: { label: "Red alert", icon: "!", className: "alert-red" },
  orange: { label: "Orange alert", icon: "!", className: "alert-orange" },
  yellow: { label: "Yellow alert", icon: "i", className: "alert-yellow" },
  green: { label: "All clear", icon: "✓", className: "alert-green" }
};

export default function AlertDisplay({ alerts = [], open, onToggle }) {
  const [expanded, setExpanded] = useState(null);
  const count = alerts.length;
  return (
    <aside className={`alerts-panel ${open ? "open" : "closed"}`}>
      <div className="alerts-head">
        <div>
          <div className="eyebrow">Safety desk</div>
          <h2>Weather alerts {count > 0 && <span className="count-badge">{count}</span>}</h2>
        </div>
        <button className="panel-close" onClick={onToggle} aria-label="Toggle alerts panel">{open ? "›" : "‹"}</button>
      </div>
      {open && (
        <div className="alerts-body">
          <div className="alert-status"><span className="status-dot" /> Live alert stream</div>
          {alerts.length === 0 ? (
            <div className="all-clear">
              <div className="clear-icon">✓</div>
              <strong>No active alerts</strong>
              <p>We'll keep watching the connected alert stream.</p>
            </div>
          ) : alerts.map((alert, index) => {
            const meta = severityMeta[alert.severity] || severityMeta.yellow;
            const isExpanded = expanded === index;
            return (
              <div className={`alert-card ${meta.className}`} key={`${alert.timestamp}-${index}`}>
                <div className="alert-card-top">
                  <span className="severity-pill"><b>{meta.icon}</b>{meta.label}</span>
                  <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <strong>{alert.location}</strong>
                <p>{alert.message}</p>
                <button className="text-link" onClick={() => setExpanded(isExpanded ? null : index)}>{isExpanded ? "Hide details" : "View details"} →</button>
                {isExpanded && <div className="alert-detail">Follow official IMD and local authority instructions. Avoid unnecessary travel during severe conditions.</div>}
              </div>
            );
          })}
          <div className="imd-note"><span>◈</span><div><strong>Official-source mindset</strong><p>WeatherGPT separates provider data from demo fallback data. For emergencies, verify official IMD advisories.</p></div></div>
        </div>
      )}
    </aside>
  );
}
