"""Baseline browser security headers for every response."""

from __future__ import annotations

from typing import Any

from starlette.types import ASGIApp, Message, Receive, Scope, Send

# Everything the UI loads is served from this origin (vendored libraries, the
# US atlas, the API). `data:`/`blob:` images cover the inline favicon, Leaflet
# markers and chart PNG export. Inline scripts are forbidden; styles applied
# through the CSSOM (Chart.js, Leaflet) are not affected by style-src.
CONTENT_SECURITY_POLICY = "; ".join(
    [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ]
)

BASE_HEADERS: tuple[tuple[bytes, bytes], ...] = (
    (b"x-content-type-options", b"nosniff"),
    (b"x-frame-options", b"DENY"),
    (b"referrer-policy", b"no-referrer"),
    (b"cross-origin-opener-policy", b"same-origin"),
)

# FastAPI's Swagger/ReDoc pages pull assets from a CDN and use inline script,
# so they keep the other headers but not the CSP.
_CSP_EXEMPT_PREFIXES = ("/docs", "/redoc")


class SecurityHeadersMiddleware:
    """Pure ASGI (not BaseHTTPMiddleware) so streamed chat responses pass
    through untouched apart from their start message."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        path: str = scope.get("path", "")
        add_csp = not path.startswith(_CSP_EXEMPT_PREFIXES)

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers: list[Any] = list(message.get("headers", []))
                present = {name.lower() for name, _ in headers}
                for name, value in BASE_HEADERS:
                    if name not in present:
                        headers.append((name, value))
                if add_csp and b"content-security-policy" not in present:
                    headers.append((b"content-security-policy", CONTENT_SECURITY_POLICY.encode("ascii")))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_headers)
