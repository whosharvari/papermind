from pathlib import Path

import pytest

from papermind.chunking.schemas import Chunk
from papermind.embeddings.embedder import Embedder
from papermind.retrieval.retriever import Retriever
from papermind.vectorstore.faiss_store import FaissVectorStore

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

DOCS = [
    "The Eiffel Tower is a wrought-iron lattice tower in Paris, France.",
    "Photosynthesis converts light energy into chemical energy in plants.",
    "The Great Wall of China stretches thousands of kilometers.",
]


def _chunk(index: int, text: str) -> Chunk:
    return Chunk(
        id=f"doc.pdf::{index:04d}",
        text=text,
        source_file="doc.pdf",
        page_number=index + 1,
        chunk_index=index,
    )


@pytest.fixture(scope="module")
def embedder() -> Embedder:
    return Embedder(EMBEDDING_MODEL)


@pytest.fixture(scope="module")
def retriever(embedder: Embedder) -> Retriever:
    chunks = [_chunk(i, text) for i, text in enumerate(DOCS)]
    store = FaissVectorStore(dim=embedder.embedding_dim)
    store.add(embedder.embed(DOCS), chunks)
    return Retriever(store, embedder)


def test_retrieve_ranks_most_relevant_chunk_first(retriever: Retriever) -> None:
    results = retriever.retrieve("landmark tower in Paris", k=2)

    assert results[0].chunk.text == DOCS[0]
    assert results[0].score > results[1].score


def test_retrieve_respects_k(retriever: Retriever) -> None:
    assert len(retriever.retrieve("plants and energy", k=1)) == 1
    assert len(retriever.retrieve("plants and energy", k=3)) == 3


def test_from_disk_round_trip(tmp_path: Path, embedder: Embedder) -> None:
    chunks = [_chunk(i, text) for i, text in enumerate(DOCS)]
    store = FaissVectorStore(dim=embedder.embedding_dim)
    store.add(embedder.embed(DOCS), chunks)
    store.save(tmp_path)

    retriever = Retriever.from_disk(tmp_path, EMBEDDING_MODEL)
    results = retriever.retrieve("ancient wall in China", k=1)

    assert results[0].chunk.text == DOCS[2]
