=== Zoho Books Connector ===
Contributors: allmygpt
Tags: zoho, zoho books, invoices, clients, projects, estimates
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Conecta WordPress con Zoho Books: muestra clientes, presupuestos, facturas y proyectos con autenticación OAuth por usuario.

== Description ==

**Zoho Books Connector** permite a cada usuario WordPress autenticar su propia cuenta de Zoho Books mediante OAuth 2.0 y ver sus datos directamente en el sitio.

= Características =

* Autenticación OAuth 2.0 por usuario (cada usuario conecta su propia cuenta)
* Datos en tiempo real desde Zoho Books API v3
* Caché configurable (5 min por defecto) para minimizar llamadas a la API
* Portal completo con tabs: Clientes, Presupuestos, Facturas, Proyectos
* Filtros por estado en presupuestos, facturas y proyectos
* Paginación
* Vista de detalle en modal para cada registro
* Panel de administración para configurar credenciales y gestionar usuarios
* Shortcodes individuales para insertar secciones específicas

= Shortcodes =

* `[zoho_portal]` — Portal completo
* `[zoho_customers per_page="25"]` — Lista de clientes
* `[zoho_estimates per_page="25" status=""]` — Presupuestos
* `[zoho_invoices per_page="25" status=""]` — Facturas
* `[zoho_projects per_page="25" status=""]` — Proyectos

== Installation ==

1. Sube la carpeta `zoho-books-connector` a `/wp-content/plugins/`
2. Activa el plugin en **Plugins > Plugins instalados**
3. Ve a **Zoho Books > Configuración**
4. Crea una aplicación en https://api-console.zoho.com/ con el Authorized Redirect URI que aparece en la configuración
5. Copia el Client ID y Client Secret
6. Configura la página del portal e inserta el shortcode `[zoho_portal]`
7. Los usuarios pueden conectar su cuenta desde esa página

== Frequently Asked Questions ==

= ¿Cada usuario necesita su propia cuenta de Zoho Books? =

Sí. Cada usuario de WordPress conecta su propia cuenta Zoho mediante OAuth 2.0. El administrador solo configura las credenciales de la aplicación Zoho.

= ¿Qué permisos necesita la aplicación Zoho? =

El plugin solicita permisos de lectura para: contactos, presupuestos, facturas, proyectos y configuración de organización.

= ¿Los datos se almacenan en WordPress? =

Solo los tokens OAuth se almacenan de forma segura. Los datos de Zoho se cachean temporalmente (5 minutos) y luego se obtienen de nuevo.

== Changelog ==

= 1.0.0 =
* Versión inicial
