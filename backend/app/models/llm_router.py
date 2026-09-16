import logging
from app.core.cache import get_text, set_text
from app.core.config import get_settings
from app.models.rag_pipeline import RAGPipeline

logger = logging.getLogger(__name__)
settings = get_settings()

LANG_NAMES = {
    "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
    "bn": "Bengali", "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada",
    "ml": "Malayalam", "pa": "Punjabi", "or": "Odia",
}


class LLMRouter:
    def __init__(self):
        self.rag = RAGPipeline()
        self.llm = None
        if settings.groq_api_key:
            self._build_llm()

    def _build_llm(self):
        try:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                api_key=settings.groq_api_key,
                model=settings.groq_model,
                temperature=0.1,
                max_tokens=700,
            )
        except Exception as exc:
            logger.warning("Groq/LangChain unavailable; using fallback: %s", exc)
            self.llm = None

    def choose_mode(self, query: str) -> str:
        q = (query or "").lower()
        if any(x in q for x in ["alert", "warning", "danger", "emergency", "heatwave", "flood", "cyclone", "எச்சரிக்கை", "వర్షం", "వెదర్ అలర్ట్"]):
            return "alert"
        if any(x in q for x in ["why", "explain", "what is", "meaning", "how does", "ஏன்", "விளக்க", "क्यों", "काय"]):
            return "explain"
        return "query"

    async def answer(self, query, weather, forecast, mode, language="en"):
        cache_key = f"{query}|{weather.get('location')}|{mode}|{language}|{weather.get('source')}"
        cached = get_text("llm:v2", cache_key)
        if cached:
            return cached, ["OpenWeatherMap" if weather.get("source") == "OpenWeatherMap" else "WeatherGPT Demo Fallback", "WeatherGPT Knowledge Base"]

        context = self.rag.retrieve(query)
        language_name = LANG_NAMES.get(language, "English")
        answer = None
        if self.llm:
            prompt = f"""You are WeatherGPT, a trustworthy Indian weather assistant.
The user may write in any Indian language. Understand the question semantically and answer in ONLY {language_name} ({language}).

Mode: {mode}
Current weather data (authoritative for this answer): {weather}
Forecast data: {forecast}
Safety knowledge: {context}

Rules:
1. Use the supplied weather data; do not invent or replace values.
2. Never say weather data is unavailable when current weather.source is OpenWeatherMap.
3. If current weather.fallback is true, clearly say that demo fallback data is being used.
4. Keep numbers, units, location names, dates and percentages accurate.
5. Give a natural, human-sounding answer, not a robotic template.
6. Answer the user's actual question first, then useful details.
7. Reply ONLY in {language_name}. Do not mix English except proper nouns, API/provider names, units, or unavoidable place names.
8. If asked for today's weather, include temperature, feels-like, humidity, wind, condition, rain and a short advisory when useful.

User question:
{query}"""
            try:
                result = await self.llm.ainvoke(prompt)
                answer = result.content if hasattr(result, "content") else str(result)
            except Exception as exc:
                logger.warning("LLM call failed: %s", exc)
                # Retry with the currently supported model if an old model was configured.
                if settings.groq_api_key:
                    try:
                        from langchain_groq import ChatGroq
                        retry_llm = ChatGroq(api_key=settings.groq_api_key, model="openai/gpt-oss-20b", temperature=0.1, max_tokens=700)
                        result = await retry_llm.ainvoke(prompt)
                        answer = result.content if hasattr(result, "content") else str(result)
                    except Exception as retry_exc:
                        logger.warning("Groq retry failed: %s", retry_exc)

        if not answer:
            answer = self._fallback(weather, forecast, mode, language)

        set_text("llm:v2", cache_key, answer, settings.llm_cache_ttl)
        source = "OpenWeatherMap" if weather.get("source") == "OpenWeatherMap" else "WeatherGPT Demo Fallback"
        return answer.strip(), [source, "WeatherGPT Knowledge Base"]

    @staticmethod
    def _fallback(weather, forecast, mode, language="en"):
        t = weather.get("temperature", "N/A")
        feels = weather.get("feels_like", "N/A")
        h = weather.get("humidity", "N/A")
        wind = weather.get("wind_speed", "N/A")
        rain = weather.get("rain_1h", 0)
        desc = weather.get("description", "unknown")
        loc = weather.get("location", "your location")
        live = weather.get("source") == "OpenWeatherMap"
        note = {
            "en": "Live OpenWeatherMap data." if live else "Live weather is temporarily unavailable; showing clearly labelled demo data.",
            "hi": "लाइव OpenWeatherMap डेटा।" if live else "लाइव मौसम डेटा अभी उपलब्ध नहीं है; स्पष्ट रूप से डेमो डेटा दिखाया जा रहा है।",
            "ta": "நேரடி OpenWeatherMap தரவு." if live else "நேரடி வானிலை தரவு இப்போது கிடைக்கவில்லை; டெமோ தரவு தெளிவாகக் குறிக்கப்பட்டுள்ளது.",
            "te": "ప్రత్యక్ష OpenWeatherMap డేటా." if live else "ప్రత్యక్ష వాతావరణ డేటా ప్రస్తుతం అందుబాటులో లేదు; డెమో డేటா தெளிவாக చూపப்படுகிறது.",
            "bn": "লাইভ OpenWeatherMap ডেটা।" if live else "লাইভ আবহাওয়ার তথ্য এখন পাওয়া যাচ্ছে না; ডেমো ডেটা স্পষ্টভাবে দেখানো হচ্ছে।",
            "mr": "थेट OpenWeatherMap डेटा." if live else "थेट हवामान डेटा सध्या उपलब्ध नाही; डेमो डेटा स्पष्टपणे दाखवला आहे.",
            "gu": "લાઇવ OpenWeatherMap ડેટા." if live else "લાઇવ હવામાન ડેટા હાલમાં ઉપલબ્ધ નથી; ડેમો ડેટા સ્પષ્ટ રીતે બતાવવામાં આવ્યો છે.",
            "kn": "ಲೈವ್ OpenWeatherMap ಡೇಟಾ." if live else "ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ ಈಗ ಲಭ್ಯವಿಲ್ಲ; ಡೆಮೊ ಡೇಟಾವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸಲಾಗಿದೆ.",
            "ml": "തത്സമയ OpenWeatherMap ഡാറ്റ." if live else "തത്സമയ കാലാവസ്ഥാ ഡാറ്റ ഇപ്പോൾ ലഭ്യമല്ല; ഡെമോ ഡാറ്റ വ്യക്തമായി കാണിക്കുന്നു.",
            "pa": "ਲਾਈਵ OpenWeatherMap ਡਾਟਾ।" if live else "ਲਾਈਵ ਮੌਸਮ ਡਾਟਾ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ; ਡੈਮੋ ਡਾਟਾ ਸਪਸ਼ਟ ਤੌਰ 'ਤੇ ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।",
            "or": "ଲାଇଭ୍ OpenWeatherMap ତଥ୍ୟ।" if live else "ଲାଇଭ୍ ପାଣିପାଗ ତଥ୍ୟ ବର୍ତ୍ତମାନ ଉପଲବ୍ଧ ନାହିଁ; ଡେମୋ ତଥ୍ୟ ସ୍ପଷ୍ଟ ଭାବରେ ଦେଖାଯାଉଛି।",
        }.get(language, "Live OpenWeatherMap data." if live else "Live weather data is temporarily unavailable; demo data is clearly labelled.")

        if language == "ta":
            return f"{loc} நகரில் தற்போது {t}°C; உணரப்படும் வெப்பநிலை {feels}°C. வானிலை {desc}, ஈரப்பதம் {h}%, காற்றின் வேகம் {wind} m/s, கடந்த ஒரு மணி நேர மழை {rain} mm. {note}"
        if language == "hi":
            return f"{loc} में अभी तापमान {t}°C है और महसूस होने वाला तापमान {feels}°C है। मौसम {desc} है, आर्द्रता {h}% और हवा की गति {wind} m/s है। पिछले एक घंटे में बारिश {rain} mm है। {note}"
        if language == "te":
            return f"{loc}లో ప్రస్తుతం ఉష్ణోగ్రత {t}°C, అనిపించే ఉష్ణోగ్రత {feels}°C. వాతావరణం {desc}, తేమ {h}%, గాలి వేగం {wind} m/s, గత గంటలో వర్షపాతం {rain} mm. {note}"
        if language == "bn":
            return f"{loc}-এ এখন তাপমাত্রা {t}°C এবং অনুভূত তাপমাত্রা {feels}°C। আবহাওয়া {desc}, আর্দ্রতা {h}%, বাতাসের গতি {wind} m/s এবং গত এক ঘণ্টায় বৃষ্টিপাত {rain} mm। {note}"
        if language == "mr":
            return f"{loc} येथे सध्या तापमान {t}°C आणि जाणवणारे तापमान {feels}°C आहे. हवामान {desc}, आर्द्रता {h}%, वाऱ्याचा वेग {wind} m/s आणि मागील एका तासातील पाऊस {rain} mm आहे. {note}"
        if language == "gu":
            return f"{loc}માં હાલમાં તાપમાન {t}°C અને અનુભવાતું તાપમાન {feels}°C છે. હવામાન {desc}, ભેજ {h}%, પવનની ઝડપ {wind} m/s અને છેલ્લા એક કલાકનો વરસાદ {rain} mm છે. {note}"
        if language == "kn":
            return f"{loc}ನಲ್ಲಿ ಈಗ ತಾಪಮಾನ {t}°C ಮತ್ತು ಅನುಭವವಾಗುವ ತಾಪಮಾನ {feels}°C ಇದೆ. ಹವಾಮಾನ {desc}, ತೇವಾಂಶ {h}%, ಗಾಳಿಯ ವೇಗ {wind} m/s ಮತ್ತು ಕಳೆದ ಒಂದು ಗಂಟೆಯ ಮಳೆ {rain} mm. {note}"
        if language == "ml":
            return f"{loc}ൽ ഇപ്പോൾ താപനില {t}°C, അനുഭവപ്പെടുന്ന താപനില {feels}°C ആണ്. കാലാവസ്ഥ {desc}, ഈർപ്പം {h}%, കാറ്റിന്റെ വേഗം {wind} m/s, കഴിഞ്ഞ ഒരു മണിക്കൂറിലെ മഴ {rain} mm. {note}"
        if language == "pa":
            return f"{loc} ਵਿੱਚ ਇਸ ਵੇਲੇ ਤਾਪਮਾਨ {t}°C ਅਤੇ ਮਹਿਸੂਸ ਹੋਣ ਵਾਲਾ ਤਾਪਮਾਨ {feels}°C ਹੈ। ਮੌਸਮ {desc}, ਨਮੀ {h}%, ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ {wind} m/s ਅਤੇ ਪਿਛਲੇ ਇੱਕ ਘੰਟੇ ਦੀ ਬਾਰਿਸ਼ {rain} mm ਹੈ। {note}"
        if language == "or":
            return f"{loc}ରେ ବର୍ତ୍ତମାନ ତାପମାତ୍ରା {t}°C ଏବଂ ଅନୁଭୂତ ତାପମାତ୍ରା {feels}°C। ପାଣିପାଗ {desc}, ଆର୍ଦ୍ରତା {h}%, ପବନ ବେଗ {wind} m/s ଏବଂ ଗତ ଏକ ଘଣ୍ଟାର ବର୍ଷା {rain} mm। {note}"
        return f"In {loc}, it is currently {t}°C, feels like {feels}°C, with {desc}. Humidity is {h}%, wind is {wind} m/s, and rain in the last hour is {rain} mm. {note}"
