# Pizarra · Club Manager

Mánager de fútbol para navegador inspirado en los clásicos de gestión de los 2000: mismo tipo de bucle de juego (despacho, plantilla, tácticas, entrenamiento, fichajes, finanzas, estadio, cantera, competiciones y partido en directo), con gráficos 2D modernos y las plantillas actuales de las 5 grandes ligas.

> Juego independiente, sin afiliación con clubes, ligas ni editores. Los escudos se generan por código (no son los oficiales) y las valoraciones de los jugadores son aproximadas (temporada 2025/26).

## Qué incluye

- **5 ligas jugables + 5 segundas divisiones** (España, Inglaterra, Italia, Alemania, Francia): ~2.150 jugadores reales con posición, edad, nacionalidad, media y potencial; las segundas usan clubes reales con plantillas generadas.
- **Ascensos y descensos**, **copas nacionales** (eliminatorias con prórroga y penaltis) y **Copa de Campeones** (8 grupos + eliminatorias a doble partido + final).
- **Motor de partido** por fases de posesión: pases, regates, centros, tiros, paradas, córners, faltas, penaltis, fueras de juego, tarjetas, lesiones, cansancio, moral, cohesión táctica y factor campo.
- **Partido en directo 2D** (canvas, vista cenital) con comentarios, estadísticas, 5 cambios y ajustes tácticos en vivo, velocidades x1–x12 o resultado rápido.
- **Tácticas**: 9 formaciones, pizarra interactiva, mentalidad, presión, ritmo, amplitud, estilo de pase, fuera de juego y lanzadores.
- **Entrenamiento** semanal (intensidad + foco) con progresión por edad/potencial y declive de veteranos.
- **Fichajes**: buscador con filtros, precio de venta por importancia, contraofertas, negociación de contrato, agentes libres, ofertas recibidas, ventanas de verano e invierno y mercado entre clubes de la IA.
- **Finanzas**: taquilla según precio y demanda, TV, merchandising, patrocinio, salarios, premios, ampliación de estadio y personal técnico (6 áreas, niveles 1–5).
- **Cantera** con hornada anual, **directiva** con objetivos y confianza (puedes ser destituido y recibir ofertas de otros clubes), y **carrera multitemporada**.
- **Guardado**: autoguardado + 5 ranuras en el navegador (comprimido) y 5 ranuras en la nube con Supabase (email + contraseña).

## Desarrollo local

```bash
cd club-manager
npm install
cp .env.example .env.local   # opcional: claves de Supabase
npm run dev                  # http://localhost:3000
npm run sim -- rma 2         # simula 2 temporadas en consola (calibración del motor)
```

Sin variables de Supabase el juego funciona entero y guarda solo en el navegador.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/20261115000000_init.sql` (SQL Editor o `supabase db push`). Crea la tabla `saves` con RLS (cada usuario solo ve sus partidas) y una tabla opcional `hall_of_fame`.
3. En Authentication activa Email. Copia `Project URL` y la clave `anon`/publishable.

## Despliegue en Vercel

1. Importa el repositorio en Vercel y pon **Root Directory = `club-manager`** (framework: Next.js).
2. Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Toda la simulación corre en el navegador, así que no hay coste de servidor por partido.

## Estructura

```
src/data/leagues/*.ts   plantillas reales por liga (formato: Nombre|POS|año|NAC|media|potencial)
src/game/               motor: jugadores, tácticas, partido, calendario, temporada, mercado
src/components/         interfaz (pantallas, ficha de jugador, partido 2D)
src/lib/                Supabase y guardado comprimido
supabase/migrations/    esquema SQL
```

Para actualizar plantillas basta con editar las líneas de `src/data/leagues/*.ts`.
