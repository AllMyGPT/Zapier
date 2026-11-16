<?php
/**
 * Title: FAQ Acordeón
 * Slug: wf2gutenberg/faq-accordion
 * Categories: wf2g
 * Keywords: faq, preguntas frecuentes, acordeón
 * Description: Sección de preguntas frecuentes usando el bloque Details nativo de WordPress 6.5+.
 */
?>
<!-- wp:group {"className":"wf2g-faq","style":{"color":{"background":"var(--wp--preset--color--base-2)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-faq">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"700px"},"style":{"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--70)"},"blockGap":"var(--wp--preset--spacing--20)"}}} -->
  <div class="wp-block-group">
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
    <h2 class="wp-block-heading has-text-align-center">Preguntas frecuentes</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--contrast-3)"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--contrast-3)">¿Tienes dudas? Aquí resolvemos las más habituales.</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"760px"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--30)"}}} -->
  <div class="wp-block-group">

    <!-- wp:details {"style":{"border":{"radius":"12px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--50)","bottom":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"color":{"background":"#ffffff"}}} -->
    <details class="wp-block-details" style="background-color:#fff;border-radius:12px">
      <summary>¿Necesito conocimientos de programación para usar este tema?</summary>
      <!-- wp:paragraph -->
      <p>No. El tema está construido 100% con bloques Gutenberg nativos. Puedes personalizar colores, tipografías, layouts y contenidos desde el Editor de Sitio de WordPress sin tocar código.</p>
      <!-- /wp:paragraph -->
    </details>
    <!-- /wp:details -->

    <!-- wp:details {"style":{"border":{"radius":"12px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--50)","bottom":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"color":{"background":"#ffffff"}}} -->
    <details class="wp-block-details" style="background-color:#fff;border-radius:12px">
      <summary>¿Cómo adapto un wireframe a una plantilla?</summary>
      <!-- wp:paragraph -->
      <p>Consulta la carpeta <code>wireframes/</code> del repositorio. Ahí encontrarás una guía paso a paso para mapear cada sección de tu wireframe a un patrón de bloque y ensamblar la plantilla en el Editor de Sitio.</p>
      <!-- /wp:paragraph -->
    </details>
    <!-- /wp:details -->

    <!-- wp:details {"style":{"border":{"radius":"12px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--50)","bottom":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"color":{"background":"#ffffff"}}} -->
    <details class="wp-block-details" style="background-color:#fff;border-radius:12px">
      <summary>¿Las páginas son responsive?</summary>
      <!-- wp:paragraph -->
      <p>Sí. Todas las plantillas y patrones usan CSS fluido, columnas responsive y unidades <code>clamp()</code> para adaptarse a cualquier pantalla, desde 320px hasta 4K.</p>
      <!-- /wp:paragraph -->
    </details>
    <!-- /wp:details -->

    <!-- wp:details {"style":{"border":{"radius":"12px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--50)","bottom":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"color":{"background":"#ffffff"}}} -->
    <details class="wp-block-details" style="background-color:#fff;border-radius:12px">
      <summary>¿Qué versión de WordPress se necesita?</summary>
      <!-- wp:paragraph -->
      <p>WordPress 6.4 o superior. Se recomienda WordPress 6.6+ para aprovechar todas las funciones FSE (Full Site Editing), incluyendo la edición de partes de plantilla y el libro de estilos.</p>
      <!-- /wp:paragraph -->
    </details>
    <!-- /wp:details -->

    <!-- wp:details {"style":{"border":{"radius":"12px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--50)","bottom":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"color":{"background":"#ffffff"}}} -->
    <details class="wp-block-details" style="background-color:#fff;border-radius:12px">
      <summary>¿Funciona con WooCommerce?</summary>
      <!-- wp:paragraph -->
      <p>El tema es compatible con WooCommerce. Para plantillas específicas de tienda (carrito, checkout, producto) deberás añadir los bloques de WooCommerce en las plantillas correspondientes desde el Editor de Sitio.</p>
      <!-- /wp:paragraph -->
    </details>
    <!-- /wp:details -->

  </div>
  <!-- /wp:group -->

</div>
<!-- /wp:group -->
