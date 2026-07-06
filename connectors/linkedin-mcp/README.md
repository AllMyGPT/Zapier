# LinkedIn MCP Connector

Servidor **MCP (Model Context Protocol)** local que conecta la **API de
LinkedIn** con cualquier cliente compatible con MCP (Claude Desktop, Claude
Code, Cursor…). Permite leer tu perfil, listar las Páginas de empresa que
administras y publicar en el feed como persona o como empresa.

> Escrito en Python con el SDK oficial de MCP (`FastMCP`). Funciona en local
> con tu propio token OAuth 2.0 de LinkedIn.

---

## 1. Requisitos

- **Python 3.10+**
- Una **app de LinkedIn** (<https://www.linkedin.com/developers/apps>) y un
  **access token OAuth 2.0** con los scopes que necesites:
  - `openid profile email` — iniciar sesión / leer perfil.
  - `w_member_social` — publicar como el miembro autenticado.
  - `w_organization_social` — publicar como Página de empresa *(requiere la
    Community Management API con la app aprobada)*.
  - `r_organization_admin` — listar las Páginas que administras.

### Cómo obtener el token

1. Crea una app en el [portal de desarrolladores de LinkedIn](https://www.linkedin.com/developers/apps).
2. En **Auth**, añade los scopes/products (Sign In with LinkedIn using OpenID
   Connect, Share on LinkedIn y, si vas a gestionar Páginas, Community
   Management API).
3. Genera un access token mediante el flujo OAuth 2.0 (Authorization Code) o el
   **OAuth token tools** del portal para pruebas.

Documentación oficial: <https://learn.microsoft.com/linkedin/>

---

## 2. Instalación

```bash
cd connectors/linkedin-mcp
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
# edita .env y rellena LINKEDIN_ACCESS_TOKEN
```

### Prueba rápida

```bash
python src/server.py        # arranca el servidor MCP (stdio); Ctrl+C para salir
```

---

## 3. Configuración en el cliente MCP

### Claude Desktop

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "python",
      "args": ["/ruta/absoluta/a/connectors/linkedin-mcp/src/server.py"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "tu_access_token",
        "LINKEDIN_AUTHOR_URN": ""
      }
    }
  }
}
```

> Si usas el intérprete del entorno virtual, apunta `command` a
> `/ruta/.venv/bin/python` (macOS/Linux) o `\.venv\Scripts\python.exe` (Windows).

### Claude Code (CLI)

```bash
claude mcp add linkedin \
  -e LINKEDIN_ACCESS_TOKEN=tu_access_token \
  -- python /ruta/absoluta/a/connectors/linkedin-mcp/src/server.py
```

---

## 4. Herramientas disponibles

| Herramienta | Descripción |
|---|---|
| `linkedin_get_profile` | Perfil del miembro autenticado (OpenID Connect). El `sub` es tu id de persona. |
| `linkedin_list_organizations` | Páginas de empresa que administras (devuelve el URN de organización). |
| `linkedin_get_organization` | Detalles de una organización por id o URN. |
| `linkedin_create_post` | Publica un post de texto como persona o como empresa. |
| `linkedin_request` | *Escape hatch*: llama a cualquier endpoint de la API de LinkedIn. |

El header `Authorization: Bearer` y los headers Rest.li se añaden
automáticamente. Puedes definir `LINKEDIN_AUTHOR_URN` como autor por defecto.

### Flujo típico

1. `linkedin_get_profile` → toma el `sub` y forma `urn:li:person:<sub>`.
2. (Opcional) `linkedin_list_organizations` → toma el URN de la Página.
3. `linkedin_create_post` con ese `author_urn`.

### Ejemplos de uso (en lenguaje natural)

- *"¿Cuál es mi perfil de LinkedIn?"*
- *"Lista las páginas de empresa que administro."*
- *"Publica en mi LinkedIn: 'Encantado de anunciar…'."*

---

## 5. Notas

- Publicar como **Página de empresa** requiere la **Community Management API**,
  que exige que tu app de LinkedIn esté aprobada para ese producto.
- Las APIs `/rest/*` son versionadas: se envía el header `LinkedIn-Version`
  (`LINKEDIN_API_VERSION`, formato `YYYYMM`). Actualízalo si LinkedIn deprecia
  la versión por defecto.
- Este conector no almacena tu token: se lee del entorno / `.env`
  (que está en `.gitignore`).
