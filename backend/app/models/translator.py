import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
}


class Translator:
    """Translate WeatherGPT responses while keeping weather numbers intact.

    Groq is used when available. A small deterministic fallback keeps the app
    usable if the LLM is temporarily unavailable.
    """

    def __init__(self):
        self.languages = LANG_NAMES
        self.llm = None
        if settings.groq_api_key:
            try:
                from langchain_groq import ChatGroq
                self.llm = ChatGroq(
                    api_key=settings.groq_api_key,
                    model=settings.groq_model,
                    temperature=0,
                    max_tokens=500,
                )
            except Exception as exc:
                logger.warning("Translation LLM unavailable: %s", exc)

    async def to_english(self, text: str, language: str) -> str:
        # The weather/location extractor works best from the original text for
        # supported Indian-language examples. Keep it unchanged rather than
        # pretending the phrase-level fallback is a real translator.
        return text

    async def from_english(self, text: str, language: str) -> str:
        if language == "en" or not text:
            return text

        language_name = LANG_NAMES.get(language)
        if not language_name:
            return text

        if self.llm:
            prompt = f"""You are a professional translator for WeatherGPT.
Translate the following weather answer into {language_name} ({language}).
Rules:
- Output ONLY the translated answer, with no preface or explanation.
- Preserve every number, temperature, percentage, wind speed, place name, and unit exactly.
- Do not add facts that are not present in the source.
- Keep the answer natural and easy for an Indian user to understand.

Source answer:
{text}"""
            try:
                result = await self.llm.ainvoke(prompt)
                translated = result.content if hasattr(result, "content") else str(result)
                if translated and translated.strip():
                    return translated.strip()
            except Exception as exc:
                logger.warning("Translation LLM failed: %s", exc)

        return self._fallback_translate(text, language)

    def _fallback_translate(self, text: str, language: str) -> str:
        phrases: dict[str, dict[str, str]] = {
            "hi": {
                "In ": "में ", "it is currently": "अभी तापमान है",
                "feels like": "महसूस हो रहा है", "with": "और",
                "humidity": "आर्द्रता", "Live OpenWeatherMap data.": "लाइव OpenWeatherMap डेटा।",
                "Safety check for": "के लिए सुरक्षा जांच:",
                "Follow official IMD/local authority warnings for emergencies.": "आपात स्थिति में आधिकारिक IMD/स्थानीय प्रशासन की चेतावनियों का पालन करें।",
            },
            "ta": {
                "In ": "இல் ", "it is currently": "தற்போது வெப்பநிலை",
                "feels like": "உணரப்படும் வெப்பநிலை", "humidity": "ஈரப்பதம்",
                "with": "மற்றும்", "Live OpenWeatherMap data.": "நேரடி OpenWeatherMap தரவு.",
                "Safety check for": "பாதுகாப்பு நிலை:",
                "Follow official IMD/local authority warnings for emergencies.": "அவசரநிலைகளில் அதிகாரப்பூர்வ IMD/உள்ளூர் நிர்வாக எச்சரிக்கைகளைப் பின்பற்றவும்.",
            },
            "bn": {
                "humidity": "আর্দ্রতা", "feels like": "অনুভূত তাপমাত্রা",
                "Live OpenWeatherMap data.": "লাইভ OpenWeatherMap ডেটা।",
            },
            "mr": {
                "humidity": "आर्द्रता", "feels like": "जाणवणारे तापमान",
                "Live OpenWeatherMap data.": "थेट OpenWeatherMap डेटा.",
            },
            "gu": {
                "humidity": "ભેજ", "feels like": "અનુભવાતું તાપમાન",
                "Live OpenWeatherMap data.": "લાઇવ OpenWeatherMap ડેટા.",
            },
        }
        result = text
        for source, target in phrases.get(language, {}).items():
            result = result.replace(source, target)
        return result
