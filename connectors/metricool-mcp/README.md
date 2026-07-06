# Metricool MCP Connector (oficial)

Este conector usa el **MCP oficial de Metricool**, mantenido por la propia
Metricool y publicado en PyPI como
[`mcp-metricool`](https://pypi.org/project/mcp-metricool/)
([código fuente](https://github.com/metricool/mcp-metricool), licencia
Apache-2.0).

> ℹ️ **Por qué el oficial:** lo mantiene Metricool, cubre ~28 herramientas
> (reels, posts, competidores, campañas de Ads, best time to post, programación
> de publicaciones, etc.) y se actualiza con la API. No necesitas mantener
> código propio.

---

## 1. Requisitos

- Una cuenta de Metricool. **Funciona con cualquier plan, incluido el
  gratuito** — solo aplican los límites de tu plan (p. ej., en el plan Free no
  puedes ver datos de más de 30 días ni programar más de 20 publicaciones).
- Tus credenciales: **User token** y **User id**.
- Para el método recomendado: [`uv`](https://docs.astral.sh/uv/) instalado
  (trae `uvx`). Alternativamente, Python 3.12+ y `pip`.

> ⚠️ **MCP ≠ API access.** El *MCP oficial* funciona en **cualquier plan**. Lo
> que exige plan *Advanced/Custom* es la **API access** directa (peticiones
> HTTP con token de API), que es un mecanismo distinto. Este conector usa el
> MCP, así que **te vale con el plan básico/gratuito**.
> Ver: <https://help.metricool.com/mcp-vs-api-access-what-is-the-difference-5y3ib>

### Cómo obtener las credenciales

1. Entra en Metricool → **Ajustes / Settings**.
2. Copia el **User token** (`METRICOOL_USER_TOKEN`) y el **User id**
   (`METRICOOL_USER_ID`). Están en la configuración de tu cuenta; el MCP
   oficial también documenta cómo obtenerlos.

---

## 2. Configuración en el cliente MCP

No hace falta clonar nada: `uvx` descarga y ejecuta el paquete automáticamente.

### Claude Desktop

Edita el fichero de configuración:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-metricool": {
      "command": "uvx",
      "args": ["mcp-metricool"],
      "env": {
        "METRICOOL_USER_TOKEN": "tu_user_token",
        "METRICOOL_USER_ID": "tu_user_id"
      }
    }
  }
}
```

> Usa la ruta absoluta a `uvx` si tu cliente no encuentra el binario en el PATH
> (`which uvx` en macOS/Linux, `where uvx` en Windows).

### Claude Code (CLI)

```bash
claude mcp add mcp-metricool \
  -e METRICOOL_USER_TOKEN=tu_user_token \
  -e METRICOOL_USER_ID=tu_user_id \
  -- uvx mcp-metricool
```

Reinicia el cliente para que cargue el servidor.

---

## 3. Alternativa: instalación con pip

Si prefieres no usar `uvx`:

```bash
cd connectors/metricool-mcp
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt  # instala mcp-metricool
cp .env.example .env             # rellena tus credenciales
mcp-metricool                    # arranca el servidor (stdio)
```

Y en el cliente apunta `command` al binario `mcp-metricool` del entorno
virtual (o a `python -m mcp_metricool`), en lugar de a `uvx`.

---

## 4. Herramientas (proporcionadas por el paquete oficial)

El servidor oficial expone ~28 herramientas, entre ellas:

- Marcas: `get_brands`
- Contenido por red: `get_instagram_reels`, `get_instagram_posts`,
  `get_tiktok_videos`, `get_facebook_posts`, `get_x_posts`,
  `get_linkedin_posts`, `get_youtube_videos`, `get_pinterest_boards`
- Ads: `get_facebookads_campaigns`, `get_googleads_campaigns`,
  `get_tiktokads_campaigns`
- Competidores: `get_network_competitors`, `get_network_competitors_posts`
- Programación: `post_schedule_post`, `get_scheduled_posts`,
  `update_schedule_post`
- Analítica: `get_analytics`, `get_metrics`, `get_best_time_to_post`

La lista completa y actualizada está en el repositorio oficial:
<https://github.com/metricool/mcp-metricool>

---

## 5. Notas

- El MCP oficial funciona con **cualquier plan de Metricool, incluido el
  gratuito** (con los límites propios de tu plan). No necesitas plan de pago.
- Este conector no almacena tus credenciales: se pasan por variables de entorno
  desde la configuración del cliente MCP (o `.env` para pruebas locales, que
  está en `.gitignore`).
- Los otros conectores de este repositorio (Meta y LinkedIn) sí son propios,
  porque esas plataformas **no** publican un MCP oficial.
