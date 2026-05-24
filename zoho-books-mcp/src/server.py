"""
Zoho Books MCP Server
Exposes tools to upload invoices (PDF/JPG/text) as expenses or vendor bills
and to query financial data from Zoho Books.
"""

from __future__ import annotations

import json
import os
from typing import Any, Optional

from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolResult,
    TextContent,
    Tool,
)

load_dotenv()

from .document_processor import invoice_data_to_dict, process_document
from .zoho_client import get_client

app = Server("zoho-books-mcp")

# ── Helper ─────────────────────────────────────────────────────────────────────

def _ok(data: Any) -> CallToolResult:
    return CallToolResult(
        content=[TextContent(type="text", text=json.dumps(data, ensure_ascii=False, indent=2))]
    )


def _err(msg: str) -> CallToolResult:
    return CallToolResult(
        content=[TextContent(type="text", text=f"ERROR: {msg}")],
        isError=True,
    )


# ── Tool definitions ───────────────────────────────────────────────────────────

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="analyze_invoice_document",
            description=(
                "Extrae y estructura los datos de una factura o ticket en PDF, imagen (JPG/PNG) "
                "o texto plano. Devuelve proveedor, número de factura, fecha, importes, IVA, etc. "
                "Úsalo antes de crear el gasto o factura de proveedor para pre-rellenar los campos."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Ruta absoluta al fichero PDF, JPG o PNG en el sistema local.",
                    },
                    "base64_content": {
                        "type": "string",
                        "description": "Contenido del fichero codificado en Base64.",
                    },
                    "file_type": {
                        "type": "string",
                        "enum": ["pdf", "jpg", "jpeg", "png", "txt"],
                        "description": "Tipo de fichero (necesario si se usa base64_content).",
                    },
                    "text_content": {
                        "type": "string",
                        "description": "Texto de la factura si ya lo tienes en formato plano.",
                    },
                },
            },
        ),
        Tool(
            name="list_expense_accounts",
            description=(
                "Devuelve las cuentas de gasto disponibles en el plan contable de Zoho Books. "
                "Úsalo para mostrarle al usuario las categorías de gasto existentes antes de crear "
                "un gasto, para que elija la más adecuada."
            ),
            inputSchema={"type": "object", "properties": {}},
        ),
        Tool(
            name="list_vendors",
            description=(
                "Devuelve la lista de proveedores registrados en Zoho Books. "
                "Acepta un texto de búsqueda opcional para filtrar por nombre."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {
                        "type": "string",
                        "description": "Texto para buscar proveedores por nombre.",
                    }
                },
            },
        ),
        Tool(
            name="list_taxes",
            description="Devuelve los tipos de IVA / impuestos configurados en Zoho Books.",
            inputSchema={"type": "object", "properties": {}},
        ),
        Tool(
            name="create_expense",
            description=(
                "Crea un gasto en Zoho Books. Puede adjuntar el documento original (recibo o factura). "
                "Si el proveedor no existe se creará automáticamente. "
                "Campos mínimos: account_id, amount, date."
            ),
            inputSchema={
                "type": "object",
                "required": ["account_id", "amount", "date"],
                "properties": {
                    "account_id": {
                        "type": "string",
                        "description": "ID de la cuenta contable de gasto (de list_expense_accounts).",
                    },
                    "amount": {
                        "type": "number",
                        "description": "Importe total del gasto (con IVA si aplica).",
                    },
                    "date": {
                        "type": "string",
                        "description": "Fecha del gasto en formato YYYY-MM-DD.",
                    },
                    "paid_through_account_id": {
                        "type": "string",
                        "description": "ID de la cuenta por la que se pagó (banco, caja, tarjeta…).",
                    },
                    "vendor_id": {
                        "type": "string",
                        "description": "ID del proveedor (de list_vendors). Opcional.",
                    },
                    "vendor_name": {
                        "type": "string",
                        "description": "Nombre del proveedor si no existe en Zoho (se creará).",
                    },
                    "tax_id": {
                        "type": "string",
                        "description": "ID del impuesto aplicado (de list_taxes).",
                    },
                    "tax_amount": {
                        "type": "number",
                        "description": "Importe del IVA / impuesto.",
                    },
                    "currency_id": {
                        "type": "string",
                        "description": "Código ISO de moneda (EUR, USD…). Por defecto usa la configurada.",
                    },
                    "reference_number": {
                        "type": "string",
                        "description": "Número de factura / referencia del gasto.",
                    },
                    "description": {
                        "type": "string",
                        "description": "Descripción o notas del gasto.",
                    },
                    "is_billable": {
                        "type": "boolean",
                        "description": "Si el gasto es facturable a un cliente.",
                        "default": False,
                    },
                    "customer_id": {
                        "type": "string",
                        "description": "ID del cliente al que se facturará (solo si is_billable=true).",
                    },
                    "attachment_file_path": {
                        "type": "string",
                        "description": "Ruta al fichero adjunto (recibo/factura) para subir junto al gasto.",
                    },
                    "attachment_base64": {
                        "type": "string",
                        "description": "Contenido del adjunto en Base64.",
                    },
                    "attachment_filename": {
                        "type": "string",
                        "description": "Nombre del fichero adjunto (necesario si se usa attachment_base64).",
                    },
                },
            },
        ),
        Tool(
            name="create_vendor_bill",
            description=(
                "Crea una factura de proveedor (vendor bill) en Zoho Books. "
                "A diferencia de un gasto, una factura de proveedor crea una cuenta a pagar (AP). "
                "Requiere al menos un proveedor y una línea de detalle."
            ),
            inputSchema={
                "type": "object",
                "required": ["vendor_id", "bill_date", "line_items"],
                "properties": {
                    "vendor_id": {
                        "type": "string",
                        "description": "ID del proveedor (de list_vendors).",
                    },
                    "vendor_name": {
                        "type": "string",
                        "description": "Nombre del proveedor si no existe (se creará).",
                    },
                    "bill_number": {
                        "type": "string",
                        "description": "Número de la factura del proveedor.",
                    },
                    "bill_date": {
                        "type": "string",
                        "description": "Fecha de la factura YYYY-MM-DD.",
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Fecha de vencimiento YYYY-MM-DD.",
                    },
                    "currency_code": {
                        "type": "string",
                        "description": "Código ISO de moneda (EUR, USD…).",
                    },
                    "line_items": {
                        "type": "array",
                        "description": "Líneas de la factura.",
                        "items": {
                            "type": "object",
                            "required": ["account_id", "rate"],
                            "properties": {
                                "account_id": {"type": "string", "description": "ID cuenta de gasto."},
                                "description": {"type": "string"},
                                "quantity": {"type": "number", "default": 1},
                                "rate": {"type": "number", "description": "Precio unitario sin IVA."},
                                "tax_id": {"type": "string", "description": "ID del impuesto."},
                            },
                        },
                    },
                    "notes": {
                        "type": "string",
                        "description": "Notas / observaciones.",
                    },
                    "attachment_file_path": {
                        "type": "string",
                        "description": "Ruta al fichero PDF/JPG a adjuntar.",
                    },
                    "attachment_base64": {
                        "type": "string",
                        "description": "Contenido del adjunto en Base64.",
                    },
                    "attachment_filename": {
                        "type": "string",
                        "description": "Nombre del fichero adjunto.",
                    },
                },
            },
        ),
        Tool(
            name="get_expenses",
            description="Lista los gastos registrados en Zoho Books con filtros opcionales.",
            inputSchema={
                "type": "object",
                "properties": {
                    "from_date": {"type": "string", "description": "Fecha inicio YYYY-MM-DD."},
                    "to_date": {"type": "string", "description": "Fecha fin YYYY-MM-DD."},
                    "account_id": {"type": "string", "description": "Filtrar por cuenta de gasto."},
                    "vendor_id": {"type": "string", "description": "Filtrar por proveedor."},
                    "status": {
                        "type": "string",
                        "enum": ["unbilled", "invoiced", "reimbursed", "non-billable"],
                        "description": "Estado del gasto.",
                    },
                },
            },
        ),
        Tool(
            name="get_bills",
            description="Lista las facturas de proveedor en Zoho Books con filtros opcionales.",
            inputSchema={
                "type": "object",
                "properties": {
                    "from_date": {"type": "string", "description": "Fecha inicio YYYY-MM-DD."},
                    "to_date": {"type": "string", "description": "Fecha fin YYYY-MM-DD."},
                    "vendor_id": {"type": "string", "description": "Filtrar por proveedor."},
                    "status": {
                        "type": "string",
                        "enum": ["draft", "open", "overdue", "paid", "void"],
                        "description": "Estado de la factura.",
                    },
                },
            },
        ),
        Tool(
            name="get_expense_detail",
            description="Devuelve el detalle completo de un gasto por su ID.",
            inputSchema={
                "type": "object",
                "required": ["expense_id"],
                "properties": {
                    "expense_id": {"type": "string", "description": "ID del gasto en Zoho Books."},
                },
            },
        ),
        Tool(
            name="get_bill_detail",
            description="Devuelve el detalle completo de una factura de proveedor por su ID.",
            inputSchema={
                "type": "object",
                "required": ["bill_id"],
                "properties": {
                    "bill_id": {"type": "string", "description": "ID de la factura en Zoho Books."},
                },
            },
        ),
        Tool(
            name="get_profit_loss_report",
            description="Obtiene el informe de Pérdidas y Ganancias de un periodo.",
            inputSchema={
                "type": "object",
                "required": ["from_date", "to_date"],
                "properties": {
                    "from_date": {"type": "string", "description": "Fecha inicio YYYY-MM-DD."},
                    "to_date": {"type": "string", "description": "Fecha fin YYYY-MM-DD."},
                },
            },
        ),
        Tool(
            name="get_expense_by_category_report",
            description="Obtiene un desglose de gastos por categoría contable en un periodo.",
            inputSchema={
                "type": "object",
                "required": ["from_date", "to_date"],
                "properties": {
                    "from_date": {"type": "string", "description": "Fecha inicio YYYY-MM-DD."},
                    "to_date": {"type": "string", "description": "Fecha fin YYYY-MM-DD."},
                },
            },
        ),
        Tool(
            name="get_organization_info",
            description="Devuelve la información general de la organización en Zoho Books.",
            inputSchema={"type": "object", "properties": {}},
        ),
        Tool(
            name="create_vendor_if_missing",
            description=(
                "Busca un proveedor por nombre en Zoho Books y lo crea si no existe. "
                "Devuelve el vendor_id para usar en create_expense o create_vendor_bill."
            ),
            inputSchema={
                "type": "object",
                "required": ["vendor_name"],
                "properties": {
                    "vendor_name": {"type": "string", "description": "Nombre del proveedor."},
                    "vendor_email": {"type": "string", "description": "Email del proveedor."},
                    "vendor_nif": {"type": "string", "description": "CIF / NIF / VAT del proveedor."},
                    "vendor_phone": {"type": "string"},
                    "vendor_address": {"type": "string"},
                },
            },
        ),
    ]


