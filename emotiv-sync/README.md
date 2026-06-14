# Emotiv Sync — Everhour ↔ Zoho Books

App web mobile-first (PWA) para sincronizar el tracking de tiempo de **Everhour**
con la contabilidad de **Zoho Books**, desplegable en **Vercel** con backend en
**Supabase**.

## Funcionalidades

### Núcleo de sincronización
- Importa proyectos y entradas de tiempo desde Everhour.
- Sincroniza proyectos (con `customer_id`) y partes de horas a Zoho Books.
- Historial completo de sincronizaciones con estado (éxito / parcial / error).

### Lo mejor de Everhour
- **Presupuestos y alertas** — presupuesto por proyecto en horas o dinero (total o
  mensual), barra de consumo y alertas automáticas al superar el 80 % / 100 %.
- **Flujo de aprobación** — las horas importadas entran como *pendientes*; un admin
  las aprueba o rechaza (en bloque por persona) y **solo las aprobadas** se
  sincronizan a Zoho Books. Un trigger en la base de datos lo garantiza.
- **Informes y rentabilidad** — ingresos, coste, beneficio y margen; facturable vs
  no facturable; utilización del equipo (horas / capacidad); desglose por cliente,
  proyecto y persona.

### Multiusuario
- **Admin** — importa/sincroniza, aprueba horas, gestiona usuarios y configura las
  API keys. Ve informes de todo el equipo.
- **Freelancer** — ve sus propios proyectos, horas y el estado de aprobación.
- El primer usuario registrado se convierte automáticamente en `admin`.

## Stack

| Capa          | Tecnología                          |
|---------------|-------------------------------------|
| Frontend      | Next.js 16 (App Router) + Tailwind  |
| Backend       | API Routes de Next.js               |
| Base de datos | Supabase (proyecto `contabilidad-emotive`) |
| Auth          | Supabase Auth                       |
| Deploy        | Vercel                              |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena las variables de Supabase
npm run dev
```

### Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=https://ulayaivxakzaghxaxlae.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

### Base de datos

Las migraciones están en `supabase/migrations/`. Aplícalas en orden:
1. `001_initial_schema.sql` — tablas base + RLS + perfiles.
2. `0015_fix_rls_recursion_and_role_guard.sql` — helper `is_admin()` y guard de rol.
3. `002_budgets_approvals_reports.sql` — presupuestos, aprobaciones y rentabilidad.

## Despliegue en Vercel

1. Importa la carpeta `emotiv-sync/` como proyecto en Vercel.
2. Configura las dos variables de entorno anteriores.
3. En Supabase → Authentication → URL Configuration, añade la URL de Vercel como
   redirect permitido.
4. Entra por primera vez: tu usuario quedará como **admin**.
5. En *Configuración*, introduce la API Key de Everhour y el Access Token + Org ID
   (+ customer por defecto) de Zoho Books.
6. Importa proyectos → revisa presupuestos → importa horas → aprueba → sincroniza.
