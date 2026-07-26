from papermind.evaluation.schemas import EvalExample
from papermind.generation.schemas import Answer


def check_citation_correctness(example: EvalExample, answer: Answer) -> bool:
    if example.should_refuse:
        return looks_like_refusal(answer.text)
    return any(c.source_file == example.expected_source for c in answer.citations)


def check_page_match(example: EvalExample, answer: Answer, tolerance: int = 1) -> bool | None:
    if example.should_refuse or example.expected_page is None:
        return None
    return any(
        c.source_file == example.expected_source
        and abs(c.page_number - example.expected_page) <= tolerance
        for c in answer.citations
    )


_REFUSAL_PHRASES = (
    "don't contain",
    "do not contain",
    "not enough information",
    "cannot answer",
    "can't answer",
    "i don't know",
    "no relevant",
    "doesn't mention",
    "do not mention",
)


def looks_like_refusal(text: str) -> bool:
    lowered = text.lower()
    return any(phrase in lowered for phrase in _REFUSAL_PHRASES)
