from papermind.chunking.schemas import Chunk
from papermind.generation.prompt import build_messages
from papermind.retrieval.schemas import RetrievedChunk


def _retrieved(index: int, text: str, page: int) -> RetrievedChunk:
    chunk = Chunk(
        id=f"doc.pdf::{index:04d}",
        text=text,
        source_file="doc.pdf",
        page_number=page,
        chunk_index=index,
    )
    return RetrievedChunk(chunk=chunk, score=0.9)


def test_messages_have_system_and_user_roles() -> None:
    messages = build_messages("What is X?", [_retrieved(0, "X is a thing.", 1)])

    assert [m["role"] for m in messages] == ["system", "user"]


def test_user_message_numbers_excerpts_and_includes_provenance() -> None:
    retrieved = [_retrieved(0, "First excerpt.", page=3), _retrieved(1, "Second excerpt.", page=7)]

    content = build_messages("Q", retrieved)[1]["content"]

    assert "[1] (doc.pdf, page 3)" in content
    assert "First excerpt." in content
    assert "[2] (doc.pdf, page 7)" in content
    assert "Second excerpt." in content


def test_user_message_includes_the_question() -> None:
    content = build_messages("How does attention work?", [_retrieved(0, "text", 1)])[1]["content"]

    assert "How does attention work?" in content


def test_system_prompt_instructs_grounding_and_citation() -> None:
    system_content = build_messages("Q", [_retrieved(0, "text", 1)])[0]["content"]

    assert "only the excerpts" in system_content
    assert "[n]" in system_content
