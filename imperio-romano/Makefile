# Imperio Romano — atajos para el Mac de apoyo
SHELL := /bin/bash
PY ?= $(if $(wildcard .venv/bin/python),.venv/bin/python,python3)
COMPOSE := docker compose

.PHONY: help setup venv check-env assets build typecheck bundle validate all \
        server-up server-up-bridge bridge server-down logs console guide clean

help:            ## Lista de comandos
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-18s %s\n", $$1, $$2}'

setup: venv     ## Instala dependencias (Node + Pillow en .venv)
	npm ci || npm install

venv:
	@[ -x .venv/bin/python ] || python3 -m venv .venv
	@.venv/bin/pip install -q --upgrade pip Pillow

check-env:       ## FASE 1: verifica herramientas y UUIDs
	bash tools/check_env.sh

assets:          ## FASE 2: genera las texturas pixel-art
	$(PY) tools/generate_assets.py

typecheck:       ## Comprueba tipos de src/main.ts
	npx --no-install tsc --noEmit

build:           ## Compila src/main.ts -> behavior_pack/scripts/main.js
	npx --no-install tsc

bundle:          ## FASE 6: genera dist/ImperioRomano.mcaddon e inyecta en server-data/
	bash tools/bundle.sh

validate:        ## Checklist de aceptación
	bash tools/validate.sh

all: setup check-env bundle validate guide  ## Todo de una vez

server-up: bundle  ## Levanta el servidor Bedrock en Docker (puerto 19132)
	$(COMPOSE) up -d
	@echo "Servidor arrancando… primera vez tarda 1-2 min en descargar BDS. 'make logs' para verlo."
	@bash tools/guide.sh | sed -n '/OPCIÓN B/,$$p'

server-up-bridge: bundle  ## Servidor en 19134 + puente LAN nativo (si la Switch no lo ve)
	HOST_PORT=19134 $(COMPOSE) up -d
	HOST_PORT=19134 bash tools/lan_bridge.sh

bridge:          ## Solo el puente LAN (servidor ya levantado con HOST_PORT=19134)
	bash tools/lan_bridge.sh

server-down:     ## Para el servidor
	$(COMPOSE) down

logs:            ## Logs del servidor
	$(COMPOSE) logs -f --tail=100

console:         ## Consola del servidor (Ctrl+P Ctrl+Q para salir)
	docker attach imperio-romano

guide:           ## Imprime la guía rápida de conexión
	@bash tools/guide.sh

clean:           ## Borra dist/ y el JS compilado (no toca el mundo)
	rm -rf dist behavior_pack/scripts/main.js
