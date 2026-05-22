<?php
/**
 * Plugin Name:       Zoho Books Connector
 * Plugin URI:        https://github.com/allmygpt/zapier
 * Description:       Conecta WordPress con Zoho Books para mostrar clientes, presupuestos, facturas y proyectos con autenticación de usuario.
 * Version:           1.0.0
 * Author:            AllMyGPT
 * License:           GPL-2.0+
 * Text Domain:       zoho-books-connector
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ZBC_VERSION', '1.0.0' );
define( 'ZBC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ZBC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ZBC_PLUGIN_FILE', __FILE__ );

require_once ZBC_PLUGIN_DIR . 'includes/class-zoho-auth.php';
require_once ZBC_PLUGIN_DIR . 'includes/class-zoho-api.php';
require_once ZBC_PLUGIN_DIR . 'includes/class-zoho-admin.php';
require_once ZBC_PLUGIN_DIR . 'includes/class-zoho-shortcodes.php';
require_once ZBC_PLUGIN_DIR . 'includes/class-zoho-user-portal.php';

register_activation_hook( __FILE__, 'zbc_activate' );
register_deactivation_hook( __FILE__, 'zbc_deactivate' );

function zbc_activate() {
	global $wpdb;

	$charset_collate = $wpdb->get_charset_collate();
	$table_tokens    = $wpdb->prefix . 'zbc_tokens';
	$table_cache     = $wpdb->prefix . 'zbc_cache';

	$sql_tokens = "CREATE TABLE IF NOT EXISTS $table_tokens (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		wp_user_id BIGINT UNSIGNED NOT NULL,
		zoho_user_id VARCHAR(255) DEFAULT '',
		access_token TEXT NOT NULL,
		refresh_token TEXT NOT NULL,
		expires_at DATETIME NOT NULL,
		organization_id VARCHAR(100) DEFAULT '',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		PRIMARY KEY (id),
		UNIQUE KEY wp_user_id (wp_user_id)
	) $charset_collate;";

	$sql_cache = "CREATE TABLE IF NOT EXISTS $table_cache (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		cache_key VARCHAR(255) NOT NULL,
		wp_user_id BIGINT UNSIGNED NOT NULL,
		data LONGTEXT NOT NULL,
		expires_at DATETIME NOT NULL,
		PRIMARY KEY (id),
		UNIQUE KEY cache_key_user (cache_key, wp_user_id)
	) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql_tokens );
	dbDelta( $sql_cache );

	add_option( 'zbc_version', ZBC_VERSION );
}

function zbc_deactivate() {
	wp_clear_scheduled_hook( 'zbc_refresh_tokens_cron' );
}

function zbc_init() {
	$auth       = new ZBC_Auth();
	$admin      = new ZBC_Admin();
	$shortcodes = new ZBC_Shortcodes();
	$portal     = new ZBC_User_Portal();

	$auth->init();
	$admin->init();
	$shortcodes->init();
	$portal->init();

	add_action( 'zbc_refresh_tokens_cron', array( $auth, 'cron_refresh_all_tokens' ) );

	if ( ! wp_next_scheduled( 'zbc_refresh_tokens_cron' ) ) {
		wp_schedule_event( time(), 'hourly', 'zbc_refresh_tokens_cron' );
	}
}
add_action( 'plugins_loaded', 'zbc_init' );

function zbc_get_option( $key, $default = '' ) {
	$options = get_option( 'zbc_settings', array() );
	return isset( $options[ $key ] ) ? $options[ $key ] : $default;
}

function zbc_update_option( $key, $value ) {
	$options         = get_option( 'zbc_settings', array() );
	$options[ $key ] = $value;
	update_option( 'zbc_settings', $options );
}
