"""Shared logging configuration for the ingestion pipeline and API."""

import logging
import sys

from papermind.core.config import get_settings

# Third-party libraries that log routine HTTP/network activity at INFO,
# which drowns out our own pipeline's log lines. We only want to hear from
# them at WARNING or above.
_NOISY_LIBRARY_LOGGERS = ["httpx", "httpcore", "huggingface_hub", "urllib3"]


def configure_logging(level: str | None = None) -> None:
    """Configure root logging once. Safe to call multiple times (no duplicate handlers).

    `level` defaults to the LOG_LEVEL setting (env-configurable) rather than a
    hardcoded constant, so every caller gets that behavior for free.
    """
    root = logging.getLogger()
    if root.handlers:
        return

    if level is None:
        level = get_settings().log_level

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
    )
    root.addHandler(handler)
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    for name in _NOISY_LIBRARY_LOGGERS:
        logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
