<?php
/**
 * Title: Grid de Características
 * Slug: wf2gutenberg/features-grid
 * Categories: wf2g, featured
 * Block Types: core/columns
 * Keywords: características, features, ventajas, grid
 * Description: Cuadrícula de 3 características con icono, título y descripción.
 */
?>
<!-- wp:group {"className":"wf2g-features","id":"caracteristicas","style":{"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-features" id="caracteristicas">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"700px"},"style":{"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--80)"},"blockGap":"var(--wp--preset--spacing--30)"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","letterSpacing":"0.08em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--primary);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">¿Por qué elegirnos?</p>
    <!-- /wp:paragraph -->
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--20)","bottom":"0"}}}} -->
    <h2 class="wp-block-heading has-text-align-center">Todo lo que necesitas para triunfar online</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)"}}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--contrast-3);margin-top:var(--wp--preset--spacing--40)">Cada característica está diseñada para maximizar tu presencia digital y convertir visitantes en clientes.</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)"}}}} -->
  <div class="wp-block-columns">

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"feature-card","style":{"border":{"radius":"16px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--md)"},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}} -->
      <div class="wp-block-group feature-card">
        <!-- wp:paragraph {"style":{"typography":{"fontSize":"3rem","lineHeight":"1"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--40)"}}}} -->
        <p style="font-size:3rem;line-height:1">⚡</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"0","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h3 class="wp-block-heading">Carga ultrarrápida</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3)">Bloques nativos de Gutenberg sin código innecesario. Puntuaciones perfectas en Core Web Vitals y Google PageSpeed.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"feature-card feature-card--highlight","style":{"border":{"radius":"16px"},"color":{"background":"var(--wp--preset--color--primary)","text":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--xl)"},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}} -->
      <div class="wp-block-group feature-card feature-card--highlight" style="background-color:var(--wp--preset--color--primary);color:#fff">
        <!-- wp:paragraph {"style":{"typography":{"fontSize":"3rem","lineHeight":"1"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--40)"}}}} -->
        <p style="font-size:3rem;line-height:1">🎨</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"0","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h3 class="wp-block-heading" style="color:#fff">Diseño 100% personalizable</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,0.8)"}}} -->
        <p style="color:rgba(255,255,255,0.8)">Sistema de diseño completo en theme.json. Cambia colores, tipografías y espaciados sin tocar código.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"feature-card","style":{"border":{"radius":"16px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--md)"},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}} -->
      <div class="wp-block-group feature-card">
        <!-- wp:paragraph {"style":{"typography":{"fontSize":"3rem","lineHeight":"1"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--40)"}}}} -->
        <p style="font-size:3rem;line-height:1">📱</p>
        <!-- /wp:paragraph -->
        <!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"top":"0","bottom":"var(--wp--preset--spacing--30)"}}}} -->
        <h3 class="wp-block-heading">Responsive de serie</h3>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3)">Adaptado perfectamente a móvil, tablet y escritorio desde el primer momento. Sin media queries adicionales.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

  </div>
  <!-- /wp:columns -->

</div>
<!-- /wp:group -->
