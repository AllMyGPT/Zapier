# HANDOFF — elianaoliveros.com

> **Para:** sesión local de Claude Code en la máquina deDamián (Chrome local, IP propia).
> **De:** sesión remota del 20/08/2026 (Claude Code on the web).
> **PR con el diagnóstico completo:** AllMyGPT/Zapier#12 · rama `claude/elianaoliveros-website-repair-g5nb0c`
> **Lee primero:** `docs/elianaoliveros-diagnostico.md` (informe con evidencias).

---

## 1. Misión

Reparar elianaoliveros.com. El cliente reporta *"está rota y me da problemas al editarla"*.
El frontend **no está caído**; el fallo está en la **edición**, y hay dos causas
independientes. Este handoff existe porque la sesión remota **no pudo aplicar la
reparación**: le faltaba acceso. La sesión local sí lo tiene.

## 2. Por qué una sesión local desbloquea esto

| Bloqueo en la sesión remota | En local |
|---|---|
| WAF de Raiola devuelve **302** en `wp-login.php` desde la IP del contenedor (`160.79.106.131`, datacenter) → `webcloud.es/bloqueos/...&rule_id=201` | La IP doméstica/oficina normalmente no dispara la regla → acceso a wp-admin |
| `clientes.raiolanetworks.es` **inalcanzable** (política de red del proxy del entorno, denegación en CONNECT) | Acceso directo al panel de Raiola |
| Chromium del contenedor no atravesaba el proxy (`ERR_CONNECTION_RESET`) | Chrome local funciona: se puede abrir el editor de Elementor con DevTools |

**Primera comprobación al arrancar en local** — confirma que el desbloqueo es real:

```bash
curl -sI https://elianaoliveros.com/wp-login.php | head -1
# Esperado en local: HTTP/2 200
# Si sale 302 hacia webcloud.es/bloqueos/ -> tu IP también está bloqueada:
#   entra antes al panel de Raiola y mete tu IP en lista blanca (ver §6, paso 5).
```

## 3. Credenciales

**No están en este fichero, a propósito** — es un repo de GitHub y quedarían en el
historial de git de forma permanente.

Damián las pega al inicio de la sesión local. Son dos juegos:
- **WordPress** — `https://elianaoliveros.com/wp-login.php` (usuario = email del cliente)
- **Hosting Raiola** — panel de cliente (usuario = email de María Dolores Casás)

> Recomendación pendiente ya trasladada al usuario: **rotar al menos la credencial de
> WordPress** cuando el incidente esté cerrado. Han circulado por WhatsApp y por chat.

## 4. Estado: hecho vs. pendiente

**Hecho (sesión remota)**
- [x] Diagnóstico externo completo, sin autenticar
- [x] Informe con evidencias → `docs/elianaoliveros-diagnostico.md`
- [x] PR #12 abierto (docs-only, `mergeable_state: clean`, sin CI en el repo)

**Pendiente (sesión local) — nada de esto se ha aplicado**
- [ ] Backup completo previo
- [ ] Causa B: estabilizar servidor
- [ ] Causa A: emparejar Elementor core/Pro
- [ ] Verificar que el editor abre y guarda
- [ ] Causa C: maquetador redundante
- [ ] Causas D/E: lista blanca de IPs y limpieza

## 5. Hallazgos que arrastras (con nivel de confianza)

### Plataforma
```
WordPress 7.0.4 · PHP 8.1.34 · Tema GeneratePress · Yoast · Akismet · sin caché
21 páginas publicadas, todas HTTP 200
```

### Causa A — Desfase Elementor · CONFIRMADO (el dato) / INFERIDO (la causalidad)

```
Elementor core  4.2.2    Elementor Pro  3.19.0     <- una versión mayor de desfase
```

Verificado por **tres vías independientes**: `readme.txt` (`Stable tag: 4.2.2`),
`<meta name="generator">`, y los `?ver=` de los assets propios de Pro
(`webpack-pro.runtime.min.js`, `frontend.min.js`, `frontend.min.css`).

Pro sigue cargando porque solo valida una versión **mínima** de core (4.2.2 la cumple),
pero invoca APIs que la rama 4.x ya no expone. Encaja con el síntoma: frontend bien
(CSS ya generado en disco), editor roto.

