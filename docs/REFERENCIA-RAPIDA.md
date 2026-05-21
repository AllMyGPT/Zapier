# Referencia Rápida — WireFrame-to-Gutenberg
## Chuleta de diseño para compatibilidad con el sistema de bloques

---

## Paleta de colores

```
┌──────────────────┬───────────┬──────────────────────────────────────┐
│ Nombre           │ Hex       │ Cuándo usarlo                        │
├──────────────────┼───────────┼──────────────────────────────────────┤
│ primary          │ #1a6b3c   │ Botones, links, fondos CTA           │
│ primary-light    │ #2d9e5a   │ Hover, gradientes                    │
│ primary-dark     │ #0f4526   │ Hover oscuro, énfasis                │
│ secondary        │ #f59e0b   │ Estrellas, badges, destacados        │
│ accent           │ #3b82f6   │ Info, iconos alternativos            │
│ base             │ #ffffff   │ Fondo principal, tarjetas            │
│ base-2           │ #f8fafc   │ Secciones alternas, inputs           │
│ contrast         │ #0f172a   │ Texto principal                      │
│ contrast-2       │ #334155   │ Texto secundario, subtítulos         │
│ contrast-3       │ #64748b   │ Metadatos, placeholder, caption      │
│ border           │ #e2e8f0   │ Bordes, separadores                  │
└──────────────────┴───────────┴──────────────────────────────────────┘
```

---

## Escala tipográfica

```
xs     0.75rem  → Eyebrows uppercase, badges, labels
small  0.875rem → Metadatos, captions, botones secundarios
medium 1rem     → Cuerpo de texto, nav
large  1.125rem → Leads, texto intro, sidebar
xl     1.25rem  → Subtítulos de tarjeta
2xl    1.5rem   → H4, precios "por mes"
3xl    1.875rem → H3 de sección menor
4xl    2.25rem  → H2 de sección principal
5xl    3rem     → H1 de página
6xl    3.75rem  → H1 de hero mediano
7xl    4.5rem   → H1 de hero grande (siempre con clamp())
```

---

## Mapa de secciones → patrones

```
Tipo de sección                   Patrón a usar
──────────────────────────────    ──────────────────────────
Portada / Banner principal    →   hero-default
Características / Por qué     →   features-grid
Servicios / Oferta            →   services-cards
Cifras / Logros               →   stats-counter
Testimonios / Reseñas         →   testimonials-slider
Llamada a la acción           →   cta-banner
Planes / Precios              →   pricing-table
Formulario de contacto        →   contact-section
Preguntas frecuentes          →   faq-accordion
Newsletter / Captación leads  →   newsletter-signup
Últimos artículos             →   blog-grid
Galería de proyectos          →   portfolio-grid
```

---

## Anatomía de una sección bien diseñada

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   EYEBROW — texto pequeño, verde, uppercase         │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━                      │
│   Título H2 grande y descriptivo                    │
│   Subtítulo opcional en gris, tamaño large          │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│   │          │  │          │  │          │         │
│   │ Tarjeta  │  │ Tarjeta  │  │ Tarjeta  │         │
│   │  col 1   │  │  col 2   │  │  col 3   │         │
│   │          │  │(destacada│  │          │         │
│   └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘

Fondo: blanco (#fff) ← alternar con → gris (#f8fafc)
Padding vertical: 4-8rem según importancia
```

---

## Reglas de color por tipo de sección

```
Sección normal          → fondo blanco,      texto #0f172a
Sección alterna         → fondo #f8fafc,     texto #0f172a
Sección de impacto CTA  → fondo gradiente,   texto blanco
Sección de stats        → fondo #1a6b3c,     texto blanco
Sección de testimon.    → fondo #f1f5f9,     texto #0f172a
Footer                  → fondo #0f172a,     texto blanco/gris
```

---

## Anatomía del botón

```
Primario:    [ fondo #1a6b3c  |  texto blanco  |  radius 6-8px ]
Outline:     [ borde 2px primary  |  texto primary  |  fondo transp. ]
En oscuro:   [ fondo blanco  |  texto primary  |  radius 6-8px ]
Ghost:       [ borde rgba(255,255,255,0.5)  |  texto blanco ]

Padding:  0.75-1rem vertical  ×  1.5-2.5rem horizontal
Hover:    translateY(-1px) + box-shadow suave
```

---

## Composición de página tipo — Landing de Servicio

```
1. [header]           cabecera sticky con CTA
   ────────────────────────────────────────────
2. hero-default       h1 + subtítulo + 2 CTAs  [fondo oscuro]
   ────────────────────────────────────────────
3. stats-counter      4 métricas              [fondo primary]
   ────────────────────────────────────────────
4. features-grid      3 ventajas              [fondo blanco]
   ────────────────────────────────────────────
5. services-cards     4 servicios             [fondo gris]
   ────────────────────────────────────────────
6. testimonials       3 opiniones             [fondo #f1f5f9]
   ────────────────────────────────────────────
7. pricing-table      3 planes                [fondo blanco]
   ────────────────────────────────────────────
8. faq-accordion      5-6 preguntas           [fondo gris]
   ────────────────────────────────────────────
9. cta-banner         conversión final        [fondo gradiente]
   ────────────────────────────────────────────
10.[footer]           pie completo             [fondo #0f172a]
```

---

## Composición de página tipo — Blog / Entrada

```
1. [header]
2. hero de entrada    imagen + título + meta
3. contenido          texto a 780px de ancho + sidebar (30%)
4. artículos rel.     3 tarjetas en grid
5. [footer]
```

---

## Lo que rompe el sistema (❌ evitar)

```
❌ Colores fuera de la paleta
❌ Tamaños de fuente no definidos en la escala (ej: 22px, 34px)
❌ Columnas sin comportamiento responsive definido
❌ Más de 4 columnas en desktop
❌ Dos secciones consecutivas con el mismo fondo
❌ Botones sin hover definido
❌ Imágenes sin ratio especificado
❌ Secciones de color claro con texto en color oscuro personalizado (usar tokens)
❌ Gradientes distintos a los predefinidos
❌ Border-radius arbitrarios (usar 6/8/10/12/16/20px)
❌ Fuentes externas a Inter / Playfair / JetBrains Mono
```

---

## Lo que requiere marcar como ⚠️ CÓDIGO CUSTOM

```
⚠️ Carrusel/slider con autoplay
⚠️ Filtrado de portafolio con AJAX
⚠️ Animaciones parallax o complejas
⚠️ Formulario con envío real (→ usar plugin CF7/WPForms)
⚠️ Mapa Google Maps interactivo
⚠️ Countdown timer
⚠️ Popup / modal
⚠️ Chat en vivo
⚠️ Búsqueda con filtros avanzados
```
