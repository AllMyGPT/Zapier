"""Metricool MCP connector.

A local Model Context Protocol (MCP) server that exposes the Metricool API
(https://app.metricool.com/api) to any MCP-compatible client such as Claude
Desktop, Claude Code or Cursor.

Authentication (see README):
  * Header  ``X-Mc-Auth: <user token>``   -> env METRICOOL_USER_TOKEN
  * Query   ``userId=<user id>``           -> env METRICOOL_USER_ID
  * Query   ``blogId=<brand id>``          -> env METRICOOL_BLOG_ID (optional
    default) or passed per call.

The connector ships a set of convenience tools for the most common operations
plus a generic ``metricool_request`` passthrough so you can reach *any*
documented endpoint without waiting for a new tool to be written.
"""

from __future__ import annotations

import os
from typing import Any

import httpx

try:  # optional, only needed when running standalone with a .env file
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv is optional
    pass

from mcp.server.fastmcp import FastMCP

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
BASE_URL = os.environ.get("METRICOOL_BASE_URL", "https://app.metricool.com/api").rstrip("/")
USER_TOKEN = os.environ.get("METRICOOL_USER_TOKEN", "")
USER_ID = os.environ.get("METRICOOL_USER_ID", "")
DEFAULT_BLOG_ID = os.environ.get("METRICOOL_BLOG_ID", "")

TIMEOUT = float(os.environ.get("METRICOOL_TIMEOUT", "30"))

mcp = FastMCP("metricool")


# --------------------------------------------------------------------------- #
# Low level HTTP helper
# --------------------------------------------------------------------------- #
def _require_credentials() -> str | None:
    """Return an error string if mandatory credentials are missing."""
    if not USER_TOKEN:
        return "Missing METRICOOL_USER_TOKEN environment variable."
    if not USER_ID:
        return "Missing METRICOOL_USER_ID environment variable."
    return None


