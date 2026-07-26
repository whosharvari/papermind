"""Chunk cleaned document pages into retrieval-sized units."""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer

from papermind.chunking.schemas import Chunk
from papermind.chunking.sections import detect_section_boundaries
from papermind.core.logging import get_logger
from papermind.ingestion.schemas import PageContent

logger = get_logger(__name__)

_PAGE_SEPARATOR = "\n\n"


class DocumentChunker:
    """Splits a document's cleaned pages into token-bounded chunks.

    Chunk size is measured in tokens of the *target embedding model's*
    tokenizer, not raw characters, so a chunk is guaranteed to fit within
    that model's max sequence length instead of being silently truncated at
    embedding time. See the Session 2 chunking-strategy discussion for why
    this matters and why chunking spans whole documents rather than
    individual pages.
    """

    def __init__(
        self,
        embedding_model_name: str,
        chunk_size_tokens: int = 200,
        chunk_overlap_tokens: int = 40,
    ) -> None:
        # NOTE: we deliberately do NOT use the splitter's built-in
        # `add_start_index=True`. Its offset math (in `create_documents`)
        # computes `previous_chunk_len - self._chunk_overlap`, mixing
        # character length with `chunk_overlap`'s unit -- which is *tokens*
        # here, since we're using a Hugging Face tokenizer length function.
        # That mismatch makes it overshoot a chunk's true position and
        # return start_index=-1. We compute offsets ourselves in
        # `_locate_chunks` instead, using plain character search.
        tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
        # We only use this tokenizer to *count* tokens while splitting, on
        # text that's naturally longer than the model's own max length --
        # not to actually encode input for the model. Silence the resulting
        # (harmless, but alarming-looking) truncation warning.
        tokenizer.model_max_length = int(1e9)
        self._splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
            tokenizer,
            chunk_size=chunk_size_tokens,
            chunk_overlap=chunk_overlap_tokens,
        )

    def chunk_document(self, source_file: str, pages: list[PageContent]) -> list[Chunk]:
        """Chunk a document's pages, mapping each chunk back to its start page.

        Pages are concatenated (in order) into one text blob before splitting,
        so chunk boundaries don't land mid-sentence at every page break. The
        text is then split into sections at detected header boundaries (see
        `chunking.sections`), and the token splitter runs independently
        within each section -- so a token-budget cut can no longer land
        between, say, "5.2 Hardware and Schedule" and "5.3 Optimizer" (the
        Session 5 failure this exists to fix). A document with no detected
        boundaries is just one section, i.e. identical to the old behavior.
        """
        if not pages:
            return []

        full_text, page_offsets = self._concatenate_pages(pages)
        section_bounds = sorted({0, *detect_section_boundaries(full_text), len(full_text)})

        chunks: list[Chunk] = []
        for start, end in zip(section_bounds, section_bounds[1:], strict=False):
            section_text = full_text[start:end]
            if not section_text.strip():
                continue
            for chunk_text, local_offset in self._locate_chunks(section_text):
                page_number = self._page_for_offset(page_offsets, start + local_offset)
                index = len(chunks)
                chunks.append(
                    Chunk(
                        id=f"{source_file}::{index:04d}",
                        text=chunk_text,
                        source_file=source_file,
                        page_number=page_number,
                        chunk_index=index,
                    )
                )

        logger.info(
            "Chunked %s into %d chunks (%d sections)",
            source_file,
            len(chunks),
            len(section_bounds) - 1,
        )
        return chunks

    def _locate_chunks(self, text: str) -> list[tuple[str, int]]:
        """Split text into chunks and find each chunk's character offset in `text`.

        Chunks are produced in left-to-right order, so we search forward
        from just past the previous chunk's start -- never further, which
        guarantees we can't overshoot past a chunk's true position (unlike
        the splitter's own `add_start_index`, see note above). A search
        failure (e.g. the chunk's exact substring appears only earlier,
        because of unusual whitespace collapsing) falls back to a full-text
        search rather than dropping the chunk.
        """
        located: list[tuple[str, int]] = []
        search_from = 0
        for chunk in self._splitter.split_text(text):
            start = text.find(chunk, search_from)
            if start == -1:
                start = text.find(chunk)
            located.append((chunk, start))
            search_from = start + 1
        return located

    @staticmethod
    def _concatenate_pages(pages: list[PageContent]) -> tuple[str, list[tuple[int, int]]]:
        """Join pages into one text blob, recording each page's starting offset."""
        parts: list[str] = []
        page_offsets: list[tuple[int, int]] = []  # (start_offset, page_number)
        cursor = 0
        for page in pages:
            page_offsets.append((cursor, page.page_number))
            parts.append(page.text)
            cursor += len(page.text)
            parts.append(_PAGE_SEPARATOR)
            cursor += len(_PAGE_SEPARATOR)
        return "".join(parts), page_offsets

    @staticmethod
    def _page_for_offset(page_offsets: list[tuple[int, int]], offset: int) -> int:
        """Return the page number of the last page starting at or before `offset`.

        Offsets that fall inside the separator between two pages are
        attributed to the preceding page.
        """
        page_number = page_offsets[0][1]
        for start, number in page_offsets:
            if start <= offset:
                page_number = number
            else:
                break
        return page_number
