# 🏛️ ⚔️ 🚀 Mundos Minecraft para Nintendo Switch 2

Tres mundos temáticos de Minecraft Bedrock (add-ons + escenarios que se construyen solos) que llegan
a una **Nintendo Switch 2 sin modificarla**:

| Mundo | Archivo | Qué trae |
|-------|---------|----------|
| **Mundo Romano** | `dist/MundoRomano.mcaddon` | Foro de mármol, templo, Coliseo con altar, legionarios comerciantes, gladius, pilum, denarios, formación Testudo y oleadas de gladiadores. |
| **Aldea Gala** | `dist/AldeaGala.mcaddon` | Aldea con empalizada y chozas, caldero del druida, **poción mágica** (fuerza sobrehumana: tus golpes lanzan a los enemigos por los aires), menhires que se pueden lanzar, jabalíes y banquete, campamento romano vecino. Incluye el pack romano. |
| **Galaxia** | `dist/Galaxia.mcaddon` | Puesto avanzado en el desierto con cúpulas, vaporizadores, cantina y nave de desembarco; espadas de plasma (azul, verde, roja) con empuje telequinético, bláster, baliza de invasión con soldados imperiales y droides, créditos galácticos. |

> Inspirado en los cómics de galos y en la ópera espacial, pero con nombres y arte propios (sin
> personajes, logotipos ni marcas registradas), para poder compartirlo sin problemas.

## Cómo llegan los mundos a la Switch 2

Comprobado a noviembre de 2026: la Switch 2 (también la edición nativa del 27-oct-2026) **no permite
importar `.mcaddon` ni añadir servidores**, y los atajos por DNS no funcionan con el nuevo protocolo de
red. Lo que sí funciona de forma oficial:

1. **Realms → "Descargar mundo" (recomendado).** Importas los `.mcaddon` en un iPhone/iPad, creas cada
   mundo, lo subes a tu Realm y desde la Switch 2 pulsas *Descargar mundo*. La copia queda en la consola
   con sus mods y se juega offline para siempre. Requiere suscripción a Realms.
2. **Servidor en el Mac por LAN.** El servidor oficial Bedrock en Docker con los packs inyectados y
   `texturepack-required=true`; la Switch lo ve en *Amigos → Partidas LAN* y descarga los packs al entrar.

`make guide` imprime los pasos detallados de ambas vías.

## Puesta en marcha en el Mac de apoyo

Requisitos: Xcode Command Line Tools (`python3`, `zip`), Node 18+ y [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone <este repo> && cd Zapier/mundos-minecraft
make all                          # dependencias + entorno + build + 3 .mcaddon + checklist + guía
make server-up MUNDO=romano       # o MUNDO=galos / MUNDO=galaxia
```

`make server-up` detecta la IP del Mac en la Wi-Fi (`ipconfig getifaddr en0`); si falla, pásala a mano:
`make server-up HOST_IP=192.168.1.20`. El servidor Bedrock actual (1.26.50+, transporte NetherNet) usa
**TCP 19132** para conectar, **UDP 19140-19147** para el juego y **UDP 7551** para anunciarse en la LAN.
Cada mundo guarda su progreso en `server-data/worlds/<mundo>`; cambiar de mundo no borra los demás.

Si la Switch no ve la partida en **Partidas LAN** (Docker Desktop corre en una VM y puede no recibir
los broadcasts de la consola): en Docker Desktop → Settings → Resources → Network activa
**Enable host networking**, reinicia Docker y luego:

```bash
make server-down
make server-up-host MUNDO=galos   # mismo servidor, con la red del host
```

Otros comandos: `make help`, `make logs`, `make console`, `make server-down`, `make guide`.

> La Switch y el servidor deben tener **la misma versión de Minecraft** (`VERSION=LATEST`): actualiza
> el juego en la consola. Mac → Ajustes → Red → Firewall: permite las conexiones entrantes de Docker.

## Cómo se construyen los escenarios

Cada pack registra un escenario (`src/<tema>/main.ts` → `registerScenario`). La primera vez que alguien
entra al mundo, el script explana el terreno alrededor del jugador y levanta las construcciones por tandas
(`system.runJob`), fija ahí el punto de aparición y deja un cofre con el equipo inicial. Un operador puede
repetirlo donde esté con `/roma:construir`, `/galos:construir` o `/galaxia:construir`.

## Estructura

```
mundos-minecraft/
├── Makefile, docker-compose.yml, docker-compose.host.yml, mundos.json, package.json, tsconfig.json
├── src/
│   ├── common/        # util.ts (raycast, oleadas, recompensas) y builder.ts (escenarios)
│   ├── roma/main.ts   # Testudo, pilum, Coliseo, denarios, Foro
│   ├── galos/main.ts  # poción mágica, menhir, jabalíes, aldea
│   └── galaxia/main.ts# espadas de plasma, bláster, invasión, puesto avanzado
├── packs/<tema>/{behavior_pack,resource_pack}   # roma · galos · galaxia
├── tools/             # check_env.sh · generate_assets.py · bundle.sh · validate.sh · guide.sh
├── dist/              # (generado) MundoRomano/AldeaGala/Galaxia.mcaddon + packs/*.mcpack
└── server-data/       # (generado) servidor y mundos
```

Script API: `@minecraft/server` **2.1.0** (estable, sin funciones experimentales), por lo que funciona
en Realms, en la Switch y en el servidor dedicado. Versión mínima del juego: 1.21.100.
