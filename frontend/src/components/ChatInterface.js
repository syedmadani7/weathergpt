import React, { useEffect, useRef, useState } from "react";
import { queryWeather } from "../services/api";
import VoiceInput from "./VoiceInput";

const copy = {
  en: { hello: "Hello! I’m your weather companion.", sub: "Ask naturally — weather, rain, heat, forecasts or warnings.", placeholder: "Ask about weather, forecasts, or warnings…", send: "Send", simple: "Simple", detailed: "Detailed", try: "Try asking", live: "Live weather" },
  hi: { hello: "नमस्ते! मैं आपका मौसम सहायक हूँ।", sub: "मौसम, बारिश, गर्मी, पूर्वानुमान या चेतावनी के बारे में पूछें।", placeholder: "मौसम, पूर्वानुमान या चेतावनी के बारे में पूछें…", send: "भेजें", simple: "सरल", detailed: "विस्तृत", try: "ऐसा पूछें", live: "लाइव मौसम" },
  ta: { hello: "வணக்கம்! நான் உங்கள் வானிலை துணை.", sub: "வானிலை, மழை, வெப்பம், முன்னறிவிப்பு அல்லது எச்சரிக்கை பற்றி கேளுங்கள்.", placeholder: "வானிலை, முன்னறிவிப்பு அல்லது எச்சரிக்கை பற்றி கேளுங்கள்…", send: "அனுப்பு", simple: "எளிமை", detailed: "விரிவாக", try: "இப்படி கேட்கலாம்", live: "நேரடி வானிலை" },
  te: { hello: "నమస్కారం! నేను మీ వాతావరణ సహాయకుడిని.", sub: "వాతావరణం, వర్షం, వేడి, అంచనా లేదా హెచ్చరికల గురించి అడగండి.", placeholder: "వాతావరణం, అంచనా లేదా హెచ్చరిక గురించి అడగండి…", send: "పంపండి", simple: "సులభం", detailed: "వివరంగా", try: "ఇలా అడగండి", live: "ప్రత్యక్ష వాతావరణం" },
  bn: { hello: "নমস্কার! আমি আপনার আবহাওয়া সহকারী।", sub: "আবহাওয়া, বৃষ্টি, গরম, পূর্বাভাস বা সতর্কতা জিজ্ঞেস করুন।", placeholder: "আবহাওয়া, পূর্বাভাস বা সতর্কতা সম্পর্কে জিজ্ঞেস করুন…", send: "পাঠান", simple: "সহজ", detailed: "বিস্তারিত", try: "এভাবে জিজ্ঞেস করুন", live: "লাইভ আবহাওয়া" },
  mr: { hello: "नमस्कार! मी तुमचा हवामान सहाय्यक आहे.", sub: "हवामान, पाऊस, उष्णता, अंदाज किंवा इशाऱ्यांबद्दल विचारा.", placeholder: "हवामान, अंदाज किंवा इशाऱ्यांबद्दल विचारा…", send: "पाठवा", simple: "सोपे", detailed: "तपशील", try: "असे विचारा", live: "थेट हवामान" },
  gu: { hello: "નમસ્તે! હું તમારો હવામાન સહાયક છું.", sub: "હવામાન, વરસાદ, ગરમી, આગાહી અથવા ચેતવણી વિશે પૂછો.", placeholder: "હવામાન, આગાહી અથવા ચેતવણી વિશે પૂછો…", send: "મોકલો", simple: "સરળ", detailed: "વિગતવાર", try: "આ રીતે પૂછો", live: "લાઇવ હવામાન" },
  kn: { hello: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಹವಾಮಾನ ಸಹಾಯಕ.", sub: "ಹವಾಮಾನ, ಮಳೆ, ಬಿಸಿಲು, ಮುನ್ಸೂಚನೆ ಅಥವಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಕೇಳಿ.", placeholder: "ಹವಾಮಾನ, ಮುನ್ಸೂಚನೆ ಅಥವಾ ಎಚ್ಚರಿಕೆ ಕೇಳಿ…", send: "ಕಳುಹಿಸಿ", simple: "ಸರಳ", detailed: "ವಿವರ", try: "ಹೀಗೆ ಕೇಳಿ", live: "ಲೈವ್ ಹವಾಮಾನ" },
  ml: { hello: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കാലാവസ്ഥാ സഹായി.", sub: "കാലാവസ്ഥ, മഴ, ചൂട്, പ്രവചനം അല്ലെങ്കിൽ മുന്നറിയിപ്പുകൾ ചോദിക്കാം.", placeholder: "കാലാവസ്ഥ, പ്രവചനം അല്ലെങ്കിൽ മുന്നറിയിപ്പ് ചോദിക്കൂ…", send: "അയയ്ക്കുക", simple: "ലളിതം", detailed: "വിശദം", try: "ഇങ്ങനെ ചോദിക്കാം", live: "തത്സമയ കാലാവസ്ഥ" },
  pa: { hello: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਮੌਸਮ ਸਹਾਇਕ ਹਾਂ।", sub: "ਮੌਸਮ, ਮੀਂਹ, ਗਰਮੀ, ਪੂਰਵ ਅਨੁਮਾਨ ਜਾਂ ਚੇਤਾਵਨੀ ਬਾਰੇ ਪੁੱਛੋ।", placeholder: "ਮੌਸਮ, ਪੂਰਵ ਅਨੁਮਾਨ ਜਾਂ ਚੇਤਾਵਨੀ ਬਾਰੇ ਪੁੱਛੋ…", send: "ਭੇਜੋ", simple: "ਸੌਖਾ", detailed: "ਵੇਰਵਾ", try: "ਇੰਝ ਪੁੱਛੋ", live: "ਲਾਈਵ ਮੌਸਮ" },
  or: { hello: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ପାଣିପାଗ ସହାୟକ।", sub: "ପାଣିପାଗ, ବର୍ଷା, ଗରମ, ପୂର୍ବାନୁମାନ କିମ୍ବା ସତର୍କତା ପଚାରନ୍ତୁ।", placeholder: "ପାଣିପାଗ, ପୂର୍ବାନୁମାନ କିମ୍ବା ସତର୍କତା ପଚାରନ୍ତୁ…", send: "ପଠାନ୍ତୁ", simple: "ସରଳ", detailed: "ବିସ୍ତୃତ", try: "ଏଭଳି ପଚାରନ୍ତୁ", live: "ଲାଇଭ୍ ପାଣିପାଗ" }
};

const examples = {
  en: "What’s the weather in Chennai today?", hi: "आज दिल्ली में मौसम कैसा है?", ta: "இன்று சென்னையில் வானிலை எப்படி இருக்கும்?", te: "ఈరోజు హైదరాబాద్‌లో వాతావరణం ఎలా ఉంటుంది?", bn: "আজ কলকাতার আবহাওয়া কেমন?", mr: "आज मुंबईचे हवामान कसे आहे?", gu: "આજે અમદાવાદનું હવામાન કેવું છે?", kn: "ಇಂದು ಬೆಂಗಳೂರಿನ ಹವಾಮಾನ ಹೇಗಿದೆ?", ml: "ഇന്ന് കൊച്ചിയിലെ കാലാവസ്ഥ എങ്ങനെയാണ്?", pa: "ਅੱਜ ਦਿੱਲੀ ਦਾ ਮੌਸਮ ਕਿਹੋ ਜਿਹਾ ਹੈ?", or: "ଆଜି ଭୁବନେଶ୍ୱରର ପାଣିପାଗ କେମିତି?"
};

function WeatherCard({ data, simple }) {
  if (!data) return null;
  const icon = /rain|drizzle|storm/i.test(data.description || "") ? "☂" : /cloud/i.test(data.description || "") ? "☁" : "☀";
  return (
    <div className="weather-card">
      <div className="weather-card-head"><div><div className="eyebrow">Current weather</div><h3>{data.location}</h3><span>{new Date(data.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span></div><div className="weather-symbol">{icon}<small>{data.description}</small></div></div>
      <div className="temp-line"><strong>{Math.round(data.temperature)}<sup>°C</sup></strong><span>Feels like {Math.round(data.feels_like)}°</span></div>
      {!simple && <div className="metric-row"><div><b>{data.humidity}%</b><span>Humidity</span></div><div><b>{Number(data.wind_speed).toFixed(1)} m/s</b><span>Wind</span></div><div><b>{Number(data.rain_1h || 0).toFixed(1)} mm</b><span>Rain · 1h</span></div></div>}
      {data.fallback && <div className="fallback-note">Demo fallback · live weather provider could not be reached</div>}
    </div>
  );
}

function Forecast({ forecast }) {
  if (!forecast?.items?.length) return null;
  const days = forecast.items.filter((_, i) => i % 3 === 0).slice(0, 3);
  return <div className="forecast"><div className="eyebrow">3-day outlook</div><div className="forecast-grid">{days.map((item, i) => <div className="forecast-item" key={`${item.time}-${i}`}><span>{i === 0 ? "Today" : i === 1 ? "Tomorrow" : "Day 3"}</span><b>{Math.round(item.temperature)}°</b><small>{item.description}</small><em>{Math.round((item.rain_probability || 0) * 100)}% rain</em></div>)}</div></div>;
}

export default function ChatInterface({ language, location, onLocationChange, onOpenLocation }) {
  const t = copy[language] || copy.en;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [simple, setSimple] = useState(false);
  const bottom = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("weathergpt_messages");
    if (saved) { try { setMessages(JSON.parse(saved)); } catch (_) {} }
  }, []);
  useEffect(() => { localStorage.setItem("weathergpt_messages", JSON.stringify(messages.slice(-30))); }, [messages]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text = input) => {
    const value = text.trim();
    if (!value || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: value, time: Date.now() }]);
    setLoading(true);
    try {
      const data = await queryWeather(value, language, location);
      if (data.location) onLocationChange(data.location);
      setMessages((m) => [...m, { role: "assistant", text: data.response, weather: data.weather, forecast: data.forecast, sources: data.sources, fallback: data.fallback, time: Date.now() }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", error: true, text: err.message?.includes("Failed to fetch") ? "No internet connection. Please check that WeatherGPT backend is running." : `Weather service error: ${err.message}`, time: Date.now() }]);
    } finally { setLoading(false); }
  };

  const clear = () => { setMessages([]); localStorage.removeItem("weathergpt_messages"); setTimeout(() => inputRef.current?.focus(), 50); };
  const onVoice = React.useCallback((text, final) => { setInput(text); if (final && text.trim()) send(text); }, [language, location, loading]);

  return <div className="chat-shell">
    <div className="chat-scroll">
      {messages.length === 0 && <div className="welcome"><div className="welcome-mark">☁</div><h1>{t.hello}</h1><p>{t.sub}</p><button onClick={() => send(examples[language] || examples.en)}>{t.try}: <strong>{examples[language] || examples.en}</strong> <span>→</span></button></div>}
      {messages.map((msg, i) => <div key={msg.time || i} className={`message-row ${msg.role}`}>
        <div className={`message ${msg.error ? "message-error" : ""}`}>
          {msg.role === "assistant" && <div className="assistant-avatar">☁</div>}
          <div className="message-content"><p>{msg.text}</p>{msg.weather && <WeatherCard data={msg.weather} simple={simple} />}{msg.forecast && <Forecast forecast={msg.forecast} />}{msg.sources?.length > 0 && <div className="source-line">◈ {msg.sources.join(" · ")}{msg.fallback && <span className="demo-tag">Demo fallback</span>}</div>}
          {msg.role === "assistant" && !msg.error && <div className="message-actions"><button onClick={() => navigator.clipboard?.writeText(msg.text)}>Copy</button><button onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(msg.text))}>Read aloud</button><button onClick={() => navigator.share?.({ title: "WeatherGPT", text: msg.text })}>Share</button></div>}</div>
        </div>
      </div>)}
      {loading && <div className="message-row assistant"><div className="message"><div className="assistant-avatar">☁</div><div className="typing"><i/><i/><i/></div></div></div>}
      <div ref={bottom} />
    </div>
    <div className="composer-wrap">
      <div className="mode-bar"><div><span className="live-pill"><i /> {t.live}</span><button className="clear-link" onClick={clear}>Clear chat</button></div><div className="segmented"><button className={!simple ? "active" : ""} onClick={() => setSimple(false)}>{t.detailed}</button><button className={simple ? "active" : ""} onClick={() => setSimple(true)}>{t.simple}</button></div></div>
      <div className="composer"><button className="attach-button" title="Choose location" onClick={onOpenLocation}>⌖</button><textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={t.placeholder} rows={1} aria-label="Weather question" />{input && <button className="clear-input" onClick={() => setInput("")} aria-label="Clear input">×</button>}<VoiceInput language={language} onTranscript={onVoice} /><button className="send-button" onClick={() => send()} disabled={loading || !input.trim()} aria-label={t.send}>↑</button></div>
      <div className="composer-foot">WeatherGPT can make mistakes. For severe weather, verify official IMD advisories.</div>
    </div>
  </div>;
}
