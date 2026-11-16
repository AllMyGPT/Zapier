<?php
/**
 * Filtros y extensiones para bloques de Gutenberg.
 */

defined( 'ABSPATH' ) || exit;

// Elimina estilos de bloques no usados en el frontend para mejorar rendimiento
add_filter( 'should_load_separate_core_block_assets', '__return_true' );

// Añade clase CSS a la imagen destacada cuando no existe
add_filter( 'post_thumbnail_html', function ( string $html, int $post_id ): string {
    if ( ! $html ) {
        $placeholder = wf2g_placeholder_image();
        $html = sprintf(
            '<img src="%s" alt="%s" class="wp-post-image placeholder-image" loading="lazy" decoding="async">',
            esc_attr( $placeholder ),
            esc_attr( get_the_title( $post_id ) )
        );
    }
    return $html;
}, 10, 2 );

// Añade atributos de accesibilidad a iframes embebidos
add_filter( 'embed_oembed_html', function ( string $html ): string {
    if ( str_contains( $html, '<iframe' ) && ! str_contains( $html, 'title=' ) ) {
        $html = str_replace( '<iframe', '<iframe title="Video embebido"', $html );
    }
    return $html;
} );

// Limpia el head de WordPress (etiquetas innecesarias)
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
