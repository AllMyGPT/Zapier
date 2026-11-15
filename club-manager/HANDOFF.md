# Handoff · Pizarra Club Manager

Estado a 15 nov 2026, para continuar en otra sesión (Mac).

## Dónde está el código

- Repo: `AllMyGPT/Zapier`, carpeta `club-manager/`
- Rama: `claude/busy-noether-51g0mc`
- PR abierto: https://github.com/AllMyGPT/Zapier/pull/14 (Codex lo revisó; los 3 fallos que encontró ya están corregidos y subidos)

```bash
git clone https://github.com/AllMyGPT/Zapier.git && cd Zapier
git checkout claude/busy-noether-51g0mc
cd club-manager && npm install
npm run dev              # http://localhost:3000 (funciona sin Supabase, guarda en el navegador)
npm run sim -- rma 2     # simula 2 temporadas en consola
npx tsc --noEmit && npx next build   # comprobaciones
```

## Qué está hecho (y verificado)

- Juego completo: 5 ligas con ~2.150 jugadores reales 2025/26 + segundas divisiones (clubes reales, plantillas generadas), copas nacionales, Copa de Campeones, ascensos/descensos, multitemporada.
- Motor de partido calibrado (~2,7 goles/partido, ~23 % empates); temporada entera en ~5 s.
- Partido en directo 2D (canvas), tácticas, entrenamiento, fichajes con negociación, finanzas, estadio, personal, cantera, directiva y destitución.
- Guardado: autoguardado + 5 ranuras en el navegador (gzip) y 5 ranuras en Supabase con login email/contraseña.
- `tsc` y `next build` pasan; recorrido completo con Playwright sin errores de consola.

## Qué falta (siguiente paso)

### 1-2. Supabase: HECHO
- El usuario pidió no crear un proyecto nuevo. El juego es un **tenant aislado en el esquema `pizarra`** del proyecto EmotivOS (`fpjsbjybsnnyanxgygvn`, eu-central-1).
- La migración `pizarra_tenant_init` está aplicada: `pizarra.saves` y `pizarra.hall_of_fame` con RLS, y el esquema expuesto en la API (`public, extensions, clara, contabilidad, pizarra`).
- Verificado por REST: se puede leer `hall_of_fame` sin sesión y `saves` queda denegado sin login.
- Los avisos de seguridad no señalan nada en `pizarra`; los avisos que hay son de esquemas anteriores.
- URL y clave publishable en `.env.example` (son públicas por diseño).
- Pendiente de decidir: la Auth es compartida con EmotivOS. Comprobar si el registro por email está habilitado, porque si no los jugadores no podrán crear cuenta. Revisar también la Site URL o las Redirect URLs para el dominio de Vercel.

### 3. Vercel: PENDIENTE (bloqueado por permisos)
- Equipo Vercel: **Emotiv** (`team_kOJsKhnuFG3OlGNbvN8sGeRl`, slug `emotiv`). Todavía no hay ningún proyecto ligado a `AllMyGPT/Zapier`.
- Crear el proyecto vía MCP falló con **403 forbidden** (`create_project` y `create_git_project`). La cuenta conectada no tiene permiso para crear proyectos en el equipo; hace falta rol Owner o Member.
- Opciones:
  - Que un Owner suba el rol en Settings → Members y reintentar.
  - Hacerlo en local con la CLI (`npm i -g vercel`, `vercel login`).
  - Hacerlo desde el panel (vercel.com/new).
- Configuración a usar:
  - Nombre `pizarra-club-manager`, framework Next.js, **Root Directory `club-manager`**.
  - Variables (production, preview y development; son públicas por diseño):
    - `NEXT_PUBLIC_SUPABASE_URL=https://fpjsbjybsnnyanxgygvn.supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_RTR8othuGqBnouJGhpXe7w_QFdMENbt`
    - `NEXT_PUBLIC_SUPABASE_SCHEMA=pizarra`
  - Rama: `claude/busy-noether-51g0mc` hasta que se fusione el PR #14 (`main` aún no tiene el juego).
