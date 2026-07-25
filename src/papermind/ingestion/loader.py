"""PDF loading via PyMuPDF."""

from pathlib import Path

import fitz  # PyMuPDF

from papermind.core.logging import get_logger
from papermind.ingestion.schemas import PageContent

logger = get_logger(__name__)


class PDFLoadError(Exception):
    """Raised when a PDF file cannot be opened at all."""


class PDFLoader:
    """Extracts per-page text from PDF files."""

    def load_file(self, path: Path) -> list[PageContent]:
        """Extract text from every page of a single PDF.

        Raises PDFLoadError if the file can't be opened. A page that fails to
        extract individually is skipped (and logged) rather than discarding
        the rest of the document.
        """
        try:
            doc = fitz.open(path)
        except Exception as exc:
            raise PDFLoadError(f"Could not open {path}: {exc}") from exc

        pages: list[PageContent] = []
        with doc:
            for index in range(len(doc)):
                page_number = index + 1
                try:
                    text = doc[index].get_text("text")
                except Exception:
                    logger.warning(
                        "Failed to extract text from %s page %d; skipping page",
                        path.name,
                        page_number,
                    )
                    continue
                pages.append(PageContent(source_file=path.name, page_number=page_number, text=text))

        if not pages:
            logger.warning("No extractable text found in %s", path.name)
        return pages

    def load_directory(self, directory: Path) -> dict[str, list[PageContent]]:
        """Load every PDF in a directory.

        Files that fail to open are logged and skipped so one bad PDF doesn't
        stop ingestion of the rest of the collection.
        """
        results: dict[str, list[PageContent]] = {}
        pdf_paths = sorted(directory.glob("*.pdf"))
        if not pdf_paths:
            logger.warning("No PDF files found in %s", directory)

        for path in pdf_paths:
            try:
                pages = self.load_file(path)
            except PDFLoadError as exc:
                logger.error("Skipping %s: %s", path.name, exc)
                continue
            results[path.name] = pages
            logger.info("Loaded %s (%d pages)", path.name, len(pages))

        return results
