"""Data models produced by the ingestion stage."""

from pydantic import BaseModel


class PageContent(BaseModel):
    """The text of a single PDF page, tagged with its provenance."""

    source_file: str
    page_number: int  # 1-indexed, matches how a human would cite the page
    text: str
