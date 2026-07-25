"""FAISS-backed vector store with a parallel chunk-metadata sidecar."""

import json
from pathlib import Path

import faiss
import numpy as np

from papermind.chunking.schemas import Chunk
from papermind.core.logging import get_logger

logger = get_logger(__name__)

_INDEX_FILENAME = "index.faiss"
_METADATA_FILENAME = "metadata.json"


class VectorStoreError(Exception):
    """Raised when the persisted index and metadata are inconsistent or missing."""


class FaissVectorStore:
    """Wraps a FAISS `IndexFlatIP` with a metadata list kept in lockstep.

    FAISS only knows about vectors and their integer positions -- it has no
    concept of "which paper and page this vector came from". We maintain
    that mapping ourselves: `self.metadata[i]` is always the Chunk for the
    vector at index position `i`. Every method that mutates the index
    mutates `metadata` in the same call, so the two can never drift apart.

    `IndexFlatIP` performs exact (brute-force) inner-product search. On
    L2-normalized vectors (see `Embedder`), inner product is equivalent to
    cosine similarity. Exact search is deliberate: at the scale of a 20-100
    paper collection (thousands, not millions, of chunks), brute force is
    fast enough that there's no reason to take on the recall/accuracy
    trade-offs of an approximate index (e.g. IVF, HNSW).
    """

    def __init__(self, dim: int) -> None:
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.metadata: list[Chunk] = []

    def add(self, embeddings: np.ndarray, chunks: list[Chunk]) -> None:
        """Add vectors and their corresponding chunks. Order must match."""
        if len(embeddings) != len(chunks):
            raise ValueError(
                f"Got {len(embeddings)} embeddings but {len(chunks)} chunks -- "
                "these must be the same length and in the same order."
            )
        if len(embeddings) == 0:
            return

        self.index.add(embeddings)
        self.metadata.extend(chunks)

    def search(self, query_embedding: np.ndarray, k: int = 5) -> list[tuple[Chunk, float]]:
        """Return the top-k (chunk, similarity_score) pairs for a query vector."""
        if self.index.ntotal == 0:
            return []

        k = min(k, self.index.ntotal)
        scores, indices = self.index.search(query_embedding.reshape(1, -1), k)

        results = []
        for score, idx in zip(scores[0], indices[0], strict=True):
            if idx == -1:
                continue
            results.append((self.metadata[idx], float(score)))
        return results

    def save(self, directory: Path) -> None:
        directory.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(directory / _INDEX_FILENAME))
        payload = [chunk.model_dump() for chunk in self.metadata]
        (directory / _METADATA_FILENAME).write_text(json.dumps(payload, indent=2))
        logger.info("Saved FAISS index (%d vectors) to %s", self.index.ntotal, directory)

    @classmethod
    def load(cls, directory: Path) -> "FaissVectorStore":
        index_path = directory / _INDEX_FILENAME
        metadata_path = directory / _METADATA_FILENAME
        if not index_path.exists() or not metadata_path.exists():
            raise VectorStoreError(f"No persisted index found at {directory}")

        index = faiss.read_index(str(index_path))
        metadata = [Chunk(**item) for item in json.loads(metadata_path.read_text())]

        if index.ntotal != len(metadata):
            raise VectorStoreError(
                f"Index/metadata mismatch: {index.ntotal} vectors but "
                f"{len(metadata)} metadata entries. The persisted files are "
                "corrupt or were written by two different runs."
            )

        store = cls(dim=index.d)
        store.index = index
        store.metadata = metadata
        return store
