<?php
/**
 * Title: Banner CTA
 * Slug: wf2gutenberg/cta-banner
 * Categories: wf2g, call-to-action
 * Keywords: cta, llamada acción, banner, contacto
 * Description: Banner de llamada a la acción con fondo degradado.
 */
?>
<!-- wp:group {"className":"wf2g-cta","id":"cta","style":{"background":{"gradient":"var(--wp--preset--gradient--hero-gradient)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-cta" id="cta" style="background:var(--wp--preset--gradient--hero-gradient)">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"700px"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--50)"}}} -->
  <div class="wp-block-group">

    <!-- wp:heading {"textAlign":"center","level":2,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
    <h2 class="wp-block-heading has-text-align-center" style="color:#fff">¿Listo para empezar tu proyecto?</h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.8)"},"typography":{"fontSize":"var(--wp--preset--font-size--xl)","lineHeight":"1.6"}}} -->
    <p class="has-text-align-center" style="color:rgba(255,255,255,0.8);font-size:var(--wp--preset--font-size--xl);line-height:1.6">Contáctanos hoy y transforma tu presencia digital en algo extraordinario.</p>
    <!-- /wp:paragraph -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center","flexWrap":"wrap"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)","margin":{"top":"var(--wp--preset--spacing--50)"}}}} -->
    <div class="wp-block-buttons">
      <!-- wp:button {"style":{"border":{"radius":"8px"},"color":{"background":"#ffffff","text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","fontSize":"var(--wp--preset--font-size--large)"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2.5rem","right":"2.5rem"}}}} -->
      <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#contacto" style="border-radius:8px;background-color:#fff;color:var(--wp--preset--color--primary);font-weight:700;padding:1rem 2.5rem">Hablemos →</a></div>
      <!-- /wp:button -->
      <!-- wp:button {"className":"is-style-outline","style":{"border":{"color":"rgba(255,255,255,0.6)","radius":"8px","width":"2px"},"color":{"text":"#ffffff"},"typography":{"fontWeight":"600","fontSize":"var(--wp--preset--font-size--large)"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2rem","right":"2rem"}}}} -->
      <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#servicios" style="border-radius:8px;color:#fff;font-weight:600;padding:1rem 2rem;border:2px solid rgba(255,255,255,0.6)">Ver servicios</a></div>
      <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->

    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.5)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} -->
    <p class="has-text-align-center" style="color:rgba(255,255,255,0.5);font-size:var(--wp--preset--font-size--small)">Sin compromiso · Respuesta en 24h · Primera consulta gratuita</p>
    <!-- /wp:paragraph -->

  </div>
  <!-- /wp:group -->

</div>
<!-- /wp:group -->
