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

```bash
# 1. Clona el repositorio
git clone https://github.com/allmygpt/zapier.git

# 2. Copia la carpeta theme/ a tu WordPress
cp -r theme/ /ruta/a/wordpress/wp-content/themes/wf2gutenberg

# 3. Activa el tema
# Apariencia → Temas → WireFrame-to-Gutenberg → Activar
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
