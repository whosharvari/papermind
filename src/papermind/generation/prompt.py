from papermind.retrieval.schemas import RetrievedChunk

SYSTEM_PROMPT = (
    "You are a research assistant answering questions using only the excerpts "
    "provided below, drawn from a collection of AI research papers. Cite excerpts "
    "inline using their [n] number. If the excerpts don't contain enough "
    "information to answer, say so explicitly instead of guessing."
)


def build_messages(question: str, retrieved: list[RetrievedChunk]) -> list[dict[str, str]]:
    excerpts = "\n\n".join(
        f"[{i}] ({r.chunk.source_file}, page {r.chunk.page_number})\n{r.chunk.text}"
        for i, r in enumerate(retrieved, start=1)
    )
    user_content = f"Excerpts:\n\n{excerpts}\n\nQuestion: {question}"
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]
