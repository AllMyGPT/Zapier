# 🏛️ Imperio Romano — mod para Minecraft Bedrock (Nintendo Switch)

Add-on de Bedrock (behavior pack + resource pack + Script API) que llega a una
Nintendo Switch **sin modificar la consola**, por dos vías:

| Vía | Qué genera | Para qué |
|-----|------------|----------|
| **A. Realm → "Descargar mundo"** | `dist/ImperioRomano.mcaddon` | Llevar el mundo con el mod a la memoria de la Switch y jugar offline para siempre. |
| **B. Servidor local en el Mac** | `docker-compose.yml` + `server-data/` | Servidor Bedrock oficial en el Mac con el mod inyectado y `texturepack-required=true`: la Switch se descarga los packs al entrar desde **Amigos → Partidas LAN**. |

## Puesta en marcha en el Mac de apoyo

Requisitos: Xcode Command Line Tools (`python3`, `zip`), Node 18+ y [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone <este repo> && cd Zapier/imperio-romano
make all          # dependencias + comprobación del entorno + build + .mcaddon + checklist + guía
make server-up    # levanta el servidor (Docker) (TCP 19132)
```

`make server-up` detecta la IP del Mac en la Wi-Fi (`ipconfig getifaddr en0`); si falla, pásala a mano:
`make server-up HOST_IP=192.168.1.20`. El servidor Bedrock actual (1.26.50+, transporte NetherNet) usa
**TCP 19132** para conectar, **UDP 19140-19147** para el juego y **UDP 7551** para anunciarse en la LAN.

Si la Switch no ve la partida en **Partidas LAN** (Docker Desktop corre en una VM y puede no recibir
los broadcasts de la consola): en Docker Desktop → Settings → Resources → Network activa
**Enable host networking**, reinicia Docker y luego:

```bash
make server-down
make server-up-host     # mismo servidor, con la red del host
```

Otros comandos: `make help`, `make logs`, `make console`, `make server-down`, `make guide`.

> La Switch y el servidor deben tener **la misma versión de Minecraft**. El contenedor usa
> `VERSION=LATEST`, así que actualiza el juego en la Switch. Mac → Ajustes → Red → Firewall:
> permite las conexiones entrantes de Docker.

## Contenido del mod

- **Gladius** (`roma:gladius`): daño 8, durabilidad 400, reparable con hierro.
- **Pilum** (`roma:pilum`): se lanza al usarlo (raycast de 20 bloques, 10 de daño, perfora y bloquea escudos 5 s). Se consume 1 unidad (no en creativo).
- **Denario Imperial** (`roma:denarius`): moneda; caen 1–3 al matar hostiles o gladiadores.
- **Columna de Mármol** (`roma:marble_pillar`) y **Altar del Coliseo** (`roma:colosseum_altar`, luz 7).
- **Legionario** (`roma:legionary`): 40 de vida, ataque 7, defiende de monstruos, no recibe daño de jugadores y comercia: denarios → pan, gladius, pilum y manzanas doradas. Huevo de generación en el inventario creativo.
- **Formación Testudo**: agachado con gladius o escudo en cualquier mano → Resistencia II + Lentitud I.
- **Coliseo**: pulsa un Altar del Coliseo o escribe `/roma:coliseo` → cuerno, título *¡AVE CÉSAR!* y oleada de *Gladiador Murmillo* (zombi) y *Gladiador Retiarius* (esqueleto) con armadura de hierro/oro. 30 s de espera entre oleadas por altar.

## Estructura

```
imperio-romano/
├── Makefile, docker-compose.yml, docker-compose.host.yml, package.json, tsconfig.json
├── src/main.ts                  # mecánicas (TypeScript → behavior_pack/scripts/main.js)
├── behavior_pack/               # manifest, items/, blocks/, entities/, trading/, loot_tables/
├── resource_pack/               # manifest, textures/ (PNG generados), entity/, texts/, blocks.json
├── tools/
│   ├── check_env.sh             # FASE 1: herramientas + UUIDs
│   ├── generate_assets.py       # FASE 2: texturas pixel-art (Pillow)
│   ├── bundle.sh                # FASE 6: .mcaddon/.mcpack + inyección en server-data/
│   ├── validate.sh              # checklist de aceptación
│   └── guide.sh                 # guía rápida de conexión
├── dist/                        # (generado) ImperioRomano.mcaddon
└── server-data/                 # (generado) datos del servidor y mundo
```

Script API: `@minecraft/server` **2.1.0** (estable, sin experimentos), así que funciona en Realms
y en servidores sin activar "funciones experimentales".
