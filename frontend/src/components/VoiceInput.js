import React, { useEffect, useRef, useState } from "react";

const speechCodes = {
  en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN",
  mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN", or: "or-IN"
};

export default function VoiceInput({ language, onTranscript }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return undefined; }
    const recognition = new SpeechRecognition();
    recognition.lang = speechCodes[language] || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      onTranscript(transcript, Boolean(event.results[event.results.length - 1].isFinal));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch (_) {} };
  }, [language, onTranscript]);

  if (!supported) return null;

  const toggle = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    try { recognitionRef.current?.start(); setListening(true); } catch (_) { setListening(false); }
  };

  return (
    <button type="button" className={`icon-button voice-button ${listening ? "recording" : ""}`} onClick={toggle} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop listening" : "Voice question"}>
      <span className="mic-dot">{listening ? "●" : "♩"}</span>
      {listening && <span className="wave"><i /><i /><i /><i /><i /></span>}
    </button>
  );
}
