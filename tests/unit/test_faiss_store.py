from pathlib import Path

import numpy as np
import pytest

from papermind.chunking.schemas import Chunk
from papermind.vectorstore.faiss_store import FaissVectorStore, VectorStoreError

DIM = 4


def _chunk(index: int) -> Chunk:
    return Chunk(
        id=f"doc.pdf::{index:04d}",
        text=f"chunk text {index}",
        source_file="doc.pdf",
        page_number=index + 1,
        chunk_index=index,
    )


def _unit_vector(values: list[float]) -> np.ndarray:
    v = np.array(values, dtype=np.float32)
    return v / np.linalg.norm(v)


def test_add_raises_on_length_mismatch() -> None:
    store = FaissVectorStore(dim=DIM)
    embeddings = np.zeros((2, DIM), dtype=np.float32)

    with pytest.raises(ValueError):
        store.add(embeddings, [_chunk(0)])


def test_search_returns_most_similar_chunk_first() -> None:
    store = FaissVectorStore(dim=DIM)
    vectors = np.stack(
        [
            _unit_vector([1, 0, 0, 0]),
            _unit_vector([0, 1, 0, 0]),
            _unit_vector([0.9, 0.1, 0, 0]),  # close to vector 0
        ]
    )
    chunks = [_chunk(0), _chunk(1), _chunk(2)]
    store.add(vectors, chunks)

    query = _unit_vector([1, 0, 0, 0])
    results = store.search(query, k=2)

    assert results[0][0].id == "doc.pdf::0000"  # exact match first
    assert results[1][0].id == "doc.pdf::0002"  # near match second
    assert results[0][1] > results[1][1]  # scores are descending


def test_search_on_empty_store_returns_empty_list() -> None:
    store = FaissVectorStore(dim=DIM)

    assert store.search(_unit_vector([1, 0, 0, 0])) == []


def test_search_k_larger_than_index_size_does_not_error() -> None:
    store = FaissVectorStore(dim=DIM)
    store.add(np.stack([_unit_vector([1, 0, 0, 0])]), [_chunk(0)])

    results = store.search(_unit_vector([1, 0, 0, 0]), k=10)

    assert len(results) == 1


def test_save_and_load_round_trip_preserves_vectors_and_metadata(tmp_path: Path) -> None:
    store = FaissVectorStore(dim=DIM)
    vectors = np.stack([_unit_vector([1, 0, 0, 0]), _unit_vector([0, 1, 0, 0])])
    chunks = [_chunk(0), _chunk(1)]
    store.add(vectors, chunks)

    store.save(tmp_path)
    loaded = FaissVectorStore.load(tmp_path)

    assert loaded.index.ntotal == 2
    assert [c.id for c in loaded.metadata] == [c.id for c in chunks]
    results = loaded.search(_unit_vector([1, 0, 0, 0]), k=1)
    assert results[0][0].id == "doc.pdf::0000"


def test_load_raises_when_no_index_exists(tmp_path: Path) -> None:
    with pytest.raises(VectorStoreError):
        FaissVectorStore.load(tmp_path)


def test_load_raises_on_index_metadata_mismatch(tmp_path: Path) -> None:
    store = FaissVectorStore(dim=DIM)
    store.add(np.stack([_unit_vector([1, 0, 0, 0])]), [_chunk(0)])
    store.save(tmp_path)

    # Corrupt the metadata file so it disagrees with the index's vector count.
    (tmp_path / "metadata.json").write_text("[]")

    with pytest.raises(VectorStoreError):
        FaissVectorStore.load(tmp_path)
