"""Data models produced by the chunking stage."""

from pydantic import BaseModel


class Chunk(BaseModel):
    """A retrieval-sized unit of text, tagged with provenance back to its source page."""

    id: str
    text: str
    source_file: str
    page_number: int  # page the chunk *starts* on (chunks rarely span pages)
    chunk_index: int  # position within the document, for deterministic ordering
