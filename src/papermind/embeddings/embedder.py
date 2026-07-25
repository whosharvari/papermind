"""Embedding generation via Sentence Transformers."""

import numpy as np
from sentence_transformers import SentenceTransformer

from papermind.core.logging import get_logger

logger = get_logger(__name__)


class Embedder:
    """Wraps a Sentence Transformers model for batch text embedding."""

    def __init__(self, model_name: str, batch_size: int = 32) -> None:
        self._model = SentenceTransformer(model_name)
        self._batch_size = batch_size
        self.embedding_dim: int = self._model.get_embedding_dimension()
        logger.info("Loaded embedding model %s (dim=%d)", model_name, self.embedding_dim)

    def embed(self, texts: list[str]) -> np.ndarray:
        """Embed a batch of texts.

        Returns an (N, embedding_dim) float32 array of L2-normalized vectors,
        so that FAISS inner-product search is equivalent to cosine similarity.
        """
        if not texts:
            return np.empty((0, self.embedding_dim), dtype=np.float32)

        embeddings = self._model.encode(
            texts,
            batch_size=self._batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True,
        )
        return embeddings.astype(np.float32)
