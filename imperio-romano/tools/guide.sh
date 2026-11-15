#!/usr/bin/env bash
IP=$( (ipconfig getifaddr en0 || ipconfig getifaddr en1 || hostname -I | awk '{print $1}') 2>/dev/null | head -1)
cat <<GUIDE

══════════════════════════════════════════════════════════════════════
  🏛️  IMPERIO ROMANO — Guía rápida de conexión para Nintendo Switch
══════════════════════════════════════════════════════════════════════

 OPCIÓN A · Jugar en la Switch para siempre (offline) vía Realm
 ───────────────────────────────────────────────────────────────
  1. En el Mac, Finder → dist/ImperioRomano.mcaddon → clic derecho →
     Compartir → AirDrop → tu iPhone/iPad.
  2. En el iPhone: "Abrir con Minecraft". Verás "Importación correcta"
     (dos packs: Recursos y Comportamiento).
  3. Minecraft (iPhone) → Crear nuevo mundo → Paquetes de comportamiento
     → Activar "Imperio Romano (Comportamiento)" (activa también el de
     recursos automáticamente). Crea el mundo y sal.
  4. Editar mundo → "Reemplazar mundo en Realm" / "Subir a Realm" en tu
     Realm (necesita suscripción a Realms en esa cuenta Microsoft).
  5. En la Switch: Jugar → Realms → tu Realm → ✏️ Editar →
     "Descargar mundo". Queda guardado en la memoria de la consola con
     el mod dentro y se puede jugar sin conexión.

 OPCIÓN B · Servidor local en este Mac (misma Wi-Fi)
 ───────────────────────────────────────────────────
  1. Abre Docker Desktop y ejecuta:   make server-up
  2. En la Switch: Jugar → pestaña "Amigos" → "Partidas LAN":
     aparecerá "Imperio Romano". Al entrar, acepta descargar los
     paquetes (texturepack-required=true lo fuerza).
     IP de este Mac: ${IP:-<desconocida>}  ·  Puerto UDP 19132
  3. Si NO aparece en "Partidas LAN" (Docker Desktop en Mac a veces no
     reenvía los anuncios LAN):   make server-down && make server-up-bridge
     (levanta el servidor en 19134 y un puente LAN nativo en 19132).
  4. Otros comandos: make logs · make server-down · make console
  En la partida: /roma:coliseo  o pulsa sobre un Altar del Coliseo.
══════════════════════════════════════════════════════════════════════
GUIDE
