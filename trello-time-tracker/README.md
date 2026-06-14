# Card Time Tracker — Trello Power-Up

Registra tiempo directamente desde tus tarjetas de Trello. Sincroniza con tu base de datos Supabase (tablas `everhour_projects` y `everhour_time_entries`).

## Funcionalidades

- **Timer en tiempo real** — Inicia y detiene un cronómetro desde el reverso de la tarjeta
- **Entradas manuales** — Agrega tiempo pasado con fecha y descripción
- **Badges en tarjetas** — Muestra el tiempo total o el timer en curso directamente en la lista de tarjetas
- **Historial** — Ve todas las entradas de tiempo para cada tarjeta
- **Mapeo automático** — Crea un proyecto en Supabase automáticamente si la tarjeta no tiene uno asignado

## Requisitos previos

- Node.js 18+
- Cuenta Supabase con las tablas `everhour_projects`, `everhour_time_entries` y `user_profiles`
- Cuenta Trello con acceso a Power-Ups (https://trello.com/power-ups/admin)
- ngrok u otro túnel HTTPS para pruebas locales

## Instalación

```bash
cd /home/user/Zapier/trello-time-tracker
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y rellena los valores:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   VITE_APP_NAME=Card Time Tracker
   ```
   - `VITE_SUPABASE_URL`: URL del proyecto Supabase (en el dashboard: Settings → API)
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima pública (Settings → API → `anon` `public`)

## Desarrollo local

```bash
npm run dev
```

Esto levanta el servidor en `http://localhost:5173`. Trello **requiere HTTPS**, así que necesitas exponer el servidor con ngrok.

## Exponer con HTTPS (ngrok)

1. Instala ngrok si no lo tienes: https://ngrok.com/download

2. En una terminal separada:
   ```bash
   ngrok http 5173
   ```

3. Copia la URL HTTPS que te da ngrok, por ejemplo:
   ```
   https://abc123.ngrok-free.app
   ```

4. Esta URL es tu **Connector URL** para el Power-Up.

> Nota: Con ngrok gratuito la URL cambia cada vez que reinicias. Para desarrollo estable considera ngrok con cuenta fija o servicios alternativos como Cloudflare Tunnel.

## Registrar el Power-Up en Trello

1. Ve a https://trello.com/power-ups/admin
2. Haz clic en **"Create new Power-Up"** (o selecciona tu workspace)
3. Rellena:
   - **Name**: Card Time Tracker
   - **Connector URL (iframe)**: `https://abc123.ngrok-free.app/index.html`
   - **Email**: tu correo
4. En la sección **Capabilities**, activa:
   - `card-buttons`
   - `card-badges`
   - `card-detail-badges`
   - `card-back-section`
5. Guarda y ve a tu tablero de Trello
6. En el tablero → **Power-Ups** → busca tu Power-Up por nombre y actívalo

## Uso

1. Abre el reverso de cualquier tarjeta
2. La primera vez verás el botón **"🔑 Iniciar sesión"** — inicia sesión con tu cuenta Supabase
3. Después verás los botones:
   - **⏱ Iniciar timer** — arranca un cronómetro
   - **⏹ Parar timer** — detiene el cronómetro y guarda la entrada
   - **➕ Tiempo manual** — agrega tiempo pasado manualmente
   - **📋 Historial** — lista todas las entradas para esa tarjeta
4. El badge en la lista de tarjetas muestra el tiempo acumulado o el timer en curso

## Build para producción

```bash
npm run build
```

Los archivos compilados quedan en `dist/`. Puedes servirlos desde cualquier servidor estático (Vercel, Netlify, GitHub Pages, etc.) con HTTPS habilitado.

Para Vercel:
```bash
vercel --prod
```
Luego actualiza el Connector URL en https://trello.com/power-ups/admin con tu URL de producción.

## Estructura del proyecto

```
trello-time-tracker/
  index.html              # Entrada principal del Power-Up (invisible, registra capabilities)
  src/
    powerup.ts            # Inicializa capabilities y lógica principal
    supabase.ts           # Cliente Supabase + funciones de acceso a datos
    format.ts             # Utilidades de formato (tiempo, fechas)
  popups/
    login.html/ts         # Popup de login con email/contraseña
    timer.html/ts         # Popup para timer e entradas manuales
    history.html/ts       # Popup de historial de tiempo
  public/
    manifest.json         # Manifiesto del Power-Up
  vite.config.ts
  tsconfig.json
  package.json
```

## Arquitectura

El Power-Up usa **Supabase JS client directamente** (sin backend intermedio). La autenticación se hace con email/contraseña y los tokens se almacenan en el storage privado de Trello (`t.set('member', 'private', ...)`), que solo es accesible por el Power-Up en ese workspace.

La autorización la controlan las **RLS policies de Supabase** — los usuarios solo ven y modifican sus propios datos.

## Limitaciones del MVP

- **Un timer a la vez**: No se puede tener más de un timer activo por usuario (restricción intencional)
- **Sin edición de entradas**: El historial es de solo lectura; para editar hay que ir al dashboard
- **Sin eliminación**: No se pueden borrar entradas desde el Power-Up
- **Badge refresh**: Los badges se actualizan cada ~30 segundos (limitación de Trello)
- **Sin notificaciones**: No hay alertas cuando el timer lleva mucho tiempo corriendo
- **ngrok gratuito**: La URL cambia al reiniciar, requiere actualizar el Connector URL en Trello
