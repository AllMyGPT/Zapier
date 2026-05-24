"""
Utility script to obtain a Zoho OAuth2 refresh token via browser flow.

Usage:
  1. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in your .env file.
  2. Run: python get_token.py
  3. Open the URL shown in the browser, authorize the app.
  4. Paste the authorization code when prompted.
  5. Copy the refresh_token into your .env as ZOHO_REFRESH_TOKEN.
"""

import os
import sys
import urllib.parse
import httpx
from dotenv import load_dotenv

load_dotenv()

REGION_ACCOUNTS = {
    "com": "https://accounts.zoho.com",
    "eu":  "https://accounts.zoho.eu",
    "in":  "https://accounts.zoho.in",
    "au":  "https://accounts.zoho.com.au",
    "jp":  "https://accounts.zoho.jp",
}

# Scopes needed by the MCP server
SCOPES = [
    "ZohoBooks.expenses.CREATE",
    "ZohoBooks.expenses.READ",
    "ZohoBooks.expenses.UPDATE",
    "ZohoBooks.bills.CREATE",
    "ZohoBooks.bills.READ",
    "ZohoBooks.bills.UPDATE",
    "ZohoBooks.contacts.CREATE",
    "ZohoBooks.contacts.READ",
    "ZohoBooks.accountants.READ",
    "ZohoBooks.reports.READ",
    "ZohoBooks.settings.READ",
]


def main():
    client_id = os.environ.get("ZOHO_CLIENT_ID")
    client_secret = os.environ.get("ZOHO_CLIENT_SECRET")
    region = os.environ.get("ZOHO_REGION", "eu")

    if not client_id or not client_secret:
        print("ERROR: Falta ZOHO_CLIENT_ID o ZOHO_CLIENT_SECRET en .env")
        sys.exit(1)

    accounts_url = REGION_ACCOUNTS.get(region, REGION_ACCOUNTS["eu"])
    redirect_uri = "https://www.zoho.com/books"  # Use the one registered in Zoho API Console

    params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": ",".join(SCOPES),
        "redirect_uri": redirect_uri,
        "access_type": "offline",
        "prompt": "consent",
    }
    auth_url = f"{accounts_url}/oauth/v2/auth?" + urllib.parse.urlencode(params)

    print("\n=== Autorización Zoho Books ===")
    print(f"\n1. Abre este enlace en tu navegador:\n\n   {auth_url}\n")
    print("2. Inicia sesión y autoriza la aplicación.")
    print("3. Serás redirigido a una URL como:")
    print("   https://www.zoho.com/books?code=XXXXXXX&location=eu&...\n")

    code = input("4. Pega aquí el valor de 'code' de la URL de redirección: ").strip()

    if not code:
        print("ERROR: No se introdujo ningún código.")
        sys.exit(1)

    token_url = f"{accounts_url}/oauth/v2/token"
    resp = httpx.post(token_url, params={
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    })

    data = resp.json()
    if "refresh_token" not in data:
        print(f"\nERROR obteniendo token: {data}")
        sys.exit(1)

    print("\n=== ¡Éxito! ===")
    print(f"refresh_token  = {data['refresh_token']}")
    print(f"access_token   = {data.get('access_token', 'n/a')}")
    print(f"\nCopia el refresh_token en tu .env como ZOHO_REFRESH_TOKEN.")


if __name__ == "__main__":
    main()
