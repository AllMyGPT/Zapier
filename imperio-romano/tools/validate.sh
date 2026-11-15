#!/usr/bin/env bash
# Criterios de aceptación: tipos, JSON, texturas y contenido del .mcaddon.
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${PYTHON:-python3}"; [ -x .venv/bin/python ] && PY=.venv/bin/python

echo "▶ npx tsc --noEmit"; npx --no-install tsc --noEmit && echo "  ✅ sin errores de tipos"

echo "▶ JSON válidos (python3 -m json.tool)"
n=0
while IFS= read -r -d '' f; do
  "$PY" -m json.tool "$f" >/dev/null || { echo "  ❌ $f"; exit 1; }; n=$((n+1))
done < <(find behavior_pack resource_pack -name '*.json' -print0)
echo "  ✅ $n archivos JSON válidos"

echo "▶ Texturas PNG"
for f in resource_pack/textures/items/{gladius,pilum,denarius}.png resource_pack/textures/blocks/{marble_pillar,colosseum_altar}.png resource_pack/pack_icon.png behavior_pack/pack_icon.png resource_pack/textures/entity/legionary.png; do
  [ -s "$f" ] && [ "$(wc -c < "$f")" -gt 100 ] && head -c 8 "$f" | grep -q PNG || { echo "  ❌ $f"; exit 1; }
done
echo "  ✅ texturas presentes y válidas"

echo "▶ dist/ImperioRomano.mcaddon"
[ -f dist/ImperioRomano.mcaddon ] || { echo "  ❌ no existe (ejecuta make bundle)"; exit 1; }
listing=$(unzip -Z1 dist/ImperioRomano.mcaddon)
for need in ImperioRomano_BP/manifest.json ImperioRomano_BP/scripts/main.js ImperioRomano_BP/items/gladius.json \
            ImperioRomano_BP/entities/legionary.json ImperioRomano_RP/manifest.json \
            ImperioRomano_RP/textures/items/gladius.png ImperioRomano_RP/textures/blocks/colosseum_altar.png ImperioRomano_RP/pack_icon.png; do
  grep -qx "$need" <<<"$listing" || { echo "  ❌ falta $need"; exit 1; }
done
echo "  ✅ $(grep -c . <<<"$listing") entradas (BP + RP + PNG)"
echo "✅ Todas las comprobaciones pasaron"