# ── Tool handlers ──────────────────────────────────────────────────────────────

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> CallToolResult:
    client = get_client()

    try:
        if name == "analyze_invoice_document":
            return await _analyze_invoice(arguments)

        elif name == "list_expense_accounts":
            data = await client.list_accounts(account_type="expense")
            accounts = data.get("chartofaccounts", [])
            result = [
                {"account_id": a["account_id"], "account_name": a["account_name"],
                 "account_code": a.get("account_code", ""), "account_type": a.get("account_type", "")}
                for a in accounts
            ]
            return _ok({"expense_accounts": result, "count": len(result)})

        elif name == "list_vendors":
            search = arguments.get("search")
            data = await client.list_contacts(contact_type="vendor", search=search)
            vendors = data.get("contacts", [])
            result = [
                {"vendor_id": v["contact_id"], "vendor_name": v["contact_name"],
                 "email": v.get("email", ""), "phone": v.get("phone", ""),
                 "outstanding_payable_amount": v.get("outstanding_payable_amount", 0)}
                for v in vendors
            ]
            return _ok({"vendors": result, "count": len(result)})

        elif name == "list_taxes":
            data = await client.list_taxes()
            taxes = data.get("taxes", [])
            result = [
                {"tax_id": t["tax_id"], "tax_name": t["tax_name"],
                 "tax_percentage": t.get("tax_percentage", 0), "tax_type": t.get("tax_type", "")}
                for t in taxes
            ]
            return _ok({"taxes": result})

        elif name == "create_expense":
            return await _create_expense(client, arguments)

        elif name == "create_vendor_bill":
            return await _create_vendor_bill(client, arguments)

        elif name == "get_expenses":
            filters = {k: v for k, v in arguments.items() if v is not None}
            data = await client.list_expenses(filters)
            return _ok(data)

        elif name == "get_bills":
            filters = {k: v for k, v in arguments.items() if v is not None}
            data = await client.list_bills(filters)
            return _ok(data)

        elif name == "get_expense_detail":
            data = await client.get_expense(arguments["expense_id"])
            return _ok(data)

        elif name == "get_bill_detail":
            data = await client.get_bill(arguments["bill_id"])
            return _ok(data)

        elif name == "get_profit_loss_report":
            data = await client.get_profit_loss(arguments["from_date"], arguments["to_date"])
            return _ok(data)

        elif name == "get_expense_by_category_report":
            data = await client.get_expense_by_category(arguments["from_date"], arguments["to_date"])
            return _ok(data)

        elif name == "get_organization_info":
            data = await client.get_organization()
            return _ok(data)

        elif name == "create_vendor_if_missing":
            return await _create_vendor_if_missing(client, arguments)

        else:
            return _err(f"Tool desconocido: {name}")

    except Exception as exc:
        return _err(str(exc))


