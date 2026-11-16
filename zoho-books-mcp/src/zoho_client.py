"""Zoho Books API client — all HTTP calls go through here."""

import os
from typing import Any, Optional
import httpx
from .auth import get_auth

REGION_API = {
    "com": "https://www.zohoapis.com",
    "eu":  "https://www.zohoapis.eu",
    "in":  "https://www.zohoapis.in",
    "au":  "https://www.zohoapis.com.au",
    "jp":  "https://www.zohoapis.jp",
}


class ZohoBooksClient:
    def __init__(self):
        self.org_id = os.environ["ZOHO_ORGANIZATION_ID"]
        region = os.environ.get("ZOHO_REGION", "eu")
        base = REGION_API.get(region, REGION_API["eu"])
        self.base_url = f"{base}/books/v3"
        self.auth = get_auth()

    async def _headers(self) -> dict:
        token = await self.auth.get_access_token()
        return {"Authorization": f"Zoho-oauthtoken {token}"}

    async def get(self, path: str, params: Optional[dict] = None) -> dict:
        params = params or {}
        params["organization_id"] = self.org_id
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{self.base_url}{path}",
                headers=await self._headers(),
                params=params,
            )
            resp.raise_for_status()
            return resp.json()

    async def post(self, path: str, data: dict, files: Optional[dict] = None) -> dict:
        headers = await self._headers()
        params = {"organization_id": self.org_id}
        async with httpx.AsyncClient(timeout=60) as client:
            if files:
                resp = await client.post(
                    f"{self.base_url}{path}",
                    headers=headers,
                    params=params,
                    data={"JSONString": __import__("json").dumps(data)},
                    files=files,
                )
            else:
                headers["Content-Type"] = "application/json"
                resp = await client.post(
                    f"{self.base_url}{path}",
                    headers=headers,
                    params=params,
                    json=data,
                )
            resp.raise_for_status()
            return resp.json()

    async def put(self, path: str, data: dict) -> dict:
        headers = await self._headers()
        headers["Content-Type"] = "application/json"
        params = {"organization_id": self.org_id}
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.put(
                f"{self.base_url}{path}",
                headers=headers,
                params=params,
                json=data,
            )
            resp.raise_for_status()
            return resp.json()

    # ── Chart of Accounts ──────────────────────────────────────────────
    async def list_accounts(self, account_type: Optional[str] = None) -> dict:
        params = {}
        if account_type:
            params["account_type"] = account_type
        return await self.get("/chartofaccounts", params)

    # ── Contacts / Vendors ─────────────────────────────────────────────
    async def list_contacts(self, contact_type: str = "vendor", search: Optional[str] = None) -> dict:
        params: dict[str, Any] = {"contact_type": contact_type}
        if search:
            params["search_text"] = search
        return await self.get("/contacts", params)

    async def create_contact(self, data: dict) -> dict:
        return await self.post("/contacts", data)

    # ── Expenses ───────────────────────────────────────────────────────
    async def list_expenses(self, filters: Optional[dict] = None) -> dict:
        return await self.get("/expenses", filters or {})

    async def get_expense(self, expense_id: str) -> dict:
        return await self.get(f"/expenses/{expense_id}")

    async def create_expense(self, data: dict) -> dict:
        return await self.post("/expenses", data)

    async def attach_receipt_to_expense(
        self, expense_id: str, file_bytes: bytes, filename: str, content_type: str
    ) -> dict:
        files = {"receipt": (filename, file_bytes, content_type)}
        headers = await self._headers()
        params = {"organization_id": self.org_id}
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/expenses/{expense_id}/receipt",
                headers=headers,
                params=params,
                files=files,
            )
            resp.raise_for_status()
            return resp.json()

    # ── Vendor Bills ───────────────────────────────────────────────────
    async def list_bills(self, filters: Optional[dict] = None) -> dict:
        return await self.get("/bills", filters or {})

    async def get_bill(self, bill_id: str) -> dict:
        return await self.get(f"/bills/{bill_id}")

    async def create_bill(self, data: dict) -> dict:
        return await self.post("/bills", data)

    async def attach_document_to_bill(
        self, bill_id: str, file_bytes: bytes, filename: str, content_type: str
    ) -> dict:
        files = {"attachment": (filename, file_bytes, content_type)}
        headers = await self._headers()
        params = {"organization_id": self.org_id}
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/bills/{bill_id}/attachment",
                headers=headers,
                params=params,
                files=files,
            )
            resp.raise_for_status()
            return resp.json()

    # ── Tax Rates ──────────────────────────────────────────────────────
    async def list_taxes(self) -> dict:
        return await self.get("/taxes")

    # ── Currencies ────────────────────────────────────────────────────
    async def list_currencies(self) -> dict:
        return await self.get("/currencies")

    # ── Reports ───────────────────────────────────────────────────────
    async def get_profit_loss(self, from_date: str, to_date: str) -> dict:
        return await self.get(
            "/reports/profitandloss",
            {"from_date": from_date, "to_date": to_date},
        )

    async def get_cash_flow(self, from_date: str, to_date: str) -> dict:
        return await self.get(
            "/reports/cashflow",
            {"from_date": from_date, "to_date": to_date},
        )

    async def get_expense_by_category(self, from_date: str, to_date: str) -> dict:
        return await self.get(
            "/reports/expensesbycategory",
            {"from_date": from_date, "to_date": to_date},
        )

    # ── Organization ──────────────────────────────────────────────────
    async def get_organization(self) -> dict:
        return await self.get("/organizations")


_client: Optional[ZohoBooksClient] = None


def get_client() -> ZohoBooksClient:
    global _client
    if _client is None:
        _client = ZohoBooksClient()
    return _client
