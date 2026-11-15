# Handoff — Gran Estrategia

Estado al 15-nov-2026. Rama `claude/historical-strategy-game-engine-7gcbv9` · PR **AllMyGPT/Zapier#15** (abierto, sin CI en el repo).

## Arranque local

```bash
git clone https://github.com/AllMyGPT/Zapier && cd Zapier
git checkout claude/historical-strategy-game-engine-7gcbv9
cd grand-strategy && npm install
npm run dev                 # http://localhost:3000
npm test                    # 10 tests: 5 escenarios simulan 3 años + reglas de paz/territorio
npm run build               # exportación estática en out/
npm run desktop             # Electron (tras build). Mac: npm run desktop:build:mac (genera .dmg)
SC=ww1939 Y=4 N=200 npx vitest run tests/sim.inspect.test.ts   # ver la historia emergente sin jugador
```

## Qué hay

- **Motor** `src/engine/`: `core.ts` (simulación diaria, movimiento, batallas, asedios, guerras/cobeligerancia, paz, eventos, IA, comandos), `map.ts` (grafo: tierra por masa continental, estrechos, rutas marítimas), `types.ts`, `util.ts` (RNG determinista + calendario), `ruleset.ts` (interfaz).
- **Reglamentos** `src/rulesets/`: `medieval.ts` (personajes, dinastías, sucesión, vasallos, intrigas, piedad, cruzadas), `earlymodern.ts` (estabilidad, presupuesto/tecnología, políticas, comercio, colonización, religión, rebeldes), `ww2.ts` (CI, recursos+mercado/bloqueo, producción, investigación, suministro/cercos, aire, naval, capitulación, bloques). `common.ts` = nombres, rasgos, colas.
- **Datos** `src/data/`: `provinces.ts` (~215 provincias con lon/lat reales), `fantasy.ts` (mapa original Valdoria), `maps.ts`, `scenarios/` (1066, Valdoria, 1492, 1936, 1939).
- **UI** `src/components/`: `Menu.tsx`, `Game.tsx` (bucle, barra superior, modales), `MapView.tsx` (SVG Voronoi, zoom/pan/pellizco), `Panels.tsx` (provincia, ejército, estado, diplomacia, guerras/paz, dinastía, producción, registro). Estilos en `src/app/globals.css`. Geometría en `src/lib/geometry.ts`.
- **Guardado** `src/lib/saves.ts`: localStorage (máx. 20) + Supabase.
- **Escritorio** `electron/main.cjs` (protocolo `app://`). Verificado arrancando en Linux; `.dmg` sin generar (requiere Mac).

## Infraestructura

- **Supabase (hecho)**: tenant independiente en el proyecto existente **EmotivOS** (`fpjsbjybsnnyanxgygvn`), esquema `gran_estrategia`, tabla `saves` con RLS por usuario, sin acceso `anon`. Esquema añadido a `pgrst.db_schemas` del rol `authenticator` (se conservaron `public, extensions, clara, contabilidad`). Aislamiento verificado. Config pública en `.env.production`. Migración documentada en `supabase/migrations/0001_saves.sql`.
  - Los jugadores comparten `auth.users` con las demás apps de EmotivOS.
  - Pendiente: añadir la URL de despliegue en *Auth → URL Configuration → Redirect URLs*.
- **Vercel (bloqueado)**: 403 al crear proyecto en el equipo Emotiv (falta permiso). Al importar el repo: Root Directory `grand-strategy`; `vercel.json` ya define build y `out/`.
- **Canva**: portada generada (media `MAHbADtN3t0`); en `public/cover.png` solo hay miniatura 198×112 usada difuminada. Pantallas de carga (medieval, moderna, SGM) y escudos fallaron por `quota_cooldown`. Prompts usados: óleo, sin texto, sin símbolos políticos.

## Límites de derechos (mantener)

Juego original del género. No usar nombres/arte/UI/mapas/ficheros o mods de Paradox, ni contenido de *Juego de tronos*. Escenarios = hechos históricos; Valdoria es fantasía original.

## Próximo trabajo pedido: "mejora las gráficas y completa el juego"

### Gráficos (prioridad)
1. **Mapa**: costas suavizadas (curvas en vez de polígonos Voronoi), relieve/textura por terreno, bordes nacionales más gruesos que los provinciales, nombres de país grandes en curva sobre su territorio, ríos principales, niebla de guerra opcional.
2. **Unidades**: iconos por tipo (infantería/caballería/blindados…) en lugar de cajas con número; animación de movimiento interpolada entre provincias; indicador de batalla animado.
3. **Arte**: pantallas de carga por época, portada a resolución completa, escudos/banderas originales por nación (generables por código como SVG heráldico procedural para no depender de Canva).
4. **UI**: retratos procedurales de personajes, árbol genealógico gráfico, gráficas de economía (ingresos, CI), pantalla de resumen de batalla, tooltips ricos.
5. **Audio**: música/efectos libres de derechos (opcional).

