"""LinkedIn MCP connector.

A local Model Context Protocol (MCP) server that exposes the LinkedIn API
(https://api.linkedin.com) to any MCP-compatible client such as Claude Desktop,
Claude Code or Cursor.

It covers the most common LinkedIn operations:
  * read the authenticated member's profile (OpenID Connect ``userinfo``)
  * list the organizations (Company Pages) the member administers
  * read basic organization details
  * publish a text post as a person or as an organization (Posts API)
  * a generic ``linkedin_request`` passthrough for anything else

Authentication (see README):
  * An OAuth 2.0 access token is required (env LINKEDIN_ACCESS_TOKEN) with the
    scopes you need, e.g. ``openid profile email`` (sign in),
    ``w_member_social`` (post as the member) and, for Company Pages,
    ``w_organization_social`` + ``r_organization_admin`` (Community Management
    API, which requires an approved LinkedIn app).
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
BASE_URL = os.environ.get("LINKEDIN_BASE_URL", "https://api.linkedin.com").rstrip("/")
ACCESS_TOKEN = os.environ.get("LINKEDIN_ACCESS_TOKEN", "")
# Versioned REST APIs require a LinkedIn-Version header (format YYYYMM).
API_VERSION = os.environ.get("LINKEDIN_API_VERSION", "202506")
# Optional default author URN, e.g. "urn:li:person:xxxx" or
# "urn:li:organization:12345".
DEFAULT_AUTHOR_URN = os.environ.get("LINKEDIN_AUTHOR_URN", "")
TIMEOUT = float(os.environ.get("LINKEDIN_TIMEOUT", "30"))

mcp = FastMCP("linkedin")


# --------------------------------------------------------------------------- #
# Low level HTTP helper
# --------------------------------------------------------------------------- #
def _request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    json_body: Any | None = None,
    versioned: bool = True,
) -> Any:
    """Perform an authenticated request against the LinkedIn API.

    Adds the ``Authorization: Bearer`` header, the Rest.li protocol header and
    (for versioned ``/rest/*`` endpoints) the ``LinkedIn-Version`` header.
    ``path`` may be given with or without a leading slash.
    """
    if not ACCESS_TOKEN:
        return {"error": "Missing LINKEDIN_ACCESS_TOKEN environment variable."}

    clean = path.strip()
    if clean.startswith("http://") or clean.startswith("https://"):
        url = clean
    else:
        url = f"{BASE_URL}/{clean.lstrip('/')}"

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "X-Restli-Protocol-Version": "2.0.0",
        "Accept": "application/json",
    }
    if json_body is not None:
        headers["Content-Type"] = "application/json"
    # Versioned APIs live under /rest/ and need the version header.
    if versioned and "/rest/" in url:
        headers["LinkedIn-Version"] = API_VERSION

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            resp = client.request(
                method.upper(),
                url,
                params=params,
                json=json_body,
                headers=headers,
            )
    except httpx.HTTPError as exc:
        return {"error": f"HTTP request failed: {exc}"}

    body: Any
    try:
        body = resp.json()
    except Exception:
        body = resp.text

    if resp.status_code >= 400:
        return {
            "error": f"LinkedIn API returned {resp.status_code}",
            "status_code": resp.status_code,
            "body": body,
        }
    # Some write endpoints return the created id in a header, not the body.
    if not body and "x-restli-id" in resp.headers:
        return {"id": resp.headers["x-restli-id"], "status_code": resp.status_code}
    return body


# --------------------------------------------------------------------------- #
# Tools - identity
# --------------------------------------------------------------------------- #
@mcp.tool()
def linkedin_get_profile() -> Any:
    """Return the authenticated member's profile via OpenID Connect
    (`/v2/userinfo`).

    Requires the ``openid profile`` scopes. The ``sub`` field is the member id;
    the person URN for posting is ``urn:li:person:<sub>``.
    """
    return _request("GET", "/v2/userinfo", versioned=False)


# --------------------------------------------------------------------------- #
# Tools - organizations (Company Pages)
# --------------------------------------------------------------------------- #
@mcp.tool()
def linkedin_list_organizations(
    role: str = "ADMINISTRATOR",
    state: str = "APPROVED",
) -> Any:
    """List the organizations (Company Pages) the member has a role on.

    Requires ``r_organization_admin`` (Community Management API). Returns
    ``organizationAcls`` whose ``organization`` field is the org URN
    (``urn:li:organization:<id>``) you use as an author to post as the page.

    Args:
        role:  Role filter, e.g. ``ADMINISTRATOR``.
        state: Assignment state, e.g. ``APPROVED``.
    """
    return _request(
        "GET",
        "/rest/organizationAcls",
        params={"q": "roleAssignee", "role": role, "state": state},
    )


@mcp.tool()
def linkedin_get_organization(org_id: str) -> Any:
    """Get details for an organization by numeric id or URN.

    Args:
        org_id: Numeric organization id (e.g. ``12345``) or full URN
                ``urn:li:organization:12345``.
    """
    oid = org_id.split(":")[-1]
    return _request("GET", f"/rest/organizations/{oid}")


# --------------------------------------------------------------------------- #
# Tools - posting
# --------------------------------------------------------------------------- #
def _resolve_author(author_urn: str | None) -> str | None:
    urn = author_urn or DEFAULT_AUTHOR_URN
    return urn or None


@mcp.tool()
def linkedin_create_post(
    commentary: str,
    author_urn: str | None = None,
    visibility: str = "PUBLIC",
) -> Any:
    """Publish a text post to the LinkedIn feed (Posts API, `/rest/posts`).

    Posts as a person requires ``w_member_social``; posting as an organization
    requires ``w_organization_social``.

    Args:
        commentary: The post text (supports @mentions/hashtags as plain text).
        author_urn: Author URN. A person URN is ``urn:li:person:<sub>`` (see
                    ``linkedin_get_profile``); an org URN is
                    ``urn:li:organization:<id>`` (see
                    ``linkedin_list_organizations``). Falls back to
                    LINKEDIN_AUTHOR_URN.
        visibility: ``PUBLIC``, ``CONNECTIONS`` or ``LOGGED_IN``.
    """
    author = _resolve_author(author_urn)
    if not author:
        return {
            "error": "author_urn is required (or set LINKEDIN_AUTHOR_URN). "
            "Use urn:li:person:<sub> or urn:li:organization:<id>."
        }

    body = {
        "author": author,
        "commentary": commentary,
        "visibility": visibility,
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
        "lifecycleState": "PUBLISHED",
        "isReshareDisabledByAuthor": False,
    }
    return _request("POST", "/rest/posts", json_body=body)


# --------------------------------------------------------------------------- #
# Tool - generic passthrough
# --------------------------------------------------------------------------- #
@mcp.tool()
def linkedin_request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
    json_body: Any | None = None,
    versioned: bool = True,
) -> Any:
    """Call any LinkedIn API endpoint directly (escape hatch).

    The ``Authorization`` header and Rest.li headers are added automatically.
    See https://learn.microsoft.com/linkedin/

    Args:
        method:    HTTP method: GET, POST, PUT, DELETE.
        path:      Endpoint path, e.g. ``/v2/userinfo`` or ``/rest/posts``.
        params:    Query parameters.
        json_body: JSON body for write operations.
        versioned: Whether to send the LinkedIn-Version header (for /rest/*).
    """
    return _request(method, path, params=params, json_body=json_body, versioned=versioned)


def main() -> None:
    """Entry point for stdio transport."""
    mcp.run()


if __name__ == "__main__":
    main()
