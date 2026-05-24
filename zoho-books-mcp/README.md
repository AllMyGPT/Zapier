# Zoho Books MCP Server

Servidor MCP (Model Context Protocol) que conecta Claude con Zoho Books para:

- **Subir facturas** en PDF, JPG o texto y registrarlas automáticamente como gasto o factura de proveedor.
- **Preguntar al usuario** las categorías, proveedor e impuestos antes de crear el registro.
- **Adjuntar el documento original** al registro en Zoho Books.
- **Consultar información** de gastos, facturas, informes y cuentas.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Python | 3.11+ |
| tesseract-ocr | 5.x (para OCR de imágenes) |
| Cuenta Zoho Books | Con API habilitada |

### Instalar Tesseract (Ubuntu/Debian)

```bash
sudo apt-get install tesseract-ocr tesseract-ocr-spa
```

### Instalar Tesseract (macOS)

```bash
brew install tesseract
```

---

## Instalación

```bash
git clone <repo>
cd zoho-books-mcp
pip install -r requirements.txt
```

---

## Configuración OAuth2 en Zoho

### 1. Crear la aplicación en Zoho API Console

1. Ve a [api-console.zoho.com](https://api-console.zoho.com/)
2. Crea una aplicación de tipo **"Server-based Applications"**
3. En **Redirect URI** pon `https://www.zoho.com/books`
4. Anota el **Client ID** y **Client Secret**

### 2. Obtener el Refresh Token

```bash
cp .env.example .env
# Edita .env con ZOHO_CLIENT_ID y ZOHO_CLIENT_SECRET
python get_token.py
```

Sigue las instrucciones en pantalla. El script abrirá la URL de autorización, y al pegar el código te devolverá el `refresh_token`.

### 3. Completar el .env

```env
ZOHO_CLIENT_ID=tu_client_id
ZOHO_CLIENT_SECRET=tu_client_secret
ZOHO_REFRESH_TOKEN=tu_refresh_token

# ID de organización: Zoho Books → Configuración → Perfil de organización
ZOHO_ORGANIZATION_ID=tu_org_id

# eu para España y Europa
ZOHO_REGION=eu

DEFAULT_CURRENCY=EUR
```

---

## Integración con Claude Desktop

Añade esto a tu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zoho-books": {
      "command": "python",
      "args": ["/ruta/absoluta/a/zoho-books-mcp/main.py"],
      "env": {
        "ZOHO_CLIENT_ID": "tu_client_id",
        "ZOHO_CLIENT_SECRET": "tu_client_secret",
        "ZOHO_REFRESH_TOKEN": "tu_refresh_token",
        "ZOHO_ORGANIZATION_ID": "tu_org_id",
        "ZOHO_REGION": "eu",
        "DEFAULT_CURRENCY": "EUR"
      }
    }
  }
}
```

La ruta del fichero de configuración de Claude Desktop:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

---

## Integración con Claude Code (CLI)

En tu directorio de proyecto crea o edita `.claude/mcp_servers.json`:

```json
{
  "zoho-books": {
    "command": "python",
    "args": ["/ruta/absoluta/a/zoho-books-mcp/main.py"]
  }
}
```

Y el `.env` debe estar presente en el directorio `zoho-books-mcp/`.

---

## Tools disponibles

| Tool | Descripción |
|------|-------------|
| `analyze_invoice_document` | Extrae datos estructurados de PDF, imagen o texto |
| `list_expense_accounts` | Lista cuentas de gasto del plan contable |
| `list_vendors` | Lista / busca proveedores |
| `list_taxes` | Lista tipos de IVA configurados |
| `create_expense` | Crea un gasto (con adjunto opcional) |
| `create_vendor_bill` | Crea una factura de proveedor (AP) con líneas de detalle |
| `create_vendor_if_missing` | Busca o crea un proveedor por nombre |
| `get_expenses` | Lista gastos con filtros de fecha, cuenta o estado |
| `get_bills` | Lista facturas de proveedor con filtros |
| `get_expense_detail` | Detalle completo de un gasto |
| `get_bill_detail` | Detalle completo de una factura |
| `get_profit_loss_report` | Informe de Pérdidas y Ganancias |
| `get_expense_by_category_report` | Gastos por categoría en un periodo |
| `get_organization_info` | Datos de la organización |

---

## Flujo típico de uso

### Subir una factura en PDF

1. **Tú**: "Sube esta factura como gasto" (adjuntas el PDF)
2. **Claude** llama a `analyze_invoice_document` → extrae proveedor, importe, fecha, IVA
3. **Claude** llama a `list_expense_accounts` → muestra las categorías contables
4. **Claude** te pregunta: "He detectado una factura de *Telefónica* por *121,00 €* (IVA 21%). ¿La registro como *Comunicaciones* o *Servicios digitales*? ¿Se pagó con tarjeta o transferencia?"
5. Tú confirmas la categoría y la cuenta de pago
6. **Claude** llama a `create_expense` con todos los datos y adjunta el PDF
7. **Claude** te confirma: "Gasto registrado ✓ ID: 12345"

### Consultar gastos de un trimestre

"¿Cuánto hemos gastado en material de oficina entre enero y marzo de 2025?"

Claude llamará a `get_expense_by_category_report` o `get_expenses` con los filtros correspondientes.

---

## Estructura del proyecto

```
zoho-books-mcp/
├── src/
│   ├── __init__.py
│   ├── server.py            # Servidor MCP y definición de tools
│   ├── zoho_client.py       # Cliente HTTP para Zoho Books API
│   ├── document_processor.py # Extracción de datos de PDF/imagen/texto
│   └── auth.py              # Gestión OAuth2 (refresh automático)
├── main.py                  # Punto de entrada
├── get_token.py             # Script de autorización OAuth2
├── requirements.txt
├── .env.example
└── README.md
```

---

## Notas de seguridad

- El `refresh_token` tiene vida indefinida; guárdalo como un secreto.
- Nunca lo incluyas en control de versiones — el `.env` ya está en `.gitignore`.
- Para entornos de producción usa un gestor de secretos (AWS Secrets Manager, Vault, etc.).
