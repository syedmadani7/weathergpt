import logging
from pathlib import Path

logger = logging.getLogger(__name__)

try:
    from langchain_core.documents import Document
    from langchain_community.vectorstores import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings
except Exception:
    Document = Chroma = HuggingFaceEmbeddings = None


KNOWLEDGE = [
    ("Heatwave", "A heatwave is a prolonged period of unusually high temperatures. Stay hydrated, avoid strenuous outdoor activity during peak heat, and follow official local advisories."),
    ("Heavy rainfall", "Heavy rainfall can cause urban and river flooding. Avoid driving through floodwater and move to safer higher ground when authorities advise evacuation."),
    ("Thunderstorm", "During thunderstorms, move indoors, avoid isolated trees and open fields, and unplug sensitive electronics where practical."),
    ("Weather warnings", "Weather warnings should be treated as time-sensitive safety information. Prefer official IMD and local authority instructions for evacuation and emergency action."),
]


class RAGPipeline:
    def __init__(self):
        self.store = None
        if Chroma and HuggingFaceEmbeddings:
            try:
                embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
                docs = [Document(page_content=text, metadata={"topic": topic}) for topic, text in KNOWLEDGE]
                self.store = Chroma.from_documents(docs, embedding=embeddings, collection_name="weathergpt_knowledge")
            except Exception as exc:
                logger.warning("Chroma initialization skipped: %s", exc)

    def retrieve(self, query: str) -> list[dict]:
        if self.store:
            try:
                docs = self.store.similarity_search(query, k=3)
                return [{"topic": d.metadata.get("topic", "Knowledge"), "text": d.page_content} for d in docs]
            except Exception as exc:
                logger.warning("RAG retrieval failed: %s", exc)
        q = query.lower()
        ranked = sorted(
            [{"topic": topic, "text": text} for topic, text in KNOWLEDGE],
            key=lambda x: sum(word in x["text"].lower() for word in q.split()),
            reverse=True,
        )
        return ranked[:3]
