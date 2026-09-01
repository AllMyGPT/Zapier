# Zapier

Repositorio para códigos para Zapier y conectores relacionados.

## Conectores MCP

Servidores **MCP (Model Context Protocol)** locales, listos para descargar y
configurar en tu cliente MCP (Claude Desktop, Claude Code, Cursor…). Cada uno
es autocontenido: código + dependencias + instrucciones.

| Conector | Qué hace | Carpeta |
|---|---|---|
| **Meta** | Facebook / Instagram vía Graph API: leer y publicar en Páginas, cuenta de Instagram Business, insights. Conector propio. | [`connectors/meta-mcp`](connectors/meta-mcp) |
| **Metricool** | Analíticas, competidores, Ads y programación. Usa el **MCP oficial** de Metricool (`uvx mcp-metricool`). | [`connectors/metricool-mcp`](connectors/metricool-mcp) |
| **LinkedIn** | Perfil, Páginas de empresa administradas y publicación en el feed (como persona o empresa) vía API de LinkedIn. Conector propio. | [`connectors/linkedin-mcp`](connectors/linkedin-mcp) |

> **Meta** y **LinkedIn** son conectores propios (sobre las APIs oficiales de cada plataforma), porque esas empresas no publican un MCP oficial. **Metricool** sí tiene MCP oficial, así que ese conector solo documenta cómo configurarlo.

### Puesta en marcha rápida

**Meta / LinkedIn** (conectores propios):

```bash
cd connectors/meta-mcp        # o connectors/linkedin-mcp
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # rellena tus credenciales
python src/server.py          # arranca el servidor MCP (stdio)
```

**Metricool** (MCP oficial, no requiere clonar código):

```bash
uvx mcp-metricool             # con METRICOOL_USER_TOKEN y METRICOOL_USER_ID en el entorno
```

Consulta el `README.md` de cada carpeta para el detalle de credenciales,
herramientas disponibles y el JSON de configuración para Claude Desktop /
Claude Code.
