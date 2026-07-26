from unittest.mock import MagicMock

import pytest
from groq import APIConnectionError

from papermind.generation.llm import GroqLLM, LLMError


def _llm_with_mocked_client() -> tuple[GroqLLM, MagicMock]:
    llm = GroqLLM(api_key="test-key", model="test-model")
    mock_create = MagicMock()
    llm._client.chat.completions.create = mock_create
    return llm, mock_create


def test_complete_returns_response_text() -> None:
    llm, mock_create = _llm_with_mocked_client()
    mock_create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content="the answer"))]
    )

    result = llm.complete([{"role": "user", "content": "hi"}])

    assert result == "the answer"


def test_complete_passes_model_and_messages_to_client() -> None:
    llm, mock_create = _llm_with_mocked_client()
    mock_create.return_value = MagicMock(choices=[MagicMock(message=MagicMock(content="ok"))])
    messages = [{"role": "user", "content": "hi"}]

    llm.complete(messages)

    _, kwargs = mock_create.call_args
    assert kwargs["model"] == "test-model"
    assert kwargs["messages"] == messages


def test_complete_wraps_groq_errors_as_llm_error() -> None:
    llm, mock_create = _llm_with_mocked_client()
    mock_create.side_effect = APIConnectionError(request=MagicMock())

    with pytest.raises(LLMError):
        llm.complete([{"role": "user", "content": "hi"}])
