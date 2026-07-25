import numpy as np
import pytest

from papermind.embeddings.embedder import Embedder

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


@pytest.fixture(scope="module")
def embedder() -> Embedder:
    return Embedder(EMBEDDING_MODEL)


def test_embed_empty_list_returns_empty_array(embedder: Embedder) -> None:
    result = embedder.embed([])

    assert result.shape == (0, embedder.embedding_dim)


def test_embed_returns_one_vector_per_text_with_correct_dim(embedder: Embedder) -> None:
    result = embedder.embed(["hello world", "another sentence", "a third one"])

    assert result.shape == (3, embedder.embedding_dim)
    assert result.dtype == np.float32


def test_embeddings_are_l2_normalized(embedder: Embedder) -> None:
    result = embedder.embed(["some text to embed", "some other text"])

    norms = np.linalg.norm(result, axis=1)
    np.testing.assert_allclose(norms, 1.0, atol=1e-5)


def test_similar_sentences_are_closer_than_dissimilar_ones(embedder: Embedder) -> None:
    anchor, similar, different = embedder.embed(
        [
            "The cat sat on the mat.",
            "A cat was sitting on the rug.",
            "Quarterly revenue exceeded analyst expectations.",
        ]
    )

    # vectors are L2-normalized, so dot product == cosine similarity
    sim_to_similar = float(anchor @ similar)
    sim_to_different = float(anchor @ different)

    assert sim_to_similar > sim_to_different
