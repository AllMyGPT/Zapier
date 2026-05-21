<?php
/**
 * Opciones del Customizer para el tema WireFrame-to-Gutenberg.
 * Solo ajustes que no se cubren con theme.json / FSE.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'customize_register', function ( WP_Customize_Manager $wp_customize ) {

    // ── Sección: Cabecera ──────────────────────────────────
    $wp_customize->add_section( 'wf2g_header', [
        'title'    => __( 'Cabecera', 'wf2gutenberg' ),
        'priority' => 30,
    ] );

    $wp_customize->add_setting( 'wf2g_sticky_header', [
        'default'           => true,
        'sanitize_callback' => 'rest_sanitize_boolean',
        'transport'         => 'refresh',
    ] );
    $wp_customize->add_control( 'wf2g_sticky_header', [
        'type'        => 'checkbox',
        'section'     => 'wf2g_header',
        'label'       => __( 'Cabecera fija al hacer scroll', 'wf2gutenberg' ),
    ] );

    // ── Sección: Footer ────────────────────────────────────
    $wp_customize->add_section( 'wf2g_footer', [
        'title'    => __( 'Pie de página', 'wf2gutenberg' ),
        'priority' => 35,
    ] );

    $wp_customize->add_setting( 'wf2g_footer_text', [
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ] );
    $wp_customize->add_control( 'wf2g_footer_text', [
        'type'        => 'text',
        'section'     => 'wf2g_footer',
        'label'       => __( 'Texto adicional del pie', 'wf2gutenberg' ),
        'description' => __( 'Texto que aparece junto al copyright.', 'wf2gutenberg' ),
    ] );

} );
