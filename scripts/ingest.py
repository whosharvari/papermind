#!/usr/bin/env python
"""CLI entry point: ingest all PDFs in data/raw/ into a FAISS index.

Usage:
    python scripts/ingest.py
"""

import json
import sys
import time
from pathlib import Path

# Defensive: make `papermind` importable even if the editable install's
# metadata is unavailable (see README Troubleshooting -- a macOS-specific
# hidden-file quirk has been observed to break `pip install -e .` imports
# outside of pytest on this project).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from papermind.chunking.schemas import Chunk  # noqa: E402
from papermind.chunking.splitter import DocumentChunker  # noqa: E402
from papermind.core.config import get_settings  # noqa: E402
from papermind.core.logging import configure_logging, get_logger  # noqa: E402
from papermind.embeddings.embedder import Embedder  # noqa: E402
from papermind.ingestion.cleaner import clean_page_text  # noqa: E402
from papermind.ingestion.loader import PDFLoader  # noqa: E402
from papermind.vectorstore.faiss_store import FaissVectorStore  # noqa: E402

logger = get_logger("papermind.ingest")


def main() -> None:
    configure_logging()
    settings = get_settings()
    start = time.perf_counter()

    logger.info("Loading PDFs from %s", settings.raw_pdf_dir)
    pages_by_doc = PDFLoader().load_directory(settings.raw_pdf_dir)
    if not pages_by_doc:
        logger.error(
            "No PDFs were loaded from %s. Add some .pdf files there and re-run.",
            settings.raw_pdf_dir,
        )
        sys.exit(1)

    logger.info("Loading embedding model %s", settings.embedding_model)
    embedder = Embedder(settings.embedding_model)
    chunker = DocumentChunker(settings.embedding_model)

    all_chunks: list[Chunk] = []
    for source_file, pages in pages_by_doc.items():
        cleaned_pages = [p.model_copy(update={"text": clean_page_text(p.text)}) for p in pages]
        chunks = chunker.chunk_document(source_file, cleaned_pages)
        if not chunks:
            logger.warning("%s produced zero chunks (no extractable text?)", source_file)
        all_chunks.extend(chunks)

    if not all_chunks:
        logger.error("No chunks were produced from any document. Nothing to index.")
        sys.exit(1)

    logger.info("Saving %d processed chunks to %s", len(all_chunks), settings.processed_dir)
    settings.processed_dir.mkdir(parents=True, exist_ok=True)
    chunks_path = settings.processed_dir / "chunks.json"
    chunks_path.write_text(json.dumps([c.model_dump() for c in all_chunks], indent=2))

    logger.info("Embedding %d chunks", len(all_chunks))
    embeddings = embedder.embed([c.text for c in all_chunks])

    logger.info("Building FAISS index")
    store = FaissVectorStore(dim=embedder.embedding_dim)
    store.add(embeddings, all_chunks)
    store.save(settings.vector_store_dir)

    elapsed = time.perf_counter() - start
    logger.info(
        "Done in %.1fs: %d documents, %d chunks, %d-dim index -> %s",
        elapsed,
        len(pages_by_doc),
        len(all_chunks),
        embedder.embedding_dim,
        settings.vector_store_dir,
    )


if __name__ == "__main__":
    main()
