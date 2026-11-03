from __future__ import annotations

import time
from typing import Any

import requests

from backend.llm.provider import LLMProvider

DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5:7b-instruct"
REQUEST_TIMEOUT_SECONDS = 120
CONTEXT_LENGTH = 8192  # default (2048 on most local installs) is too tight for full-schema + tool-result prompts


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str = DEFAULT_BASE_URL, model: str = DEFAULT_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"num_ctx": CONTEXT_LENGTH},
        }
        if tools:
            payload["tools"] = tools

        # A transient drop (Ollama mid-restart, a slow first model load) is common
        # enough locally that a single retry beats surfacing a raw connection error
        # on the first hiccup. Timeouts are not retried — a slow model is likely to
        # be slow again immediately, so retrying would just double the user's wait.
        response = None
        for attempt in range(2):
            try:
                response = requests.post(
                    f"{self.base_url}/api/chat", json=payload, timeout=REQUEST_TIMEOUT_SECONDS
                )
                response.raise_for_status()
                break
            except requests.ConnectionError as exc:
                if attempt == 0:
                    time.sleep(1)
                    continue
                raise RuntimeError(
                    "Couldn't reach the local Ollama server. Make sure Ollama is "
                    "running (`ollama serve`) and try again."
                ) from exc
            except requests.Timeout as exc:
                raise RuntimeError(
                    f"The local model took too long to respond (over {REQUEST_TIMEOUT_SECONDS}s). "
                    "It may be overloaded — try again in a moment."
                ) from exc
            except requests.HTTPError as exc:
                raise RuntimeError(f"Ollama returned an error: {exc}") from exc
        assert response is not None  # loop always returns or raises

        data = response.json()
        message = data.get("message", {})

        tool_calls = None
        if message.get("tool_calls"):
            tool_calls = [
                {
                    "name": tc["function"]["name"],
                    "arguments": tc["function"].get("arguments", {}),
                }
                for tc in message["tool_calls"]
            ]

        return {"content": message.get("content") or None, "tool_calls": tool_calls}

    def health_check(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/version", timeout=5)
            return response.ok
        except requests.RequestException:
            return False

    def model_status(self) -> dict[str, Any]:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            tags = {m.get("name") for m in response.json().get("models", [])}
            return {"reachable": True, "model_available": self.model in tags, "model": self.model}
        except requests.RequestException:
            return {"reachable": False, "model_available": False, "model": self.model}

    def list_models(self) -> list[str]:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            names = [m.get("name") for m in response.json().get("models", []) if m.get("name")]
            return sorted(names)
        except requests.RequestException:
            return []
