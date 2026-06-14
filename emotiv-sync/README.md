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
- **Aprobación con control de presupuesto** — las horas del freelancer son
  **OK automáticamente** mientras el proyecto esté dentro de presupuesto. Al
  superarlo, esas horas pasan a *Requiere justificación*: el freelancer escribe
  una justificación y la envía a aprobación; el admin la aprueba o rechaza. **Solo
  las horas aprobadas** se sincronizan a Zoho Books (garantizado por un trigger).
- **Informes y rentabilidad** — ingresos, coste, beneficio y margen; facturable vs
  no facturable; utilización del equipo (horas / capacidad); desglose por cliente,
  proyecto y persona.

### Multiusuario
- **Admin** — importa/sincroniza, aprueba horas, gestiona usuarios (alta con
  invitación por email), configura las API keys y ve informes de todo el equipo.
- **Freelancer** — ve sus proyectos y horas; sus horas son OK salvo que superen
  presupuesto, en cuyo caso debe justificarlas.
- El primer usuario registrado es `admin`. El resto se crea por invitación: el
  admin los da de alta y reciben un email para activar su cuenta y poner contraseña.

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
# Solo servidor — necesaria para dar de alta usuarios por invitación:
SUPABASE_SERVICE_ROLE_KEY=<service role secret>
```

### Base de datos

Las migraciones están en `supabase/migrations/`. Aplícalas en orden:
1. `001_initial_schema.sql` — tablas base + RLS + perfiles.
2. `0015_fix_rls_recursion_and_role_guard.sql` — helper `is_admin()` y guard de rol.
3. `002_budgets_approvals_reports.sql` — presupuestos, aprobaciones y rentabilidad.
4. `003_budget_gated_approval.sql` — auto-OK por presupuesto + justificación.

## Despliegue: emotiv.es/team

La app se monta bajo **`/team`** (`basePath` en `next.config.ts`) para convivir en
el mismo dominio con la **web de ventas** y la app de **contabilidad** sin pisar
sus rutas ni sus assets. Todo —login, dashboard, API y estáticos— vive bajo
`emotiv.es/team/…`, así que el resto del dominio queda intacto.

Además está marcada como **no indexable**: cabecera `X-Robots-Tag: noindex,
nofollow` en todas las respuestas y `<meta robots noindex>` en las páginas.

### Pasos

1. Importa la carpeta `emotiv-sync/` como proyecto en Vercel.
2. Configura las variables de entorno (incluida `SUPABASE_SERVICE_ROLE_KEY`).
3. Enruta `emotiv.es/team` a este proyecto. Dos opciones:
   - **Rewrite** desde el proyecto principal (web de ventas):
     ```jsonc
     // next.config / vercel.json del sitio principal
     { "rewrites": [{ "source": "/team/:path*", "destination": "https://<este-proyecto>.vercel.app/team/:path*" }] }
     ```
   - O añade `emotiv.es` como dominio de este proyecto y deja que el `basePath`
     `/team` sirva solo esas rutas (el resto las atienden los otros proyectos).
4. En Supabase → Authentication → URL Configuration, añade
   `https://emotiv.es/team/auth/callback` como **Redirect URL**.
5. Entra por primera vez: tu usuario quedará como **admin**.
6. En *Configuración*, introduce la API Key de Everhour y el Access Token + Org ID
   (+ customer por defecto) de Zoho Books.
7. Flujo: importa proyectos → revisa presupuestos → importa horas → las que superen
   presupuesto se justifican → apruebas → sincronizas a Zoho.

### Alta de usuarios

En *Usuarios → Nuevo usuario*, el admin introduce email, nombre y rol. La persona
recibe un email de Supabase para activar la cuenta; al abrirlo aterriza en
`/team/auth/set-password` y define su contraseña.

> Requiere `SUPABASE_SERVICE_ROLE_KEY` y un SMTP configurado en Supabase
> (Authentication → Emails) para el envío de invitaciones.
