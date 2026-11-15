#!/usr/bin/env bash
# Compila, genera texturas y empaqueta el mod:
#   dist/ImperioRomano.mcaddon  (BP + RP, para iPhone/iPad -> Realm -> Switch)
#   dist/ImperioRomano_BP.mcpack / dist/ImperioRomano_RP.mcpack
#   server-data/...             (packs inyectados en el servidor Docker)
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
PY="${PYTHON:-python3}"
[ -x .venv/bin/python ] && PY=.venv/bin/python

echo "▶ Generando texturas…";            "$PY" tools/generate_assets.py
echo "▶ Compilando TypeScript…";         npx --no-install tsc

LEVEL_NAME="${LEVEL_NAME:-ImperioRomano}"
BP_UUID=$("$PY" -c "import json;print(json.load(open('behavior_pack/manifest.json'))['header']['uuid'])")
RP_UUID=$("$PY" -c "import json;print(json.load(open('resource_pack/manifest.json'))['header']['uuid'])")
BP_VER=$("$PY" -c "import json;print(json.dumps(json.load(open('behavior_pack/manifest.json'))['header']['version']))")
RP_VER=$("$PY" -c "import json;print(json.dumps(json.load(open('resource_pack/manifest.json'))['header']['version']))")

STAGE="$(mktemp -d)"; trap 'rm -rf "$STAGE"' EXIT
cp -R behavior_pack "$STAGE/ImperioRomano_BP"
cp -R resource_pack "$STAGE/ImperioRomano_RP"
find "$STAGE" -name '.DS_Store' -delete

mkdir -p dist
rm -f dist/ImperioRomano.mcaddon dist/ImperioRomano_BP.mcpack dist/ImperioRomano_RP.mcpack
( cd "$STAGE" && zip -qr -X "$ROOT/dist/ImperioRomano.mcaddon" ImperioRomano_BP ImperioRomano_RP )
( cd "$STAGE/ImperioRomano_BP" && zip -qr -X "$ROOT/dist/ImperioRomano_BP.mcpack" . )
( cd "$STAGE/ImperioRomano_RP" && zip -qr -X "$ROOT/dist/ImperioRomano_RP.mcpack" . )
echo "▶ Empaquetado: $(ls dist/*.mcaddon dist/*.mcpack | tr '\n' ' ')"

# --- Inyección en el servidor Docker -------------------------------------------
SD="server-data"
mkdir -p "$SD/behavior_packs" "$SD/resource_packs" "$SD/worlds/$LEVEL_NAME"
rm -rf "$SD/behavior_packs/ImperioRomano_BP" "$SD/resource_packs/ImperioRomano_RP"
cp -R "$STAGE/ImperioRomano_BP" "$SD/behavior_packs/"
cp -R "$STAGE/ImperioRomano_RP" "$SD/resource_packs/"
printf '[\n  { "pack_id": "%s", "version": %s }\n]\n' "$BP_UUID" "$BP_VER" > "$SD/worlds/$LEVEL_NAME/world_behavior_packs.json"
printf '[\n  { "pack_id": "%s", "version": %s }\n]\n' "$RP_UUID" "$RP_VER" > "$SD/worlds/$LEVEL_NAME/world_resource_packs.json"
echo "▶ Packs inyectados en $SD/ (mundo: $LEVEL_NAME)"
