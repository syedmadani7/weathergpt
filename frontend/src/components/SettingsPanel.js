import React from "react";
import Icon from "./Icon";
import LanguageSelector from "./LanguageSelector";

export default function SettingsPanel({ open, onClose, language, onLanguageChange, simple, setSimple }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="settings-panel" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Settings">
      <div className="modal-header"><div><div className="eyebrow">PREFERENCES</div><h2>Settings</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div>
      <div className="profile-card"><div className="profile-avatar">SM</div><div><b>WeatherGPT user</b><small>Guest session · preferences saved locally</small></div><button className="icon-button"><Icon name="edit" size={16}/></button></div>
      <div className="settings-section"><h3><Icon name="globe"/> Language</h3><div className="setting-row"><div><b>Display language</b><small>WeatherGPT responses and labels</small></div><LanguageSelector language={language} onChange={onLanguageChange} compact/></div></div>
      <div className="settings-section"><h3><Icon name="sun"/> Units</h3><div className="segmented"><button className="active">°C</button><button>°F</button></div></div>
      <div className="settings-section"><h3><Icon name="bell"/> Notifications</h3><SettingToggle label="Severe alerts" checked/><SettingToggle label="Daily forecast"/><SettingToggle label="Weather changes"/></div>
      <div className="settings-section"><h3><Icon name="shield"/> Accessibility</h3><SettingToggle label="High contrast"/><SettingToggle label="Simplified weather language" checked={simple} onChange={() => setSimple(!simple)}/><SettingToggle label="Larger text"/></div>
      <div className="settings-section"><h3><Icon name="pin"/> Location</h3><div className="setting-row"><div><b>Auto-detect</b><small>Ask before using your location</small></div><button className="toggle"><span/></button></div></div>
      <div className="settings-section"><h3><Icon name="trash"/> Data</h3><button className="danger-link">Clear chat history</button></div>
    </div>
  </div>;
}

function SettingToggle({ label, checked, onChange }) { return <div className="setting-row"><div><b>{label}</b></div><button className={`toggle ${checked ? "toggle--on" : ""}`} onClick={onChange} aria-pressed={checked}><span/></button></div>; }
