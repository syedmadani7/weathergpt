import re
from datetime import datetime, timezone


CITY_ALIASES = {
    "Delhi": ["delhi", "new delhi", "दिल्ली", "नई दिल्ली", "ਦਿੱਲੀ", "ଠିଲ୍ଲୀ"],
    "Chennai": ["chennai", "madras", "சென்னை", "சென்னையில்", "சென்னையின்", "चेन्नई", "చెన్నై", "চেন্নাই"],
    "Mumbai": ["mumbai", "bombay", "மும்பை", "मुंबई", "ముంబై", "মুম্বাই"],
    "Bengaluru": ["bengaluru", "bangalore", "பெங்களூரு", "பெங்களூர்", "बेंगलुरु", "ಬೆಂಗಳೂರು", "బెంగళూరు"],
    "Hyderabad": ["hyderabad", "ஹைதராபாத்", "हैदराबाद", "హైదరాబాద్", "হায়দরাবাদ"],
    "Kolkata": ["kolkata", "calcutta", "கொல்கத்தா", "কলকাতা", "कोलकाता", "কলকাতায়"],
    "Pune": ["pune", "புனே", "पुणे", "পুনে", "પુણે"],
    "Ahmedabad": ["ahmedabad", "அகமதாபாத்", "अहमदाबाद", "અમદાવાદ", "আহমেদাবাদ"],
    "Kochi": ["kochi", "cochin", "கொச்சி", "കൊച്ചി", "कोच्चि"],
    "Madurai": ["madurai", "மதுரை", "மதுரையில்", "मदुरै", "మదురై"],
    "Coimbatore": ["coimbatore", "கோயம்புத்தூர்", "கோவை", "कोयंबटूर", "கோயம்புத்தூரில்", "కోయంబత్తూరు"],
    "Tiruchirappalli": ["tiruchirappalli", "trichy", "திருச்சிராப்பள்ளி", "திருச்சி", "त्रिची", "తిరుచిరాపల్లి"],
    "Salem": ["salem", "சேலம்", "சேலத்தில்", "सेलम", "సేలం"],
    "Jaipur": ["jaipur", "ஜெய்ப்பூர்", "जयपुर", "जयपुर में", "జైపూర్"],
    "Lucknow": ["lucknow", "லக்னோ", "लखनऊ", "లక్నో"],
    "Visakhapatnam": ["visakhapatnam", "vizag", "విశాఖపట్నం", "విశాఖ", "विशाखापट्टणम", "ভাইজাগ"],
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def extract_location(text: str, explicit_location: str | None = None) -> str:
    haystack = (text or "").lower()
    # This handles Indian scripts without relying on English prepositions.
    for canonical, aliases in CITY_ALIASES.items():
        for alias in aliases:
            if alias.lower() in haystack:
                return canonical

    # If the query did not name a city, use the location selected in the UI.
    if explicit_location and explicit_location.strip():
        return explicit_location.strip()

    # English free-form fallback for cities not in the alias table.
    patterns = [
        r"\bin\s+([A-Za-z][A-Za-z .'-]{1,60})",
        r"\bat\s+([A-Za-z][A-Za-z .'-]{1,60})",
        r"\bnear\s+([A-Za-z][A-Za-z .'-]{1,60})",
        r"\bfor\s+([A-Za-z][A-Za-z .'-]{1,60})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text or "", re.IGNORECASE)
        if match:
            return match.group(1).strip(" ?.,")
    return "Delhi"


def safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default
