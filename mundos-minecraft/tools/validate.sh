#!/usr/bin/env bash
# Criterios de aceptación: tipos, JSON, texturas y contenido de cada .mcaddon.
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${PYTHON:-python3}"; [ -x .venv/bin/python ] && PY=.venv/bin/python

echo "▶ npx tsc --noEmit"; npx --no-install tsc --noEmit && echo "  ✅ sin errores de tipos"

echo "▶ JSON válidos (python3 -m json.tool)"
n=0
while IFS= read -r -d '' f; do
  "$PY" -m json.tool "$f" >/dev/null || { echo "  ❌ $f"; exit 1; }; n=$((n+1))
done < <(find packs mundos.json -name '*.json' -print0)
echo "  ✅ $n archivos JSON válidos"

echo "▶ Texturas referenciadas existen y son PNG válidos"
"$PY" - <<'PY'
import glob, json, os, sys
missing = []
for atlas in glob.glob("packs/*/resource_pack/textures/*_texture.json") + glob.glob("packs/*/resource_pack/entity/*.json"):
    rp = atlas.split("/textures/")[0].split("/entity/")[0]
    data = json.load(open(atlas))
    paths = [v["textures"] for v in data.get("texture_data", {}).values()]
    if "minecraft:client_entity" in data:
        paths += list(data["minecraft:client_entity"]["description"]["textures"].values())
    for p in paths:
        f = os.path.join(rp, p + ".png")
        if not (os.path.isfile(f) and os.path.getsize(f) > 100 and open(f, "rb").read(8)[1:4] == b"PNG"):
            missing.append(f)
for icon in glob.glob("packs/*/*/"):
    if not os.path.isfile(icon + "pack_icon.png"): missing.append(icon + "pack_icon.png")
if missing:
    print("  ❌ faltan:", *missing, sep="\n     "); sys.exit(1)
print("  ✅ todas las texturas referenciadas existen")
PY

echo "▶ Paquetes .mcaddon"
"$PY" - <<'PY'
import json, sys, zipfile
mundos = json.load(open("mundos.json")); ok = True
for key, m in mundos.items():
    path = f"dist/{m['archivo']}.mcaddon"
    try:
        names = set(zipfile.ZipFile(path).namelist())
    except FileNotFoundError:
        print(f"  ❌ {path} no existe (ejecuta make bundle)"); ok = False; continue
    need = [f"{t}_{s}/manifest.json" for t in m["packs"] for s in ("BP", "RP")]
    need += [f"{t}_BP/scripts/{t}/main.js" for t in m["packs"]] + [f"{t}_BP/scripts/common/builder.js" for t in m["packs"]]
    need += [f"{t}_RP/pack_icon.png" for t in m["packs"]]
    miss = [n for n in need if n not in names]
    pngs = sum(n.endswith(".png") for n in names)
    print(f"  {'✅' if not miss else '❌'} {path}: {len(names)} entradas, {pngs} PNG" + (f" — faltan {miss}" if miss else ""))
    ok &= not miss
sys.exit(0 if ok else 1)
PY
echo "✅ Todas las comprobaciones pasaron"
