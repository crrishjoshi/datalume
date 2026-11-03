"""LLM provider abstraction. One implementation today (Ollama, local).
Adding a hosted provider (OpenAI/Anthropic) later for the BYOK feature means
adding a class here and a lookup by Account.provider_type — not a redesign."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class LLMProvider(ABC):
    @abstractmethod
    def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        """Send a chat-completion request. Returns a normalized dict:
        {"content": str | None, "tool_calls": [{"name": str, "arguments": dict}] | None}
        """

    @abstractmethod
    def health_check(self) -> bool:
        """True if the provider is reachable right now."""

    def model_status(self) -> dict[str, Any]:
        """Reachability plus whether the configured model is actually usable.
        Base implementation assumes a hosted provider is always ready given a
        valid key; OllamaProvider overrides this with a real local check since
        "server up" and "model pulled" are independent failure modes there."""
        return {"reachable": self.health_check(), "model_available": True, "model": None}

    def list_models(self) -> list[str]:
        """Models this provider could be switched to. Base implementation has
        no way to enumerate a hosted account's models generically, so it just
        reports the one currently configured; OllamaProvider overrides this
        with the real local `/api/tags` list."""
        model = getattr(self, "model", None)
        return [model] if model else []