def _request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    json_body: Any | None = None,
) -> Any:
    """Perform an authenticated request against the Metricool API.

    ``path`` may be given with or without a leading slash and with or without
    the ``/api`` prefix (it is normalised against ``BASE_URL``).
    """
    err = _require_credentials()
    if err:
        return {"error": err}

    # Normalise the path against the configured base URL.
    clean = path.strip()
    if clean.startswith("http://") or clean.startswith("https://"):
        url = clean
    else:
        clean = "/" + clean.lstrip("/")
        if clean.startswith("/api/"):
            clean = clean[len("/api"):]
        url = f"{BASE_URL}{clean}"

    query: dict[str, Any] = {"userId": USER_ID}
    if params:
        query.update({k: v for k, v in params.items() if v is not None})
    # Inject a default blogId when the endpoint needs one and the caller
    # relied on the environment default.
    if "blogId" not in query and DEFAULT_BLOG_ID:
        query["blogId"] = DEFAULT_BLOG_ID

    headers = {
        "X-Mc-Auth": USER_TOKEN,
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            resp = client.request(
                method.upper(),
                url,
                params=query,
                json=json_body,
                headers=headers,
            )
    except httpx.HTTPError as exc:  # network / connection errors
        return {"error": f"HTTP request failed: {exc}"}

    # Try to decode JSON, fall back to raw text.
    body: Any
    try:
        body = resp.json()
    except Exception:
        body = resp.text

    if resp.status_code >= 400:
        return {
            "error": f"Metricool API returned {resp.status_code}",
            "status_code": resp.status_code,
            "body": body,
        }
    return body


def _resolve_blog_id(blog_id: str | int | None) -> str | None:
    if blog_id not in (None, ""):
        return str(blog_id)
    if DEFAULT_BLOG_ID:
        return DEFAULT_BLOG_ID
    return None


# --------------------------------------------------------------------------- #
# Tools - accounts / brands
# --------------------------------------------------------------------------- #
@mcp.tool()
def metricool_get_brands() -> Any:
    """List the brands (profiles) available in your Metricool account.

    Each brand exposes a ``blogId`` (a.k.a. ``id``) that you must pass to the
    analytics and scheduling tools. Call this first to discover your brand ids.
    """
    return _request("GET", "/admin/simpleProfiles")


# --------------------------------------------------------------------------- #
# Tools - analytics
# --------------------------------------------------------------------------- #
@mcp.tool()
def metricool_get_analytics(
    endpoint: str,
    start: str,
    end: str,
    blog_id: str | None = None,
    extra_params: dict[str, Any] | None = None,
) -> Any:
    """Fetch analytics data from a Metricool analytics ``endpoint``.

    Metricool exposes a large, evolving catalogue of per-network analytics
    endpoints (Instagram, Facebook, X/Twitter, LinkedIn, TikTok, YouTube,
    Pinterest, Google Business, web, ...). Rather than hard-coding paths that
    change over time, pass the endpoint path shown in the official API docs
    (https://app.metricool.com/resources/apidocs/index.html) or discovered via
    your browser's network tab, e.g. ``/stats/instagram`` or
    ``/v2/analytics/posts/instagram``.

    Args:
        endpoint:   Analytics endpoint path (with or without leading slash).
        start:      Start date, ``YYYYMMDD`` or ISO ``YYYY-MM-DD``.
        end:        End date, ``YYYYMMDD`` or ISO ``YYYY-MM-DD``.
        blog_id:    Brand id. Falls back to METRICOOL_BLOG_ID when omitted.
        extra_params: Any additional query parameters the endpoint accepts.
    """
    bid = _resolve_blog_id(blog_id)
    if not bid:
        return {"error": "blog_id is required (or set METRICOOL_BLOG_ID)."}
    params: dict[str, Any] = {"blogId": bid, "start": start, "end": end}
    if extra_params:
        params.update(extra_params)
    return _request("GET", endpoint, params=params)


@mcp.tool()
def metricool_get_competitors(
    network: str,
    start: str,
    end: str,
    blog_id: str | None = None,
) -> Any:
    """Get competitor analytics for a given ``network`` (e.g. ``instagram``,
    ``facebook``, ``twitter``, ``youtube``, ``tiktok``).

    Uses the ``/competitors/<network>`` endpoint family.
    """
    bid = _resolve_blog_id(blog_id)
    if not bid:
        return {"error": "blog_id is required (or set METRICOOL_BLOG_ID)."}
    return _request(
        "GET",
        f"/competitors/{network.lower()}",
        params={"blogId": bid, "start": start, "end": end},
    )


# --------------------------------------------------------------------------- #
# Tools - scheduler / posts
# --------------------------------------------------------------------------- #
@mcp.tool()
def metricool_get_scheduled_posts(
    start: str,
    end: str,
    blog_id: str | None = None,
) -> Any:
    """List scheduled / planned posts between ``start`` and ``end``.

    Args:
        start:   Start datetime, ``YYYYMMDDHHMMSS`` or ISO.
        end:     End datetime, ``YYYYMMDDHHMMSS`` or ISO.
        blog_id: Brand id. Falls back to METRICOOL_BLOG_ID when omitted.
    """
    bid = _resolve_blog_id(blog_id)
    if not bid:
        return {"error": "blog_id is required (or set METRICOOL_BLOG_ID)."}
    return _request(
        "GET",
        "/v2/scheduler/posts",
        params={"blogId": bid, "start": start, "end": end},
    )


@mcp.tool()
def metricool_schedule_post(
    text: str,
    date_time: str,
    providers: list[str],
    blog_id: str | None = None,
    timezone: str = "Europe/Madrid",
    media_urls: list[str] | None = None,
    auto_publish: bool = True,
    draft: bool = False,
    extra: dict[str, Any] | None = None,
) -> Any:
    """Schedule (or draft) a post to one or more social networks.

    Args:
        text:        The post copy / caption.
        date_time:   Publication datetime in ISO local time, e.g.
                     ``2026-07-10T18:30:00``.
        providers:   Networks to publish to, e.g. ``["instagram", "facebook"]``.
        blog_id:     Brand id. Falls back to METRICOOL_BLOG_ID when omitted.
        timezone:    IANA timezone for ``date_time`` (default Europe/Madrid).
        media_urls:  Optional list of publicly reachable image/video URLs.
        auto_publish: If True, Metricool publishes automatically at the given
                     time; if False it only reminds you.
        draft:       Save as draft instead of scheduling.
        extra:       Any additional fields to merge into the request body
                     (see the official docs for the full schema).
    """
    bid = _resolve_blog_id(blog_id)
    if not bid:
        return {"error": "blog_id is required (or set METRICOOL_BLOG_ID)."}

    body: dict[str, Any] = {
        "autoPublish": auto_publish,
        "draft": draft,
        "text": text,
        "publicationDate": {"dateTime": date_time, "timezone": timezone},
        "providers": [{"network": n.lower()} for n in providers],
    }
    if media_urls:
        body["media"] = list(media_urls)
    if extra:
        body.update(extra)

    return _request(
        "POST",
        "/v2/scheduler/posts",
        params={"blogId": bid},
        json_body=body,
    )


# --------------------------------------------------------------------------- #
# Tool - generic passthrough
# --------------------------------------------------------------------------- #
@mcp.tool()
def metricool_request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    json_body: Any | None = None,
) -> Any:
    """Call any Metricool API endpoint directly (escape hatch).

    ``userId`` and the ``X-Mc-Auth`` header are added automatically; supply
    ``blogId`` inside ``params`` when the endpoint needs it. Use this for any
    endpoint not covered by a dedicated tool. See the API reference at
    https://app.metricool.com/resources/apidocs/index.html

    Args:
        method:    HTTP method: GET, POST, PUT, PATCH, DELETE.
        path:      Endpoint path, e.g. ``/admin/simpleProfiles``.
        params:    Query parameters (blogId, start, end, ...).
        json_body: JSON body for write operations.
    """
    return _request(method, path, params=params, json_body=json_body)


def main() -> None:
    """Entry point for stdio transport."""
    mcp.run()


if __name__ == "__main__":
    main()
