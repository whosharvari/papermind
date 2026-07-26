#!/usr/bin/env python
"""Evaluate retrieval quality, answer quality, citation correctness, and latency.

Usage:
    python scripts/evaluate.py
"""

import json
import statistics
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from papermind.core.config import get_settings  # noqa: E402
from papermind.core.logging import configure_logging, get_logger  # noqa: E402
from papermind.evaluation.citations import (
    check_citation_correctness,
    check_page_match,
    looks_like_refusal,
)  # noqa: E402
from papermind.evaluation.dataset import load_eval_set  # noqa: E402
from papermind.evaluation.judge import score_groundedness  # noqa: E402
from papermind.evaluation.metrics import (
    evaluate_retrieval,
    hit_rate,
    mean_reciprocal_rank,
)  # noqa: E402
from papermind.evaluation.schemas import (
    EvalExample,
    GenerationResult,
    RetrievalResult,
)  # noqa: E402
from papermind.generation.llm import GroqLLM  # noqa: E402
from papermind.generation.prompt import build_messages  # noqa: E402
from papermind.generation.qa import NO_DOCUMENTS_ANSWER, build_citations  # noqa: E402
from papermind.generation.schemas import Answer  # noqa: E402
from papermind.retrieval.retriever import Retriever  # noqa: E402
from papermind.vectorstore.faiss_store import VectorStoreError  # noqa: E402

logger = get_logger("papermind.evaluate")

REPO_ROOT = Path(__file__).resolve().parent.parent
EVAL_SET_PATH = REPO_ROOT / "evaluation" / "eval_set.json"
REPORT_PATH = REPO_ROOT / "evaluation" / "report.md"
RESULTS_PATH = REPO_ROOT / "evaluation" / "results.json"
TOP_K_SWEEP = [3, 5, 8]
GENERATION_K = 5


def run_retrieval_sweep(
    answerable: list[EvalExample], retriever: Retriever
) -> dict[int, list[RetrievalResult]]:
    return {k: [evaluate_retrieval(e, retriever, k) for e in answerable] for k in TOP_K_SWEEP}


def run_generation_eval(
    examples: list[EvalExample], retriever: Retriever, llm: GroqLLM
) -> list[GenerationResult]:
    results = []
    for example in examples:
        t0 = time.perf_counter()
        retrieved = retriever.retrieve(example.question, k=GENERATION_K)
        t1 = time.perf_counter()

        answer_text = NO_DOCUMENTS_ANSWER
        if retrieved:
            answer_text = llm.complete(build_messages(example.question, retrieved))
        t2 = time.perf_counter()

        answer = Answer(
            question=example.question,
            text=answer_text,
            citations=build_citations(retrieved),
            retrieved_chunks=retrieved,
        )
        groundedness = score_groundedness(llm, example.question, retrieved, answer_text)

        results.append(
            GenerationResult(
                question=example.question,
                answer_text=answer_text,
                should_refuse=example.should_refuse,
                refused=looks_like_refusal(answer_text),
                citation_correct=check_citation_correctness(example, answer),
                page_match=check_page_match(example, answer),
                groundedness_score=groundedness,
                retrieval_latency_ms=(t1 - t0) * 1000,
                generation_latency_ms=(t2 - t1) * 1000,
                total_latency_ms=(t2 - t0) * 1000,
            )
        )
        logger.info("Evaluated: %s", example.question)
    return results


def latency_stats(values: list[float]) -> dict[str, float]:
    return {
        "mean": statistics.mean(values),
        "median": statistics.median(values),
        "p95": sorted(values)[max(0, int(len(values) * 0.95) - 1)],
    }


