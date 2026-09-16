import logging
import re

logger = logging.getLogger(__name__)

KNOWLEDGE = [
    ("Heatwave", "A heatwave is a prolonged period of unusually high temperatures. Stay hydrated, avoid strenuous outdoor activity during peak heat, and follow official local advisories."),
    ("Heavy rainfall", "Heavy rainfall can cause urban and river flooding. Avoid driving through floodwater and move to safer higher ground when authorities advise evacuation."),
    ("Thunderstorm", "During thunderstorms, move indoors, avoid isolated trees and open fields, and unplug sensitive electronics where practical."),
    ("Weather warnings", "Weather warnings should be treated as time-sensitive safety information. Prefer official IMD and local authority instructions for evacuation and emergency action."),
]

# Multilingual keywords to allow high-accuracy safety advisory retrieval without heavy local neural models
TOPIC_KEYWORDS = {
    "Heatwave": {
        "heat", "heatwave", "hot", "warm", "sun", "sunny", "temperature", "burn", "dehydration",
        "hydration", "summer", "loo", "लू", "गर्मी", "धूप", "வெப்பம்", "சூடு", "வேடி", "ఎండ",
    },
    "Heavy rainfall": {
        "rain", "rainfall", "heavy", "flood", "flooding", "water", "monsoon", "downpour", "drench",
        "inundation", "cloudburst", "बारिश", "बाढ़", "बरसात", "மழை", "வெள்ளம்", "వర్షం", "వరద",
    },
    "Thunderstorm": {
        "thunder", "lightning", "storm", "thunderstorm", "strike", "electric", "gust", "squall", "wind",
        "hail", "cyclone", "तूफान", "बिजली", "இடி", "மின்னல்", "புயல்", "తుఫాను", "మెరుపు",
    },
    "Weather warnings": {
        "warning", "alert", "danger", "advisory", "imd", "emergency", "precaution", "safety", "evacuation",
        "severe", "red", "orange", "चेतावनी", "अलर्ट", "खतरा", "எச்சரிக்கை", "ஆபத்து", "హెచ్చరిక", "ప్రమాదం",
    },
}


class RAGPipeline:
    """Lightweight, low-memory RAG retriever designed for constrained cloud environments (e.g. Render 512MB RAM).

    Uses semantic token & multilingual keyword matching for instantaneous retrieval
    without heavy PyTorch / SentenceTransformer memory overhead.
    """

    def __init__(self):
        logger.info("Initialized lightweight zero-memory RAG pipeline.")

    def retrieve(self, query: str) -> list[dict]:
        if not query:
            return [{"topic": topic, "text": text} for topic, text in KNOWLEDGE[:3]]

        # Tokenize query into alphanumeric and Indian language script words
        tokens = set(re.findall(r"[\w\u0900-\u0D7F]+", query.lower()))
        scored = []

        for topic, text in KNOWLEDGE:
            score = 0
            text_lower = text.lower()
            topic_lower = topic.lower()
            keywords = TOPIC_KEYWORDS.get(topic, set())

            for token in tokens:
                if token in topic_lower:
                    score += 4
                if token in keywords:
                    score += 3
                if token in text_lower:
                    score += 1

            scored.append((score, topic, text))

        # Sort descending by relevance score
        scored.sort(key=lambda item: item[0], reverse=True)
        return [{"topic": topic, "text": text} for _, topic, text in scored[:3]]

