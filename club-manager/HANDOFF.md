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

## Vida personal, contratos, patrocinios, Europa y pretemporada (15 nov 2026)
- **Modo vida personal** (`src/game/life.ts`, pantalla Vida). Se activa o desactiva al crear la partida; se elige a quién te interesa conocer y la edad del míster.
  - Casa y coche (4 + 4).
  - Citas en 5 lugares, con preferencias y rasgos de cada persona.
  - Pareja, boda, aventuras con riesgo de escándalo (directiva y afición) y divorcio.
  - Hijos que crecen; un hijo futbolista con talento entra en tu cantera a los 16.
  - El ánimo del míster contagia al vestuario.
  - Imágenes en `public/art/life/`, generadas con Gemini y Flow: personas adultas ficticias y escenas sin caras.
- **Contratos**:
  - rol prometido; si no juega, se queja;
  - prima de fichaje;
  - cláusula de rescisión, que la IA puede pagar;
  - 5 % de comisión del agente.
- **Patrocinio**: tres ofertas por temporada (fija, por objetivo o larga), con bonus a fin de temporada; venta del nombre del estadio.
- **Tácticas**: seis estilos predefinidos.
- **Entrenamiento**: foco individual por atributo.
- **Copa Continental**: segunda competición europea.
- **Pretemporada**: tres planes con amistosos.
- **Eventos**: con decisiones y tiempos de espera.
- **Filiales vinculados y cesiones**.

## LaLiga 2026/27 desde Transfermarkt (15 nov 2026)
- Plantillas de los 20 clubes de LaLiga 26/27 leídas de Transfermarkt (vista detallada de cada club): nombre, posición, año de nacimiento, nacionalidad, valor de mercado y fin de contrato.
  - Suben Deportivo, Racing y Málaga; bajan Mallorca, Girona y Real Oviedo.
  - Transfermarkt bloquea las lecturas automáticas: se extrajo desde el navegador y se convirtió con `scripts/build-laliga.py <export>`.
- Formato de jugador: `Nombre|POS|año|NAC|media|potencial|valor M€|fin de contrato`.
- Valoración: los que ya estaban mantienen la suya ajustada con el valor actual; los nuevos se estiman con valor y edad (ajuste sobre 308 coincidencias); a los menores de 23 se les da más peso al valor.
- Precios: `marketValue` usa el valor de Transfermarkt como base y lo mueve en proporción a lo que cambien media, edad y contrato.
- Cantera: nivel 1-6 por club, mejorable en Club (6 M€ por nivel).
  - El Celta empieza en élite (6): unos 6 juveniles por hornada y 2-3 con potencial alto.
  - Los menores de 22 progresan un 60 % más rápido, también en el Celta Fortuna.

## Premier, Bundesliga, Serie A y Ligue 1 2026/27 (15 nov 2026)
- Mismo método que LaLiga: plantillas de Transfermarkt (temporada 26/27) convertidas con `scripts/build-leagues.py <export>`.
  - El export lleva bloques `@liga` y `#idTM|club`; `TM_IDS` traduce el id de Transfermarkt al id del juego y `NEW` guarda los datos de los clubes que no existían.
  - El ajuste media ~ valor + edad se hace por liga, porque la Premier infla los valores.
- Premier: suben Ipswich, Coventry y Hull City (nuevo); bajan West Ham, Wolves y Burnley.
- Bundesliga: suben Schalke, Elversberg y Paderborn (nuevos los dos últimos); bajan Wolfsburgo, Heidenheim y St. Pauli.
- Serie A: suben Venezia, Frosinone y Monza; bajan Verona, Pisa y Cremonese.
- Ligue 1: suben Troyes y Le Mans (nuevo); bajan Nantes y Metz.
- Motor: el peso de remate del delantero centro baja de 1 a 0,85 para que los goles se repartan algo más.

## Resto de Europa y Sudamérica (15 nov 2026)
- 49 primeras divisiones europeas y 10 sudamericanas en `public/world/leagues.json` (817 clubes, ~23.000 jugadores), cargadas al crear partida.
  - Generadas con `scripts/build-world.py <export>`. El export sale de Transfermarkt desde el navegador: plantilla (temporada 2026 o 2025 en ligas de año natural), estadio y aforo, ciudad y colores del club.
  - Reputación por valor de plantilla (ajuste sobre los clubes de las 5 grandes) y medias por valor y edad. Un club con plantilla incompleta se completa con jugadores generados.
  - Sin segunda división: estas ligas no tienen ascensos ni descensos. Argentina (30 clubes) juega a una vuelta.
- Copas: Copa de Campeones de América (32 clubes sudamericanos). Con el resto de Europa, las 5 grandes pasan a 21+10 plazas europeas y el resto se reparte entre las demás ligas (`EURO` en el script). Copa nacional en cada país con 16 o más clubes.
- Nueva partida: regiones (grandes ligas, resto de Europa, Sudamérica) y opción «Ligas simuladas» (5 grandes, toda Europa, Europa y Sudamérica; tu liga siempre está).
- Rendimiento con todo: ~33 s de simulación por temporada en Node, ~1 s por semana en el navegador, guardado de ~3 MB comprimido.
  - `strengthOf` se cachea por día (las transferencias llaman a `invalidateStrength`).
  - El fin de temporada usa índices por club en lugar de recorrer todos los jugadores.
- Guardado local en IndexedDB (las partidas antiguas de localStorage se siguen leyendo). El autoguardado espera 2,5 s en mundos grandes.
- Escudos y fotos: `WORLD=1 npx tsx scripts/fetch-media.ts`. Busca escudos de todos los clubes y fotos solo de los jugadores de estas ligas que valen 1,5 M€ o más.

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
