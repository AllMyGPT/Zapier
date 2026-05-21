<?php
/**
 * Title: Sección de Contacto
 * Slug: wf2gutenberg/contact-section
 * Categories: wf2g
 * Keywords: contacto, formulario, email, teléfono
 * Description: Sección de contacto con información y formulario nativo.
 */
?>
<!-- wp:group {"className":"wf2g-contact","id":"contacto","style":{"spacing":{"padding":{"top":"var(--wp--preset--spacing--90)","bottom":"var(--wp--preset--spacing--90)"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group wf2g-contact" id="contacto">

  <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var(--wp--preset--spacing--80)","left":"var(--wp--preset--spacing--80)"}}}} -->
  <div class="wp-block-columns">

    <!-- wp:column {"width":"40%"} -->
    <div class="wp-block-column" style="flex-basis:40%">

      <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--primary)"},"typography":{"fontWeight":"700","letterSpacing":"0.08em","textTransform":"uppercase","fontSize":"var(--wp--preset--font-size--small)"}}} -->
      <p style="color:var(--wp--preset--color--primary);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Hablemos</p>
      <!-- /wp:paragraph -->

      <!-- wp:heading {"level":2,"style":{"typography":{"fontWeight":"800","letterSpacing":"-0.025em"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--20)"}}}} -->
      <h2 class="wp-block-heading">¿Tienes un proyecto en mente?</h2>
      <!-- /wp:heading -->

      <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"typography":{"fontSize":"var(--wp--preset--font-size--large)"},"spacing":{"margin":{"top":"var(--wp--preset--spacing--40)"}}}} -->
      <p style="color:var(--wp--preset--color--contrast-3);font-size:var(--wp--preset--font-size--large)">Cuéntanos tu idea y te responderemos en menos de 24 horas.</p>
      <!-- /wp:paragraph -->

      <!-- wp:group {"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)","margin":{"top":"var(--wp--preset--spacing--60)"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group">

        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
        <div class="wp-block-group">
          <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(26,107,60,0.1)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}},"layout":{"selfStretch":"fit"}}} -->
          <div class="wp-block-group" style="background-color:rgba(26,107,60,0.1);border-radius:12px;padding:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem","lineHeight":"1"}}} --><p style="font-size:1.5rem;line-height:1">✉️</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
          <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} -->
          <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"bottom":"0"}}}} --><p style="font-weight:700;margin-bottom:0">Email</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"spacing":{"margin":{"top":"0"}}}} --><p style="color:var(--wp--preset--color--contrast-3);margin-top:0"><a href="mailto:hola@tusitio.com">hola@tusitio.com</a></p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
        <div class="wp-block-group">
          <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(26,107,60,0.1)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}}}} -->
          <div class="wp-block-group" style="background-color:rgba(26,107,60,0.1);border-radius:12px;padding:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem","lineHeight":"1"}}} --><p style="font-size:1.5rem;line-height:1">📞</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
          <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} -->
          <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"bottom":"0"}}}} --><p style="font-weight:700;margin-bottom:0">Teléfono</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"spacing":{"margin":{"top":"0"}}}} --><p style="color:var(--wp--preset--color--contrast-3);margin-top:0"><a href="tel:+34900000000">+34 900 000 000</a></p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"var(--wp--preset--spacing--40)"}}} -->
        <div class="wp-block-group">
          <!-- wp:group {"style":{"border":{"radius":"12px"},"color":{"background":"rgba(26,107,60,0.1)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--40)","bottom":"var(--wp--preset--spacing--40)","left":"var(--wp--preset--spacing--40)","right":"var(--wp--preset--spacing--40)"}}}} -->
          <div class="wp-block-group" style="background-color:rgba(26,107,60,0.1);border-radius:12px;padding:var(--wp--preset--spacing--40)">
            <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.5rem","lineHeight":"1"}}} --><p style="font-size:1.5rem;line-height:1">📍</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
          <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"0"}}} -->
          <div class="wp-block-group">
            <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"bottom":"0"}}}} --><p style="font-weight:700;margin-bottom:0">Ubicación</p><!-- /wp:paragraph -->
            <!-- wp:paragraph {"style":{"color":{"text":"var(--wp--preset--color--contrast-3)"},"spacing":{"margin":{"top":"0"}}}} --><p style="color:var(--wp--preset--color--contrast-3);margin-top:0">Tu Ciudad, País</p><!-- /wp:paragraph -->
          </div>
          <!-- /wp:group -->
        </div>
        <!-- /wp:group -->

      </div>
      <!-- /wp:group -->

    </div>
    <!-- /wp:column -->

    <!-- wp:column {"width":"60%"} -->
    <div class="wp-block-column" style="flex-basis:60%">

      <!-- wp:group {"style":{"border":{"radius":"20px","width":"1px","color":"var(--wp--preset--color--border)"},"spacing":{"padding":{"top":"var(--wp--preset--spacing--70)","bottom":"var(--wp--preset--spacing--70)","left":"var(--wp--preset--spacing--70)","right":"var(--wp--preset--spacing--70)"}},"shadow":"var(--wp--preset--shadow--lg)"},"layout":{"type":"flex","orientation":"vertical"}} -->
      <div class="wp-block-group" style="border-radius:20px">

        <!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"700"},"spacing":{"margin":{"bottom":"var(--wp--preset--spacing--50)"}}}} -->
        <h3 class="wp-block-heading">Envíanos un mensaje</h3>
        <!-- /wp:heading -->

        <!-- wp:html -->
        <form class="wf2g-contact-form" method="post" action="">
          <?php if ( function_exists( 'wp_nonce_field' ) ) : ?>
          <?php endif; ?>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
            <div>
              <label for="wf2g-name" style="display:block;font-weight:600;margin-bottom:.375rem;font-size:.875rem">Nombre *</label>
              <input type="text" id="wf2g-name" name="name" required placeholder="Tu nombre" style="width:100%;padding:.75rem 1rem;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:1rem;transition:border-color .2s ease" onfocus="this.style.borderColor='#1a6b3c'" onblur="this.style.borderColor='#e2e8f0'">
            </div>
            <div>
              <label for="wf2g-email" style="display:block;font-weight:600;margin-bottom:.375rem;font-size:.875rem">Email *</label>
              <input type="email" id="wf2g-email" name="email" required placeholder="tu@email.com" style="width:100%;padding:.75rem 1rem;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:1rem;transition:border-color .2s ease" onfocus="this.style.borderColor='#1a6b3c'" onblur="this.style.borderColor='#e2e8f0'">
            </div>
          </div>
          <div style="margin-bottom:1rem">
            <label for="wf2g-subject" style="display:block;font-weight:600;margin-bottom:.375rem;font-size:.875rem">Asunto</label>
            <input type="text" id="wf2g-subject" name="subject" placeholder="¿En qué podemos ayudarte?" style="width:100%;padding:.75rem 1rem;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:1rem;transition:border-color .2s ease" onfocus="this.style.borderColor='#1a6b3c'" onblur="this.style.borderColor='#e2e8f0'">
          </div>
          <div style="margin-bottom:1.5rem">
            <label for="wf2g-message" style="display:block;font-weight:600;margin-bottom:.375rem;font-size:.875rem">Mensaje *</label>
            <textarea id="wf2g-message" name="message" required rows="5" placeholder="Cuéntanos sobre tu proyecto..." style="width:100%;padding:.75rem 1rem;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:1rem;resize:vertical;transition:border-color .2s ease" onfocus="this.style.borderColor='#1a6b3c'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
          </div>
          <button type="submit" style="width:100%;padding:1rem 2rem;background:#1a6b3c;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:1rem;font-weight:700;cursor:pointer;transition:background-color .2s ease,transform .15s ease" onmouseover="this.style.backgroundColor='#0f4526'" onmouseout="this.style.backgroundColor='#1a6b3c'">Enviar mensaje →</button>
          <p style="margin-top:.75rem;font-size:.8rem;color:#64748b;text-align:center">* Campos obligatorios. No compartimos tus datos.</p>
        </form>
        <!-- /wp:html -->

      </div>
      <!-- /wp:group -->

    </div>
    <!-- /wp:column -->

  </div>
  <!-- /wp:columns -->

</div>
<!-- /wp:group -->
