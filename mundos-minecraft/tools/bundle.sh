#!/usr/bin/env bash
# Compila, genera texturas y empaqueta los tres mundos:
#   dist/<Mundo>.mcaddon   (packs del mundo, para iPhone/iPad -> Realm -> Switch)
#   dist/packs/*.mcpack    (cada pack suelto)
#   server-data/           (packs + configuración de mundos para el servidor Docker)
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
PY="${PYTHON:-python3}"; [ -x .venv/bin/python ] && PY=.venv/bin/python

echo "▶ Generando texturas…";    "$PY" tools/generate_assets.py | tail -1
echo "▶ Compilando TypeScript…"; rm -rf build; npx --no-install tsc

STAGE="$(mktemp -d)"; trap 'rm -rf "$STAGE"' EXIT
THEMES=$(ls packs)
for t in $THEMES; do
  cp -R "packs/$t/behavior_pack" "$STAGE/${t}_BP"
  cp -R "packs/$t/resource_pack" "$STAGE/${t}_RP"
  rm -rf "$STAGE/${t}_BP/scripts"; mkdir -p "$STAGE/${t}_BP/scripts"
  cp -R build/scripts/common "build/scripts/$t" "$STAGE/${t}_BP/scripts/"
done
find "$STAGE" -name '.DS_Store' -delete

rm -rf dist; mkdir -p dist/packs
for t in $THEMES; do
  ( cd "$STAGE/${t}_BP" && zip -qr -X "$ROOT/dist/packs/${t}_BP.mcpack" . )
  ( cd "$STAGE/${t}_RP" && zip -qr -X "$ROOT/dist/packs/${t}_RP.mcpack" . )
done

# server-data: todos los packs + un mundo por entrada de mundos.json
SD=server-data
mkdir -p "$SD/behavior_packs" "$SD/resource_packs" "$SD/worlds"
for t in $THEMES; do
  rm -rf "$SD/behavior_packs/${t}_BP" "$SD/resource_packs/${t}_RP"
  cp -R "$STAGE/${t}_BP" "$SD/behavior_packs/"; cp -R "$STAGE/${t}_RP" "$SD/resource_packs/"
done

"$PY" - "$STAGE" "$ROOT" <<'PY'
import json, os, subprocess, sys
stage, root = sys.argv[1], sys.argv[2]
mundos = json.load(open(os.path.join(root, "mundos.json")))
def header(t, kind):
    return json.load(open(os.path.join(root, "packs", t, kind, "manifest.json")))["header"]
for key, m in mundos.items():
    dirs = [f"{t}_{s}" for t in m["packs"] for s in ("BP", "RP")]
    out = os.path.join(root, "dist", f"{m['archivo']}.mcaddon")
    subprocess.run(["zip", "-qr", "-X", out, *dirs], cwd=stage, check=True)
    wdir = os.path.join(root, "server-data", "worlds", key)
    os.makedirs(wdir, exist_ok=True)
    for kind, fname in (("behavior_pack", "world_behavior_packs.json"), ("resource_pack", "world_resource_packs.json")):
        # Orden: el último pack tiene prioridad -> el pack temático principal va primero en la lista.
        entries = [{"pack_id": header(t, kind)["uuid"], "version": header(t, kind)["version"]} for t in reversed(m["packs"])]
        json.dump(entries, open(os.path.join(wdir, fname), "w"), indent=2)
    print(f"▶ {m['titulo']:<13} → dist/{m['archivo']}.mcaddon  ·  server-data/worlds/{key}/")
PY
