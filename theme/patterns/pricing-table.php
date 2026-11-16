<?php
/**
 * Title: Tabla de Precios
 * Slug: wf2gutenberg/pricing-table
 * Categories: wf2g
 * Keywords: precios, planes, tarifas, pricing
 * Description: Tres planes de precios con lista de características.
 */
?>
<!-- wp:group {"className":"wf2g-pricing","id":"precios","style":{"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-pricing" id="precios">

  <!-- wp:group {"layout":{"type":"constrained","contentSize":"600px"},"style":{"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--80)"},"blockGap":"var(--wp--preset--spacing--30)"}}} -->
  <div class="wp-block-group">
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","letterSpacing":"0.08em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--primary);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Planes y precios</p>
    <!-- /wp:paragraph -->
    <!-- wp:heading {"textAlign":"center","level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"}}} -->
    <h2 class="wp-block-heading has-text-align-center">Elige el plan perfecto para ti</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","style":{"color":{"text":"var(--wp--preset--color--contrast-3)"}}} -->
    <p class="has-text-align-center" style="color:var(--wp--preset--color--contrast-3)">Sin costes ocultos. Cancela cuando quieras.</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->

  <!-- wp:columns {"isStackedOnMobile":true,"verticalAlignment":"center","style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--50)","left":"var(--wp--preset--spacing--50)"}}}} -->
  <div class="wp-block-columns are-vertically-aligned-center">

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"pricing-card","style":{"border":{"radius":"16px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--70)","bottom":"var(--wp--preset--spacing--70)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--sm)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group pricing-card">
        <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.05em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"},"color":{"text":"var(--wp--preset--color--contrast-3)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3);font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Básico</p>
        <!-- /wp:paragraph -->
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"baseline"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--10)","margin":{"top":"var(--wp--preset--spacing--30)","bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <div class="wp-block-group">
          <!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"900","letterSpacing":"-0.03em","fontSize":"clamp(2.5rem,5vw,3.5rem)"}}} --><h3 class="wp-block-heading" style="font-weight:900;letter-spacing:-0.03em;font-size:clamp(2.5rem,5vw,3.5rem)">29€</h3><!-- /wp:heading -->
          <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} --><p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small)">/mes</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:list {"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--30)"}},"className":"pricing-list"} -->
        <ul class="wp-block-list pricing-list">
          <li>✓ 1 sitio web</li>
          <li>✓ Plantillas básicas</li>
          <li>✓ Soporte por email</li>
          <li>✓ Actualizaciones 6 meses</li>
          <li style="color:var(--wp--preset--color--contrast-3)">✗ Patrones premium</li>
          <li style="color:var(--wp--preset--color--contrast-3)">✗ Soporte prioritario</li>
        </ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var(--wp--preset--spacing--60)"}}}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"is-style-outline","width":100,"style":{"border":{"color":"var(--wp--preset--color--primary)","radius":"8px","width":"2px"},"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600"}}} -->
          <div class="wp-block-button is-style-outline has-custom-width wp-block-button__width-100"><a class="wp-block-button__link wp-element-button" href="#contacto" style="border-radius:8px;font-weight:600">Empezar gratis</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"pricing-card pricing-card--featured","style":{"border":{"radius":"16px"},"color":{"background":"var(--wp--preset--color--primary)","text":"#ffffff"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--70)","bottom":"var(--wp--preset--spacing--70)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--xl)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group pricing-card pricing-card--featured" style="background-color:var(--wp--preset--color--primary);color:#fff">
        <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"center"}} -->
        <div class="wp-block-group">
          <!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,0.8)"},"typography":{"fontWeight":"700","letterSpacing":"0.05em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
          <p style="color:rgba(255,255,255,0.8);font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Profesional</p>
          <!-- /wp:paragraph -->
          <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--secondary)"},"typography":{"fontWeight":"700","fontSize":"var(--wp--preset--font-size--xs)","letterSpacing":"0.05em","textTransform":"uppercase"},"border":{"color":"var(--wp--preset--color--secondary)","width":"1px","radius":"99px"},"spacing":{"padding":{"top":"0.25rem","bottom":"0.25rem","left":"0.75rem","right":"0.75rem"}}}} -->
          <p style="color:var(--wp--preset--color--secondary);font-weight:700;font-size:var(--wp--preset--font-size--xs);text-transform:uppercase;border:1px solid var(--wp--preset--color--secondary);border-radius:99px;padding:0.25rem 0.75rem">Más popular</p>
          <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"baseline"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--10)","margin":{"top":"var(--wp--preset--spacing--30)","bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <div class="wp-block-group">
          <!-- wp:heading {"level":3,"style":{"color":{"text":"#ffffff"},"typography":{"fontWeight":"900","letterSpacing":"-0.03em","fontSize":"clamp(2.5rem,5vw,3.5rem)"}}} --><h3 class="wp-block-heading" style="color:#fff;font-weight:900;font-size:clamp(2.5rem,5vw,3.5rem)">79€</h3><!-- /wp:heading -->
          <!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,0.7)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} --><p style="color:rgba(255,255,255,0.7);font-size:var(--wp--preset--font-size--small)">/mes</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:list {"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--30)"},"color":{"text":"rgba(255,255,255,0.9)"}},"className":"pricing-list"} -->
        <ul class="wp-block-list pricing-list" style="color:rgba(255,255,255,0.9)">
          <li>✓ 5 sitios web</li>
          <li>✓ Todas las plantillas</li>
          <li>✓ Todos los patrones</li>
          <li>✓ Soporte prioritario</li>
          <li>✓ Actualizaciones ilimitadas</li>
          <li>✓ Consultoría inicial (1h)</li>
        </ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var(--wp--preset--spacing--60)"}}}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"width":100,"style":{"border":{"radius":"8px"},"color":{"background":"#ffffff","text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700"}}} -->
          <div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link wp-element-button" href="#contacto" style="border-radius:8px;background-color:#fff;color:var(--wp--preset--color--primary);font-weight:700">Comenzar ahora →</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column">
      <!-- wp:group {"className":"pricing-card","style":{"border":{"radius":"16px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--70)","bottom":"var(--wp--preset--spacing--70)","left":"var(--wp--preset--spacing--60)","right":"var(--wp--preset--spacing--60)"}},"shadow":"var(--wp--preset--shadow--sm)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group pricing-card">
        <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","letterSpacing":"0.05em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"},"color":{"text":"var(--wp--preset--color--contrast-3)"}}} -->
        <p style="color:var(--wp--preset--color--contrast-3);font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Empresa</p>
        <!-- /wp:paragraph -->
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"baseline"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--10)","margin":{"top":"var(--wp--preset--spacing--30)","bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <div class="wp-block-group">
          <!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"900","letterSpacing":"-0.03em","fontSize":"clamp(2.5rem,5vw,3.5rem)"}}} --><h3 class="wp-block-heading" style="font-weight:900;font-size:clamp(2.5rem,5vw,3.5rem)">199€</h3><!-- /wp:heading -->
          <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--small)"}}} --><p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--small)">/mes</p><!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:list {"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--30)"}},"className":"pricing-list"} -->
        <ul class="wp-block-list pricing-list">
          <li>✓ Sitios ilimitados</li>
          <li>✓ Desarrollo a medida</li>
          <li>✓ SLA garantizado</li>
          <li>✓ Soporte 24/7</li>
          <li>✓ Gestor de cuenta</li>
          <li>✓ Formación del equipo</li>
        </ul>
        <!-- /wp:list -->
        <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var(--wp--preset--spacing--60)"}}}} -->
        <div class="wp-block-buttons">
          <!-- wp:button {"className":"is-style-outline","width":100,"style":{"border":{"color":"var(--wp--preset--color--primary)","radius":"8px","width":"2px"},"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"600"}}} -->
          <div class="wp-block-button is-style-outline has-custom-width wp-block-button__width-100"><a class="wp-block-button__link wp-element-button" href="#contacto" style="border-radius:8px;font-weight:600">Contactar ventas</a></div>
          <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

  </div>
  <!-- /wp:columns -->

</div>
<!-- /wp:group -->