- Con la CLI, desde `club-manager/`:
  ```bash
  vercel link --scope emotiv --project pizarra-club-manager   # crea o enlaza el proyecto
  for k in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_SUPABASE_SCHEMA; do
    for e in production preview development; do grep "^$k=" .env.example | cut -d= -f2- | vercel env add $k $e; done
  done
  vercel --prod          # o `vercel` para una preview
  ```
  Si se usa `vercel link` desde `club-manager/`, revisar en Settings que Root Directory no quede duplicado.
- Después del despliegue:
  - En Supabase (EmotivOS) → Auth → URL Configuration, **añadir** la URL de Vercel a Redirect URLs. No cambiar la Site URL de EmotivOS.
  - Probar crear una cuenta, guardar en la nube y cargar.
- Decidido por el usuario: se acepta que la Auth sea compartida con EmotivOS.

## Arte y tema visual (15 nov 2026)
- Tema «noche de estadio» al estilo de los managers de los 2000, con diseño original: paneles de cristal con barras de título cromadas, botones con relieve, barra lateral con iconos propios, banner con foto en cada pantalla, teletipo de noticias, previa en el túnel, rótulo de gol, ficha de jugador tipo cromo y medidor de la directiva.
- Recursos en `public/art/` (WebP optimizados):
  - Fondos de Gemini (Nano Banana).
  - `stadium-loop.mp4/.webm`: Google Flow (Omni 1.2 Flash), con el mismo fotograma al inicio y al final para el bucle.
  - `og.jpg` y `keyart.webp`: Canva (diseño `DAHbAYdq8g8`).
  - `emblem.svg`: dibujado a mano en vector.
- Los originales a máxima resolución están en `art/raw/`, excluido de git. Son imágenes generadas, sin logos ni personas identificables.

## Escudos y fotos reales; tercera categoría en España (15 nov 2026)
- `scripts/fetch-media.ts` busca en Wikipedia el escudo de cada club y la foto de cada jugador real, y guarda las URLs (upload.wikimedia.org) en `public/media.json`.
  - El juego carga ese archivo al arrancar: `src/lib/media.ts`.
  - Si falta una imagen o no carga, se usa el escudo generado o la silueta.
  - En «Partida» hay un interruptor «Reales / Generados».
- Cobertura actual: unas 3/4 partes de los jugadores tienen foto. Se puede volver a ejecutar el script: solo busca lo que falta, en lotes de 50 títulos y con pausas, porque Wikipedia limita las peticiones.
- Derechos:
  - Los escudos son marcas de los clubes.
  - Muchas fotos de jugadores son libres en Commons pero piden atribución, y las de clubes suelen ser «non-free».
  - Antes de publicar el juego en abierto o con ingresos, revisar las licencias o dejar «Generados» por defecto.
- España tiene ahora tres categorías:
  - Liga, con 20 clubes.
  - Segunda, con los 22 clubes reales 2025/26.
  - Primera Federación, en dos grupos de 20 con los clubes reales 2025/26.
- Ascensos y descensos: suben los 2 primeros de cada grupo y bajan 4 de Segunda (`endSeason`, generalizado a N categorías y grupos).
- Las plantillas de Segunda y Primera Federación son generadas.
- La copa nacional tiene como máximo 32 equipos: toda Primera más un sorteo entre las categorías inferiores.
- Datos sin verificar: los estadios y aforos del Grupo 2 salieron de un resumen de Wikipedia, no de la tabla literal.

## Ideas pendientes (opcionales)
- Revisar plantillas dudosas en `src/data/leagues/*.ts` (formato `Nombre|POS|año|NAC|media|potencial`), p. ej. canteranos poco seguros en `esp.ts`: David Otorbi, Ismael Bekhoucha, Yellu Santiago, Dani Budesca.
- Los escudos son generados a propósito (no logos oficiales). Si se publica o monetiza, revisar los derechos de imagen de los nombres de jugadores.

## Mapa del código
```
src/data/leagues/   plantillas por liga
src/game/           engine.ts (partido), season.ts (bucle diario, copas, fin de temporada),
                    market.ts (fichajes), calendar.ts, player.ts, lineup.ts, tactics.ts, data.ts
src/components/     GameApp (shell), MatchView (canvas 2D), PlayerModal, screens/*
src/lib/            supabase.ts, storage.ts (guardado gzip local/nube)
scripts/sim-season.ts  simulación por consola para calibrar
```
