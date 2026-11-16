<?php
/**
 * Title: Hero Principal
 * Slug: wf2gutenberg/hero-default
 * Categories: wf2g, banner
 * Block Types: core/group
 * Keywords: hero, portada, inicio, banner
 * Description: Sección hero con imagen de fondo, título, subtítulo y CTA doble.
 */
?>
<!-- wp:group {"className":"wf2g-hero","style":{"color":{"background":"var(--wp--preset--color--contrast)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--100)","bottom":"var(--wp--preset--spacing--100)"}},"minHeight":"90vh"},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-hero" style="background-color:var(--wp--preset--color--contrast);min-height:90vh;padding-top:var(--wp--preset--spacing--100);padding-bottom:var(--wp--preset--spacing--100)">

  <!-- wp:cover {"dimRatio":70,"overlayColor":"contrast","isUserOverlayColor":true,"minHeight":90,"minHeightUnit":"vh","isDark":true,"style":{"border":{"radius":"0"},"spacing":{"padding":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
  <div class="wp-block-cover is-dark" style="min-height:90vh">
    <span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-70 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">

      <!-- wp:group {"layout":{"type":"constrained","contentSize":"860px"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--50)"}}} -->
      <div class="wp-block-group">

        <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--secondary)"},"typography":{"fontWeight":"700","letterSpacing":"0.1em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p class="has-text-align-center" style="color:var(--wp--preset--color--secondary);font-weight:700;letter-spacing:0.1em;text-transform:uppercase">✦ Bienvenido a tu proyecto</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"textAlign":"center","level":1,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"800","lineHeight":"1.1","letterSpacing":"-0.03em"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"7xl"} -->
        <h1 class="wp-block-heading has-text-align-center" style="color:#ffffff;font-weight:800;line-height:1.1;letter-spacing:-0.03em">Transforma tus<br><em style="color:var(--wp--preset--color--primary-light)">Wireframes</em><br>en Realidad</h1>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.75)"},"typography":{"fontSize":"var(--wp--preset--font-size--xl)","lineHeight":"1.6"}},"fontSize":"xl"} -->
        <p class="has-text-align-center" style="color:rgba(255,255,255,0.75);font-size:var(--wp--preset--font-size--xl);line-height:1.6">Convierte cualquier diseño en un tema WordPress nativo con bloques Gutenberg, responsive y listo para producción. Sin plugins innecesarios.</p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center","flexWrap":"wrap"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)","margin":{"top":"var(--wp--preset--spacing--60)"}}}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"backgroundColor":"primary","textColor":"base","style":{"border":{"radius":"8px"},"typography":{"fontWeight":"700","fontSize":"var(--wp--preset--font-size--large)"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2rem","right":"2rem"}}}} -->
          <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button" href="#contacto" style="border-radius:8px;padding:1rem 2rem;font-weight:700">Empezar ahora →</a></div>
          <!-- /wp:button -->
          <!-- wp:button {"className":"is-style-outline","style":{"border":{"color":"rgba(255,255,255,0.5)","radius":"8px","width":"2px"},"color":{"text":"#ffffff"},"typography":{"fontWeight":"600","fontSize":"var(--wp--preset--font-size--large)"},"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2rem","right":"2rem"}}}} -->
          <div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" href="#caracteristicas" style="border-radius:8px;padding:1rem 2rem;font-weight:600;border:2px solid rgba(255,255,255,0.5)">Ver demo ↓</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->

        <!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var(--wp--preset--spacing--60)"},"blockGap":"var(--wp--preset--spacing--50)"}}} -->
        <div class="wp-block-group">
          <!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,0.5)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} -->
          <p style="color:rgba(255,255,255,0.5);font-size:var(--wp--preset--font-size--small)">✓ Código limpio &nbsp; ✓ Totalmente responsive &nbsp; ✓ Sin plugins extra &nbsp; ✓ FSE nativo</p>
          <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

      </div>
      <!-- /wp:group -->

    </div>
  </div>
  <!-- /wp:cover -->

</div>
<!-- /wp:group -->
