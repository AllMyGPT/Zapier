# Prompts de prueba — MCP de Zoho Mail

Colección de prompts para validar que el servidor MCP `ZohoMail` está
correctamente conectado y que sus herramientas responden como se espera.
Úsalos en una sesión de Claude Code una vez que `claude mcp list` muestre
`ZohoMail` como `✓ Connected`.

## 1. Verificación de conexión

- "¿Qué herramientas tiene disponibles el servidor MCP ZohoMail?"
- "Lista los últimos 5 correos de mi bandeja de entrada de Zoho Mail."
- "¿Cuál es la cuenta de correo conectada actualmente en Zoho Mail?"

## 2. Lectura y búsqueda de correo

- "Busca en Zoho Mail los correos recibidos en los últimos 7 días que
  contengan la palabra 'factura'."
- "Muéstrame el contenido completo del último correo recibido de
  [remitente]."
- "¿Tengo correos sin leer en la carpeta de entrada?"

## 3. Redacción y envío

- "Crea un borrador de correo en Zoho Mail para [destinatario] con el
  asunto 'Prueba MCP' y un cuerpo breve confirmando que la integración
  funciona."
- "Responde al último correo de [remitente] agradeciendo la información y
  confirmando que lo revisaremos esta semana."

## 4. Organización

- "Lista las carpetas/etiquetas disponibles en mi cuenta de Zoho Mail."
- "Mueve el correo con asunto '[asunto]' a la carpeta '[carpeta]'."
- "Marca como leído el último correo de [remitente]."

## 5. Casos límite / manejo de errores

- "Busca correos de un remitente que no existe (ej: nadie@dominio-falso.test)
  y confirma que la respuesta indica que no hay resultados, sin fallar."
- "Intenta acceder a una carpeta que no existe y describe el mensaje de
  error que devuelve la herramienta."

## Registro de resultados

Al ejecutar estas pruebas, conviene anotar:

| Prompt | Herramienta usada | Resultado esperado | Resultado obtenido | OK/Fallo |
|---|---|---|---|---|
| | | | | |

> Nota: ninguno de estos prompts requiere ni debe incluir el token de
> acceso del servidor MCP. Si una respuesta expone la URL completa con el
> token, repórtalo como un problema de seguridad y rota el token desde
> Zoho Mail.
