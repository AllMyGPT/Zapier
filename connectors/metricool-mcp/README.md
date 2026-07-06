# Metricool MCP Connector

Servidor **MCP (Model Context Protocol)** local que conecta tu cuenta de
[Metricool](https://metricool.com/) con cualquier cliente compatible con MCP
(Claude Desktop, Claude Code, Cursor, etc.). Permite consultar analíticas de
redes sociales, competidores y programar publicaciones desde el chat.

> Escrito en Python con el SDK oficial de MCP (`FastMCP`). Sin dependencias de
> pago: funciona en local con tus credenciales de Metricool.

---

## 1. Requisitos

- **Python 3.10+**
- Una cuenta de Metricool con **acceso a la API** (planes *Advanced* o *Custom*).
- Tus credenciales de API: *user token* y *user id*.

### Cómo obtener las credenciales

1. Entra en Metricool → **Ajustes / Settings**.
2. Abre la pestaña **API**.
3. Copia el **User token** (`METRICOOL_USER_TOKEN`) y el **User id**
   (`METRICOOL_USER_ID`).
4. Opcionalmente, obtén el `blogId` de cada marca con la herramienta
   `metricool_get_brands` una vez configurado (o desde la propia URL de la app).

Documentación oficial de la API:
<https://app.metricool.com/resources/apidocs/index.html>

---

## 2. Instalación

Clona/descarga el repositorio y entra en esta carpeta:

```bash
cd connectors/metricool-mcp
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
# edita .env y rellena METRICOOL_USER_TOKEN y METRICOOL_USER_ID
```

### Prueba rápida

```bash
python src/server.py        # arranca el servidor MCP (stdio); Ctrl+C para salir
```

Si arranca sin errores, ya está listo para conectarlo a tu cliente.

---

## 3. Configuración en el cliente MCP

### Claude Desktop

Edita el fichero de configuración:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Añade el servidor (usa **rutas absolutas**):

```json
{
  "mcpServers": {
    "metricool": {
      "command": "python",
      "args": ["/ruta/absoluta/a/connectors/metricool-mcp/src/server.py"],
      "env": {
        "METRICOOL_USER_TOKEN": "tu_user_token",
        "METRICOOL_USER_ID": "tu_user_id",
        "METRICOOL_BLOG_ID": ""
      }
    }
  }
}
```

> Si usas el intérprete del entorno virtual, apunta `command` a
> `/ruta/.venv/bin/python` (macOS/Linux) o `\.venv\Scripts\python.exe` (Windows).

### Claude Code (CLI)

```bash
claude mcp add metricool \
  -e METRICOOL_USER_TOKEN=tu_user_token \
  -e METRICOOL_USER_ID=tu_user_id \
  -- python /ruta/absoluta/a/connectors/metricool-mcp/src/server.py
```

Reinicia el cliente para que cargue el servidor.

---

## 4. Herramientas disponibles

| Herramienta | Descripción |
|---|---|
| `metricool_get_brands` | Lista tus marcas y sus `blogId`. **Empieza por aquí.** |
| `metricool_get_analytics` | Analíticas de un endpoint (Instagram, Facebook, X, LinkedIn, TikTok, YouTube…) entre dos fechas. |
| `metricool_get_competitors` | Analíticas de competidores por red. |
| `metricool_get_scheduled_posts` | Lista las publicaciones programadas en un rango. |
| `metricool_schedule_post` | Programa (o guarda como borrador) una publicación en una o varias redes. |
| `metricool_request` | *Escape hatch*: llama a cualquier endpoint de la API de Metricool. |

`userId` y la cabecera `X-Mc-Auth` se añaden automáticamente. En las
herramientas de analítica/scheduling puedes omitir `blog_id` si defines
`METRICOOL_BLOG_ID`.

### Ejemplos de uso (en lenguaje natural)

- *"Lista mis marcas en Metricool."*
- *"Dame las publicaciones programadas entre el 1 y el 15 de julio."*
- *"Programa un post en Instagram y Facebook para el 10 de julio a las 18:30 con este texto…"*

---

## 5. Notas

- Los endpoints de analítica de Metricool evolucionan; por eso
  `metricool_get_analytics` recibe el `endpoint` como parámetro y
  `metricool_request` permite llamar a cualquier ruta de la documentación.
- El esquema del cuerpo de `metricool_schedule_post` sigue el *scheduler v2*
  (`/v2/scheduler/posts`). Usa el parámetro `extra` para campos adicionales.
- Este conector no almacena tus credenciales: se leen del entorno / `.env`
  (que está en `.gitignore`).
