<?php
/**
 * Title: Grid de Portafolio
 * Slug: wf2gutenberg/portfolio-grid
 * Categories: wf2g, gallery
 * Keywords: portafolio, proyectos, galería, portfolio
 * Description: Cuadrícula masonry de proyectos de portafolio.
 */
?>
<!-- wp:group {"className":"wf2g-portfolio-grid","style":{"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-portfolio-grid">

  <!-- wp:gallery {"columns":3,"linkTo":"none","imageCrop":true,"style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)"}}}} -->
  <figure class="wp-block-gallery has-nested-images columns-3">

    <!-- wp:image {"sizeSlug":"wf2g-card","style":{"border":{"radius":"12px"},"shadow":"var(--wp--preset--shadow--md)"}} -->
    <figure class="wp-block-image size-wf2g-card" style="border-radius:12px">
      <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%231a6b3c'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='Arial'>Proyecto 1</text></svg>" alt="Proyecto 1"/>
      <figcaption class="wp-element-caption">E-commerce — Sector moda</figcaption>
    </figure>
    <!-- /wp:image -->

    <!-- wp:image {"sizeSlug":"wf2g-card","style":{"border":{"radius":"12px"},"shadow":"var(--wp--preset--shadow--md)"}} -->
    <figure class="wp-block-image size-wf2g-card" style="border-radius:12px">
      <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%233b82f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='Arial'>Proyecto 2</text></svg>" alt="Proyecto 2"/>
      <figcaption class="wp-element-caption">Corporate — Finanzas</figcaption>
    </figure>
    <!-- /wp:image -->

    <!-- wp:image {"sizeSlug":"wf2g-card","style":{"border":{"radius":"12px"},"shadow":"var(--wp--preset--shadow--md)"}} -->
    <figure class="wp-block-image size-wf2g-card" style="border-radius:12px">
      <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23f59e0b'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='Arial'>Proyecto 3</text></svg>" alt="Proyecto 3"/>
      <figcaption class="wp-element-caption">Landing Page — SaaS</figcaption>
    </figure>
    <!-- /wp:image -->

    <!-- wp:image {"sizeSlug":"wf2g-card","style":{"border":{"radius":"12px"},"shadow":"var(--wp--preset--shadow--md)"}} -->
    <figure class="wp-block-image size-wf2g-card" style="border-radius:12px">
      <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23ef4444'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='Arial'>Proyecto 4</text></svg>" alt="Proyecto 4"/>
      <figcaption class="wp-element-caption">Blog — Gastronomía</figcaption>
    </figure>
    <!-- /wp:image -->

    <!-- wp:image {"sizeSlug":"wf2g-card","style":{"border":{"radius":"12px"},"shadow":"var(--wp--preset--shadow--md)"}} -->
    <figure class="wp-block-image size-wf2g-card" style="border-radius:12px">
      <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%238b5cf6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='Arial'>Proyecto 5</text></svg>" alt="Proyecto 5"/>
      <figcaption class="wp-element-caption">Portfolio — Fotografía</figcaption>
    </figure>
    <!-- /wp:image -->

    <!-- wp:image {"sizeSlug":"wf2g-card","style":{"border":{"radius":"12px"},"shadow":"var(--wp--preset--shadow--md)"}} -->
    <figure class="wp-block-image size-wf2g-card" style="border-radius:12px">
      <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%2306b6d4'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='Arial'>Proyecto 6</text></svg>" alt="Proyecto 6"/>
      <figcaption class="wp-element-caption">Dashboard — EdTech</figcaption>
    </figure>
    <!-- /wp:image -->

  </figure>
  <!-- /wp:gallery -->

</div>
<!-- /wp:group -->