# ── Business logic helpers ─────────────────────────────────────────────────────

async def _analyze_invoice(args: dict) -> CallToolResult:
    try:
        data = process_document(
            file_path=args.get("file_path"),
            base64_content=args.get("base64_content"),
            file_type=args.get("file_type"),
            text_content=args.get("text_content"),
        )
    except Exception as exc:
        return _err(f"Error procesando documento: {exc}")

    result = invoice_data_to_dict(data)
    result["raw_text_preview"] = data.raw_text[:800] if data.raw_text else ""

    suggestions = []
    if not result["vendor_name"]:
        suggestions.append("No se detectó el nombre del proveedor — indícamelo manualmente.")
    if not result["total"]:
        suggestions.append("No se detectó el importe total — indícamelo manualmente.")
    if not result["invoice_date"]:
        suggestions.append("No se detectó la fecha — indícamela en formato YYYY-MM-DD.")
    if result["tax_rate"] is None:
        suggestions.append("No se detectó el tipo de IVA — ¿cuál aplica? (21%, 10%, 4%, 0%?)")

    result["suggestions"] = suggestions
    return _ok(result)


async def _resolve_vendor(client, args: dict) -> Optional[str]:
    """Returns vendor_id, creating the vendor if vendor_name is provided."""
    if args.get("vendor_id"):
        return args["vendor_id"]

    if args.get("vendor_name"):
        # Try to find existing vendor
        data = await client.list_contacts(contact_type="vendor", search=args["vendor_name"])
        contacts = data.get("contacts", [])
        if contacts:
            return contacts[0]["contact_id"]
        # Create new vendor
        new_vendor = await client.create_contact({
            "contact_name": args["vendor_name"],
            "contact_type": "vendor",
        })
        return new_vendor.get("contact", {}).get("contact_id")

    return None