def main() -> None:
    configure_logging()
    settings = get_settings()
    examples = load_eval_set(EVAL_SET_PATH)
    answerable = [e for e in examples if e.expected_source is not None]
    refusal_examples = [e for e in examples if e.should_refuse]
    logger.info(
        "Loaded %d eval examples (%d answerable, %d refusal)",
        len(examples),
        len(answerable),
        len(refusal_examples),
    )

    try:
        retriever = Retriever.from_disk(settings.vector_store_dir, settings.embedding_model)
    except VectorStoreError:
        logger.error(
            "No FAISS index found at %s. Run scripts/ingest.py first.", settings.vector_store_dir
        )
        sys.exit(1)

    if not settings.groq_api_key:
        logger.error("GROQ_API_KEY is not set. Add it to .env before running evaluation.")
        sys.exit(1)
    llm = GroqLLM(api_key=settings.groq_api_key, model=settings.groq_model)

    logger.info("Running retrieval sweep over k=%s", TOP_K_SWEEP)
    sweep = run_retrieval_sweep(answerable, retriever)

    logger.info("Running full pipeline evaluation at k=%d", GENERATION_K)
    generation_results = run_generation_eval(examples, retriever, llm)

    write_report(sweep, generation_results)
    RESULTS_PATH.write_text(
        json.dumps(
            {
                "sweep": {str(k): [r.model_dump() for r in v] for k, v in sweep.items()},
                "generation": [r.model_dump() for r in generation_results],
            },
            indent=2,
        )
    )
    logger.info("Report written to %s, raw results to %s", REPORT_PATH, RESULTS_PATH)


def write_report(
    sweep: dict[int, list[RetrievalResult]],
    generation_results: list[GenerationResult],
) -> None:
    lines = ["# Papermind Evaluation Report", ""]

    lines += [
        "## Retrieval quality by top-k",
        "",
        "| k | Hit Rate | MRR | n |",
        "|---|---|---|---|",
    ]
    for k, results in sweep.items():
        row = (
            f"| {k} | {hit_rate(results):.2f} | "
            f"{mean_reciprocal_rank(results):.3f} | {len(results)} |"
        )
        lines.append(row)

    answerable_results = [r for r in generation_results if not r.should_refuse]
    refusal_results = [r for r in generation_results if r.should_refuse]

    n_total = len(generation_results)
    n_citation_correct = sum(r.citation_correct for r in generation_results)
    citation_accuracy = n_citation_correct / n_total
    avg_groundedness = statistics.mean(r.groundedness_score for r in generation_results)
    false_refusals = sum(1 for r in answerable_results if r.refused)
    correct_refusals = sum(1 for r in refusal_results if r.refused)

    page_matches = [r.page_match for r in generation_results if r.page_match is not None]
    page_accuracy_line = (
        f"- Page-level accuracy (±1 page tolerance): "
        f"{sum(page_matches) / len(page_matches):.2f} ({sum(page_matches)}/{len(page_matches)})"
        if page_matches
        else "- Page-level accuracy: n/a (no examples with an expected page)"
    )

    lines += [
        "",
        f"## Answer quality & citation correctness (k={GENERATION_K})",
        "",
        f"- Citation accuracy (source document): {citation_accuracy:.2f} "
        f"({n_citation_correct}/{n_total})",
        page_accuracy_line,
        f"- Mean groundedness score (1-5, LLM-judged): {avg_groundedness:.2f}",
        f"- False refusals on answerable questions: {false_refusals}/{len(answerable_results)}",
        f"- Correct refusals on out-of-corpus questions: {correct_refusals}/{len(refusal_results)}",
    ]

    retrieval_latencies = [r.retrieval_latency_ms for r in generation_results]
    generation_latencies = [r.generation_latency_ms for r in generation_results]
    total_latencies = [r.total_latency_ms for r in generation_results]

    lines += [
        "",
        "## Latency (ms, k=5)",
        "",
        "| stage | mean | median | p95 |",
        "|---|---|---|---|",
    ]
    for label, values in [
        ("retrieval", retrieval_latencies),
        ("generation", generation_latencies),
        ("total", total_latencies),
    ]:
        stats = latency_stats(values)
        lines.append(
            f"| {label} | {stats['mean']:.0f} | {stats['median']:.0f} | {stats['p95']:.0f} |"
        )

    lines += [
        "",
        "## Per-question results",
        "",
        "| question | citation ok | refused | groundedness | total ms |",
        "|---|---|---|---|---|",
    ]
    for r in generation_results:
        citation_mark = "✓" if r.citation_correct else "✗"
        refused_mark = "yes" if r.refused else "no"
        lines.append(
            f"| {r.question} | {citation_mark} | {refused_mark} | "
            f"{r.groundedness_score} | {r.total_latency_ms:.0f} |"
        )

    REPORT_PATH.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
