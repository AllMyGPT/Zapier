#!/usr/bin/env python3
"""
Codex AI → Claude Code Importer
Importa proyectos desde la API de Codex AI y los convierte
en una estructura de proyecto lista para Claude Code.
"""

import os
import sys
import json
import argparse
import re
from pathlib import Path
from datetime import datetime

try:
    import requests
except ImportError:
    sys.exit("Instala dependencias: pip install -r requirements.txt")


CODEX_API_BASE = os.getenv("CODEX_API_BASE", "https://api.openai.com/v1")
CODEX_API_KEY = os.getenv("CODEX_API_KEY", "")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./imported_projects")


def get_headers() -> dict:
    if not CODEX_API_KEY:
        sys.exit("Error: define CODEX_API_KEY en tu entorno o en .env")
    return {
        "Authorization": f"Bearer {CODEX_API_KEY}",
        "Content-Type": "application/json",
    }


def fetch_codex_project(project_id: str) -> dict:
    """Obtiene los datos de un proyecto desde la API de Codex AI."""
    url = f"{CODEX_API_BASE}/tasks/{project_id}"
    response = requests.get(url, headers=get_headers(), timeout=30)
    response.raise_for_status()
    return response.json()


def generate_code_from_prompt(prompt: str, language: str = "python") -> str:
    """Genera código usando el modelo de Codex/GPT."""
    payload = {
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": (
                    f"Eres un asistente experto en {language}. "
                    "Genera código limpio, bien estructurado y listo para producción. "
                    "Responde ÚNICAMENTE con el código, sin explicaciones adicionales."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    url = f"{CODEX_API_BASE}/chat/completions"
    response = requests.post(url, headers=get_headers(), json=payload, timeout=60)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def parse_files_from_response(content: str) -> list[dict]:
    """
    Extrae bloques de código de la respuesta del modelo.
    Soporta bloques ```lang\nfilename\n...``` o marcadores # filepath:
    """
    files = []

    # Patrón: ```lang\n# filename: path\n...código...```
    block_pattern = re.compile(
        r"```(?P<lang>\w+)?\n(?:#\s*(?:filename|filepath|file):\s*(?P<path>[^\n]+)\n)?(?P<code>.*?)```",
        re.DOTALL,
    )
    for match in block_pattern.finditer(content):
        path = match.group("path")
        code = match.group("code").strip()
        lang = match.group("lang") or "txt"
        if not path:
            ext = {"python": ".py", "javascript": ".js", "typescript": ".ts",
                   "bash": ".sh", "json": ".json"}.get(lang, f".{lang}")
            path = f"main{ext}"
        files.append({"path": path, "content": code})

    # Si no se detectaron bloques, guarda el contenido completo como main.py
    if not files and content.strip():
        files.append({"path": "main.py", "content": content.strip()})

    return files


def build_claude_md(project_name: str, description: str, files: list[dict]) -> str:
    """Genera el archivo CLAUDE.md con contexto del proyecto."""
    file_list = "\n".join(f"- `{f['path']}`" for f in files)
    return f"""# {project_name}

Importado desde Codex AI el {datetime.now().strftime('%Y-%m-%d %H:%M')}.

## Descripción
{description}

## Archivos del proyecto
{file_list}

## Cómo usar
1. Abre esta carpeta en Claude Code.
2. Revisa cada archivo y ajusta según sea necesario.
3. Ejecuta los tests o el punto de entrada principal.
"""


def import_from_prompt(prompt: str, project_name: str, language: str, output_base: Path) -> Path:
    """Genera un proyecto a partir de un prompt y lo guarda en disco."""
    print(f"Generando código para: {project_name!r}...")
    raw_content = generate_code_from_prompt(prompt, language)
    files = parse_files_from_response(raw_content)

    project_dir = output_base / project_name
    project_dir.mkdir(parents=True, exist_ok=True)

    for file_info in files:
        dest = project_dir / file_info["path"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(file_info["content"], encoding="utf-8")
        print(f"  Creado: {dest.relative_to(output_base)}")

    claude_md = project_dir / "CLAUDE.md"
    claude_md.write_text(
        build_claude_md(project_name, prompt, files), encoding="utf-8"
    )
    print(f"  Creado: {claude_md.relative_to(output_base)}")

    return project_dir


def import_from_project_id(project_id: str, output_base: Path) -> Path:
    """Importa un proyecto existente por su ID desde la API de Codex AI."""
    print(f"Obteniendo proyecto {project_id!r} desde Codex AI...")
    data = fetch_codex_project(project_id)

    project_name = data.get("name", project_id).replace(" ", "_")
    description = data.get("description", "Sin descripción")
    files_data = data.get("files", [])

    if not files_data and data.get("output"):
        files_data = parse_files_from_response(data["output"])

    project_dir = output_base / project_name
    project_dir.mkdir(parents=True, exist_ok=True)

    for file_info in files_data:
        dest = project_dir / file_info["path"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(file_info.get("content", ""), encoding="utf-8")
        print(f"  Creado: {dest.relative_to(output_base)}")

    claude_md = project_dir / "CLAUDE.md"
    claude_md.write_text(
        build_claude_md(project_name, description, files_data), encoding="utf-8"
    )

    manifest = project_dir / "codex_manifest.json"
    manifest.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Manifest guardado: {manifest.relative_to(output_base)}")

    return project_dir


def main():
    parser = argparse.ArgumentParser(
        description="Importa proyectos de Codex AI a Claude Code",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  # Generar proyecto desde un prompt
  python codex_importer.py --prompt "API REST con Flask para gestión de tareas" \\
                            --name mi_api --lang python

  # Importar proyecto existente por ID
  python codex_importer.py --project-id task_abc123

  # Especificar directorio de salida
  python codex_importer.py --prompt "Script de scraping con BeautifulSoup" \\
                            --name scraper --output ./mis_proyectos
        """,
    )
    parser.add_argument("--prompt", help="Descripción del proyecto a generar")
    parser.add_argument("--name", default="proyecto_codex", help="Nombre del proyecto (default: proyecto_codex)")
    parser.add_argument("--lang", default="python", help="Lenguaje principal (default: python)")
    parser.add_argument("--project-id", dest="project_id", help="ID de proyecto existente en Codex AI")
    parser.add_argument("--output", default=OUTPUT_DIR, help=f"Directorio de salida (default: {OUTPUT_DIR})")

    args = parser.parse_args()

    if not args.prompt and not args.project_id:
        parser.error("Debes indicar --prompt o --project-id")

    output_base = Path(args.output)
    output_base.mkdir(parents=True, exist_ok=True)

    if args.project_id:
        project_dir = import_from_project_id(args.project_id, output_base)
    else:
        project_dir = import_from_prompt(args.prompt, args.name, args.lang, output_base)

    print(f"\nProyecto importado en: {project_dir.resolve()}")
    print("Abre esa carpeta en Claude Code para continuar.")


if __name__ == "__main__":
    main()
