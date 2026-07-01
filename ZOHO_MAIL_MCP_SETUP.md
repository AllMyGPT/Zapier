# Configuración del servidor MCP de Zoho Mail

Este documento describe cómo verificar e instalar el servidor MCP (Model
Context Protocol) de Zoho Mail para usarlo con Claude Code.

## 1. Requisitos previos

- Claude Code CLI instalado (`claude --version`).
- Acceso al panel de Zoho Mail para generar la URL del servidor MCP
  (`https://zoho-mail-mcp-chatgpt-<id>.zohomcp.com/mcp/<token>/message`).

> ⚠️ **Importante sobre seguridad:** la URL que entrega Zoho incluye un
> token de acceso embebido en la propia ruta (`/mcp/<token>/message`).
> Ese token concede acceso a la cuenta de correo conectada, por lo que debe
> tratarse como una credencial secreta:
> - No lo publiques en repositorios, tickets, chats públicos ni capturas
>   de pantalla.
> - No lo commitees en el historial de git.
> - Si crees que se filtró, revócalo/regenéralo desde el panel de Zoho.
>
> En los comandos de este documento se usa el placeholder `<ZOHO_MCP_URL>`
> en lugar del valor real.

## 2. Verificar el estado actual

```bash
# Comprobar la versión de Claude Code
claude --version

# Listar los servidores MCP configurados actualmente
claude mcp list
```

Si no hay servidores configurados, el comando anterior mostrará:

```
No MCP servers configured. Use `claude mcp add` to add a server.
```

## 3. Instalar el servidor MCP de Zoho Mail

```bash
claude mcp add --transport http ZohoMail <ZOHO_MCP_URL> --scope user
```

- `--transport http`: el servidor de Zoho Mail se expone vía HTTP.
- `ZohoMail`: nombre con el que quedará registrado el servidor.
- `<ZOHO_MCP_URL>`: URL completa provista por Zoho Mail (con el token de
  acceso incluido).
- `--scope user`: la configuración queda disponible para el usuario actual
  en todos sus proyectos (se guarda en `~/.claude.json`).

## 4. Verificar la instalación

```bash
claude mcp list
```

Salida esperada (el estado puede variar según si hace falta autenticación
adicional):

```
Checking MCP server health…

ZohoMail: <ZOHO_MCP_URL> (HTTP) - ✓ Connected
```

Si aparece `! Needs authentication`, significa que el servidor está
registrado correctamente pero falta completar un paso de autorización
(por ejemplo, OAuth) antes de poder usar las herramientas. Ese paso debe
realizarse en modo interactivo (`claude` o `/mcp` dentro de una sesión
interactiva), ya que requiere abrir un navegador para autorizar el acceso.

## 5. Uso

Una vez conectado, las herramientas del servidor aparecerán con el
prefijo `mcp__ZohoMail__*` (por ejemplo, para leer correos, crear
borradores, buscar mensajes, etc., según lo que exponga el servidor).
Puedes probar la integración con los prompts de ejemplo en
[`MCP_TEST_PROMPTS.md`](./MCP_TEST_PROMPTS.md).

## 6. Desinstalar / actualizar

```bash
# Quitar el servidor
claude mcp remove ZohoMail

# Volver a añadirlo con una URL nueva (por ejemplo, tras rotar el token)
claude mcp add --transport http ZohoMail <NUEVA_ZOHO_MCP_URL> --scope user
```

## 7. Resolución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `No MCP servers configured` tras el `add` | El `add` falló silenciosamente o se usó otro `--scope` | Repetir `claude mcp add` y confirmar con `claude mcp list` |
| `! Needs authentication` | Falta completar OAuth/login del servidor | Ejecutar `claude` en modo interactivo y usar `/mcp` para autorizar |
| Herramientas `mcp__ZohoMail__*` no aparecen | El servidor no terminó de conectar | Verificar con `claude mcp list` y revisar la URL/token |
| Token inválido o expirado | Token rotado o revocado desde Zoho | Generar una URL nueva en Zoho Mail y repetir el paso 3 |
