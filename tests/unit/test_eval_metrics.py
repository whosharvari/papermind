from unittest.mock import MagicMock

from papermind.chunking.schemas import Chunk
from papermind.evaluation.metrics import evaluate_retrieval, hit_rate, mean_reciprocal_rank
from papermind.evaluation.schemas import EvalExample, RetrievalResult
from papermind.retrieval.schemas import RetrievedChunk


def _retrieved(source_file: str, page: int, index: int) -> RetrievedChunk:
    chunk = Chunk(
        id=f"{source_file}::{index:04d}",
        text="text",
        source_file=source_file,
        page_number=page,
        chunk_index=index,
    )
    return RetrievedChunk(chunk=chunk, score=1.0 - index * 0.1)


def test_evaluate_retrieval_reports_document_level_hit_and_rank() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [
        _retrieved("wrong.pdf", 1, 0),
        _retrieved("expected.pdf", 5, 1),
        _retrieved("wrong.pdf", 1, 2),
    ]
    example = EvalExample(question="Q", expected_source="expected.pdf")

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.document_hit is True
    assert result.document_rank == 2
    assert result.page_hit is None
    assert result.chunk_hit is None


def test_evaluate_retrieval_reports_document_miss() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [_retrieved("wrong.pdf", 1, 0)]
    example = EvalExample(question="Q", expected_source="expected.pdf")

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.document_hit is False
    assert result.document_rank is None


def test_evaluate_retrieval_page_hit_within_tolerance() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [_retrieved("expected.pdf", 6, 0)]
    example = EvalExample(question="Q", expected_source="expected.pdf", expected_page=5)

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.page_hit is True
    assert result.page_rank == 1


def test_evaluate_retrieval_page_miss_outside_tolerance() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [_retrieved("expected.pdf", 9, 0)]
    example = EvalExample(question="Q", expected_source="expected.pdf", expected_page=5)

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.page_hit is False


def test_evaluate_retrieval_chunk_level_requires_exact_id() -> None:
    retriever = MagicMock()
    retriever.retrieve.return_value = [
        _retrieved("expected.pdf", 5, 0),
        _retrieved("expected.pdf", 5, 1),
    ]
    example = EvalExample(
        question="Q", expected_source="expected.pdf", expected_chunk_id="expected.pdf::0001"
    )

    result = evaluate_retrieval(example, retriever, k=3)

    assert result.chunk_hit is True
    assert result.chunk_rank == 2


def test_hit_rate_ignores_examples_without_that_level() -> None:
    results = [
        RetrievalResult(
            question="a",
            k=5,
            document_hit=True,
            document_rank=1,
            page_hit=True,
            page_rank=1,
            chunk_hit=None,
            chunk_rank=None,
        ),
        RetrievalResult(
            question="b",
            k=5,
            document_hit=False,
            document_rank=None,
            page_hit=None,
            page_rank=None,
            chunk_hit=None,
            chunk_rank=None,
        ),
    ]

    assert hit_rate(results, level="document") == 0.5
    assert hit_rate(results, level="page") == 1.0  # only one example has an expected page


def test_hit_rate_of_empty_results_is_zero() -> None:
    assert hit_rate([]) == 0.0


def test_mrr_rewards_higher_ranked_hits() -> None:
    results = [
        RetrievalResult(
            question="a",
            k=5,
            document_hit=True,
            document_rank=1,
            page_hit=None,
            page_rank=None,
            chunk_hit=None,
            chunk_rank=None,
        ),
        RetrievalResult(
            question="b",
            k=5,
            document_hit=True,
            document_rank=4,
            page_hit=None,
            page_rank=None,
            chunk_hit=None,
            chunk_rank=None,
        ),
    ]

    assert mean_reciprocal_rank(results, level="document") == (1 / 1 + 1 / 4) / 2
