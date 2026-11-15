#!/usr/bin/env bash
IP=$( (ipconfig getifaddr en0 || ipconfig getifaddr en1 || hostname -I | awk '{print $1}') 2>/dev/null | head -1)
cat <<GUIDE

══════════════════════════════════════════════════════════════════════
  🏛️ ⚔️ 🚀  MUNDOS MINECRAFT — Guía rápida para Nintendo Switch 2
══════════════════════════════════════════════════════════════════════
  Mundos:  dist/MundoRomano.mcaddon · dist/AldeaGala.mcaddon · dist/Galaxia.mcaddon

 OPCIÓN A (recomendada) · Mundos guardados en la Switch 2 vía Realm
 ───────────────────────────────────────────────────────────────────
  Es la vía oficial: la consola no admite importar mods ni añadir
  servidores, pero sí descarga mundos de un Realm (con sus mods).
  Necesitas una suscripción a Realms en una cuenta Microsoft que uses
  también en un iPhone/iPad con Minecraft.

  1. Mac → Finder → carpeta dist/ → selecciona los 3 .mcaddon →
     Compartir → AirDrop → iPhone/iPad. Ábrelos con Minecraft
     ("Importación correcta" en cada uno).
  2. En el iPhone, para CADA mundo:
       Crear nuevo → Crear nuevo mundo → nombre (p. ej. "Aldea Gala")
       → Paquetes de comportamiento → activa el pack del mundo
         (Mundo Romano / Aldea Gala / Galaxia; Aldea Gala activa
          también Mundo Romano, acepta).
       → Crear. Entra y espera ~10 s quieto: el mundo se construye
         solo (foro, aldea o puesto avanzado). Sal del mundo.
  3. Sube el mundo al Realm: Jugar → Realms → ✏️ de tu Realm →
     "Reemplazar mundo" → elige el mundo del iPhone.
  4. En la Switch 2: Jugar → Realms → ✏️ de tu Realm → "Descargar
     mundo". Se guarda en la consola con sus mods y se juega offline.
  5. Repite 3-4 con los otros dos mundos. Las copias descargadas en la
     Switch se quedan aunque cambies el mundo del Realm.

 OPCIÓN B · Servidor en este Mac (misma Wi-Fi, para jugar juntos)
 ────────────────────────────────────────────────────────────────
  1. Abre Docker Desktop y ejecuta, según el mundo:
       make server-up MUNDO=romano    (o galos · galaxia)
  2. Switch 2: Jugar → pestaña "Amigos" → "Partidas LAN" → entra y
     acepta descargar los paquetes (texturepack-required=true).
     IP de este Mac: ${IP:-<desconocida>}  ·  TCP 19132 + UDP 19140-19147/7551
  3. Si NO aparece en "Partidas LAN" (Docker Desktop en Mac corre en una
     VM y puede no recibir los broadcasts de la Switch):
       a) Docker Desktop → Settings → Resources → Network →
          activa "Enable host networking" y reinicia Docker.
       b) make server-down && make server-up-host MUNDO=...
     Comprueba también: Mac y Switch en la misma Wi-Fi (no la de
     invitados) y el firewall del Mac permite conexiones a Docker.
  4. Otros comandos: make logs · make server-down · make console

 COMANDOS EN LA PARTIDA
  Roma:    /roma:coliseo · pulsa el Altar del Coliseo · agáchate con gladius/escudo
  Galos:   bebe la Poción Mágica · agachado + usar Menhir para lanzarlo · /galos:romanos
  Galaxia: pulsa la Baliza · agachado + usar Espada de Plasma = empuje · /galaxia:invasion
  Cualquiera (operador): /roma:construir · /galos:construir · /galaxia:construir
══════════════════════════════════════════════════════════════════════
GUIDE