> ⚠️ **Esto último es una inferencia, no una comprobación.** La sesión remota nunca pudo
> abrir el editor. **Verifícalo tú en local** (§6, paso 3.1) antes de dar la causa por
> buena — es barato y cierra la duda.

**Hipótesis del origen:** licencia de Elementor Pro caducada o desconectada. Las
actualizaciones de Pro la requieren; si cayó, el core siguió actualizándose solo y Pro
se congeló en 3.19.0. **Es lo primero que hay que mirar al entrar en wp-admin.**

### Causa B — Inestabilidad del servidor · CONFIRMADO y EMPEORANDO

Mediciones del 20/08:

| Hora UTC | Muestra | Fallos |
|---|---|---|
| ~10:25 | 20 peticiones | 2 (10 %) |
| ~12:05 | 15 peticiones | 4 (27 %) |
| ~12:08 | 30 peticiones | 6 (20 %) |

**En ~2 h la tasa de fallo se dobló.** El corte es un **timeout determinista**, no
pérdida aleatoria: 11.08 / 11.19 / 11.34 / 11.37 / 11.45 / 11.50 s. Las peticiones que
sí responden lo hacen en ~1,7 s de mediana. O va rápido, o muere a los ~11,3 s.

Esa firma apunta a un **timeout fijo delante de PHP-FPM** (proxy/balanceador) mientras
los workers PHP están saturados, o a un tope de recursos del plan.

Impacto en la edición: Elementor guarda por AJAX. Con ~20 % de peticiones perdidas, los
guardados fallan sin patrón aparente — es *literalmente* "me da problemas al editarla".

### Causa C — Dos maquetadores activos · CONFIRMADO
```
Elementor Pro  +  Thrive Suite (52 rutas REST: tcb/v1, td/v1, tss/v1, trd/v1, td-metrics/v1)
Thrive Leads 3.31 · frontend carga tve_dash_front, ThriveGlobal, tve_leads_ajax_*
Home: 29 hojas CSS + 17 scripts JS
```

### Causa D — WAF de Raiola · CONFIRMADO
`wp-login.php` → 302 → `webcloud.es/bloqueos/login-com.php?...&rule_id=201`
("¡Detectada petición de login incorrecta!"). Solo afecta a `wp-login.php`; la home va 200.

### Causa E — Menor
`/prueba/` (ID 1244) publicada, sin `noindex`, `robots.txt` permisivo (`Disallow:` vacío).

## 6. Plan para la sesión local

> **Backup completo antes de tocar nada.** Ficheros + BD, descargado **fuera** del
> servidor. Los pasos 3 y 4 tocan plugins de maquetación: sin backup un fallo es
> irreversible. Si hay staging en Raiola, trabaja ahí primero.

### Paso 1 · Backup
Panel de Raiola → copia de ficheros + base de datos → **descargar en local**.
No sirve una copia que viva solo en el mismo servidor.

### Paso 2 · Causa B — estabilizar (VA PRIMERO)
Va antes que Elementor por una razón concreta: **con ~20 % de peticiones cayéndose, una
actualización de plugin puede cortarse a mitad y dejar la instalación inconsistente.**

1. Panel de Raiola → **logs de error** y consumo de recursos (workers PHP, procesos
   concurrentes, límite de memoria, CPU).
2. **Ticket a soporte de Raiola** con este dato textual, que es accionable para ellos:
   > *"~20 % de las peticiones a elianaoliveros.com se cierran con connection reset a
   > los ~11,3 s de forma muy consistente (11.08–11.50 s en 6 muestras); el resto
   > responde en ~1,7 s. La tasa se dobló entre las 10:25 y las 12:05 UTC del 20/08.
   > Parece un timeout fijo delante de PHP-FPM con los workers saturados."*
3. Valorar **caché de páginas** (WP Rocket / LiteSpeed según soporte del servidor) para
   descargar PHP. Instálala **después** de que el servidor esté estable, no antes.

### Paso 3 · Causa A — emparejar Elementor

**3.1 — Verifica primero la inferencia (esto es lo que la sesión remota no pudo hacer):**
1. Abre Chrome, entra en wp-admin.
2. Abre una página con el editor de Elementor y **DevTools → Console** antes de cargar.
3. Captura los errores JS. Si ves fallos del tipo `undefined is not a function` /
   módulos de Pro que no resuelven contra el core → **inferencia confirmada**.
4. Mira también `Elementor → Herramientas → Información del sistema`: vuelca versiones,
   límites PHP y conflictos de un tirón. Guarda esa salida, es oro para el diagnóstico.

