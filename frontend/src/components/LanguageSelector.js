import React from "react";

export const LANGUAGES = [
  ["en", "English", "EN"], ["hi", "हिन्दी", "HI"], ["ta", "தமிழ்", "TA"],
  ["te", "తెలుగు", "TE"], ["bn", "বাংলা", "BN"], ["mr", "मराठी", "MR"],
  ["gu", "ગુજરાતી", "GU"], ["kn", "ಕನ್ನಡ", "KN"], ["ml", "മലയാളം", "ML"],
  ["pa", "ਪੰਜਾਬੀ", "PA"], ["or", "ଓଡ଼ିଆ", "OR"]
];

export default function LanguageSelector({ language, onChange }) {
  const handleChange = (event) => {
    const next = event.target.value;
    if (typeof onChange === "function") onChange(next);
  };

  return (
    <label className="language-select" title="Response language">
      <span aria-hidden="true">◎</span>
      <select
        value={language || "en"}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Response language"
      >
        {LANGUAGES.map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
