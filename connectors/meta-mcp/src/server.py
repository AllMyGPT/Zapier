"""Meta (Facebook / Instagram) MCP connector.

A local Model Context Protocol (MCP) server that exposes the Meta Graph API
(https://graph.facebook.com) to any MCP-compatible client such as Claude
Desktop, Claude Code or Cursor.

It covers the most common Meta marketing / social operations:
  * inspect the authenticated user and the Pages they manage
  * read and publish Facebook Page posts
  * resolve the Instagram Business account linked to a Page
  * read Instagram media and publish photos to Instagram
  * read Page / post / Instagram insights (metrics)
  * a generic ``meta_graph_request`` passthrough for anything else

Authentication (see README):
  * A Meta access token is required (env META_ACCESS_TOKEN). Use a long-lived
    User or Page access token created for a Meta app with the appropriate
    permissions (pages_show_list, pages_read_engagement, pages_manage_posts,
    instagram_basic, instagram_content_publish, read_insights, ...).
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
API_VERSION = os.environ.get("META_API_VERSION", "v21.0")
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"
ACCESS_TOKEN = os.environ.get("META_ACCESS_TOKEN", "")
DEFAULT_PAGE_ID = os.environ.get("META_PAGE_ID", "")
DEFAULT_IG_USER_ID = os.environ.get("META_IG_USER_ID", "")
TIMEOUT = float(os.environ.get("META_TIMEOUT", "30"))

mcp = FastMCP("meta")


# --------------------------------------------------------------------------- #
# Low level HTTP helper
# --------------------------------------------------------------------------- #
def _request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    data: dict[str, Any] | None = None,
    token: str | None = None,
) -> Any:
    """Perform a request against the Graph API.

    The access token is injected automatically (per-call ``token`` overrides
    the environment default). ``path`` may include or omit the version prefix.
    """
    access = token or ACCESS_TOKEN
    if not access:
        return {"error": "Missing META_ACCESS_TOKEN environment variable."}

    clean = path.strip()
    if clean.startswith("http://") or clean.startswith("https://"):
        url = clean
    else:
        clean = "/" + clean.lstrip("/")
        # Strip an accidental version prefix like /v21.0/...
        if clean.startswith("/v") and "/" in clean[1:]:
            head = clean.split("/", 2)
            if len(head) > 1 and head[1].startswith("v") and head[1][1:2].isdigit():
                clean = "/" + (head[2] if len(head) > 2 else "")
        url = f"{BASE_URL}{clean}"

    query: dict[str, Any] = {"access_token": access}
    if params:
        query.update({k: v for k, v in params.items() if v is not None})

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            resp = client.request(method.upper(), url, params=query, data=data)
    except httpx.HTTPError as exc:
        return {"error": f"HTTP request failed: {exc}"}

    body: Any
    try:
        body = resp.json()
    except Exception:
        body = resp.text

    if resp.status_code >= 400:
        return {
            "error": f"Meta Graph API returned {resp.status_code}",
            "status_code": resp.status_code,
            "body": body,
        }
    return body


def _resolve(value: str | None, default: str, name: str) -> str | dict[str, str]:
    resolved = value or default
    if not resolved:
        return {"error": f"{name} is required (or set the corresponding env var)."}
    return resolved


# --------------------------------------------------------------------------- #
# Tools - identity & pages
# --------------------------------------------------------------------------- #
@mcp.tool()
def meta_get_me(fields: str = "id,name") -> Any:
    """Return the profile behind the current access token (`/me`)."""
    return _request("GET", "/me", params={"fields": fields})


@mcp.tool()
def meta_list_pages() -> Any:
    """List the Facebook Pages the token can manage, including each Page's own
    access token (`/me/accounts`).

    The per-Page ``access_token`` returned here is what you use to publish to
    that Page and to reach its linked Instagram account.
    """
    return _request(
        "GET",
        "/me/accounts",
        params={"fields": "id,name,category,access_token,tasks"},
    )


# --------------------------------------------------------------------------- #
# Tools - Facebook Page content
# --------------------------------------------------------------------------- #
@mcp.tool()
def meta_get_page_posts(
    page_id: str | None = None,
    limit: int = 25,
    page_token: str | None = None,
) -> Any:
    """List recent posts published on a Facebook Page.

    Args:
        page_id:    Page id. Falls back to META_PAGE_ID.
        limit:      Max number of posts to return.
        page_token: Page access token (from ``meta_list_pages``); falls back
                    to the default token when omitted.
    """
    pid = _resolve(page_id, DEFAULT_PAGE_ID, "page_id")
    if isinstance(pid, dict):
        return pid
    return _request(
        "GET",
        f"/{pid}/posts",
        params={
            "fields": "id,message,created_time,permalink_url,shares,comments.summary(true),reactions.summary(true)",
            "limit": limit,
        },
        token=page_token,
    )


@mcp.tool()
def meta_publish_page_post(
    message: str,
    page_id: str | None = None,
    link: str | None = None,
    page_token: str | None = None,
) -> Any:
    """Publish a text (optionally with a link) post to a Facebook Page.

    Requires a Page access token with ``pages_manage_posts``.

    Args:
        message:    The post text.
        page_id:    Page id. Falls back to META_PAGE_ID.
        link:       Optional URL to attach.
        page_token: Page access token (from ``meta_list_pages``).
    """
    pid = _resolve(page_id, DEFAULT_PAGE_ID, "page_id")
    if isinstance(pid, dict):
        return pid
    data: dict[str, Any] = {"message": message}
    if link:
        data["link"] = link
    return _request("POST", f"/{pid}/feed", data=data, token=page_token)


# --------------------------------------------------------------------------- #
# Tools - Instagram
# --------------------------------------------------------------------------- #
@mcp.tool()
def meta_get_instagram_account(
    page_id: str | None = None,
    page_token: str | None = None,
) -> Any:
    """Resolve the Instagram Business account connected to a Facebook Page.

    Returns the ``instagram_business_account`` id you pass to the other
    Instagram tools (or set it as META_IG_USER_ID).
    """
    pid = _resolve(page_id, DEFAULT_PAGE_ID, "page_id")
    if isinstance(pid, dict):
        return pid
    return _request(
        "GET",
        f"/{pid}",
        params={"fields": "instagram_business_account{id,username,name,followers_count}"},
        token=page_token,
    )


@mcp.tool()
def meta_get_instagram_media(
    ig_user_id: str | None = None,
    limit: int = 25,
    token: str | None = None,
) -> Any:
    """List recent media for an Instagram Business account.

    Args:
        ig_user_id: Instagram Business account id. Falls back to META_IG_USER_ID.
        limit:      Max number of media items.
        token:      Access token; falls back to the default.
    """
    iid = _resolve(ig_user_id, DEFAULT_IG_USER_ID, "ig_user_id")
    if isinstance(iid, dict):
        return iid
    return _request(
        "GET",
        f"/{iid}/media",
        params={
            "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
            "limit": limit,
        },
        token=token,
    )


@mcp.tool()
def meta_publish_instagram_photo(
    image_url: str,
    caption: str = "",
    ig_user_id: str | None = None,
    token: str | None = None,
) -> Any:
    """Publish a single photo to Instagram (two-step container + publish flow).

    Requires ``instagram_content_publish``. The image must be a publicly
    reachable JPEG URL.

    Args:
        image_url:  Public URL of the image to post.
        caption:    Optional caption text.
        ig_user_id: Instagram Business account id. Falls back to META_IG_USER_ID.
        token:      Access token; falls back to the default.
    """
    iid = _resolve(ig_user_id, DEFAULT_IG_USER_ID, "ig_user_id")
    if isinstance(iid, dict):
        return iid

    # Step 1: create the media container.
    container = _request(
        "POST",
        f"/{iid}/media",
        data={"image_url": image_url, "caption": caption},
        token=token,
    )
    if isinstance(container, dict) and container.get("error"):
        return {"step": "create_container", **container}
    creation_id = container.get("id") if isinstance(container, dict) else None
    if not creation_id:
        return {"step": "create_container", "error": "No creation id returned", "body": container}

    # Step 2: publish the container.
    published = _request(
        "POST",
        f"/{iid}/media_publish",
        data={"creation_id": creation_id},
        token=token,
    )
    return {"creation_id": creation_id, "publish_result": published}


# --------------------------------------------------------------------------- #
# Tools - insights / metrics
# --------------------------------------------------------------------------- #
@mcp.tool()
def meta_get_insights(
    object_id: str,
    metrics: str,
    period: str = "day",
    since: str | None = None,
    until: str | None = None,
    token: str | None = None,
) -> Any:
    """Read insights (metrics) for a Page, post or Instagram object.

    Args:
        object_id: Id of the Page / post / IG media / IG user.
        metrics:   Comma-separated metric names, e.g.
                   ``page_impressions,page_engaged_users`` (Facebook Page) or
                   ``reach,impressions,profile_views`` (Instagram).
        period:    Aggregation period: ``day``, ``week``, ``days_28``,
                   ``lifetime`` (depends on the metric).
        since:     Optional start (UNIX timestamp or YYYY-MM-DD).
        until:     Optional end (UNIX timestamp or YYYY-MM-DD).
        token:     Access token; falls back to the default.
    """
    params: dict[str, Any] = {"metric": metrics, "period": period}
    if since:
        params["since"] = since
    if until:
        params["until"] = until
    return _request("GET", f"/{object_id}/insights", params=params, token=token)


# --------------------------------------------------------------------------- #
# Tool - generic passthrough
# --------------------------------------------------------------------------- #
@mcp.tool()
def meta_graph_request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    data: dict[str, Any] | None = None,
    token: str | None = None,
) -> Any:
    """Call any Graph API endpoint directly (escape hatch).

    The ``access_token`` is injected automatically. Use this for endpoints not
    covered by a dedicated tool (Ads, catalogs, comments, ...). See
    https://developers.facebook.com/docs/graph-api/

    Args:
        method: HTTP method: GET, POST, DELETE.
        path:   Endpoint path, e.g. ``/{page-id}/photos`` or ``/act_<id>/campaigns``.
        params: Query parameters (fields, limit, ...).
        data:   Form body for write operations.
        token:  Access token override.
    """
    return _request(method, path, params=params, data=data, token=token)


def main() -> None:
    """Entry point for stdio transport."""
    mcp.run()


if __name__ == "__main__":
    main()
