# Gran Estrategia — motor histórico de tres épocas

Motor de gran estrategia en tiempo real pausable, escrito en TypeScript. Un **núcleo común**
(mapa, calendario, ejércitos, batallas, asedios, guerras, paz, diplomacia, eventos, IA, guardado)
y **tres reglamentos** que cambian la economía y la política de cada época:

| Época | Reglamento | Mecánicas propias |
|---|---|---|
| Edad Media | `src/rulesets/medieval.ts` | Personajes con atributos y rasgos, dinastías, nacimientos/muertes, leyes de sucesión (primogenitura, gavelkind, antigüedad), uniones personales, vasallos con opinión y revueltas, límite de dominio, autoridad de la Corona, matrimonios, reclamaciones, asesinatos, piedad, excomunión y guerra santa |
| Edad Moderna | `src/rulesets/earlymodern.ts` | Estabilidad (−3…+3), presupuesto de investigación (5 ramas + estabilidad), 6 ejes de política interna, inflación y préstamos, centros de comercio y mercaderes, exploración y colonización, misioneros, descontento y rebeldes, agresividad, matrimonios reales, vasallaje diplomático, flota |
| Segunda Guerra Mundial | `src/rulesets/ww2.ts` | Capacidad industrial y reparto (producción, suministros, refuerzos, bienes de consumo, mejoras), recursos (energía, metal, raros, petróleo) con mercado mundial y bloqueo, cola de producción, 6 ramas de investigación, suministro y cercos, aviación (superioridad aérea y bombardeo estratégico), superioridad naval para cruzar el mar, disidencia, unidad nacional y capitulación, bloques (Eje, Aliados, Komintern), cobeligerancia, partisanos |

## Escenarios incluidos

- **1066 — El año de los tres reyes** (medieval): Haroldo, Guillermo y Hardrada; taifas y reinos cristianos; selyúcidas contra Bizancio; querella de las investiduras; Clermont.
- **Valdoria — La Corona de Ámbar** (medieval, fantasía **original**): un rey moribundo, una heredera niña y siete grandes casas. Mapa propio.
- **1492 — Un Nuevo Mundo** (moderna): Colón, Tordesillas, guerras de Italia, unión de las coronas, Reforma, Cortés y Pizarro, Selim y Mohács.
- **1936 — El camino a la guerra** y **1939 — Fall Weiss** (SGM): guerra civil española, Anschluss, Múnich, pacto germano-soviético, Fall Weiss, Guerra de Invierno, Weserübung, Fall Gelb, Barbarroja, entrada de EE. UU.

> **Sobre derechos:** es un juego original *del mismo género* que los clásicos de gran estrategia, no una copia.
> No usa nombres, arte, interfaz, mapas ni ficheros de escenario/mods de juegos comerciales (los mods de esos juegos
> derivan de ficheros con licencia de usuario). Los escenarios se basan en hechos históricos, que son de dominio público.
> Por el mismo motivo no se incluye contenido de *Juego de tronos* (propiedad de su autor y de HBO); en su lugar hay un escenario de fantasía feudal original.

## Cómo jugar

- **Clic** en una provincia para verla; **clic en un ejército** para seleccionarlo; **clic derecho** (o toque, en móvil) en el destino para moverlo.
- Rueda / pellizco para hacer zoom; arrastrar para desplazar el mapa.
- `Espacio` pausa, `1`–`5` cambian la velocidad.
- Pestañas: Provincia · Ejército · Estado (acciones del reglamento) · Diplomacia · Guerras (negociación de paz) · Dinastía/Corte · Producción · Registro.

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # simula cada escenario 3 años y comprueba invariantes
npm run build        # exportación estática en out/
```

Inspeccionar la historia emergente de un escenario sin jugador humano:

```bash
SC=ww1939 Y=4 N=200 npx vitest run tests/sim.inspect.test.ts
```

### Despliegue en Vercel

El proyecto es una exportación estática (`output: 'export'`). En Vercel, crea un proyecto con
**Root Directory = `grand-strategy`**; `vercel.json` ya indica el comando de build y la carpeta `out`.

### Partidas en la nube con Supabase (opcional)

1. Crea un proyecto en Supabase y aplica `supabase/migrations/0001_saves.sql` (tabla `saves` con RLS por usuario).
2. Activa el inicio de sesión por correo (enlace mágico) y añade la URL de Vercel en *Auth → URL Configuration*.
3. Define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`) en Vercel.

Sin estas variables, las partidas se guardan en el navegador o en la app de escritorio.

### App de escritorio (macOS)

```bash
npm run build && npm run desktop          # abre la app con Electron
npm run desktop:build:mac                 # genera .dmg y .zip en dist/ (ejecutar en un Mac)
```

En el navegador también se puede instalar como aplicación (manifiesto PWA).

## Arquitectura

```
src/engine/       núcleo: tipos, calendario y RNG determinista, grafo del mapa, simulación, IA, comandos
src/rulesets/     un fichero por época (implementan la interfaz Ruleset) + utilidades comunes
src/data/         provincias (coordenadas reales), mapa de fantasía y escenarios
src/components/   interfaz React: menú, mapa SVG (Voronoi), paneles
src/lib/          geometría del mapa y guardado (local / Supabase)
electron/         envoltorio de escritorio
```

Todas las órdenes del jugador pasan por `applyCommand` y la simulación usa un RNG con semilla guardada en el estado,
lo que deja preparada la base para multijugador por turnos de comandos (lockstep).

### Añadir un escenario

Crea un fichero en `src/data/scenarios/` que exporte un `Scenario` (naciones con sus provincias, personajes,
ejércitos, relaciones y eventos con condiciones/efectos declarativos) y añádelo a `src/data/scenarios/index.ts`.
