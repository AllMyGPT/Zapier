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
