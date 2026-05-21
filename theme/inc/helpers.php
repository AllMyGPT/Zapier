<?php
/**
 * Funciones auxiliares del tema WireFrame-to-Gutenberg.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Devuelve el tiempo estimado de lectura de un post.
 */
function wf2g_reading_time( int $post_id = 0 ): string {
    $content = get_post_field( 'post_content', $post_id ?: get_the_ID() );
    $words   = str_word_count( wp_strip_all_tags( $content ) );
    $minutes = max( 1, (int) ceil( $words / 200 ) );
    return sprintf(
        _n( '%d min de lectura', '%d min de lectura', $minutes, 'wf2gutenberg' ),
        $minutes
    );
}

/**
 * Genera un placeholder SVG de color para imágenes destacadas ausentes.
 */
function wf2g_placeholder_image( string $color = '#e2e8f0' ): string {
    $svg = sprintf(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" style="background:%s"><text x="50%%" y="50%%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="48">📷</text></svg>',
        esc_attr( $color )
    );
    return 'data:image/svg+xml;base64,' . base64_encode( $svg );
}

/**
 * Sanitiza un color hex para uso en atributos.
 */
function wf2g_sanitize_hex_color( string $color ): string {
    if ( '' === $color ) return '';
    if ( preg_match( '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $color ) ) {
        return $color;
    }
    return '';
}