### Completar el juego
- **Naval y aéreo como unidades en el mapa** (flotas en zonas marítimas, transporte, combate naval; alas aéreas asignables a provincias). Hoy son abstractos.
- **Más escenarios**: 1187 (Tercera Cruzada), 1618 (Guerra de los Treinta Años), 1700/1756, 1941 (Barbarroja), Pacífico/Asia (requiere ampliar el mapa: hoy Europa, Mediterráneo, Atlántico y algo de América/África).
- **Diplomacia**: acceso militar, garantías explícitas, embargo/comercio de recursos (SGM), ministros/gobierno (SGM), matrimonios con más reglas (medieval).
- **IA**: frentes coordinados, desembarcos, mejor uso de reclamaciones; balance de 1066/1492 a largo plazo.
- **Partida**: tutorial, condiciones de victoria por escenario, logros, opciones de dificultad.
- **Multijugador**: el motor ya es determinista y todo pasa por `applyCommand` → lockstep con Supabase Realtime.
- **Rendimiento**: `ww2.supplied()` hace BFS diario por nación (≈2 ms/día); cachear por semana si se amplía el mapa.

## Gotchas

- La lógica de juego vive en el estado serializable (`GameState`); los reglamentos se registran al importar `@/rulesets` (lo hace `src/data/scenarios/index.ts`).
- `isFriendly` da prioridad a la hostilidad (una nación puede ser aliada en una guerra y enemiga en otra).
- Paz general solo entre líderes de ambos bandos; si no, paz por separado.
- Tests de inspección (`tests/*.inspect.test.ts`) solo corren con la variable `SC` definida.
- Playwright: `text=` es subcadena; usar `h3:text-is("...")` para las tarjetas del menú.

## Actualización 15-nov-2026 (noche): gráficos, historia, dinastías, nuevos escenarios

- **Escenarios**: 1066, Valdoria, 1492, **1914 (`ww1.ts`)**, **Guerra Civil 1936 (`spain.ts`)**, 1936, 1939 y **2014–2050 (`modern.ts`, mapa `world`)**. 1914/España/2014 usan las reglas `ww2` con `options` (`allowedUnits`, `artEra`, `aiRace`) y `menu` para agruparlos.
- **Historia**: `src/data/story/{medieval,earlymodern,ww2}.ts` (cadenas `trigger`/`triggeredOnly`, misiones, `POOL` dinámico). `tests/story.test.ts` valida todas las referencias.
- **Motor nuevo**: misiones (`missions.ts`, genéricas para quien no tiene árbol), crónica permanente (`s.chronicle`), puntuación (`nationScore`), historial de guerras (`s.record`), condiciones/efectos ampliados, cansancio de guerra, IA con rivales/alianzas/reclamaciones antes de declarar, disciplina presupuestaria (1492), rebeldes que se disuelven tras concesiones.
- **Dinastías** (`rulesets/dynasty.ts`): bodas con personajes reales, derechos de sangre, uniones personales, pretendientes y «Coronar al pretendiente»; renombre de casas. **Romance** (`rulesets/romance.ts`): amantes, bastardos, celos, cartas, chantajes. Genealogías históricas reales en 1066 y 1492.
- **Fundador propio**: `FounderDef` en `createGame` y `FounderForm.tsx`.
- **Arte** (`public/art`, ~29 MB, Gemini + Flow): texturas sin costuras (`scripts/seamless.sh`), costas reales Natural Earth (`scripts/build-land.mjs [earth|world]`), 133 retratos (`{era}-{w|e|i}-{m|f}-{c|y|a|o}[-2].jpg`), escenas de evento por época, pantallas de carga, vídeo de menú.
- **Rendimiento**: índice de provincias por dueño (`touchOwners` en cada cambio de dueño) y caché de suministro: 2014 pasó de ~30 a ~2 ms/día.
- **Móvil**: mapa a pantalla completa, panel como hoja inferior, zoom táctil.
- **Inspección** (solo con `SC=x`): `metrics`, `playtest` (`PT=1`), `revolts` (`RV=1`), `econ` (`EC=1`), `perf` (`PF=1`).
- **Pendiente**: comprimir el arte (WebP), efecto «hacer la paz» y «salir de facción» para eventos, provincias de Polonia/Báltico/Finlandia para 1914, frente ucraniano más fiel.

### 16-nov-2026: mundo completo y producción
- **Producción**: https://gran-estrategia.vercel.app (proyecto `gran-estrategia`, equipo Emotiv; `vercel deploy --prod` desde `grand-strategy/`; `vercel.json` como sitio estático `out/`). Next.js actualizado a 15.5.29 (CVE-2025-66478).
- **Mapa `world`**: 592 provincias (`provinces_world.ts`), 180 Estados; `world_index.ts` con país ISO de 2014 y región. Costas: `node scripts/build-land.mjs world`.
- **`options.fullWorld`** en ww1914, spain1936, ww1936, ww1939 y mod2014: el test exige que ninguna provincia empiece sin dueño.
- **Motor**: índices de provincias y ejércitos por dueño, IA militar con candidatos por nación (≤3,5 ms/día), fix de capitulación simultánea y coste mínimo de paz al pedir provincias.
- **Pendiente**: añadir la URL de producción a *Supabase → Auth → Redirect URLs* para el guardado en la nube; comprimir el arte.
