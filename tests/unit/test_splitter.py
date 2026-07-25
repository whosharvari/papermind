import pytest

from papermind.chunking.splitter import DocumentChunker
from papermind.ingestion.schemas import PageContent

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


@pytest.fixture(scope="module")
def chunker() -> DocumentChunker:
    return DocumentChunker(EMBEDDING_MODEL, chunk_size_tokens=20, chunk_overlap_tokens=4)


def _page(page_number: int, sentence_count: int) -> PageContent:
    text = " ".join(f"This is sentence number {i} on the page." for i in range(sentence_count))
    return PageContent(source_file="doc.pdf", page_number=page_number, text=text)


def test_empty_pages_yields_no_chunks(chunker: DocumentChunker) -> None:
    assert chunker.chunk_document("doc.pdf", []) == []


def test_chunks_carry_source_file_and_sequential_index(chunker: DocumentChunker) -> None:
    pages = [_page(1, sentence_count=15)]

    chunks = chunker.chunk_document("doc.pdf", pages)

    assert len(chunks) > 1
    assert all(c.source_file == "doc.pdf" for c in chunks)
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))
    assert [c.id for c in chunks] == [f"doc.pdf::{i:04d}" for i in range(len(chunks))]


def test_single_page_document_all_chunks_map_to_that_page(chunker: DocumentChunker) -> None:
    pages = [_page(1, sentence_count=15)]

    chunks = chunker.chunk_document("doc.pdf", pages)

    assert all(c.page_number == 1 for c in chunks)


def test_multi_page_document_later_chunks_map_to_later_pages(chunker: DocumentChunker) -> None:
    pages = [_page(1, sentence_count=15), _page(2, sentence_count=15)]

    chunks = chunker.chunk_document("doc.pdf", pages)

    page_numbers = [c.page_number for c in chunks]
    assert page_numbers[0] == 1
    assert page_numbers[-1] == 2
    # page numbers must be non-decreasing -- chunking should never jump backwards
    assert page_numbers == sorted(page_numbers)


def test_consecutive_chunks_overlap(chunker: DocumentChunker) -> None:
    pages = [_page(1, sentence_count=15)]

    chunks = chunker.chunk_document("doc.pdf", pages)

    first_words = chunks[0].text.split()
    second_words = chunks[1].text.split()
    assert any(word in second_words[:8] for word in first_words[-8:])
