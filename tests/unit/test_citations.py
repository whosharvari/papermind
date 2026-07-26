from papermind.evaluation.citations import check_citation_correctness, check_page_match
from papermind.evaluation.schemas import EvalExample
from papermind.generation.schemas import Answer, Citation


def _answer(text: str, citations: list[Citation]) -> Answer:
    return Answer(question="Q", text=text, citations=citations, retrieved_chunks=[])


def test_citation_correct_when_expected_source_present() -> None:
    example = EvalExample(question="Q", expected_source="a.pdf", expected_page=3)
    answer = _answer("some answer", [Citation(source_file="a.pdf", page_number=5)])

    assert check_citation_correctness(example, answer) is True


def test_citation_incorrect_when_expected_source_missing() -> None:
    example = EvalExample(question="Q", expected_source="a.pdf")
    answer = _answer("some answer", [Citation(source_file="b.pdf", page_number=1)])

    assert check_citation_correctness(example, answer) is False


def test_refusal_example_correct_when_answer_declines() -> None:
    example = EvalExample(question="Q", should_refuse=True)
    answer = _answer(
        "The excerpts do not contain enough information to answer this.",
        [Citation(source_file="a.pdf", page_number=1)],
    )

    assert check_citation_correctness(example, answer) is True


def test_refusal_example_incorrect_when_answer_fabricates() -> None:
    example = EvalExample(question="Q", should_refuse=True)
    answer = _answer("The answer is definitely 42.", [Citation(source_file="a.pdf", page_number=1)])

    assert check_citation_correctness(example, answer) is False


def test_page_match_within_tolerance() -> None:
    example = EvalExample(question="Q", expected_source="a.pdf", expected_page=5)
    answer = _answer("text", [Citation(source_file="a.pdf", page_number=6)])

    assert check_page_match(example, answer, tolerance=1) is True


def test_page_match_outside_tolerance() -> None:
    example = EvalExample(question="Q", expected_source="a.pdf", expected_page=5)
    answer = _answer("text", [Citation(source_file="a.pdf", page_number=9)])

    assert check_page_match(example, answer, tolerance=1) is False


def test_page_match_none_when_expected_page_missing() -> None:
    example = EvalExample(question="Q", expected_source="a.pdf", expected_page=None)
    answer = _answer("text", [Citation(source_file="a.pdf", page_number=1)])

    assert check_page_match(example, answer) is None


def test_page_match_none_for_refusal_examples() -> None:
    example = EvalExample(question="Q", should_refuse=True)
    answer = _answer("no info", [])

    assert check_page_match(example, answer) is None
