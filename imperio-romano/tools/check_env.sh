#!/usr/bin/env bash
# FASE 1: verifica herramientas en macOS y la coherencia de los UUID de los manifests.
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
  docker info >/dev/null 2>&1 && echo "  ✅ Docker daemon en marcha" || { echo "  ⚠️  Docker instalado pero no arrancado (abre Docker Desktop)"; }
fi
python3 - <<'PY' || fail=1
import json, re, sys
uuids = []
for p in ("behavior_pack/manifest.json", "resource_pack/manifest.json"):
    m = json.load(open(p))
    uuids += [m["header"]["uuid"]] + [mod["uuid"] for mod in m["modules"]]
pat = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
bad = [u for u in uuids if not pat.match(u)]
dup = len(uuids) != len(set(uuids))
bp = json.load(open("behavior_pack/manifest.json")); rp = json.load(open("resource_pack/manifest.json"))
linked = any(d.get("uuid") == rp["header"]["uuid"] for d in bp["dependencies"])
if bad or dup or not linked:
    print(f"  ❌ UUIDs: inválidos={bad} duplicados={dup} BP->RP enlazado={linked}"); sys.exit(1)
print(f"  ✅ {len(uuids)} UUIDs válidos, únicos y BP→RP enlazado")
PY
exit $fail
