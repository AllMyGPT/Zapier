#!/usr/bin/env bash
# Puente LAN nativo para macOS (phantom, https://github.com/jhead/phantom).
# Docker Desktop en Mac corre dentro de una VM y a veces no reenvía los
# "pings" de broadcast LAN que envía la Switch. phantom escucha en el Mac en
# 19132, anuncia el servidor como partida LAN y reenvía el tráfico al
# contenedor publicado en 127.0.0.1:${HOST_PORT}.
set -euo pipefail
cd "$(dirname "$0")/.."
HOST_PORT="${HOST_PORT:-19134}"
if [ "$HOST_PORT" = "19132" ]; then
  echo "El puente necesita el puerto 19132 libre: arranca el servidor con HOST_PORT=19134 (make server-up-bridge)"; exit 1
fi
BIN=".bin/phantom-macos"
if [ ! -x "$BIN" ]; then
  mkdir -p .bin
  echo "▶ Descargando phantom…"
  curl -fL --retry 3 -o "$BIN" https://github.com/jhead/phantom/releases/download/v0.5.4/phantom-macos
  chmod +x "$BIN"
fi
if [ "$(uname -m)" = "arm64" ] && ! /usr/bin/pgrep -q oahd 2>/dev/null; then
  echo "ℹ️  Si falla al arrancar, instala Rosetta: softwareupdate --install-rosetta --agree-to-license"
fi
echo "▶ Puente LAN activo → 127.0.0.1:${HOST_PORT}. Deja esta ventana abierta (Ctrl+C para parar)."
exec "$BIN" -server "127.0.0.1:${HOST_PORT}"
