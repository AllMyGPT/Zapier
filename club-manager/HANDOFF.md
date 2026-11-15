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

## Ideas pendientes (opcionales)
- Arte de portada o promo con Canva (el usuario lo ofreció; Gemini y Google Flow no estaban conectados en la sesión).
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
