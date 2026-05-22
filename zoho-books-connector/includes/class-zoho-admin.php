<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ZBC_Admin {

	public function init() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_ajax_zbc_save_settings', array( $this, 'ajax_save_settings' ) );
		add_action( 'wp_ajax_zbc_test_connection', array( $this, 'ajax_test_connection' ) );
		add_action( 'wp_ajax_zbc_clear_cache', array( $this, 'ajax_clear_cache' ) );
		add_action( 'wp_ajax_zbc_admin_disconnect_user', array( $this, 'ajax_admin_disconnect_user' ) );
	}

	public function register_menu() {
		add_menu_page(
			__( 'Zoho Books', 'zoho-books-connector' ),
			__( 'Zoho Books', 'zoho-books-connector' ),
			'manage_options',
			'zoho-books-connector',
			array( $this, 'render_settings_page' ),
			'dashicons-businessman',
			58
		);

		add_submenu_page(
			'zoho-books-connector',
			__( 'Configuración', 'zoho-books-connector' ),
			__( 'Configuración', 'zoho-books-connector' ),
			'manage_options',
			'zoho-books-connector',
			array( $this, 'render_settings_page' )
		);

		add_submenu_page(
			'zoho-books-connector',
			__( 'Usuarios conectados', 'zoho-books-connector' ),
			__( 'Usuarios', 'zoho-books-connector' ),
			'manage_options',
			'zoho-books-users',
			array( $this, 'render_users_page' )
		);
	}

	public function register_settings() {
		register_setting( 'zbc_settings_group', 'zbc_settings', array( $this, 'sanitize_settings' ) );
	}

	public function sanitize_settings( $input ) {
		$clean = array();
		$fields = array( 'client_id', 'client_secret', 'portal_page_id' );
		foreach ( $fields as $field ) {
			$clean[ $field ] = isset( $input[ $field ] ) ? sanitize_text_field( $input[ $field ] ) : '';
		}
		return $clean;
	}

	public function enqueue_assets( $hook ) {
		if ( strpos( $hook, 'zoho-books' ) === false ) {
			return;
		}

		wp_enqueue_style( 'zbc-admin', ZBC_PLUGIN_URL . 'assets/css/admin.css', array(), ZBC_VERSION );
		wp_enqueue_script( 'zbc-admin', ZBC_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery' ), ZBC_VERSION, true );
		wp_localize_script(
			'zbc-admin',
			'zbcAdmin',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'zbc_admin_nonce' ),
				'i18n'    => array(
					'saving'       => __( 'Guardando...', 'zoho-books-connector' ),
					'saved'        => __( '¡Guardado!', 'zoho-books-connector' ),
					'testing'      => __( 'Probando...', 'zoho-books-connector' ),
					'clearing'     => __( 'Limpiando...', 'zoho-books-connector' ),
					'cleared'      => __( '¡Caché limpiado!', 'zoho-books-connector' ),
					'disconnected' => __( 'Usuario desconectado.', 'zoho-books-connector' ),
					'confirm_disc' => __( '¿Desconectar este usuario de Zoho Books?', 'zoho-books-connector' ),
				),
			)
		);
	}

	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		include ZBC_PLUGIN_DIR . 'admin/views/settings.php';
	}

	public function render_users_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		include ZBC_PLUGIN_DIR . 'admin/views/users.php';
	}

	public function ajax_save_settings() {
		check_ajax_referer( 'zbc_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Sin permisos.', 'zoho-books-connector' ) ) );
		}

		$fields = array( 'client_id', 'client_secret', 'portal_page_id' );
		foreach ( $fields as $field ) {
			if ( isset( $_POST[ $field ] ) ) {
				zbc_update_option( $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
			}
		}

		wp_send_json_success( array( 'message' => __( 'Configuración guardada correctamente.', 'zoho-books-connector' ) ) );
	}

	public function ajax_test_connection() {
		check_ajax_referer( 'zbc_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		$client_id     = zbc_get_option( 'client_id' );
		$client_secret = zbc_get_option( 'client_secret' );

		if ( empty( $client_id ) || empty( $client_secret ) ) {
			wp_send_json_error( array( 'message' => __( 'Configura Client ID y Client Secret primero.', 'zoho-books-connector' ) ) );
		}

		wp_send_json_success( array( 'message' => __( 'Credenciales configuradas. Conecta un usuario para verificar el acceso completo.', 'zoho-books-connector' ) ) );
	}

	public function ajax_clear_cache() {
		check_ajax_referer( 'zbc_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		global $wpdb;
		$wpdb->query( "DELETE FROM {$wpdb->prefix}zbc_cache" );

		wp_send_json_success( array( 'message' => __( 'Caché limpiado correctamente.', 'zoho-books-connector' ) ) );
	}

	public function ajax_admin_disconnect_user() {
		check_ajax_referer( 'zbc_admin_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		$user_id = (int) ( $_POST['user_id'] ?? 0 );
		if ( ! $user_id ) {
			wp_send_json_error();
		}

		$auth = new ZBC_Auth();
		$token = $auth->get_token( $user_id );

		if ( $token && ! empty( $token->refresh_token ) ) {
			wp_remote_post(
				ZBC_Auth::ZOHO_REVOKE_URL,
				array( 'body' => array( 'token' => $token->refresh_token ) )
			);
		}

		$auth->delete_token( $user_id );

		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'zbc_cache', array( 'wp_user_id' => $user_id ), array( '%d' ) );

		wp_send_json_success( array( 'message' => __( 'Usuario desconectado.', 'zoho-books-connector' ) ) );
	}

	public function get_connected_users() {
		global $wpdb;

		return $wpdb->get_results(
			"SELECT t.*, u.display_name, u.user_email
			FROM {$wpdb->prefix}zbc_tokens t
			INNER JOIN {$wpdb->users} u ON t.wp_user_id = u.ID
			ORDER BY t.updated_at DESC"
		);
	}
}
