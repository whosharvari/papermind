from papermind.generation.llm import GroqLLM
from papermind.generation.prompt import build_messages
from papermind.generation.schemas import Answer, Citation
from papermind.retrieval.retriever import DEFAULT_TOP_K, Retriever
from papermind.retrieval.schemas import RetrievedChunk

NO_DOCUMENTS_ANSWER = "No documents are indexed yet. Run scripts/ingest.py first."


def answer_question(
    question: str, retriever: Retriever, llm: GroqLLM, k: int = DEFAULT_TOP_K
) -> Answer:
    retrieved = retriever.retrieve(question, k=k)
    if not retrieved:
        return Answer(
            question=question, text=NO_DOCUMENTS_ANSWER, citations=[], retrieved_chunks=[]
        )

    messages = build_messages(question, retrieved)
    text = llm.complete(messages)

    return Answer(
        question=question,
        text=text,
        citations=build_citations(retrieved),
        retrieved_chunks=retrieved,
    )


def build_citations(retrieved: list[RetrievedChunk]) -> list[Citation]:
    seen: set[tuple[str, int]] = set()
    citations = []
    for item in retrieved:
        key = (item.chunk.source_file, item.chunk.page_number)
        if key in seen:
            continue
        seen.add(key)
        citations.append(
            Citation(source_file=item.chunk.source_file, page_number=item.chunk.page_number)
        )
    return citations