async def _read_attachment(args: dict, path_key: str, b64_key: str, name_key: str):
    """Returns (bytes, filename, content_type) or (None, None, None)."""
    import mimetypes

    if args.get(path_key):
        from pathlib import Path
        p = Path(args[path_key])
        file_bytes = p.read_bytes()
        filename = p.name
        ct = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        return file_bytes, filename, ct

    if args.get(b64_key) and args.get(name_key):
        import base64
        file_bytes = base64.b64decode(args[b64_key])
        filename = args[name_key]
        ct = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        return file_bytes, filename, ct

    return None, None, None


async def _create_expense(client, args: dict) -> CallToolResult:
    vendor_id = await _resolve_vendor(client, args)

    expense_data: dict[str, Any] = {
        "account_id": args["account_id"],
        "paid_through_account_id": args.get("paid_through_account_id", ""),
        "date": args["date"],
        "amount": args["amount"],
        "is_billable": args.get("is_billable", False),
    }

    if vendor_id:
        expense_data["vendor_id"] = vendor_id
    if args.get("tax_id"):
        expense_data["tax_id"] = args["tax_id"]
    if args.get("tax_amount"):
        expense_data["tax_amount"] = args["tax_amount"]
    if args.get("reference_number"):
        expense_data["reference_number"] = args["reference_number"]
    if args.get("description"):
        expense_data["description"] = args["description"]
    if args.get("currency_id"):
        expense_data["currency_id"] = args["currency_id"]
    if args.get("customer_id"):
        expense_data["customer_id"] = args["customer_id"]

    response = await client.create_expense(expense_data)
    expense = response.get("expense", {})
    expense_id = expense.get("expense_id")

    # Attach document if provided
    attachment_result = None
    if expense_id:
        file_bytes, filename, ct = await _read_attachment(
            args, "attachment_file_path", "attachment_base64", "attachment_filename"
        )
        if file_bytes:
            attachment_result = await client.attach_receipt_to_expense(expense_id, file_bytes, filename, ct)

    return _ok({
        "status": "success",
        "message": f"Gasto creado correctamente en Zoho Books.",
        "expense_id": expense_id,
        "expense_number": expense.get("expense_id", ""),
        "amount": expense.get("total", args["amount"]),
        "date": expense.get("date", args["date"]),
        "vendor": expense.get("vendor_name", ""),
        "account": expense.get("account_name", ""),
        "attachment_uploaded": attachment_result is not None,
    })


