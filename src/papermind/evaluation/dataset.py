import json
from pathlib import Path

from papermind.evaluation.schemas import EvalExample


def load_eval_set(path: Path) -> list[EvalExample]:
    return [EvalExample(**item) for item in json.loads(path.read_text())]
