import React, { useMemo, useState } from "react";

const DATA = {
  "Tamil Nadu": { "Chennai": ["Chennai"], "Madurai": ["Madurai"], "Coimbatore": ["Coimbatore"], "Tiruchirappalli": ["Tiruchirappalli"], "Salem": ["Salem"] },
  "Karnataka": { "Bengaluru Urban": ["Bengaluru"], "Mysuru": ["Mysuru"], "Mangaluru": ["Mangaluru"] },
  "Telangana": { "Hyderabad": ["Hyderabad"] },
  "Maharashtra": { "Mumbai": ["Mumbai"], "Pune": ["Pune"], "Nagpur": ["Nagpur"] },
  "Delhi": { "New Delhi": ["Delhi"] },
  "West Bengal": { "Kolkata": ["Kolkata"] },
  "Gujarat": { "Ahmedabad": ["Ahmedabad"], "Surat": ["Surat"] },
  "Kerala": { "Ernakulam": ["Kochi"], "Thiruvananthapuram": ["Thiruvananthapuram"] },
  "Rajasthan": { "Jaipur": ["Jaipur"], "Jodhpur": ["Jodhpur"] },
  "Uttar Pradesh": { "Lucknow": ["Lucknow"], "Kanpur": ["Kanpur"] },
  "Odisha": { "Khordha": ["Bhubaneswar"] },
  "Punjab": { "Ludhiana": ["Ludhiana"], "Amritsar": ["Amritsar"] }
};

export default function LocationPicker({ value, onChange, onClose }) {
  const states = Object.keys(DATA);

  const initialState = states.find((s) => Object.values(DATA[s]).flat().includes(value)) || "Tamil Nadu";
  const initialDistricts = Object.keys(DATA[initialState]);
  const initialDistrict = initialDistricts.find((d) => DATA[initialState][d].includes(value)) || initialDistricts[0];

  const [state, setState] = useState(initialState);
  const [district, setDistrict] = useState(initialDistrict);
  const [city, setCity] = useState(() => DATA[initialState][initialDistrict][0]);

  const districts = Object.keys(DATA[state] || {});
  const cities = useMemo(() => DATA[state]?.[district] || [], [state, district]);

  const selectState = (next) => {
    const nextDistricts = Object.keys(DATA[next] || {});
    const nextDistrict = nextDistricts[0] || "";
    const nextCities = DATA[next]?.[nextDistrict] || [];
    setState(next);
    setDistrict(nextDistrict);
    setCity(nextCities[0] || "");
  };

  const selectDistrict = (next) => {
    const nextCities = DATA[state]?.[next] || [];
    setDistrict(next);
    setCity(nextCities[0] || "");
  };

  const save = () => {
    if (city && typeof onChange === "function") {
      onChange(city);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="eyebrow">Your place</div><h2>Choose location</h2></div>
          <button type="button" onClick={onClose} aria-label="Close location picker">×</button>
        </div>

        <div className="location-steps"><span className="active">1 State</span><span>→</span><span>2 District</span><span>→</span><span>3 City / town</span></div>

        <label>
          State
          <select
            value={state}
            onChange={(e) => selectState(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Select state"
          >
            {states.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label>
          District
          <select
            value={district}
            onChange={(e) => selectDistrict(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Select district"
          >
            {districts.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label>
          City / town
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Select city or town"
          >
            {cities.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <button type="button" className="location-save" onClick={save} disabled={!city}>Use {city || "location"} →</button>
      </div>
    </div>
  );
}
