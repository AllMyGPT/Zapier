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

### 1. Supabase: proyecto nuevo e independiente
Crearlo desde MCP falló tres veces (la confirmación de coste nunca llegó a la app). No se creó nada.
- Panel → organización **Emotiv** (`stctnnykbxyqyvahsajr`) → New project
- Nombre `pizarra-club-manager`, región **eu-central-1 (Frankfurt)**
- No tocar EmotivOS ni el resto de proyectos.

### 2. Base de datos
Aplicar `club-manager/supabase/migrations/20261115000000_init.sql`. Se puede pegar en el SQL Editor, usar `supabase db push` o `apply_migration` vía MCP. Crea:
- `saves`, con RLS para que cada usuario solo vea sus partidas.
- `hall_of_fame`, opcional.

Después, revisar los avisos de seguridad (`get_advisors`) y activar Auth → Email.

### 3. Vercel
- Importar `AllMyGPT/Zapier` con **Root Directory = `club-manager`** (framework Next.js).
- Variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clave anon o publishable (pública, no la service_role)
- Rama de producción: `main` cuando se fusione el PR #14, o desplegar antes una preview de la rama.
- Después, en Supabase → Auth → URL Configuration, poner la URL de Vercel como Site URL.

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
