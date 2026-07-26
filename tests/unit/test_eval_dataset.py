import json
from pathlib import Path

from papermind.evaluation.dataset import load_eval_set


def test_load_eval_set_parses_examples(tmp_path: Path) -> None:
    path = tmp_path / "eval_set.json"
    path.write_text(
        json.dumps(
            [
                {
                    "question": "Q1",
                    "expected_source": "a.pdf",
                    "expected_page": 2,
                    "should_refuse": False,
                    "notes": "note",
                },
                {"question": "Q2", "should_refuse": True},
            ]
        )
    )

    examples = load_eval_set(path)

    assert len(examples) == 2
    assert examples[0].expected_source == "a.pdf"
    assert examples[0].expected_page == 2
    assert examples[1].should_refuse is True
    assert examples[1].expected_source is None


def test_real_eval_set_loads_and_is_well_formed() -> None:
    examples = load_eval_set(Path("evaluation/eval_set.json"))

    assert len(examples) >= 10
    for example in examples:
        assert example.question
        assert example.should_refuse or example.expected_source is not None
