<?php
/**
 * Title: Suscripción Newsletter
 * Slug: wf2gutenberg/newsletter-signup
 * Categories: wf2g
 * Keywords: newsletter, suscripción, email, formulario
 * Description: Sección para captura de emails con formulario de suscripción nativo.
 */
?>
<!-- wp:group {"className":"wf2g-newsletter","style":{"color":{"background":"var(--wp--preset--color--base-2)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--80)","bottom":"var(--wp--preset--spacing--80)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-newsletter">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"600px"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
  <div class="wp-block-group">

    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
    <h2 class="wp-block-heading has-text-align-center">No te pierdas nada</h2>
    <!-- /wp:heading -->

    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--large)"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--large)">Recibe artículos, tutoriales y novedades directamente en tu bandeja de entrada. Sin spam.</p>
    <!-- /wp:paragraph -->

    <!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)"},"blockGap":"var(--wp--preset--spacing--30)"}},"className":"newsletter-form-wrapper"} -->
    <div class="wp-block-group newsletter-form-wrapper">
      <!-- wp:search {"label":"Suscribirse al boletín","showLabel":false,"placeholder":"Tu dirección de email...","buttonText":"Suscribirme","buttonUseIcon":false,"style":{"border":{"radius":"8px"},"color":{"background":"#ffffff"}},"className":"newsletter-search","fontSize":"medium"} /-->
    </div>
    <!-- /wp:group -->

    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--xs)"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--20)"}}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--xs)">Al suscribirte aceptas nuestra <a href="/politica-privacidad">Política de Privacidad</a>. Cancela cuando quieras.</p>
    <!-- /wp:paragraph -->

  </div>
  <!-- /wp:group -->

</div>
<!-- /wp:group -->
