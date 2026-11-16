"""Extract structured invoice data from PDF, image, or plain text."""

from __future__ import annotations

import base64
import io
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class InvoiceData:
    """Structured data extracted from an invoice document."""
    vendor_name: Optional[str] = None
    vendor_nif: Optional[str] = None        # CIF/NIF/VAT number
    vendor_address: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None      # ISO YYYY-MM-DD when parseable
    due_date: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    tax_rate: Optional[float] = None        # percentage (21.0, 10.0…)
    total: Optional[float] = None
    currency: Optional[str] = None          # ISO code
    description: Optional[str] = None
    line_items: list[dict] = field(default_factory=list)
    raw_text: str = ""
    confidence: str = "low"                 # low | medium | high


def process_document(
    *,
    file_path: Optional[str] = None,
    base64_content: Optional[str] = None,
    file_type: Optional[str] = None,        # pdf | jpg | jpeg | png | txt
    text_content: Optional[str] = None,
) -> InvoiceData:
    """
    Main entry-point. Accepts file path, base64-encoded content, or raw text.
    Returns extracted InvoiceData (fields may be None if not found).
    """
    raw_text = ""

    if text_content:
        raw_text = text_content

    elif file_path or base64_content:
        if file_path:
            path = Path(file_path)
            ext = path.suffix.lower().lstrip(".")
            file_bytes = path.read_bytes()
        else:
            # base64
            file_bytes = base64.b64decode(base64_content)
            ext = (file_type or "").lower().lstrip(".")

        if ext == "pdf":
            raw_text = _extract_pdf(file_bytes)
        elif ext in ("jpg", "jpeg", "png", "webp", "tiff", "bmp"):
            raw_text = _extract_image(file_bytes)
        elif ext in ("txt", "text", ""):
            raw_text = file_bytes.decode("utf-8", errors="replace")
        else:
            raw_text = file_bytes.decode("utf-8", errors="replace")

    data = _parse_text(raw_text)
    data.raw_text = raw_text
    return data


# ── Extraction backends ────────────────────────────────────────────────────────

def _extract_pdf(file_bytes: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages)
    except Exception as exc:
        return f"[PDF extraction error: {exc}]"


