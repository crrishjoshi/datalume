"""Minimal in-process ASGI client so the API can be exercised without adding
httpx (FastAPI's TestClient dependency) to the project."""

from __future__ import annotations

import asyncio
import json as jsonlib
from dataclasses import dataclass, field
from http.cookies import SimpleCookie
from typing import Any
from urllib.parse import urlsplit


@dataclass
class Response:
    status: int
    headers: dict[str, str]
    raw_headers: list[tuple[str, str]]
    body: bytes

    def json(self) -> Any:
        return jsonlib.loads(self.body)

    @property
    def text(self) -> str:
        return self.body.decode("utf-8")


@dataclass
class Client:
    app: Any
    cookies: dict[str, str] = field(default_factory=dict)

    async def arequest(
        self,
        method: str,
        path: str,
        *,
        json: Any = None,
        body: bytes = b"",
        headers: dict[str, str] | None = None,
    ) -> Response:
        parts = urlsplit(path)
        request_headers = {k.lower(): v for k, v in (headers or {}).items()}
        if json is not None:
            body = jsonlib.dumps(json).encode("utf-8")
            request_headers.setdefault("content-type", "application/json")
        if self.cookies:
            request_headers["cookie"] = "; ".join(f"{k}={v}" for k, v in self.cookies.items())
        request_headers.setdefault("host", "testserver")
        request_headers["content-length"] = str(len(body))
        scope = {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": method.upper(),
            "scheme": "http",
            "path": parts.path,
            "raw_path": parts.path.encode(),
            "query_string": parts.query.encode(),
            "root_path": "",
            "headers": [(k.encode(), v.encode()) for k, v in request_headers.items()],
            "client": ("127.0.0.1", 50000),
            "server": ("testserver", 80),
        }
        sent_body = False
        status = 0
        raw_headers: list[tuple[str, str]] = []
        chunks: list[bytes] = []
        done = asyncio.Event()

        async def receive() -> dict:
            nonlocal sent_body
            if not sent_body:
                sent_body = True
                return {"type": "http.request", "body": body, "more_body": False}
            await done.wait()
            return {"type": "http.disconnect"}

        async def send(message: dict) -> None:
            nonlocal status
            if message["type"] == "http.response.start":
                status = message["status"]
                raw_headers.extend((k.decode().lower(), v.decode()) for k, v in message.get("headers", []))
            elif message["type"] == "http.response.body":
                chunks.append(message.get("body", b""))
                if not message.get("more_body", False):
                    done.set()

        await self.app(scope, receive, send)
        done.set()
        for name, value in raw_headers:
            if name == "set-cookie":
                jar = SimpleCookie()
                jar.load(value)
                for key, morsel in jar.items():
                    if morsel["max-age"] == "0" or not morsel.value:
                        self.cookies.pop(key, None)
                    else:
                        self.cookies[key] = morsel.value
        return Response(status, dict(raw_headers), raw_headers, b"".join(chunks))

    def request(self, method: str, path: str, **kwargs: Any) -> Response:
        return asyncio.run(self.arequest(method, path, **kwargs))

    def get(self, path: str, **kwargs: Any) -> Response:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> Response:
        return self.request("POST", path, **kwargs)


def multipart_file(field_name: str, filename: str, content: bytes) -> tuple[bytes, dict[str, str]]:
    """Encode one file as a multipart/form-data body; returns (body, headers)."""
    boundary = "datalume-test-boundary"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
        "Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + content + f"\r\n--{boundary}--\r\n".encode("utf-8")
    return body, {"content-type": f"multipart/form-data; boundary={boundary}"}


SAMPLE_CSV = (
    b"region,product,sales,quantity\n"
    b"East,Chair,120.5,2\nWest,Desk,300.0,1\nEast,Lamp,45.25,3\n"
    b"South,Chair,99.0,1\nWest,Lamp,60.0,4\nNorth,Desk,410.0,2\n"
)


def signed_in_client(app: Any) -> Client:
    """A client with a freshly registered user's auth cookie."""
    import time

    client = Client(app)
    res = client.post("/auth/register", json={"username": f"t{time.time_ns()}", "password": "password123"})
    assert res.status == 200, res.text
    return client


def upload_sample(client: Client, csv: bytes = SAMPLE_CSV, filename: str = "sales.csv") -> dict:
    body, headers = multipart_file("file", filename, csv)
    res = client.request("POST", "/upload", body=body, headers=headers)
    assert res.status == 200, res.text
    return res.json()