async def _create_vendor_bill(client, args: dict) -> CallToolResult:
    vendor_id = await _resolve_vendor(client, args)
    if not vendor_id:
        return _err("Se requiere vendor_id o vendor_name para crear una factura de proveedor.")

    bill_data: dict[str, Any] = {
        "vendor_id": vendor_id,
        "bill_number": args.get("bill_number", ""),
        "date": args["bill_date"],
        "due_date": args.get("due_date", ""),
        "line_items": [
            {
                "account_id": li["account_id"],
                "description": li.get("description", ""),
                "quantity": li.get("quantity", 1),
                "rate": li["rate"],
                **({"tax_id": li["tax_id"]} if li.get("tax_id") else {}),
            }
            for li in args["line_items"]
        ],
    }

    if args.get("notes"):
        bill_data["notes"] = args["notes"]
    if args.get("currency_code"):
        bill_data["currency_code"] = args["currency_code"]

    response = await client.create_bill(bill_data)
    bill = response.get("bill", {})
    bill_id = bill.get("bill_id")

    # Attach document if provided
    attachment_result = None
    if bill_id:
        file_bytes, filename, ct = await _read_attachment(
            args, "attachment_file_path", "attachment_base64", "attachment_filename"
        )
        if file_bytes:
            attachment_result = await client.attach_document_to_bill(bill_id, file_bytes, filename, ct)

    return _ok({
        "status": "success",
        "message": "Factura de proveedor creada correctamente en Zoho Books.",
        "bill_id": bill_id,
        "bill_number": bill.get("bill_number", args.get("bill_number", "")),
        "total": bill.get("total", 0),
        "vendor_name": bill.get("vendor_name", ""),
        "status_zoho": bill.get("status", ""),
        "attachment_uploaded": attachment_result is not None,
    })


async def _create_vendor_if_missing(client, args: dict) -> CallToolResult:
    name = args["vendor_name"]
    data = await client.list_contacts(contact_type="vendor", search=name)
    contacts = data.get("contacts", [])

    # Exact or close match
    for c in contacts:
        if c["contact_name"].lower() == name.lower():
            return _ok({
                "action": "found",
                "vendor_id": c["contact_id"],
                "vendor_name": c["contact_name"],
            })

    # Create
    new_data: dict[str, Any] = {
        "contact_name": name,
        "contact_type": "vendor",
    }
    if args.get("vendor_email"):
        new_data["email"] = args["vendor_email"]
    if args.get("vendor_nif"):
        new_data["vat_treatment"] = "vat_registered"
        new_data["vat_reg_no"] = args["vendor_nif"]

    resp = await client.create_contact(new_data)
    contact = resp.get("contact", {})
    return _ok({
        "action": "created",
        "vendor_id": contact.get("contact_id"),
        "vendor_name": contact.get("contact_name", name),
    })


# ── Entry point ────────────────────────────────────────────────────────────────

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
