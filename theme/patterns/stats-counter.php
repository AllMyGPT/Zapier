<?php
/**
 * Title: Contador de Estadísticas
 * Slug: wf2gutenberg/stats-counter
 * Categories: wf2g
 * Keywords: estadísticas, números, datos, métricas
 * Description: Barra de estadísticas con cuatro métricas destacadas.
 */
?>
<!-- wp:group {"className":"wf2g-stats","style":{"color":{"background":"var(--wp--preset--color--primary)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--80)","bottom":"var(--wp--preset--spacing--80)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-stats" style="background-color:var(--wp--preset--color--primary)">

  <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--50)"}}}} -->
  <div class="wp-block-columns">

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--20)"}}} -->
      <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","level":3,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"900","fontSize":"clamp(2.5rem,5vw,4rem)","letterSpacing":"-0.03em","lineHeight":"1"}}} -->
        <h3 class="wp-block-heading has-text-align-center" style="color:#fff;font-weight:900;font-size:clamp(2.5rem,5vw,4rem)">+500</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.8)"},"typography":{"fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p class="has-text-align-center" style="color:rgba(255,255,255,0.8);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Proyectos entregados</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--20)"}}} -->
      <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","level":3,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"900","fontSize":"clamp(2.5rem,5vw,4rem)","letterSpacing":"-0.03em","lineHeight":"1"}}} -->
        <h3 class="wp-block-heading has-text-align-center" style="color:#fff;font-weight:900;font-size:clamp(2.5rem,5vw,4rem)">98%</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.8)"},"typography":{"fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p class="has-text-align-center" style="color:rgba(255,255,255,0.8);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Clientes satisfechos</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--20)"}}} -->
      <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","level":3,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"900","fontSize":"clamp(2.5rem,5vw,4rem)","letterSpacing":"-0.03em","lineHeight":"1"}}} -->
        <h3 class="wp-block-heading has-text-align-center" style="color:#fff;font-weight:900;font-size:clamp(2.5rem,5vw,4rem)">10+</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.8)"},"typography":{"fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p class="has-text-align-center" style="color:rgba(255,255,255,0.8);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Años de experiencia</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--20)"}}} -->
      <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","level":3,"style":{"color":{"text":"var(--wp--preset--color--secondary)"},"typography":{"fontWeight":"900","fontSize":"clamp(2.5rem,5vw,4rem)","letterSpacing":"-0.03em","lineHeight":"1"}}} -->
        <h3 class="wp-block-heading has-text-align-center" style="color:var(--wp--preset--color--secondary);font-weight:900;font-size:clamp(2.5rem,5vw,4rem)">4.9★</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center","style":{"color":{"text":"rgba(255,255,255,0.8)"},"typography":{"fontWeight":"600","textTransform":"uppercase","letterSpacing":"0.05em","fontSize":"var(--wp--preset--font-size--small)"}}} -->
        <p class="has-text-align-center" style="color:rgba(255,255,255,0.8);font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Valoración media</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

  </div>
  <!-- /wp:columns -->

</div>
<!-- /wp:group -->
