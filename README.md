# Zapier

Repositorio para códigos para Zapier y conectores relacionados.

## Conectores MCP

Servidores **MCP (Model Context Protocol)** locales, listos para descargar y
configurar en tu cliente MCP (Claude Desktop, Claude Code, Cursor…). Cada uno
es autocontenido: código + dependencias + instrucciones.

| Conector | Qué hace | Carpeta |
|---|---|---|
| **Meta** | Facebook / Instagram vía Graph API: leer y publicar en Páginas, cuenta de Instagram Business, insights. | [`connectors/meta-mcp`](connectors/meta-mcp) |
| **Metricool** | Analíticas de redes sociales, competidores y programación de publicaciones vía API de Metricool. | [`connectors/metricool-mcp`](connectors/metricool-mcp) |
| **LinkedIn** | Perfil, Páginas de empresa administradas y publicación en el feed (como persona o empresa) vía API de LinkedIn. | [`connectors/linkedin-mcp`](connectors/linkedin-mcp) |

### Puesta en marcha rápida

```bash
cd connectors/meta-mcp        # o connectors/metricool-mcp
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # rellena tus credenciales
python src/server.py          # arranca el servidor MCP (stdio)
```

Consulta el `README.md` de cada carpeta para el detalle de credenciales,
herramientas disponibles y el JSON de configuración para Claude Desktop /
Claude Code.
