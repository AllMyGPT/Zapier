# Mundos Minecraft (Roma · Aldea Gala · Galaxia) — atajos para el Mac de apoyo
SHELL := /bin/bash
PY ?= $(if $(wildcard .venv/bin/python),.venv/bin/python,python3)
COMPOSE := docker compose
# IP del Mac en la red local (Wi-Fi en0, si no Ethernet en1). Se puede forzar: make server-up HOST_IP=192.168.1.20
HOST_IP ?= $(shell ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
export HOST_IP
# Mundo que sirve el servidor local: romano | galos | galaxia
MUNDO ?= romano
export MUNDO
export SERVER_NAME := $(shell python3 -c "import json;print(json.load(open('mundos.json'))['$(MUNDO)']['titulo'])" 2>/dev/null)

.PHONY: help setup venv check-env assets build typecheck bundle validate all \
        server-up server-up-host server-down logs console guide clean

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

typecheck:       ## Comprueba tipos de src/
	npx --no-install tsc --noEmit

build:           ## Compila src/ -> build/scripts
	npx --no-install tsc

bundle:          ## Genera dist/*.mcaddon (3 mundos) e inyecta los packs en server-data/
	bash tools/bundle.sh

validate:        ## Checklist de aceptación
	bash tools/validate.sh

all: setup check-env bundle validate guide  ## Todo de una vez

server-up: bundle  ## Levanta el servidor: make server-up MUNDO=romano|galos|galaxia
	@[ -n "$(SERVER_NAME)" ] || { echo "MUNDO desconocido: $(MUNDO). Usa romano, galos o galaxia"; exit 1; }
	@[ -n "$(HOST_IP)" ] || { echo "No se pudo detectar la IP del Mac. Usa: make server-up HOST_IP=192.168.x.y"; exit 1; }
	$(COMPOSE) up -d --force-recreate
	@echo "Servidor '$(SERVER_NAME)' arrancando en $(HOST_IP)… la primera vez tarda 1-2 min en descargar BDS. 'make logs' para verlo."
	@bash tools/guide.sh | sed -n '/OPCIÓN B/,$$p'

server-up-host: bundle  ## Igual pero con red del host (si la Switch no ve la partida LAN)
	@[ -n "$(SERVER_NAME)" ] || { echo "MUNDO desconocido: $(MUNDO)"; exit 1; }
	$(COMPOSE) -f docker-compose.yml -f docker-compose.host.yml up -d --force-recreate
	@echo "Servidor arrancando con red del host (requiere 'Enable host networking' en Docker Desktop)."

server-down:     ## Para el servidor
	$(COMPOSE) down --remove-orphans

logs:            ## Logs del servidor
	$(COMPOSE) logs -f --tail=100

console:         ## Consola del servidor (Ctrl+P Ctrl+Q para salir)
	docker attach mundos-minecraft

guide:           ## Imprime la guía rápida de conexión
	@bash tools/guide.sh

clean:           ## Borra dist/ y el JS compilado (no toca el mundo)
	rm -rf dist build
