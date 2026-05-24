"""
Zoho Books MCP Server
Guided workflow: analyze invoice → present options → confirm → create record.
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
    GetPromptResult,
    PromptMessage,
    TextContent,
    Tool,
)

load_dotenv()

from .document_processor import invoice_data_to_dict, process_document
from .zoho_client import get_client

app = Server("zoho-books-mcp")

# ── Helpers ────────────────────────────────────────────────────────────────────

def _ok(data: Any) -> CallToolResult:
    return CallToolResult(
        content=[TextContent(type="text", text=json.dumps(data, ensure_ascii=False, indent=2))]
    )


def _err(msg: str) -> CallToolResult:
    return CallToolResult(
        content=[TextContent(type="text", text=f"ERROR: {msg}")],
        isError=True,
    )


# ── MCP Prompts ────────────────────────────────────────────────────────────────

@app.list_prompts()
async def list_prompts():
    from mcp.types import Prompt, PromptArgument
    return [
        Prompt(
            name="subir_factura",
            description=(
                "Guía paso a paso para subir una factura o ticket como gasto "
                "o factura de proveedor en Zoho Books."
            ),
            arguments=[
                PromptArgument(
                    name="archivo",
                    description="Ruta al fichero PDF/JPG, contenido base64 o texto de la factura.",
                    required=False,
                ),
            ],
        ),
        Prompt(
            name="consultar_finanzas",
            description="Consulta rápida de gastos, facturas e informes financieros en Zoho Books.",
            arguments=[],
        ),
    ]


@app.get_prompt()
async def get_prompt(name: str, arguments: dict | None) -> GetPromptResult:
    archivo = (arguments or {}).get("archivo", "")

    if name == "subir_factura":
        intro = f'El usuario quiere subir el archivo: "{archivo}".\n\n' if archivo else ""
        instructions = f"""{intro}Eres un asistente contable que ayuda a registrar facturas en Zoho Books.
Sigue este flujo de forma natural y conversacional:

**PASO 1 — Obtener el documento**
Si el usuario no ha aportado todavía ningún documento, pídele:
> "Por favor, pega el texto de la factura, comparte la ruta al PDF/imagen, o envíame el contenido en base64."

**PASO 2 — Analizar**
En cuanto tengas el documento, llama a `prepare_invoice_wizard` con él.
Esta herramienta te devolverá los datos extraídos y todas las opciones disponibles en Zoho Books.

**PASO 3 — Presentar resumen y hacer preguntas simples**
Muestra al usuario un resumen claro:
```
He analizado la factura. Esto es lo que he encontrado:
  📄 Factura nº: [número o "no detectado"]
  🏢 Proveedor:  [nombre o "no detectado"]
  📅 Fecha:      [fecha o "no detectada"]
  💶 Total:      [importe] [moneda]
  🧾 IVA:        [porcentaje]% ([importe €])
```
Luego haz UNA SOLA PREGUNTA a la vez para los campos que falten o necesiten confirmación.
Empieza por lo más importante. Ejemplos:
- "¿Es correcto el proveedor '[nombre]'? ¿O es otro?"
- "¿Lo registro como **gasto directo** (ya pagado) o como **factura a pagar** (AP)?"
- "¿A qué categoría pertenece este gasto? Las opciones son: [lista numerada]"
- "¿Con qué cuenta se pagó? (banco, tarjeta, caja...)"

**PASO 4 — Confirmar antes de crear**
Antes de crear el registro, muestra un resumen final:
```
Voy a crear el siguiente registro en Zoho Books:
  Tipo:       Gasto / Factura de proveedor
  Proveedor:  ...
  Categoría:  ...
  Importe:    ...
  Fecha:      ...
  Cuenta pago: ...
¿Confirmas? (sí / no / corregir X)
```

**PASO 5 — Crear**
Usa `confirm_and_register` para crear el registro y adjuntar el documento.

Reglas:
- Sé conciso. Una pregunta cada vez.
- Usa emojis moderadamente para que sea amigable.
- Si el usuario dice "sí" o "ok", procede directamente.
- Si el usuario corrige algo, actualiza y muestra el resumen de nuevo.
"""
        return GetPromptResult(
            description="Flujo guiado para registrar una factura en Zoho Books",
            messages=[PromptMessage(role="user", content=TextContent(type="text", text=instructions))],
        )

    elif name == "consultar_finanzas":
        instructions = """Eres un asistente financiero con acceso a Zoho Books.
