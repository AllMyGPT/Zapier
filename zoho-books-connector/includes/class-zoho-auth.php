<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ZBC_Auth {

	const ZOHO_AUTH_URL  = 'https://accounts.zoho.com/oauth/v2/auth';
	const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';
	const ZOHO_REVOKE_URL = 'https://accounts.zoho.com/oauth/v2/token/revoke';

	const SCOPES = 'ZohoBooks.contacts.READ,ZohoBooks.estimates.READ,ZohoBooks.invoices.READ,ZohoBooks.projects.READ,ZohoBooks.settings.READ';

	public function init() {
		add_action( 'wp_ajax_zbc_connect_zoho', array( $this, 'handle_connect' ) );
		add_action( 'wp_ajax_zbc_disconnect_zoho', array( $this, 'handle_disconnect' ) );
		add_action( 'init', array( $this, 'handle_oauth_callback' ) );
	}

	public function get_authorization_url( $wp_user_id ) {
		$client_id    = zbc_get_option( 'client_id' );
		$redirect_uri = $this->get_redirect_uri();

		$state = wp_create_nonce( 'zbc_oauth_' . $wp_user_id );
		set_transient( 'zbc_oauth_state_' . $wp_user_id, $state, 600 );

		$params = array(
			'response_type' => 'code',
			'client_id'     => $client_id,
			'redirect_uri'  => $redirect_uri,
			'scope'         => self::SCOPES,
			'access_type'   => 'offline',
			'state'         => $state . '|' . $wp_user_id,
			'prompt'        => 'consent',
		);

		return self::ZOHO_AUTH_URL . '?' . http_build_query( $params );
	}

	public function handle_connect() {
		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'Debes iniciar sesión para conectar con Zoho.', 'zoho-books-connector' ) ) );
		}

		$client_id = zbc_get_option( 'client_id' );
		if ( empty( $client_id ) ) {
			wp_send_json_error( array( 'message' => __( 'El administrador debe configurar las credenciales de Zoho primero.', 'zoho-books-connector' ) ) );
		}

		$auth_url = $this->get_authorization_url( get_current_user_id() );
		wp_send_json_success( array( 'auth_url' => $auth_url ) );
	}

	public function handle_disconnect() {
		check_ajax_referer( 'zbc_disconnect', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error();
		}

		$user_id = get_current_user_id();
		$token   = $this->get_token( $user_id );

		if ( $token && ! empty( $token->refresh_token ) ) {
			$this->revoke_token( $token->refresh_token );
		}

		$this->delete_token( $user_id );
		$this->clear_user_cache( $user_id );

		wp_send_json_success( array( 'message' => __( 'Desconectado de Zoho Books correctamente.', 'zoho-books-connector' ) ) );
	}

	public function handle_oauth_callback() {
		if ( ! isset( $_GET['zbc_oauth'] ) || $_GET['zbc_oauth'] !== '1' ) {
			return;
		}

		if ( isset( $_GET['error'] ) ) {
			$this->redirect_with_message( 'error', urlencode( sanitize_text_field( $_GET['error_description'] ?? $_GET['error'] ) ) );
			return;
		}

		if ( empty( $_GET['code'] ) || empty( $_GET['state'] ) ) {
			$this->redirect_with_message( 'error', urlencode( __( 'Parámetros OAuth inválidos.', 'zoho-books-connector' ) ) );
			return;
		}

		$code  = sanitize_text_field( $_GET['code'] );
		$state = sanitize_text_field( $_GET['state'] );

		$parts = explode( '|', $state );
		if ( count( $parts ) !== 2 ) {
			$this->redirect_with_message( 'error', urlencode( __( 'State inválido.', 'zoho-books-connector' ) ) );
			return;
		}

		$nonce       = $parts[0];
		$wp_user_id  = (int) $parts[1];
		$saved_state = get_transient( 'zbc_oauth_state_' . $wp_user_id );

		if ( ! $saved_state || $saved_state !== $nonce ) {
			$this->redirect_with_message( 'error', urlencode( __( 'Verificación de seguridad fallida.', 'zoho-books-connector' ) ) );
			return;
		}

		delete_transient( 'zbc_oauth_state_' . $wp_user_id );

		$tokens = $this->exchange_code( $code );

		if ( is_wp_error( $tokens ) ) {
			$this->redirect_with_message( 'error', urlencode( $tokens->get_error_message() ) );
			return;
		}

		$org_id = $this->fetch_organization_id( $tokens['access_token'] );

		$this->save_token( $wp_user_id, $tokens, $org_id );

		$this->redirect_with_message( 'success', urlencode( __( '¡Conectado a Zoho Books correctamente!', 'zoho-books-connector' ) ) );
	}

	private function exchange_code( $code ) {
		$response = wp_remote_post(
			self::ZOHO_TOKEN_URL,
			array(
				'timeout' => 30,
				'body'    => array(
					'grant_type'    => 'authorization_code',
					'client_id'     => zbc_get_option( 'client_id' ),
					'client_secret' => zbc_get_option( 'client_secret' ),
					'redirect_uri'  => $this->get_redirect_uri(),
					'code'          => $code,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['error'] ) ) {
			return new WP_Error( 'zoho_oauth_error', $body['error'] );
		}

		if ( empty( $body['access_token'] ) ) {
			return new WP_Error( 'zoho_oauth_error', __( 'No se recibió access_token de Zoho.', 'zoho-books-connector' ) );
		}

		return $body;
	}

	public function refresh_access_token( $wp_user_id ) {
		$token = $this->get_token( $wp_user_id );

		if ( ! $token || empty( $token->refresh_token ) ) {
			return new WP_Error( 'no_refresh_token', __( 'No hay refresh token disponible.', 'zoho-books-connector' ) );
		}

		$response = wp_remote_post(
			self::ZOHO_TOKEN_URL,
			array(
				'timeout' => 30,
				'body'    => array(
					'grant_type'    => 'refresh_token',
					'client_id'     => zbc_get_option( 'client_id' ),
					'client_secret' => zbc_get_option( 'client_secret' ),
					'refresh_token' => $token->refresh_token,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['error'] ) ) {
			return new WP_Error( 'zoho_refresh_error', $body['error'] );
		}

		if ( empty( $body['access_token'] ) ) {
			return new WP_Error( 'zoho_refresh_error', __( 'Refresh fallido.', 'zoho-books-connector' ) );
		}

		global $wpdb;
		$wpdb->update(
			$wpdb->prefix . 'zbc_tokens',
			array(
				'access_token' => $body['access_token'],
				'expires_at'   => date( 'Y-m-d H:i:s', time() + (int) ( $body['expires_in'] ?? 3600 ) ),
				'updated_at'   => current_time( 'mysql' ),
			),
			array( 'wp_user_id' => $wp_user_id ),
			array( '%s', '%s', '%s' ),
			array( '%d' )
		);

		return $body['access_token'];
	}

	public function get_valid_access_token( $wp_user_id ) {
		$token = $this->get_token( $wp_user_id );

		if ( ! $token ) {
			return new WP_Error( 'not_connected', __( 'Usuario no conectado a Zoho Books.', 'zoho-books-connector' ) );
		}

		if ( strtotime( $token->expires_at ) <= ( time() + 60 ) ) {
			return $this->refresh_access_token( $wp_user_id );
		}

		return $token->access_token;
	}

	public function cron_refresh_all_tokens() {
		global $wpdb;

		$tokens = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT wp_user_id FROM {$wpdb->prefix}zbc_tokens WHERE expires_at <= %s",
				date( 'Y-m-d H:i:s', time() + 300 )
			)
		);

		foreach ( $tokens as $token ) {
			$this->refresh_access_token( $token->wp_user_id );
		}
	}

	private function fetch_organization_id( $access_token ) {
		$response = wp_remote_get(
			'https://books.zoho.com/api/v3/organizations',
			array(
				'timeout' => 15,
				'headers' => array(
					'Authorization' => 'Zoho-oauthtoken ' . $access_token,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return '';
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! empty( $body['organizations'][0]['organization_id'] ) ) {
			return $body['organizations'][0]['organization_id'];
		}

		return '';
	}

	private function revoke_token( $refresh_token ) {
		wp_remote_post(
			self::ZOHO_REVOKE_URL,
			array(
				'timeout' => 15,
				'body'    => array( 'token' => $refresh_token ),
			)
		);
	}

	public function save_token( $wp_user_id, $tokens, $org_id = '' ) {
		global $wpdb;

		$expires_at = date( 'Y-m-d H:i:s', time() + (int) ( $tokens['expires_in'] ?? 3600 ) );

		$existing = $wpdb->get_var(
			$wpdb->prepare( "SELECT id FROM {$wpdb->prefix}zbc_tokens WHERE wp_user_id = %d", $wp_user_id )
		);

		$data = array(
			'access_token'    => $tokens['access_token'],
			'expires_at'      => $expires_at,
			'organization_id' => $org_id,
			'updated_at'      => current_time( 'mysql' ),
		);

		if ( isset( $tokens['refresh_token'] ) ) {
			$data['refresh_token'] = $tokens['refresh_token'];
		}

		if ( $existing ) {
			$wpdb->update(
				$wpdb->prefix . 'zbc_tokens',
				$data,
				array( 'wp_user_id' => $wp_user_id )
			);
		} else {
			$data['wp_user_id']   = $wp_user_id;
			$data['refresh_token'] = $tokens['refresh_token'] ?? '';
			$data['created_at']   = current_time( 'mysql' );
			$wpdb->insert( $wpdb->prefix . 'zbc_tokens', $data );
		}
	}

	public function get_token( $wp_user_id ) {
		global $wpdb;
		return $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}zbc_tokens WHERE wp_user_id = %d",
				$wp_user_id
			)
		);
	}

	public function delete_token( $wp_user_id ) {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'zbc_tokens', array( 'wp_user_id' => $wp_user_id ), array( '%d' ) );
	}

	public function is_connected( $wp_user_id ) {
		$token = $this->get_token( $wp_user_id );
		return $token && ! empty( $token->access_token );
	}

	private function clear_user_cache( $wp_user_id ) {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'zbc_cache', array( 'wp_user_id' => $wp_user_id ), array( '%d' ) );
	}

	public function get_redirect_uri() {
		return add_query_arg( 'zbc_oauth', '1', home_url( '/' ) );
	}

	private function redirect_with_message( $type, $message ) {
		$portal_page = zbc_get_option( 'portal_page_id' );
		$base_url    = $portal_page ? get_permalink( $portal_page ) : home_url( '/' );
		wp_safe_redirect( add_query_arg( array( 'zbc_' . $type => $message ), $base_url ) );
		exit;
	}
}
