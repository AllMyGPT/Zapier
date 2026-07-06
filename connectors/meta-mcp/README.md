# Meta (Facebook / Instagram) MCP Connector

Servidor **MCP (Model Context Protocol)** local que conecta la **Graph API de
Meta** con cualquier cliente compatible con MCP (Claude Desktop, Claude Code,
Cursor, etc.). Permite leer y publicar en Páginas de Facebook, gestionar la
cuenta de Instagram Business vinculada y consultar métricas (insights).

> Escrito en Python con el SDK oficial de MCP (`FastMCP`). Funciona en local
> con tu propio token de acceso de Meta.

---

## 1. Requisitos

- **Python 3.10+**
- Una **app de Meta** (<https://developers.facebook.com/>) y un **access token**
  de larga duración (User o Page token).
- Los permisos que necesites, según lo que vayas a hacer:
  - `pages_show_list`, `pages_read_engagement` — leer Páginas y su contenido.
  - `pages_manage_posts` — publicar en una Página.
  - `instagram_basic` — leer la cuenta de Instagram Business.
  - `instagram_content_publish` — publicar en Instagram.
  - `read_insights` — métricas de Página / Instagram.

### Cómo obtener el token

1. Crea una app en el [panel de desarrolladores de Meta](https://developers.facebook.com/apps/).
2. Usa el **Graph API Explorer** o el flujo de OAuth para generar un token con
   los permisos anteriores.
3. Convierte el token a **larga duración** (long-lived) para que no caduque en
   horas. Para publicar en Páginas necesitarás el **Page access token** (lo
   devuelve la herramienta `meta_list_pages`).

Documentación oficial: <https://developers.facebook.com/docs/graph-api/>

---

## 2. Instalación

Clona/descarga el repositorio y entra en esta carpeta:

```bash
cd connectors/meta-mcp
```

### Opción A — con `uv` (recomendado)

```bash
uv venv
uv pip install -r requirements.txt
```

### Opción B — con `pip`

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Configura las credenciales

```bash
cp .env.example .env
# edita .env y rellena META_ACCESS_TOKEN
```

### Prueba rápida

```bash
python src/server.py        # arranca el servidor MCP (stdio); Ctrl+C para salir
```

---

## 3. Configuración en el cliente MCP

### Claude Desktop

Edita el fichero de configuración:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "meta": {
      "command": "python",
      "args": ["/ruta/absoluta/a/connectors/meta-mcp/src/server.py"],
      "env": {
        "META_ACCESS_TOKEN": "tu_long_lived_token",
        "META_PAGE_ID": "",
        "META_IG_USER_ID": ""
      }
    }
  }
}
```

> Si usas el intérprete del entorno virtual, apunta `command` a
> `/ruta/.venv/bin/python` (macOS/Linux) o `\.venv\Scripts\python.exe` (Windows).

### Claude Code (CLI)

```bash
claude mcp add meta \
  -e META_ACCESS_TOKEN=tu_long_lived_token \
  -- python /ruta/absoluta/a/connectors/meta-mcp/src/server.py
```

Reinicia el cliente para que cargue el servidor.

---

## 4. Herramientas disponibles

| Herramienta | Descripción |
|---|---|
| `meta_get_me` | Perfil asociado al token actual. |
| `meta_list_pages` | Lista las Páginas que gestionas **y su Page access token**. |
| `meta_get_page_posts` | Publicaciones recientes de una Página (con métricas básicas). |
| `meta_publish_page_post` | Publica texto (con enlace opcional) en una Página. |
| `meta_get_instagram_account` | Resuelve la cuenta de Instagram Business vinculada a una Página. |
| `meta_get_instagram_media` | Lista media reciente de una cuenta de Instagram. |
| `meta_publish_instagram_photo` | Publica una foto en Instagram (contenedor + publish). |
| `meta_get_insights` | Métricas de Página / post / Instagram. |
| `meta_graph_request` | *Escape hatch*: llama a cualquier endpoint de la Graph API (Ads, catálogos, comentarios…). |

El `access_token` se inyecta automáticamente en cada llamada. Puedes definir
`META_PAGE_ID` y `META_IG_USER_ID` como valores por defecto para no pasarlos en
cada herramienta.

### Flujo típico

1. `meta_list_pages` → copia el `id` y el `access_token` de tu Página.
2. `meta_get_instagram_account` → obtén el `instagram_business_account.id`.
3. Publica o consulta métricas con las herramientas correspondientes.

### Ejemplos de uso (en lenguaje natural)

- *"Lista mis páginas de Facebook."*
- *"Publica en mi página el mensaje '…' con este enlace."*
- *"Publica esta foto (URL) en Instagram con este caption."*
- *"Dame las impresiones y el alcance de mi página en los últimos 7 días."*

---

## 5. Notas

- **Publicar en Instagram** requiere que la imagen esté en una **URL pública**
  (Meta la descarga desde su lado). No se suben ficheros locales.
- Los nombres de métricas de `meta_get_insights` dependen del objeto (Página vs
  Instagram). Consulta la documentación de insights de Meta.
- Este conector no almacena tu token: se lee del entorno / `.env`
  (que está en `.gitignore`).
