# Guía: De Wireframe a Gutenberg

## Proceso de trabajo

### 1. Analizar el wireframe

Divide cada página en **secciones verticales**. Cada sección se convertirá en un bloque `core/group` o en un patrón.

| Sección del wireframe | Bloque / Patrón a usar |
|---|---|
| Cabecera / Nav | `parts/header.html` |
| Hero / Banner principal | `wf2gutenberg/hero-default` |
| Características / Features | `wf2gutenberg/features-grid` |
| Servicios / Tarjetas | `wf2gutenberg/services-cards` |
| Cifras / Estadísticas | `wf2gutenberg/stats-counter` |
| Testimonios | `wf2gutenberg/testimonials-slider` |
| Precios | `wf2gutenberg/pricing-table` |
| Portafolio / Galería | `wf2gutenberg/portfolio-grid` |
| Llamada a la acción | `wf2gutenberg/cta-banner` |
| Blog / Artículos | `wf2gutenberg/blog-grid` |
| Contacto | `wf2gutenberg/contact-section` |
| FAQ | `wf2gutenberg/faq-accordion` |
| Newsletter | `wf2gutenberg/newsletter-signup` |
| Pie de página | `parts/footer.html` |

---

### 2. Crear una plantilla nueva

1. Ve a **Apariencia → Editor → Plantillas → Nueva plantilla**
2. Comienza con la plantilla en blanco
3. Inserta la **Parte de plantilla: Cabecera**
4. Añade un bloque **Grupo** (`tagName: main`)
5. Dentro del grupo, inserta los patrones que necesites
6. Cierra con la **Parte de plantilla: Pie de página**

---

### 3. Mapeo de elementos de wireframe

#### Títulos y textos

```
Wireframe: "TÍTULO PRINCIPAL"
→ Bloque: Heading (H1), tamaño 5xl, peso 800
   Estilo predefinido en theme.json
```

```
Wireframe: "Subtítulo descriptivo"
→ Bloque: Paragraph, color contrast-3, tamaño large
```

#### Imágenes

```
Wireframe: [IMAGEN]
→ Bloque: Image (wp:image)
   Tamaños disponibles: wf2g-hero (1920×800), wf2g-card (600×400),
                        wf2g-thumbnail (400×300), wf2g-avatar (120×120)
```

#### Listas de características

```
Wireframe: ✓ Característica 1 / ✓ Característica 2
→ Bloque: List (wp:list) o columnas con Groups
→ Patrón: wf2gutenberg/features-grid (3 columnas)
```

#### Llamadas a la acción

```
Wireframe: [BOTÓN PRIMARIO] [BOTÓN SECUNDARIO]
→ Bloque: Buttons (wp:buttons)
   Botón primario: backgroundColor="primary", textColor="base"
   Botón outline: className="is-style-outline"
```

#### Grids / Cards

```
Wireframe: 3 columnas de tarjetas
→ Bloque: Columns (wp:columns, isStackedOnMobile:true)
   Dentro de cada Column: Group con className="card"
```

---

### 4. Crear un patrón nuevo

Crea un archivo PHP en `theme/patterns/mi-seccion.php`:

```php
<?php
/**
 * Title: Mi Sección
 * Slug: wf2gutenberg/mi-seccion
 * Categories: wf2g
 * Keywords: mi, sección
 * Description: Descripción breve.
 */
?>
<!-- wp:group {"style":{...},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  <!-- Aquí el HTML de los bloques -->
</div>
<!-- /wp:group -->
```

El comentario HTML es el **block grammar** de Gutenberg. Cada `<!-- wp:nombre-bloque {...atributos} -->` define un bloque.

---

### 5. Sistema de colores (theme.json)

