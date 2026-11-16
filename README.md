# Zapier

Repositorio para códigos para Zapier.

---

## Codex AI → Claude Code Importer

Conector simple que importa proyectos desde la API de Codex AI y los convierte
en proyectos listos para abrir en Claude Code.

### Requisitos

- Python 3.10+
- Una API Key de OpenAI / Codex AI

### Instalación

```bash
pip install -r requirements.txt
cp .env.example .env
# Edita .env y añade tu CODEX_API_KEY
```

### Uso

**Generar un proyecto nuevo desde un prompt:**

```bash
python codex_importer.py \
  --prompt "API REST con Flask para gestión de tareas" \
  --name mi_api \
  --lang python
```

**Importar un proyecto existente por su ID:**

```bash
python codex_importer.py --project-id task_abc123
```

**Especificar directorio de salida:**

```bash
python codex_importer.py \
  --prompt "Script de scraping con BeautifulSoup" \
  --name scraper \
  --output ./mis_proyectos
```

### Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `CODEX_API_KEY` | API Key de OpenAI/Codex (**obligatorio**) | — |
| `CODEX_API_BASE` | URL base de la API | `https://api.openai.com/v1` |
| `OUTPUT_DIR` | Carpeta de salida | `./imported_projects` |

### Resultado

El script crea una carpeta con:
- Los archivos de código generados o importados.
- `CLAUDE.md` con el contexto del proyecto para Claude Code.
- `codex_manifest.json` (solo en importación por ID) con los datos crudos del proyecto.
