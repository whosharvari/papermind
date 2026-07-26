from unittest.mock import MagicMock

from papermind.chunking.schemas import Chunk
from papermind.generation.qa import NO_DOCUMENTS_ANSWER, answer_question
from papermind.retrieval.schemas import RetrievedChunk


def _retrieved(index: int, source_file: str, page: int, score: float) -> RetrievedChunk:
    chunk = Chunk(
        id=f"{source_file}::{index:04d}",
        text=f"chunk text {index}",
        source_file=source_file,
        page_number=page,
        chunk_index=index,
    )
    return RetrievedChunk(chunk=chunk, score=score)


def test_answer_question_returns_placeholder_when_nothing_retrieved() -> None:
    retriever = MagicMock(retrieve=MagicMock(return_value=[]))
    llm = MagicMock()

    answer = answer_question("What is X?", retriever, llm)

    assert answer.text == NO_DOCUMENTS_ANSWER
    assert answer.citations == []
    llm.complete.assert_not_called()


def test_answer_question_returns_llm_text_and_retrieved_chunks() -> None:
    retrieved = [_retrieved(0, "a.pdf", 1, 0.9)]
    retriever = MagicMock(retrieve=MagicMock(return_value=retrieved))
    llm = MagicMock(complete=MagicMock(return_value="grounded answer"))

    answer = answer_question("What is X?", retriever, llm)

    assert answer.text == "grounded answer"
    assert answer.retrieved_chunks == retrieved


def test_answer_question_deduplicates_citations_preserving_order() -> None:
    retrieved = [
        _retrieved(0, "a.pdf", 1, 0.95),
        _retrieved(1, "b.pdf", 2, 0.90),
        _retrieved(2, "a.pdf", 1, 0.80),  # same source+page as the first
    ]
    retriever = MagicMock(retrieve=MagicMock(return_value=retrieved))
    llm = MagicMock(complete=MagicMock(return_value="answer"))

    answer = answer_question("Q", retriever, llm)

    assert [(c.source_file, c.page_number) for c in answer.citations] == [
        ("a.pdf", 1),
        ("b.pdf", 2),
    ]


def test_answer_question_passes_k_to_retriever() -> None:
    retriever = MagicMock(retrieve=MagicMock(return_value=[]))
    llm = MagicMock()

    answer_question("Q", retriever, llm, k=8)

    retriever.retrieve.assert_called_once_with("Q", k=8)
