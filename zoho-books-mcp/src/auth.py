"""Zoho OAuth2 token management with automatic refresh."""

import os
import time
import httpx
from typing import Optional

REGION_ACCOUNTS = {
    "com": "https://accounts.zoho.com",
    "eu":  "https://accounts.zoho.eu",
    "in":  "https://accounts.zoho.in",
    "au":  "https://accounts.zoho.com.au",
    "jp":  "https://accounts.zoho.jp",
}


class ZohoAuth:
    def __init__(self):
        self.client_id = os.environ["ZOHO_CLIENT_ID"]
        self.client_secret = os.environ["ZOHO_CLIENT_SECRET"]
        self.refresh_token = os.environ["ZOHO_REFRESH_TOKEN"]
        self.region = os.environ.get("ZOHO_REGION", "eu")

        self._access_token: Optional[str] = None
        self._token_expiry: float = 0.0

    @property
    def accounts_url(self) -> str:
        return REGION_ACCOUNTS.get(self.region, REGION_ACCOUNTS["eu"])

    async def get_access_token(self) -> str:
        if self._access_token and time.time() < self._token_expiry - 60:
            return self._access_token
        return await self._refresh()

    async def _refresh(self) -> str:
        url = f"{self.accounts_url}/oauth/v2/token"
        params = {
            "refresh_token": self.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "refresh_token",
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        if "access_token" not in data:
            raise RuntimeError(f"Token refresh failed: {data}")

        self._access_token = data["access_token"]
        expires_in = int(data.get("expires_in", 3600))
        self._token_expiry = time.time() + expires_in
        return self._access_token


# Module-level singleton
_auth: Optional[ZohoAuth] = None


def get_auth() -> ZohoAuth:
    global _auth
    if _auth is None:
        _auth = ZohoAuth()
    return _auth
