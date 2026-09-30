# Diagnóstico técnico — elianaoliveros.com

**Fecha:** 20/08/2026
**Estado del frontend:** operativo (HTTP 200, ~1,7 s de mediana)
**Estado de la edición:** degradado — dos causas independientes identificadas

---

## 1. Resumen ejecutivo

La web **no está caída**: todas las páginas publicadas se sirven correctamente. El
problema que se percibe como "web rota" está concentrado en el **backend / edición**,
y responde a dos causas independientes que se suman:

| # | Causa | Severidad | Efecto |
|---|-------|-----------|--------|
| **A** | **Elementor Pro 3.19.0 sobre Elementor core 4.2.2** (desfase de una versión mayor) | Crítica | El editor de Elementor falla / no carga / pierde widgets |
| **B** | **~20 % de las peticiones al servidor se cortan** (timeout fijo a los ~11,3 s) — **en aumento** | Crítica | Los guardados del editor fallan de forma aleatoria |
| C | Dos maquetadores activos a la vez (Elementor Pro + Thrive Suite) | Media | Conflictos JS, sobrecarga, comportamiento errático |
| D | Firewall de Raiola bloquea `wp-login.php` (regla 201) | Media | Bloqueo de acceso al panel según la IP de conexión |

---

## 2. Alcance de esta revisión

**Comprobado** — análisis externo sin autenticar: cabeceras HTTP, HTML servido,
API REST de WordPress, versiones de plugins vía `readme.txt` y `?ver=` de los
assets, y test de fiabilidad de 20 peticiones.

**No comprobado** — no se ha podido acceder a:

- **wp-admin**: el firewall de Raiola (regla `rule_id=201`, *"¡Detectada petición de
  login incorrecta!"*) redirige `wp-login.php` a `webcloud.es/bloqueos/` desde la IP
  usada en esta revisión. No se ha intentado eludir el bloqueo.
- **Panel de Raiola** (`clientes.raiolanetworks.es`): inalcanzable por la política
  de red del entorno de ejecución (denegación en el proxy).

Por tanto, los puntos del apartado 5 **no han sido aplicados**: requieren acceso
autenticado y deben ejecutarse con copia de seguridad previa.

---

## 3. Hallazgos con evidencia

### Plataforma
```
WordPress   7.0.4          (meta generator)
PHP         8.1.34         (cabecera x-powered-by)
Tema        GeneratePress
SEO         Yoast          Antispam: Akismet
Caché       ninguna detectada
```

### A. Desfase Elementor core / Elementor Pro  ← causa principal

```
Elementor core  4.2.2   <- readme.txt "Stable tag: 4.2.2" + meta generator + assets
Elementor Pro   3.19.0  <- assets propios de Pro:
                           elementor-pro/assets/js/webpack-pro.runtime.min.js?ver=3.19.0
                           elementor-pro/assets/js/frontend.min.js?ver=3.19.0
                           elementor-pro/assets/css/frontend.min.css?ver=3.19.0
```

Elementor Pro está fuertemente acoplado a las APIs internas del core y debe ir
**emparejado en versión**. Pro 3.19 corresponde a un core 3.19.x; aquí corre sobre
un core 4.2.2.

Pro sigue cargándose porque solo valida una versión **mínima** de core (que 4.2.2
cumple), pero invoca APIs que en la rama 4.x ya no existen. Resultado típico y
coherente con el síntoma descrito: **el frontend se sigue viendo bien** (se sirve
CSS ya generado y cacheado en disco) mientras **el editor deja de funcionar**.

**Causa probable del desfase:** las actualizaciones de Elementor Pro requieren
licencia activa y conectada. Si la licencia caducó o se desconectó, el core siguió
actualizándose y Pro se quedó congelado en 3.19.0. **Es lo primero que hay que mirar.**

### B. Inestabilidad del servidor  ← agrava mucho la edición

Tres mediciones a lo largo del 20/08:

| Hora UTC | Muestra | Fallos |
|---|---|---|
| ~10:25 | 20 peticiones | 2 (10 %) |
| ~12:05 | 15 peticiones | 4 (27 %) |
| ~12:08 | 30 peticiones | 6 (20 %) |

**En unas 2 h la tasa de fallo se dobló.** La degradación es real y progresiva, no una
lectura puntual.

El corte es un **timeout determinista**, no pérdida aleatoria de red. Tiempos hasta el
corte en las 6 muestras de la medición amplia:

```
11.08 s · 11.19 s · 11.34 s · 11.37 s · 11.45 s · 11.50 s
```

Las peticiones que sí responden lo hacen en ~1,7 s de mediana (min 1,42 · max 2,63).
O va rápido, o muere a los ~11,3 s: no hay término medio ni lentitud progresiva.

Esa firma tan estrecha apunta a un **timeout fijo delante de PHP-FPM** (proxy o
balanceador) mientras los workers PHP están saturados, o a un tope de recursos del plan
de hosting. Se reprodujo también en `/sobre-mi/` y en `/wp-json/`.

Esto es especialmente dañino al editar: el editor de Elementor guarda por AJAX, y
un ~20 % de peticiones perdidas se traduce en guardados fallidos aparentemente
aleatorios — exactamente "me da problemas al editarla".

### C. Dos maquetadores activos simultáneamente

Thrive Suite está instalado y activo junto a Elementor Pro. Confirmado por **52
rutas REST** registradas y por los scripts cargados en el frontend:

```
Namespaces REST: tcb/v1, td/v1, tss/v1, trd/v1, td-metrics/v1
                 (Thrive Architect, Thrive Dashboard, Thrive Smart Site)
Plugin visible:  thrive-leads 3.31
Frontend:        tve_leads_ajax_impression, tve_dash_front, ThriveGlobal, tcb_*
```

Carga de la home: **29 hojas CSS + 17 scripts JS** (20 ficheros de Elementor,
5 de Elementor Pro, 5 del tema, 1 de Thrive Leads).

### D. Bloqueo de acceso de Raiola

```
GET /wp-login.php
  -> 302  https://webcloud.es/bloqueos/login-com.php?id=...&rule_id=201
  Título: "¡Detectada petición de login incorrecta!"
```

Es la protección antifuerza bruta de Raiola. Afecta a `wp-login.php` únicamente
(la home responde 200 con normalidad). Si se dispara contra la IP del cliente o de
quien edita, el síntoma percibido es "no puedo entrar, la web está rota".

### E. Menor: página de pruebas indexable

`/prueba/` (ID 1244) está **publicada**, sin `noindex`, y `robots.txt` permite todo
(`Disallow:` vacío). Es contenido de test accesible a buscadores.

---

## 4. Plan de reparación

> **Requisito previo innegociable:** copia de seguridad completa (ficheros + base de
> datos) desde el panel de Raiola, descargada fuera del servidor. Los pasos 1 y 2
> tocan plugins de maquetación: sin backup, un fallo es irreversible.
>
> Recomendado: ejecutar primero en **staging**, no en producción.

### Paso 1 — Resolver el desfase de Elementor (causa A)

1. Entrar en `Elementor → Licencia` y verificar el estado de la licencia de Pro.
2. **Si la licencia está activa:** actualizar Elementor Pro a la versión que empareje
   con el core 4.2.2. Debería aparecer directamente en `Plugins`.
3. **Si la licencia está caducada o desconectada** — elegir una vía:
   - **Vía recomendada:** renovar/reconectar la licencia y actualizar Pro. Es la
     única solución sostenible: mantiene parches de seguridad y compatibilidad.
   - **Vía puente (solo si la renovación se demora):** revertir el **core** a la
     última 3.19.x con el plugin *WP Rollback* para emparejarlo con Pro 3.19.0.
     Restaura la edición de inmediato, pero deja WordPress con un Elementor
     desactualizado y sin parches — es un parche temporal, no una solución.
4. Tras actualizar, entrar al editor de 2–3 páginas y comprobar que carga y guarda.

### Paso 2 — Estabilizar el servidor (causa B)

Es tan prioritario como el paso 1: sin esto, la edición seguirá fallando aunque
Elementor quede perfecto.

1. Revisar en el panel de Raiola los **logs de error** y el consumo de recursos
   (workers PHP / procesos concurrentes / límite de memoria).
2. El corte constante a ~11 s apunta a agotamiento de workers PHP o a un límite del
   plan. Abrir **ticket a soporte de Raiola** aportando este dato concreto:
   *"~20 % de las peticiones se cierran con connection reset a los ~11,3 s de forma muy
   consistente (11.08–11.50 s en 6 muestras); el resto responde en ~1,7 s. La tasa se
   dobló entre las 10:25 y las 12:05 UTC del 20/08"*. Es un dato accionable para ellos.
3. Instalar una **caché de páginas** (WP Rocket, LiteSpeed Cache o similar según
   soporte del servidor). Reduce peticiones a PHP y descarga el servidor.

### Paso 3 — Desactivar el maquetador redundante (causa C)

⚠️ Con backup y preferiblemente en staging.

1. Auditar en `Páginas` qué páginas están construidas con Elementor y cuáles con
   Thrive Architect.
2. Verificar si los formularios de captación de **Thrive Leads** siguen en uso
   (`/guia-gratis/` parece usarlos).
3. Decisión recomendada: **conservar Elementor** como maquetador único; mantener
   Thrive Leads **solo** si sus formularios están activos; desactivar
   Thrive Architect / Smart Site si ninguna página depende de ellos.
4. Desactivar de uno en uno, comprobando el frontend tras cada desactivación.

### Paso 4 — Acceso y limpieza

1. En el panel de Raiola, añadir a la **lista blanca** las IPs fijas desde las que
   se administra la web, para evitar el bloqueo de `wp-login.php` (regla 201).
2. Poner `/prueba/` en borrador o marcarla `noindex`.

---

## 5. Orden de ejecución recomendado

```
Backup completo
   └─> Paso 2 (estabilizar servidor)   ← desbloquea todo lo demás
        └─> Paso 1 (emparejar Elementor)
             └─> Verificar edición
                  └─> Paso 3 (maquetador redundante, en staging)
                       └─> Paso 4 (accesos y limpieza)
```

El **paso 2 va primero**: con un ~20 % de peticiones cayéndose, cualquier
actualización de plugins puede interrumpirse a mitad y dejar la instalación en un
estado inconsistente.