def _extract_image(file_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(io.BytesIO(file_bytes))
        # Use Spanish + English OCR
        text = pytesseract.image_to_string(img, lang="spa+eng")
        return text
    except Exception as exc:
        return f"[Image OCR error: {exc}]"


# ── Text parser ────────────────────────────────────────────────────────────────

_MONEY_RE = re.compile(r"[\d]{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?")
_DATE_RE = re.compile(
    r"\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{2,4})\b"
    r"|\b(\d{4})[/\-\.](\d{1,2})[/\-\.](\d{1,2})\b"
)
_NIF_RE = re.compile(r"\b([A-Z]{1,2}\d{7,8}[A-Z0-9]?|\d{8}[A-Z])\b")
_INV_NUM_RE = re.compile(r"\b(?:factura|invoice|nº|no\.?|número)[:\s#]*([A-Z0-9\-/]+)\b", re.I)
_TAX_RATE_RE = re.compile(r"\bIVA\s*(\d+(?:[.,]\d+)?)\s*%", re.I)
_TOTAL_KEYWORDS = re.compile(r"\b(total|importe total|total a pagar)\b", re.I)
_SUBTOTAL_KEYWORDS = re.compile(r"\b(base imponible|subtotal|neto)\b", re.I)
_TAX_KEYWORDS = re.compile(r"\b(cuota iva|iva\s*\d+%|tax amount)\b", re.I)


def _to_float(s: str) -> Optional[float]:
    if not s:
        return None
    # normalise European format (1.234,56 → 1234.56)
    s = s.replace(" ", "").replace("\xa0", "")
    if "," in s and "." in s:
        if s.rindex(",") > s.rindex("."):
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _extract_amount_after(line: str) -> Optional[float]:
    """Find the last money-like number on a line."""
    matches = _MONEY_RE.findall(line)
    if matches:
        return _to_float(matches[-1])
    return None


def _normalise_date(m: re.Match) -> str:
    groups = m.groups()
    if groups[0]:
        d, mo, y = groups[0], groups[1], groups[2]
    else:
        y, mo, d = groups[3], groups[4], groups[5]
    if len(y) == 2:
        y = "20" + y
    return f"{y}-{int(mo):02d}-{int(d):02d}"


def _parse_text(text: str) -> InvoiceData:
    data = InvoiceData()
    lines = text.splitlines()
    found_fields = 0

    # --- Vendor name: first non-empty lines until we hit invoice/date keywords
    for line in lines[:8]:
        line = line.strip()
        if line and len(line) > 3 and not re.search(r"\d{2}[/\-\.]\d{2}", line):
            if not data.vendor_name:
                data.vendor_name = line
                break

    # --- NIF / CIF
    nif_match = _NIF_RE.search(text)
    if nif_match:
        data.vendor_nif = nif_match.group(0)
        found_fields += 1

    # --- Invoice number
    inv_match = _INV_NUM_RE.search(text)
    if inv_match:
        data.invoice_number = inv_match.group(1)
        found_fields += 1

    # --- Dates
    dates = []
    for m in _DATE_RE.finditer(text):
        try:
            dates.append(_normalise_date(m))
        except Exception:
            pass
    if dates:
        data.invoice_date = dates[0]
        if len(dates) > 1:
            data.due_date = dates[1]
        found_fields += 1

    # --- Tax rate
    tax_rate_m = _TAX_RATE_RE.search(text)
    if tax_rate_m:
        data.tax_rate = _to_float(tax_rate_m.group(1))
        found_fields += 1

    # --- Currency detection
    if "€" in text or "EUR" in text:
        data.currency = "EUR"
    elif "$" in text or "USD" in text:
        data.currency = "USD"
    elif "£" in text or "GBP" in text:
        data.currency = "GBP"

    # --- Amounts: scan line by line
    for line in lines:
        stripped = line.strip()
        if _TOTAL_KEYWORDS.search(stripped):
            amt = _extract_amount_after(stripped)
            if amt and (data.total is None or amt > data.total):
                data.total = amt
                found_fields += 1
        if _SUBTOTAL_KEYWORDS.search(stripped):
            amt = _extract_amount_after(stripped)
            if amt and data.subtotal is None:
                data.subtotal = amt
                found_fields += 1
        if _TAX_KEYWORDS.search(stripped):
            amt = _extract_amount_after(stripped)
            if amt and data.tax_amount is None:
                data.tax_amount = amt
                found_fields += 1

    # Infer subtotal from total - tax if only total known
    if data.total and data.tax_amount and data.subtotal is None:
        data.subtotal = round(data.total - data.tax_amount, 2)
    if data.total and data.subtotal and data.tax_amount is None:
        data.tax_amount = round(data.total - data.subtotal, 2)
    if data.total and data.tax_rate and data.subtotal is None:
        data.subtotal = round(data.total / (1 + data.tax_rate / 100), 2)
        data.tax_amount = round(data.total - data.subtotal, 2)

    # --- Confidence
    if found_fields >= 4:
        data.confidence = "high"
    elif found_fields >= 2:
        data.confidence = "medium"
    else:
        data.confidence = "low"

    return data


def invoice_data_to_dict(d: InvoiceData) -> dict:
    return {
        "vendor_name": d.vendor_name,
        "vendor_nif": d.vendor_nif,
        "vendor_address": d.vendor_address,
        "invoice_number": d.invoice_number,
        "invoice_date": d.invoice_date,
        "due_date": d.due_date,
        "subtotal": d.subtotal,
        "tax_amount": d.tax_amount,
        "tax_rate": d.tax_rate,
        "total": d.total,
        "currency": d.currency,
        "description": d.description,
        "line_items": d.line_items,
        "confidence": d.confidence,
    }
