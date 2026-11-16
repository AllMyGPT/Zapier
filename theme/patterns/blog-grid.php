<?php
/**
 * Title: Grid de Blog
 * Slug: wf2gutenberg/blog-grid
 * Categories: wf2g, query
 * Keywords: blog, entradas, artículos, grid
 * Description: Grid de últimas entradas con 3 columnas.
 */
?>
<!-- wp:group {"className":"wf2g-blog-preview","style":{"color":{"background":"var(--wp--preset--color--base)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-blog-preview">

  <!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"},"style":{"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--70)"}}}} -->
  <div class="wp-block-group">
    <!-- wp:group {"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--20)"}}} -->
    <div class="wp-block-group">
      <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","letterSpacing":"0.08em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
      <p style="color:var(--wp--preset--color--primary);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Últimos artículos</p>
      <!-- /wp:paragraph -->
      <!-- wp:heading {"level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
      <h2 class="wp-block-heading">Del blog</h2>
      <!-- /wp:heading -->
    </div>
    <!-- /wp:group -->
    <!-- wp:buttons -->
    <div class="wp-block-buttons">
      <!-- wp:button {"className":"is-style-outline","style":{"border":{"color":"var(--wp--preset--color--primary)","radius":"6px","width":"2px"},"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600"}}} -->
      <div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/blog" style="border-radius:6px;font-weight:600">Ver todos los artículos →</a></div>
      <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
  </div>
  <!-- /wp:group -->

  <!-- wp:query {"queryId":2,"query":{"perPage":3,"postType":"post","order":"desc","orderBy":"date","inherit":false}} -->
  <div class="wp-block-query">
    <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
      <!-- wp:group {"className":"card","style":{"border":{"radius":"12px","width":"1px","color":"var(--wp--preset--color--border)"},"shadow":"var(--wp--preset--shadow--card)","spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}} -->
      <div class="wp-block-group card">
        <!-- wp:post-featured-image {"isLink":true,"aspectRatio":"16/9","style":{"border":{"radius":"12px 12px 0 0"}}} /-->
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var(--wp--preset--spacing--50)","bottom":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--50)","right":"var(--wp--preset--spacing--50)"},"blockGap":"var(--wp--preset--spacing--30)"}},"layout":{"type":"flex","orientation":"vertical","flexWrap":"nowrap"}} -->
        <div class="wp-block-group">
          <!-- wp:post-terms {"term":"category","style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","letterSpacing":"0.05em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--xs)"}}} /-->
          <!-- wp:post-title {"isLink":true,"style":{"typography":{"fontWeight":"700","lineHeight":"1.3"},"elements":{"link":{"color":{"text":"var(--wp--preset--color--contrast)"},":hover":{"color":{"text":"var(--wp--preset--color--primary)"}}}}}} /-->
          <!-- wp:post-excerpt {"numberOfWords":15,"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} /-->
          <!-- wp:template-part {"slug":"post-meta","theme":"wf2gutenberg"} /-->
        </div>
        <!-- /wp:group -->
      </div>
      <!-- /wp:group -->
    <!-- /wp:post-template -->
  </div>
  <!-- /wp:query -->

</div>
<!-- /wp:group -->