Ayuda al usuario a consultar su información financiera de forma natural.

Puedes:
- Listar gastos recientes: `get_expenses`
- Listar facturas de proveedor: `get_bills`
- Ver el detalle de un gasto o factura: `get_expense_detail` / `get_bill_detail`
- Informe de Pérdidas y Ganancias: `get_profit_loss_report`
- Gastos por categoría: `get_expense_by_category_report`
- Ver proveedores: `list_vendors`
- Ver cuentas contables: `list_expense_accounts`

Cuando el usuario pregunte por periodos ("este mes", "este trimestre", "este año"),
calcula las fechas from_date y to_date automáticamente a partir de la fecha de hoy.

Responde de forma clara y estructurada, usando tablas o listas cuando haya varios elementos.
"""
        return GetPromptResult(
            description="Consulta de datos financieros en Zoho Books",
            messages=[PromptMessage(role="user", content=TextContent(type="text", text=instructions))],
        )

    raise ValueError(f"Prompt desconocido: {name}")


# ── Tool list ──────────────────────────────────────────────────────────────────

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        # ── FLUJO GUIADO ───────────────────────────────────────────────────────
        Tool(
            name="prepare_invoice_wizard",
            description=(
                "PASO 1 del flujo guiado. Analiza el documento (PDF/JPG/texto), extrae todos los "
                "datos de la factura y en la misma llamada carga las cuentas de gasto, "
                "proveedores relevantes e impuestos de Zoho Books. Devuelve todo lo necesario "
                "para presentar al usuario un resumen y hacerle las preguntas que falten."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Ruta absoluta al fichero PDF, JPG o PNG.",
                    },
                    "base64_content": {
                        "type": "string",
                        "description": "Contenido del fichero en Base64.",
                    },
                    "file_type": {
                        "type": "string",
                        "enum": ["pdf", "jpg", "jpeg", "png", "txt"],
                        "description": "Tipo de fichero (necesario con base64_content).",
                    },
                    "text_content": {
                        "type": "string",
                        "description": "Texto plano de la factura.",
                    },
                },
            },
        ),
        Tool(
            name="confirm_and_register",
            description=(
                "PASO 2 del flujo guiado. Crea el registro definitivo en Zoho Books "
                "(gasto o factura de proveedor) con los datos confirmados por el usuario "
                "y adjunta el documento original."
            ),
            inputSchema={
                "type": "object",
                "required": ["record_type", "account_id", "amount", "date"],
                "properties": {
                    "record_type": {
                        "type": "string",
                        "enum": ["expense", "vendor_bill"],
                        "description": "'expense' para gasto ya pagado, 'vendor_bill' para factura a pagar (AP).",
                    },
                    "account_id": {
                        "type": "string",
                        "description": "ID de la cuenta contable de gasto.",
                    },
                    "amount": {
                        "type": "number",
                        "description": "Importe total (con IVA).",
                    },
                    "date": {
                        "type": "string",
                        "description": "Fecha en formato YYYY-MM-DD.",
                    },
                    "vendor_id": {
                        "type": "string",
                        "description": "ID del proveedor (si ya existe en Zoho).",
                    },
                    "vendor_name": {
                        "type": "string",
                        "description": "Nombre del proveedor (si no existe, se creará).",
                    },
                    "paid_through_account_id": {
                        "type": "string",
                        "description": "Cuenta de pago (solo para gastos).",
                    },
                    "tax_id": {
                        "type": "string",
                        "description": "ID del impuesto aplicado.",
                    },
                    "tax_amount": {
                        "type": "number",
                        "description": "Importe del IVA.",
                    },
                    "reference_number": {
                        "type": "string",
                        "description": "Número de factura / referencia.",
                    },
                    "description": {
                        "type": "string",
                        "description": "Descripción del gasto.",
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Fecha de vencimiento YYYY-MM-DD (solo vendor_bill).",
                    },
                    "currency_code": {
                        "type": "string",
                        "description": "Código ISO de moneda (EUR, USD…).",
                    },
                    "is_billable": {
                        "type": "boolean",
                        "description": "Si el gasto es facturable a un cliente.",
                        "default": False,
                    },
                    "attachment_file_path": {
                        "type": "string",
                        "description": "Ruta al fichero original para adjuntar.",
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

        # ── CONSULTAS ──────────────────────────────────────────────────────────
        Tool(
            name="list_expense_accounts",
            description="Devuelve las cuentas de gasto del plan contable de Zoho Books.",
            inputSchema={"type": "object", "properties": {}},
        ),
        Tool(
            name="list_vendors",
            description="Lista proveedores de Zoho Books con búsqueda opcional por nombre.",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Texto para filtrar por nombre."},
                },
            },
        ),
        Tool(
            name="list_taxes",
            description="Devuelve los tipos de IVA / impuestos configurados en Zoho Books.",
            inputSchema={"type": "object", "properties": {}},
        ),
        Tool(
            name="get_expenses",
            description="Lista los gastos registrados con filtros opcionales de fecha, cuenta o estado.",
            inputSchema={
                "type": "object",
                "properties": {
                    "from_date": {"type": "string", "description": "Fecha inicio YYYY-MM-DD."},
                    "to_date": {"type": "string", "description": "Fecha fin YYYY-MM-DD."},
                    "account_id": {"type": "string"},
                    "vendor_id": {"type": "string"},
                    "status": {
                        "type": "string",
                        "enum": ["unbilled", "invoiced", "reimbursed", "non-billable"],
                    },
                },
            },
        ),
        Tool(
            name="get_bills",
            description="Lista las facturas de proveedor con filtros opcionales.",
            inputSchema={
                "type": "object",
                "properties": {
                    "from_date": {"type": "string"},
                    "to_date": {"type": "string"},
                    "vendor_id": {"type": "string"},
                    "status": {
                        "type": "string",
                        "enum": ["draft", "open", "overdue", "paid", "void"],
                    },
                },
            },
        ),
        Tool(
            name="get_expense_detail",
            description="Devuelve el detalle completo de un gasto.",
            inputSchema={
                "type": "object",
                "required": ["expense_id"],
                "properties": {"expense_id": {"type": "string"}},
            },
        ),
        Tool(
            name="get_bill_detail",
            description="Devuelve el detalle completo de una factura de proveedor.",
            inputSchema={
                "type": "object",
                "required": ["bill_id"],
                "properties": {"bill_id": {"type": "string"}},
            },
        ),
        Tool(
            name="get_profit_loss_report",
            description="Informe de Pérdidas y Ganancias de un periodo.",
            inputSchema={
                "type": "object",
                "required": ["from_date", "to_date"],
                "properties": {
                    "from_date": {"type": "string"},
                    "to_date": {"type": "string"},
                },
            },
        ),
        Tool(
            name="get_expense_by_category_report",
            description="Desglose de gastos por categoría contable en un periodo.",
            inputSchema={
                "type": "object",
                "required": ["from_date", "to_date"],
                "properties": {
                    "from_date": {"type": "string"},
                    "to_date": {"type": "string"},
                },
            },
        ),
        Tool(
            name="get_organization_info",
            description="Información general de la organización en Zoho Books.",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]


# ── Tool handlers ──────────────────────────────────────────────────────────────

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> CallToolResult:
    client = get_client()

    try:
        if name == "prepare_invoice_wizard":
            return await _prepare_wizard(client, arguments)

        elif name == "confirm_and_register":
            return await _confirm_and_register(client, arguments)

        elif name == "list_expense_accounts":
            data = await client.list_accounts(account_type="expense")
            accounts = [
                {
                    "account_id": a["account_id"],
                    "account_name": a["account_name"],
                    "account_code": a.get("account_code", ""),
                }
                for a in data.get("chartofaccounts", [])
            ]
            return _ok({"expense_accounts": accounts, "count": len(accounts)})

        elif name == "list_vendors":
            data = await client.list_contacts(
                contact_type="vendor", search=arguments.get("search")
            )
            vendors = [
                {
                    "vendor_id": v["contact_id"],
                    "vendor_name": v["contact_name"],
                    "email": v.get("email", ""),
                }
                for v in data.get("contacts", [])
            ]
            return _ok({"vendors": vendors, "count": len(vendors)})

        elif name == "list_taxes":
            data = await client.list_taxes()
            taxes = [
                {
                    "tax_id": t["tax_id"],
                    "tax_name": t["tax_name"],
                    "tax_percentage": t.get("tax_percentage", 0),
                }
                for t in data.get("taxes", [])
            ]
            return _ok({"taxes": taxes})

        elif name == "get_expenses":
            filters = {k: v for k, v in arguments.items() if v is not None}
            return _ok(await client.list_expenses(filters))

        elif name == "get_bills":
            filters = {k: v for k, v in arguments.items() if v is not None}
            return _ok(await client.list_bills(filters))

        elif name == "get_expense_detail":
            return _ok(await client.get_expense(arguments["expense_id"]))

        elif name == "get_bill_detail":
            return _ok(await client.get_bill(arguments["bill_id"]))

        elif name == "get_profit_loss_report":
            return _ok(await client.get_profit_loss(arguments["from_date"], arguments["to_date"]))

        elif name == "get_expense_by_category_report":
            return _ok(await client.get_expense_by_category(arguments["from_date"], arguments["to_date"]))

        elif name == "get_organization_info":
            return _ok(await client.get_organization())

        else:
            return _err(f"Tool desconocido: {name}")

    except Exception as exc:
        return _err(str(exc))


# ── Wizard logic ───────────────────────────────────────────────────────────────

async def _prepare_wizard(client, args: dict) -> CallToolResult:
    """Analyze document + load Zoho options in one single call."""
    # 1. Extract invoice data from document
    try:
        inv = process_document(
            file_path=args.get("file_path"),
            base64_content=args.get("base64_content"),
            file_type=args.get("file_type"),
            text_content=args.get("text_content"),
        )
        extracted = invoice_data_to_dict(inv)
        raw_preview = inv.raw_text[:600] if inv.raw_text else ""
    except Exception as exc:
        extracted = {}
        raw_preview = f"[Error al analizar el documento: {exc}]"

    # 2. Load Zoho Books options concurrently
    import asyncio
    accounts_task = client.list_accounts(account_type="expense")
    taxes_task = client.list_taxes()
    vendors_task = client.list_contacts(
        contact_type="vendor",
        search=extracted.get("vendor_name") or "",
    )
    accounts_data, taxes_data, vendors_data = await asyncio.gather(
        accounts_task, taxes_task, vendors_task, return_exceptions=True
    )

    accounts = []
    if not isinstance(accounts_data, Exception):
        accounts = [
            {"account_id": a["account_id"], "account_name": a["account_name"]}
            for a in accounts_data.get("chartofaccounts", [])
        ]

    taxes = []
    if not isinstance(taxes_data, Exception):
        taxes = [
            {
                "tax_id": t["tax_id"],
                "tax_name": t["tax_name"],
                "tax_percentage": t.get("tax_percentage", 0),
            }
            for t in taxes_data.get("taxes", [])
        ]

    vendors = []
    if not isinstance(vendors_data, Exception):
        vendors = [
            {"vendor_id": v["contact_id"], "vendor_name": v["contact_name"]}
            for v in vendors_data.get("contacts", [])[:10]  # top 10 matches
        ]

    # 3. Build list of missing/uncertain fields so Claude knows what to ask
    missing = []
    if not extracted.get("vendor_name"):
        missing.append("vendor_name — nombre del proveedor")
    if not extracted.get("total"):
        missing.append("amount — importe total")
    if not extracted.get("invoice_date"):
        missing.append("date — fecha de la factura")
    if extracted.get("tax_rate") is None:
        missing.append("tax_rate — tipo de IVA aplicado")

    return _ok({
        "extracted_invoice": extracted,
        "raw_text_preview": raw_preview,
        "missing_fields": missing,
        "zoho_options": {
            "expense_accounts": accounts,
            "taxes": taxes,
            "matching_vendors": vendors,
        },
        "next_step": (
            "Presenta el resumen al usuario, confirma o pregunta los campos en missing_fields, "
            "pide la categoría de gasto (expense_accounts) y si ya está pagado (expense) "
            "o es una factura a pagar (vendor_bill). Luego llama a confirm_and_register."
        ),
    })


async def _confirm_and_register(client, args: dict) -> CallToolResult:
    """Create the final record in Zoho Books with the confirmed data."""
    # Resolve or create vendor
    vendor_id = args.get("vendor_id")
    if not vendor_id and args.get("vendor_name"):
        vendor_id = await _resolve_or_create_vendor(client, args["vendor_name"])

    # Read attachment if any
    file_bytes, filename, content_type = await _read_attachment(
        args, "attachment_file_path", "attachment_base64", "attachment_filename"
    )

    record_type = args["record_type"]

    if record_type == "expense":
        expense_data: dict[str, Any] = {
            "account_id": args["account_id"],
            "date": args["date"],
            "amount": args["amount"],
            "is_billable": args.get("is_billable", False),
        }
        if vendor_id:
            expense_data["vendor_id"] = vendor_id
        if args.get("paid_through_account_id"):
            expense_data["paid_through_account_id"] = args["paid_through_account_id"]
        if args.get("tax_id"):
            expense_data["tax_id"] = args["tax_id"]
        if args.get("tax_amount"):
            expense_data["tax_amount"] = args["tax_amount"]
        if args.get("reference_number"):
            expense_data["reference_number"] = args["reference_number"]
        if args.get("description"):
            expense_data["description"] = args["description"]
        if args.get("currency_code"):
            expense_data["currency_id"] = args["currency_code"]

        resp = await client.create_expense(expense_data)
        record = resp.get("expense", {})
        record_id = record.get("expense_id")

        if record_id and file_bytes:
            await client.attach_receipt_to_expense(record_id, file_bytes, filename, content_type)

        return _ok({
            "status": "✅ Gasto registrado correctamente",
            "record_type": "expense",
            "expense_id": record_id,
            "amount": record.get("total", args["amount"]),
            "date": record.get("date", args["date"]),
            "vendor": record.get("vendor_name", args.get("vendor_name", "")),
            "account": record.get("account_name", ""),
            "document_attached": file_bytes is not None,
        })

    elif record_type == "vendor_bill":
        if not vendor_id:
            return _err("Se necesita proveedor para crear una factura de proveedor.")

        line_items = []
        # Build single line item from top-level fields
        line: dict[str, Any] = {
            "account_id": args["account_id"],
            "description": args.get("description", ""),
            "quantity": 1,
            "rate": args["amount"],  # net amount; Zoho calculates tax on top
        }
        if args.get("tax_id"):
            line["tax_id"] = args["tax_id"]
        line_items.append(line)

        bill_data: dict[str, Any] = {
            "vendor_id": vendor_id,
            "date": args["date"],
            "bill_number": args.get("reference_number", ""),
            "due_date": args.get("due_date", ""),
            "line_items": line_items,
        }
        if args.get("notes") or args.get("description"):
            bill_data["notes"] = args.get("notes") or args.get("description", "")
        if args.get("currency_code"):
            bill_data["currency_code"] = args["currency_code"]

        resp = await client.create_bill(bill_data)
        record = resp.get("bill", {})
        bill_id = record.get("bill_id")

        if bill_id and file_bytes:
            await client.attach_document_to_bill(bill_id, file_bytes, filename, content_type)

        return _ok({
            "status": "✅ Factura de proveedor registrada correctamente",
            "record_type": "vendor_bill",
            "bill_id": bill_id,
            "bill_number": record.get("bill_number", args.get("reference_number", "")),
            "total": record.get("total", args["amount"]),
            "vendor": record.get("vendor_name", ""),
            "status_zoho": record.get("status", ""),
            "document_attached": file_bytes is not None,
        })

    return _err(f"record_type desconocido: {record_type}")


# ── Shared helpers ─────────────────────────────────────────────────────────────

async def _resolve_or_create_vendor(client, name: str) -> Optional[str]:
    data = await client.list_contacts(contact_type="vendor", search=name)
    contacts = data.get("contacts", [])
    for c in contacts:
        if c["contact_name"].lower() == name.lower():
            return c["contact_id"]
    if contacts:
        return contacts[0]["contact_id"]
    resp = await client.create_contact({"contact_name": name, "contact_type": "vendor"})
    return resp.get("contact", {}).get("contact_id")


async def _read_attachment(args: dict, path_key: str, b64_key: str, name_key: str):
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


# ── Entry point ────────────────────────────────────────────────────────────────

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
