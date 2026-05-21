<?php
/**
 * Title: Testimonios
 * Slug: wf2gutenberg/testimonials-slider
 * Categories: wf2g
 * Keywords: testimonios, reseñas, clientes, opiniones
 * Description: Sección de tres testimonios de clientes en tarjetas.
 */
?>
<!-- wp:group {"className":"wf2g-testimonials","style":{"color":{"background":"var(--wp--preset--color--base-3)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-testimonials">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"600px"},"style":{"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--80)"},"blockGap":"var(--wp--preset--spacing--20)"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--secondary)"},"typography":{"fontWeight":"700","fontSize":"2rem","lineHeight":"1"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--secondary);font-weight:700;font-size:2rem">★★★★★</p>
    <!-- /wp:paragraph -->
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
    <h2 class="wp-block-heading has-text-align-center">Lo que dicen nuestros clientes</h2>
    <!-- /wp:heading -->
  </div>
  <!-- /wp:group -->

  <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--50)"}}}} -->
  <div class="wp-block-columns">

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"testimonial-card","style":{"border":{"radius":"16px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--md)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group testimonial-card" style="background-color:#fff">
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--secondary)"},"typography":{"fontSize":"var(--wp--preset--font-size--medium)"}}} -->
        <p style="color:var(--wp--preset--color--secondary)">★★★★★</p>
        <!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-2)"},"typography":{"fontStyle":"italic","fontSize":"var(--wp--preset--font-size--large)","lineHeight":"1.6"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <p style="color:var(--wp--preset--color--contrast-2);font-style:italic;font-size:var(--wp--preset--font-size--large);line-height:1.6">"El tema superó todas mis expectativas. La velocidad de carga es impresionante y el editor de bloques es muy intuitivo."</p>
        <!-- /wp:paragraph -->
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
        <div class="wp-block-group">
          <!-- wp:image {"width":48,"height":48,"style":{"border":{"radius":"50%"}}} -->
          <figure class="wp-block-image" style="width:48px;height:48px"><img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='24' fill='%231a6b3c'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-family='Arial'>M</text></svg>" alt="Avatar" style="border-radius:50%"/></figure>
          <!-- /wp:image -->
          <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} -->
          <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"var(--wp--preset--font-size--medium)"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} --><p style="font-weight:700;margin:0">María García</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} --><p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small);margin:0">CEO, StartupXYZ</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"testimonial-card","style":{"border":{"radius":"16px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--md)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group testimonial-card" style="background-color:#fff">
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--secondary)"}}} --><p style="color:var(--wp--preset--color--secondary)">★★★★★</p><!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-2)"},"typography":{"fontStyle":"italic","fontSize":"var(--wp--preset--font-size--large)","lineHeight":"1.6"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <p style="color:var(--wp--preset--color--contrast-2);font-style:italic;font-size:var(--wp--preset--font-size--large);line-height:1.6">"Pasamos de un tema genérico a algo completamente personalizado en días. El proceso fue muy ágil."</p>
        <!-- /wp:paragraph -->
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
        <div class="wp-block-group">
          <!-- wp:image {"width":48,"height":48,"style":{"border":{"radius":"50%"}}} -->
          <figure class="wp-block-image" style="width:48px;height:48px"><img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='24' fill='%233b82f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-family='Arial'>J</text></svg>" alt="Avatar" style="border-radius:50%"/></figure>
          <!-- /wp:image -->
          <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} -->
          <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"var(--wp--preset--font-size--medium)"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} --><p style="font-weight:700;margin:0">Juan López</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} --><p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small);margin:0">Director, AgenciaDigital</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"testimonial-card","style":{"border":{"radius":"16px"},"color":{"background":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--60)","bottom":"var(--wp--preset--spacing--60)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--md)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group testimonial-card" style="background-color:#fff">
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--secondary)"}}} --><p style="color:var(--wp--preset--color--secondary)">★★★★★</p><!-- /wp:paragraph -->
        <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-2)"},"typography":{"fontStyle":"italic","fontSize":"var(--wp--preset--font-size--large)","lineHeight":"1.6"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <p style="color:var(--wp--preset--color--contrast-2);font-style:italic;font-size:var(--wp--preset--font-size--large);line-height:1.6">"El soporte es excelente y la documentación muy clara. Recomiendo este tema a cualquier profesional."</p>
        <!-- /wp:paragraph -->
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
        <div class="wp-block-group">
          <!-- wp:image {"width":48,"height":48,"style":{"border":{"radius":"50%"}}} -->
          <figure class="wp-block-image" style="width:48px;height:48px"><img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><circle cx='24' cy='24' r='24' fill='%23f59e0b'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-family='Arial'>A</text></svg>" alt="Avatar" style="border-radius:50%"/></figure>
          <!-- /wp:image -->
          <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} -->
          <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"var(--wp--preset--font-size--medium)"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} --><p style="font-weight:700;margin:0">Ana Martínez</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} --><p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small);margin:0">Freelance Designer</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

  </div>
  <!-- /wp:columns -->

</div>
<!-- /wp:group -->
