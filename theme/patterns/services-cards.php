<?php
/**
 * Title: Tarjetas de Servicios
 * Slug: wf2gutenberg/services-cards
 * Categories: wf2g
 * Keywords: servicios, tarjetas, cards, oferta
 * Description: Sección de servicios con cuatro tarjetas en fondo oscuro.
 */
?>
<!-- wp:group {"className":"wf2g-services","style":{"color":{"background":"var(--wp--preset--color--base-2)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-services">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"700px"},"style":{"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--80)"},"blockGap":"var(--wp--preset--spacing--30)"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","letterSpacing":"0.08em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--primary);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Nuestros servicios</p>
    <!-- /wp:paragraph -->
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
    <h2 class="wp-block-heading has-text-align-center">Lo que hacemos por ti</h2>
    <!-- /wp:heading -->
  </div>
  <!-- /wp:group -->

  <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--50)"}}}} -->
  <div class="wp-block-columns">

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"service-card","style":{"border":{"radius":"12px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--sm)"}} -->
      <div class="wp-block-group service-card" style="background-color:#fff">
        <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(26,107,60,0.1)"},"dimensions":{"minHeight":"56px"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}},"layout":{"selfStretch":"fit"}}} -->
        <div class="wp-block-group" style="background-color:rgba(26,107,60,0.1);border-radius:12px;display:inline-flex;padding:var(--wp--preset--spacing--40)">
          <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.75rem","lineHeight":"1"}}} --><p style="font-size:1.75rem;line-height:1">🖥️</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:heading {"level":4,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h4 class="wp-block-heading">Diseño Web</h4>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small)">Creamos experiencias digitales únicas centradas en el usuario, desde wireframe hasta producción.</p>
        <!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--primary);font-weight:600;font-size:var(--wp--preset--font-size--small)"><a href="#">Ver más →</a></p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"service-card","style":{"border":{"radius":"12px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--sm)"}} -->
      <div class="wp-block-group service-card" style="background-color:#fff">
        <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(59,130,246,0.1)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}}}}} -->
        <div class="wp-block-group" style="background-color:rgba(59,130,246,0.1);border-radius:12px;display:inline-flex;padding:var(--wp--preset--spacing--40)">
          <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.75rem","lineHeight":"1"}}} --><p style="font-size:1.75rem;line-height:1">⚙️</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:heading {"level":4,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h4 class="wp-block-heading">Desarrollo WordPress</h4>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small)">Temas y plugins personalizados con código limpio, seguro y optimizado para el rendimiento.</p>
        <!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--primary);font-weight:600;font-size:var(--wp--preset--font-size--small)"><a href="#">Ver más →</a></p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"service-card","style":{"border":{"radius":"12px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--sm)"}} -->
      <div class="wp-block-group service-card" style="background-color:#fff">
        <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(245,158,11,0.1)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}}}}} -->
        <div class="wp-block-group" style="background-color:rgba(245,158,11,0.1);border-radius:12px;display:inline-flex;padding:var(--wp--preset--spacing--40)">
          <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.75rem","lineHeight":"1"}}} --><p style="font-size:1.75rem;line-height:1">🔍</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:heading {"level":4,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h4 class="wp-block-heading">SEO &amp; Rendimiento</h4>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small)">Optimización técnica, velocidad de carga y estrategia de contenido para posicionarte en Google.</p>
        <!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--primary);font-weight:600;font-size:var(--wp--preset--font-size--small)"><a href="#">Ver más →</a></p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"service-card","style":{"border":{"radius":"12px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--sm)"}} -->
      <div class="wp-block-group service-card" style="background-color:#fff">
        <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(239,68,68,0.1)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}}}}} -->
        <div class="wp-block-group" style="background-color:rgba(239,68,68,0.1);border-radius:12px;display:inline-flex;padding:var(--wp--preset--spacing--40)">
          <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.75rem","lineHeight":"1"}}} --><p style="font-size:1.75rem;line-height:1">🚀</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:heading {"level":4,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h4 class="wp-block-heading">Consultoría Digital</h4>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small)">Estrategia digital integral, auditoría de sitios y hoja de ruta para escalar tu negocio online.</p>
        <!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p style="color:var(--wp--preset--color--primary);font-weight:600;font-size:var(--wp--preset--font-size--small)"><a href="#">Ver más →</a></p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

  </div>
  <!-- /wp:columns -->

</div>
<!-- /wp:group -->
