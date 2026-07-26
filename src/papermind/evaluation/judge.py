import re

from papermind.core.logging import get_logger
from papermind.generation.llm import GroqLLM
from papermind.generation.prompt import format_excerpts
from papermind.retrieval.schemas import RetrievedChunk

logger = get_logger(__name__)

GROUNDEDNESS_SYSTEM_PROMPT = (
    "You are grading whether an AI-generated answer is faithfully grounded in the "
    "provided source excerpts, on a scale of 1 to 5:\n"
    "5 = every claim in the answer is directly supported by the excerpts\n"
    "3 = mostly supported, with minor unsupported details\n"
    "1 = the answer contradicts the excerpts or is largely fabricated\n"
    "A correct refusal (saying the excerpts don't contain the answer, when true) scores 5.\n"
    "Respond with ONLY the single digit score, nothing else."
)


def score_groundedness(
    llm: GroqLLM, question: str, retrieved: list[RetrievedChunk], answer_text: str
) -> int:
    messages = [
        {"role": "system", "content": GROUNDEDNESS_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Excerpts:\n{format_excerpts(retrieved)}\n\n"
                f"Question: {question}\n\nAnswer: {answer_text}"
            ),
        },
    ]
    response = llm.complete(messages)
    match = re.search(r"[1-5]", response)
    if not match:
        logger.warning("Unparseable groundedness judge response: %r", response)
        return 0
    return int(match.group())