| Token CSS | Valor hex | Uso |
|---|---|---|
| `--wp--preset--color--primary` | `#1a6b3c` | CTAs, links, acentos |
| `--wp--preset--color--primary-light` | `#2d9e5a` | Hover, gradientes |
| `--wp--preset--color--secondary` | `#f59e0b` | Destacados, estrellas |
| `--wp--preset--color--contrast` | `#0f172a` | Texto principal |
| `--wp--preset--color--contrast-2` | `#334155` | Texto secundario |
| `--wp--preset--color--contrast-3` | `#64748b` | Texto auxiliar |
| `--wp--preset--color--base` | `#ffffff` | Fondo principal |
| `--wp--preset--color--base-2` | `#f8fafc` | Fondo alternado |

Para cambiar la paleta de colores, edita la sección `settings.color.palette` en `theme/theme.json`.

---

### 6. Responsive: cómo funciona

- **Columnas**: `"isStackedOnMobile":true` apila columnas en móvil automáticamente
- **Tipografía**: usa `clamp()` para escalar fluido entre breakpoints
- **Imágenes**: `width:100%` y `height:auto` por defecto en bloques Image
- **Espaciados**: las unidades `var(--wp--preset--spacing--*)` escalan proporcionalmente
- **Menú**: el parámetro `"overlayMenu":"mobile"` activa el hamburger automáticamente

---

### 7. Añadir a una página existente

1. Edita la página en el **Editor de bloques**
2. Escribe `/` para abrir el insertor de bloques
3. Busca el nombre del patrón (ej: "Hero", "Precios")
4. Selecciónalo — se inserta con todos sus bloques editables

---

### 8. Elementos que requieren código personalizado

Cuando un elemento del wireframe no tiene equivalente nativo en Gutenberg:

| Elemento | Solución |
|---|---|
| Slider / Carrusel | Bloque HTML (`wp:html`) + JS en `assets/js/main.js` |
| Mapa interactivo | `wp:html` con `<iframe>` de Google Maps / OSM |
| Formulario avanzado | `wp:html` con `<form>` personalizado (ver `contact-section.php`) |
| Contador animado | Implementado en `main.js` para `.wf2g-stats` |
| Animaciones de entrada | Implementadas con Intersection Observer en `main.js` |
| Tabla de datos | `wp:html` con `<table>` estilizado con clases del tema |
| Acordeón (WP < 6.5) | `wp:html` con `<details><summary>` nativo HTML |
| Video background | `wp:cover` con el video como fondo |

---

### Estructura de archivos del tema

```
theme/
├── style.css           # Metadatos del tema (nombre, versión, etc.)
├── theme.json          # Sistema de diseño: colores, tipografía, espaciado
├── functions.php       # Registro de soporte, scripts, patrones
├── index.php           # Fallback requerido por WordPress
├── templates/          # Plantillas de página (HTML de bloques)
│   ├── index.html      # Blog / archivo
│   ├── front-page.html # Portada
│   ├── single.html     # Entrada individual
│   ├── page.html       # Página estática
│   ├── archive.html    # Categorías / tags
│   ├── search.html     # Resultados de búsqueda
│   ├── 404.html        # Página no encontrada
│   ├── landing-page.html
│   ├── full-width.html
│   ├── portfolio.html
│   └── pricing.html
├── parts/              # Partes reutilizables (cabecera, pie, sidebar)
│   ├── header.html
│   ├── header-minimal.html
│   ├── footer.html
│   ├── footer-minimal.html
│   ├── sidebar.html
│   └── post-meta.html
├── patterns/           # Patrones de sección (bloques preconstruidos)
│   ├── hero-default.php
│   ├── features-grid.php
│   ├── services-cards.php
│   ├── stats-counter.php
│   ├── testimonials-slider.php
│   ├── cta-banner.php
│   ├── pricing-table.php
│   ├── contact-section.php
│   ├── faq-accordion.php
│   ├── newsletter-signup.php
│   ├── blog-grid.php
│   └── portfolio-grid.php
├── assets/
│   ├── css/
│   │   ├── main.css         # Estilos frontend
│   │   └── editor-style.css # Estilos dentro del editor
│   └── js/
│       └── main.js          # JS mínimo (scroll, animaciones)
└── inc/
    ├── helpers.php       # Funciones auxiliares PHP
    ├── block-filters.php # Filtros de bloques y WordPress
    └── customizer.php    # Panel de personalización
```
