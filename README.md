# WireFrame-to-Gutenberg

Tema WordPress FSE (Full Site Editing) para convertir wireframes en temas Gutenberg nativos.
Inspirado en Astra, optimizado para rendimiento y 100% responsive.

## ¿Qué incluye?

| Categoría | Contenido |
|---|---|
| **Sistema de diseño** | `theme.json` con paleta de colores, tipografías (Inter + Playfair), espaciados fluidos y sombras |
| **Plantillas** | `index`, `front-page`, `single`, `page`, `archive`, `search`, `404`, `landing-page`, `full-width`, `portfolio`, `pricing` |
| **Partes de plantilla** | `header`, `header-minimal`, `footer`, `footer-minimal`, `sidebar`, `post-meta` |
| **Patrones** | `hero-default`, `features-grid`, `services-cards`, `stats-counter`, `testimonials-slider`, `cta-banner`, `pricing-table`, `contact-section`, `faq-accordion`, `newsletter-signup`, `blog-grid`, `portfolio-grid` |
| **Assets** | CSS fluido y responsive, JS mínimo con animaciones y scroll suave |

## Instalación

### Opción A — ZIP desde WordPress (recomendado)

1. **Descarga** `dist/wf2gutenberg.zip` desde este repositorio  
   *(o desde la última [Release](../../releases/latest))*
2. En tu WordPress ve a **Apariencia → Temas → Añadir nuevo → Subir tema**
3. Selecciona `wf2gutenberg.zip` → **Instalar ahora** → **Activar**

### Opción B — Desde el repositorio

```bash
git clone https://github.com/allmygpt/zapier.git
cp -r zapier/theme/ /ruta/wordpress/wp-content/themes/wf2gutenberg
# Activar desde Apariencia → Temas
```

### Generar el ZIP localmente

```bash
./build.sh 1.0.0        # genera dist/wf2gutenberg.zip
```

## Requisitos

- WordPress **6.4+** (recomendado 6.6+)
- PHP **8.0+**
- No requiere plugins adicionales

## Uso del Editor de Sitio

1. **Apariencia → Editor** para editar plantillas y partes
2. **Apariencia → Editor → Patrones** para ver todos los patrones disponibles
3. En cualquier página, escribe `/` y busca el nombre del patrón

## Adaptar un wireframe

Ver la guía completa en [`wireframes/GUIA-WIREFRAME-A-GUTENBERG.md`](wireframes/GUIA-WIREFRAME-A-GUTENBERG.md).

## Personalización de colores

Edita `theme/theme.json` → `settings.color.palette`:

```json
{
  "slug": "primary",
  "color": "#TU_COLOR",
  "name": "Primary"
}
```

## Estructura del repositorio

```
├── theme/                  # Tema WordPress listo para instalar
│   ├── theme.json          # Sistema de diseño
│   ├── templates/          # Plantillas de página
│   ├── parts/              # Cabecera, pie, sidebar
│   ├── patterns/           # Secciones preconstruidas
│   └── assets/             # CSS y JS
├── wireframes/             # Guía de conversión wireframe → Gutenberg
└── README.md
```

## Licencia

GPL v2 o superior — libre para uso personal y comercial.
