<?php
/**
 * WireFrame-to-Gutenberg — functions.php
 *
 * Tema FSE (Full Site Editing) inspirado en Astra.
 */

defined( 'ABSPATH' ) || exit;

define( 'WF2G_VERSION', '1.0.0' );
define( 'WF2G_DIR',     get_template_directory() );
define( 'WF2G_URI',     get_template_directory_uri() );

// ─── Soporte del tema ────────────────────────────────────────────────────────

add_action( 'after_setup_theme', function () {
    load_theme_textdomain( 'wf2gutenberg', WF2G_DIR . '/languages' );

    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'script', 'style' ] );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo', [
        'height'      => 80,
        'width'       => 200,
        'flex-width'  => true,
        'flex-height' => true,
    ] );
    add_theme_support( 'title-tag' );

    add_editor_style( 'assets/css/editor-style.css' );

    register_nav_menus( [
        'primary'   => __( 'Menú Principal', 'wf2gutenberg' ),
        'footer'    => __( 'Menú Pie de Página', 'wf2gutenberg' ),
        'secondary' => __( 'Menú Secundario', 'wf2gutenberg' ),
    ] );
} );

// ─── Fuentes web (Google Fonts via preconnect) ───────────────────────────────

add_action( 'wp_head', function () {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    echo '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">' . "\n";
} );

// ─── Estilos y scripts del frontend ─────────────────────────────────────────

add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'wf2g-style',
        WF2G_URI . '/assets/css/main.css',
        [],
        WF2G_VERSION
    );

    wp_enqueue_script(
        'wf2g-scripts',
        WF2G_URI . '/assets/js/main.js',
        [],
        WF2G_VERSION,
        true
    );

    wp_localize_script( 'wf2g-scripts', 'wf2gData', [
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'wf2g_nonce' ),
    ] );
} );

// ─── Estilos para el editor de bloques ──────────────────────────────────────

add_action( 'enqueue_block_editor_assets', function () {
    wp_enqueue_style(
        'wf2g-editor-style',
        WF2G_URI . '/assets/css/editor-style.css',
        [ 'wp-edit-blocks' ],
        WF2G_VERSION
    );
} );

// ─── Registro de Block Patterns ──────────────────────────────────────────────

add_action( 'init', function () {
    // Categoría propia para los patrones
    register_block_pattern_category( 'wf2g', [
        'label'       => __( 'WireFrame2Gutenberg', 'wf2gutenberg' ),
        'description' => __( 'Patrones de diseño listos para personalizar con tus wireframes.', 'wf2gutenberg' ),
    ] );

    $patterns_dir = WF2G_DIR . '/patterns';
    if ( is_dir( $patterns_dir ) ) {
        foreach ( glob( $patterns_dir . '/*.php' ) as $file ) {
            require_once $file;
        }
    }
} );

// ─── Anchos de imagen personalizados ────────────────────────────────────────

add_action( 'after_setup_theme', function () {
    add_image_size( 'wf2g-hero',      1920, 800,  true );
    add_image_size( 'wf2g-card',       600, 400,  true );
    add_image_size( 'wf2g-thumbnail',  400, 300,  true );
    add_image_size( 'wf2g-avatar',     120, 120,  true );
} );

// ─── Widget de texto para zonas no-FSE (compatibilidad) ─────────────────────

add_action( 'widgets_init', function () {
    register_sidebar( [
        'name'          => __( 'Barra Lateral Blog', 'wf2gutenberg' ),
        'id'            => 'sidebar-blog',
        'description'   => __( 'Widgets para la barra lateral del blog.', 'wf2gutenberg' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ] );
} );

// ─── Filtros de contenido ────────────────────────────────────────────────────

// Longitud del extracto
add_filter( 'excerpt_length', fn() => 25 );
add_filter( 'excerpt_more',   fn() => ' &hellip; <a href="' . get_permalink() . '" class="read-more">' . __( 'Leer más', 'wf2gutenberg' ) . '</a>' );

// ─── Includes adicionales ────────────────────────────────────────────────────

foreach ( [ 'helpers', 'block-filters', 'customizer' ] as $inc ) {
    $file = WF2G_DIR . "/inc/{$inc}.php";
    if ( file_exists( $file ) ) {
        require_once $file;
    }
}
