from groq import Groq, GroqError


class LLMError(Exception):
    pass


class GroqLLM:
    def __init__(self, api_key: str, model: str, temperature: float = 0.0) -> None:
        self._client = Groq(api_key=api_key)
        self._model = model
        self._temperature = temperature

    def complete(self, messages: list[dict[str, str]]) -> str:
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=self._temperature,
            )
        except GroqError as exc:
            raise LLMError(f"Groq request failed: {exc}") from exc

        return response.choices[0].message.content
