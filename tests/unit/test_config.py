import pytest

from papermind.core.config import Settings, get_settings


def test_settings_have_sane_defaults() -> None:
    settings = Settings(_env_file=None)

    assert settings.api_host == "0.0.0.0"
    assert settings.api_port == 8000
    assert settings.log_level == "INFO"
    assert settings.groq_model == "llama-3.3-70b-versatile"


def test_settings_read_from_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("API_PORT", "9000")
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
    monkeypatch.setenv("GROQ_API_KEY", "test-key")

    settings = Settings(_env_file=None)

    assert settings.api_port == 9000
    assert settings.log_level == "DEBUG"
    assert settings.groq_api_key == "test-key"


def test_get_settings_is_cached() -> None:
    assert get_settings() is get_settings()
