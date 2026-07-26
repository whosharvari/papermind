#!/usr/bin/env python
"""CLI entry point: ask questions against the ingested paper collection.

Usage:
    python scripts/query.py                   # interactive mode
    python scripts/query.py "What is X?"       # single question
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from papermind.core.config import get_settings  # noqa: E402
from papermind.core.logging import configure_logging, get_logger  # noqa: E402
from papermind.generation.llm import GroqLLM, LLMError  # noqa: E402
from papermind.generation.qa import answer_question  # noqa: E402
from papermind.generation.schemas import Answer  # noqa: E402
from papermind.retrieval.retriever import Retriever  # noqa: E402
from papermind.vectorstore.faiss_store import VectorStoreError  # noqa: E402

logger = get_logger("papermind.query")


def print_answer(answer: Answer) -> None:
    print(f"\n{answer.text}\n")
    if answer.citations:
        print("Retrieved from:")
        for citation in answer.citations:
            print(f"  - {citation.source_file}, page {citation.page_number}")
    if answer.retrieved_chunks:
        print("\nRetrieved chunks (similarity score):")
        for item in answer.retrieved_chunks:
            print(f"  {item.score:.3f}  {item.chunk.source_file} p.{item.chunk.page_number}")
    print()


def main() -> None:
    configure_logging()
    settings = get_settings()

    if not settings.groq_api_key:
        logger.error("GROQ_API_KEY is not set. Add it to .env and re-run.")
        sys.exit(1)

    try:
        retriever = Retriever.from_disk(settings.vector_store_dir, settings.embedding_model)
    except VectorStoreError:
        logger.error(
            "No index found at %s. Run scripts/ingest.py first.", settings.vector_store_dir
        )
        sys.exit(1)

    llm = GroqLLM(api_key=settings.groq_api_key, model=settings.groq_model)

    if len(sys.argv) > 1:
        ask(" ".join(sys.argv[1:]), retriever, llm)
        return

    print("Papermind Q&A. Type a question, or 'quit' to exit.\n")
    while True:
        try:
            question = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not question or question.lower() in {"quit", "exit"}:
            break
        ask(question, retriever, llm)


def ask(question: str, retriever: Retriever, llm: GroqLLM) -> None:
    try:
        answer = answer_question(question, retriever, llm)
    except LLMError as exc:
        logger.error(str(exc))
        return
    print_answer(answer)


if __name__ == "__main__":
    main()