**3.2 — Repara:**
1. `Elementor → Licencia` → estado de la licencia de Pro.
2. **Licencia activa** → actualizar Elementor Pro a la versión emparejada con core 4.2.2.
3. **Licencia caducada/desconectada** → dos vías:
   - **Recomendada:** renovar/reconectar y actualizar Pro. Única solución sostenible
     (mantiene parches de seguridad y compatibilidad).
   - **Puente, solo si la renovación se demora:** revertir el **core** a la última 3.19.x
     con *WP Rollback* para emparejarlo con Pro 3.19.0. Restaura la edición ya, pero deja
     Elementor desactualizado y sin parches. **Es un parche temporal — anótalo como deuda.**
4. Verificar: abrir el editor en 2–3 páginas, **editar y guardar**, confirmar que persiste.

### Paso 4 · Causa C — maquetador redundante
⚠️ Con backup y preferiblemente en staging.
1. Auditar en `Páginas` qué usa Elementor y qué usa Thrive Architect.
2. Comprobar si los formularios de **Thrive Leads** siguen en uso (`/guia-gratis/` parece usarlos).
3. Recomendado: **Elementor como maquetador único**; conservar Thrive Leads **solo** si sus
   formularios están activos; desactivar Thrive Architect / Smart Site si nada depende de ellos.
4. Desactivar **de uno en uno**, comprobando el frontend tras cada desactivación.

### Paso 5 · Causas D y E — accesos y limpieza
1. Panel de Raiola → **lista blanca** con las IPs fijas desde las que se administra la web
   (evita el bloqueo de `wp-login.php`, regla 201). Esto probablemente resuelve por sí solo
   parte del "no puedo entrar" que reporta el cliente.
2. `/prueba/` → pasar a borrador o marcar `noindex`.

## 7. Comandos de verificación

Revalidar que los hallazgos siguen vigentes (nada de esto necesita login):

```bash
# Versiones core vs Pro — el hallazgo central
curl -s https://elianaoliveros.com/ -o /tmp/h.html
grep -oE 'elementor/assets/js/frontend\.min\.js\?ver=[0-9.]+' /tmp/h.html
grep -oE 'elementor-pro/assets/js/frontend\.min\.js\?ver=[0-9.]+' /tmp/h.html

# ¿Sigue bloqueado wp-login desde tu IP?
curl -sI https://elianaoliveros.com/wp-login.php | head -1

# Tasa de fallo (compara con la tabla de §5)
ok=0; fail=0
for i in $(seq 1 30); do
  c=$(curl -s -o /dev/null --max-time 30 -w "%{http_code}" https://elianaoliveros.com/)
  [ "$c" = "200" ] && ok=$((ok+1)) || fail=$((fail+1))
done; echo "OK: $ok/30  FALLOS: $fail/30"
```

**Criterio de éxito final:** editor de Elementor abre y guarda con fiabilidad, y la tasa
de fallo de la home baja a ~0/30.

## 8. Prompt para arrancar la sesión local

```
Retomamos la reparación de elianaoliveros.com (web de cliente, WordPress en Raiola).

Lee docs/elianaoliveros-HANDOFF.md y docs/elianaoliveros-diagnostico.md del repo
AllMyGPT/Zapier, rama claude/elianaoliveros-website-repair-g5nb0c.

Resumen: el diagnóstico está cerrado pero no se aplicó nada, porque la sesión remota
no tenía acceso ni a wp-admin (WAF de Raiola bloqueaba su IP) ni al panel de Raiola
(política de red). Desde aquí sí hay acceso y Chrome local.

Empieza por el paso 0 del handoff (confirmar que wp-login.php da 200 desde mi IP) y
sigue el plan de la §6. No toques nada antes del backup del paso 1.

Credenciales: [PEGAR AQUÍ WordPress y Raiola]
```

## 9. Contexto de la sesión remota

- Rama: `claude/elianaoliveros-website-repair-g5nb0c` · PR **AllMyGPT/Zapier#12** (abierto, docs-only)
- El repo `AllMyGPT/Zapier` no tiene workflows de CI — el PR no tiene checks que vigilar
- Único comentario en el PR: aviso de límite de uso de un bot de revisión, sin acción
- El repo no contiene código de la web; es solo el vehículo para documentar este trabajo
