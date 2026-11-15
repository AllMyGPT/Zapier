#!/usr/bin/env bash
# FASE 1: verifica herramientas en macOS y la coherencia de los UUID de todos los manifests.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
check() { if command -v "$1" >/dev/null 2>&1; then printf '  ✅ %-8s %s\n' "$1" "$($2 2>&1 | head -1)"; else printf '  ❌ %-8s no encontrado — %s\n' "$1" "$3"; fail=1; fi; }
echo "Sistema: $(uname -s) $(uname -m)"
check python3 "python3 --version" "instala Xcode CLT: xcode-select --install"
check node    "node --version"    "brew install node"
check npx     "npx --version"     "viene con node"
check zip     "zip -v"            "brew install zip"
check docker  "docker --version"  "instala Docker Desktop: https://www.docker.com/products/docker-desktop/"
if command -v docker >/dev/null 2>&1; then
  docker info >/dev/null 2>&1 && echo "  ✅ Docker daemon en marcha" || echo "  ⚠️  Docker instalado pero no arrancado (abre Docker Desktop)"
fi
python3 - <<'PY' || fail=1
import glob, json, re, sys
pat = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
uuids, problems = [], []
for theme in sorted(glob.glob("packs/*")):
    bp = json.load(open(f"{theme}/behavior_pack/manifest.json")); rp = json.load(open(f"{theme}/resource_pack/manifest.json"))
    for m in (bp, rp):
        uuids += [m["header"]["uuid"]] + [mod["uuid"] for mod in m["modules"]]
    if not any(d.get("uuid") == rp["header"]["uuid"] for d in bp["dependencies"]):
        problems.append(f"{theme}: BP no depende de su RP")
bad = [u for u in uuids if not pat.match(u)]
if bad: problems.append(f"UUIDs inválidos: {bad}")
if len(uuids) != len(set(uuids)): problems.append("UUIDs duplicados")
if problems:
    print("  ❌ " + "; ".join(problems)); sys.exit(1)
print(f"  ✅ {len(uuids)} UUIDs válidos y únicos; cada BP enlaza su RP")
PY
exit $fail
