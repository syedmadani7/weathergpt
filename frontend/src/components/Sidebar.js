import React from "react";
import Icon from "./Icon";

export default function Sidebar({ open, onClose, onNewChat, chats, selectedId, onSelect, onLocation, onSettings }) {
  const today = chats.filter((c) => c.group === "Today");
  const older = chats.filter((c) => c.group !== "Today");
  return <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
    <div className="sidebar-top">
      <div className="brand"><div className="brand-mark"><Icon name="cloud" size={21}/><span className="brand-dot"/></div><div><b>WeatherGPT</b><small>AI Weather Intelligence</small></div><button className="mobile-close icon-button" onClick={onClose}><Icon name="close" size={17}/></button></div>
      <button className="new-chat" onClick={onNewChat}><Icon name="plus" size={18}/> New chat <span>⌘K</span></button>
      <label className="chat-search"><Icon name="search" size={16}/><input placeholder="Search chats"/><span>⌘F</span></label>
    </div>
    <div className="sidebar-scroll">
      <button className="sidebar-link" onClick={onLocation}><span className="sidebar-link__icon"><Icon name="pin"/></span><span>Locations</span><small>5 saved</small></button>
      <div className="history-group"><div className="history-label"><span>Pinned</span></div>{chats.filter((c) => c.pinned).map((chat) => <ChatItem key={chat.id} chat={chat} active={chat.id === selectedId} onSelect={onSelect}/>)}</div>
      <div className="history-group"><div className="history-label"><span>Today</span></div>{today.length ? today.map((chat) => <ChatItem key={chat.id} chat={chat} active={chat.id === selectedId} onSelect={onSelect}/>) : <div className="history-empty">No chats yet</div>}</div>
      <div className="history-group"><div className="history-label"><span>Previous days</span></div>{older.length ? older.map((chat) => <ChatItem key={chat.id} chat={chat} active={chat.id === selectedId} onSelect={onSelect}/>) : <div className="history-empty">Your older chats will appear here</div>}</div>
    </div>
    <div className="sidebar-bottom"><button className="profile-button"><span className="profile-avatar profile-avatar--small">SM</span><span><b>WeatherGPT user</b><small>Guest session</small></span></button><button className="icon-button" onClick={onSettings} aria-label="Settings"><Icon name="settings" size={19}/></button></div>
  </aside>;
}

function ChatItem({ chat, active, onSelect }) { return <button className={`chat-item ${active ? "chat-item--active" : ""}`} onClick={() => onSelect(chat.id)}><span className="chat-item__title">{chat.title}</span><span className="chat-item__meta">{chat.time}</span></button>; }
