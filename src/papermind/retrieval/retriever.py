from pathlib import Path

from papermind.embeddings.embedder import Embedder
from papermind.retrieval.schemas import RetrievedChunk
from papermind.vectorstore.faiss_store import FaissVectorStore

DEFAULT_TOP_K = 5


class Retriever:
    def __init__(self, store: FaissVectorStore, embedder: Embedder) -> None:
        self._store = store
        self._embedder = embedder

    @classmethod
    def from_disk(cls, vector_store_dir: Path, embedding_model: str) -> "Retriever":
        store = FaissVectorStore.load(vector_store_dir)
        embedder = Embedder(embedding_model)
        return cls(store, embedder)

    def retrieve(self, query: str, k: int = DEFAULT_TOP_K) -> list[RetrievedChunk]:
        query_vector = self._embedder.embed([query])[0]
        results = self._store.search(query_vector, k=k)
        return [RetrievedChunk(chunk=chunk, score=score) for chunk, score in results]
