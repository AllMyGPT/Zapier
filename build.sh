#!/usr/bin/env bash
# build.sh — Empaqueta el tema en un ZIP instalable desde WordPress
# Uso: ./build.sh [version]
# Ejemplo: ./build.sh 1.0.0
set -euo pipefail

THEME_SLUG="wf2gutenberg"
VERSION="${1:-$(date +%Y%m%d)}"
OUT_DIR="dist"
TEMP_DIR=$(mktemp -d)

echo "▶ Empaquetando tema ${THEME_SLUG} v${VERSION}..."

# Copia theme/ → temp/wf2gutenberg/
cp -r theme/ "${TEMP_DIR}/${THEME_SLUG}"

# Inyecta la versión en style.css
sed -i "s/^Version:.*/Version: ${VERSION}/" "${TEMP_DIR}/${THEME_SLUG}/style.css"

# Crea el directorio de salida si no existe
mkdir -p "${OUT_DIR}"

# Genera el ZIP
ZIP_PATH="${OUT_DIR}/${THEME_SLUG}.zip"
(cd "${TEMP_DIR}" && zip -r - "${THEME_SLUG}" \
  --exclude "*.DS_Store" \
  --exclude "*__MACOSX*" \
  --exclude "*.git*" \
) > "${ZIP_PATH}"

# Limpieza
rm -rf "${TEMP_DIR}"

SIZE=$(du -sh "${ZIP_PATH}" | cut -f1)
echo "✅ ZIP generado: ${ZIP_PATH} (${SIZE})"
echo ""
echo "📦 Instalación en WordPress:"
echo "   Apariencia → Temas → Añadir nuevo → Subir tema → ${THEME_SLUG}.zip"
