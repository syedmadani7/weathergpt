import React from "react";

const paths = {
  cloud: <><path d="M17.5 19H8a5 5 0 1 1 1.2-9.85A6 6 0 0 1 20.5 12H21a3 3 0 0 1 0 6h-3.5"/><path d="M8 19h10"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
  pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
  star: <path d="m12 3 2.75 5.57 6.15.9-4.45 4.34 1.05 6.12L12 17.04 6.5 19.93l1.05-6.12L3.1 9.47l6.15-.9L12 3Z"/>,
  clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.77 1.77-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.5v-.13A1.7 1.7 0 0 0 11.5 18.3a1.7 1.7 0 0 0-1.88.34l-.06.06-1.77-1.77.06-.06A1.7 1.7 0 0 0 8.2 15.0a1.7 1.7 0 0 0-1.56-1.03H6.5v-2.5h.13A1.7 1.7 0 0 0 8.2 10.4a1.7 1.7 0 0 0-.34-1.88L7.8 8.46l1.77-1.77.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5.4h2.5v.13a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.77 1.77-.06.06A1.7 1.7 0 0 0 19.4 10.4c.16.62.72 1.03 1.36 1.03h.14v2.5h-.14A1.7 1.7 0 0 0 19.4 15Z"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="M6 6l12 12M18 6 6 18"/></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></>,
  send: <><path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z"/><path d="M10.5 13.5 21 3"/></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.7-4L3 10M3 5v5h5"/><path d="M4 13a8 8 0 0 0 14.7 4L21 14M21 19v-5h-5"/></>,
  volume: <><path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  rain: <><path d="M7 17.5 5.5 21M12 17.5 10.5 21M17 17.5 15.5 21"/><path d="M6 17h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 6 11a3 3 0 0 0 0 6Z"/></>,
  wind: <><path d="M3 8h10a3 3 0 1 0-3-3M3 12h14a3 3 0 1 1-3 3M3 16h7"/></>,
  humidity: <path d="M12 3s6 6.3 6 10.5A6 6 0 0 1 6 13.5C6 9.3 12 3 12 3Z"/>,
  thermometer: <><path d="M10 4a2 2 0 1 1 4 0v8.1a4.5 4.5 0 1 1-4 0V4Z"/><path d="M12 10v5"/></>,
  menuDots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  logout: <><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 16l4-4-4-4M9 12h9"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
  globe: <><circle cx="12" cy="12" r="8.5"/><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2 2.2 3 5 3 8.5s-1 6.3-3 8.5c-2-2.2-3-5-3-8.5s1-6.3 3-8.5Z"/></>,
  shield: <path d="M12 3 19 6v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3Z"/>,
  info: <><circle cx="12" cy="12" r="8.5"/><path d="M12 10v6M12 7.5h.01"/></>,
  edit: <><path d="m4 16.5-.7 4.2 4.2-.7L19 8.5 15.5 5 4 16.5Z"/><path d="m13.5 7 3.5 3.5"/></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></>,
};

export default function Icon({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.info}</svg>;
}
