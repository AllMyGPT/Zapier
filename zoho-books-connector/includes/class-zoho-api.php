<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ZBC_API {

	const BASE_URL = 'https://books.zoho.com/api/v3';
	const CACHE_TTL = 300; // 5 minutos

	private $auth;

	public function __construct() {
		$this->auth = new ZBC_Auth();
	}

	// -------------------------------------------------------------------------
	// Clientes (Contacts)
	// -------------------------------------------------------------------------

	public function get_customers( $wp_user_id, $page = 1, $per_page = 25 ) {
		return $this->request(
			$wp_user_id,
			'/contacts',
			array(
				'contact_type' => 'customer',
				'page'         => $page,
				'per_page'     => $per_page,
				'sort_column'  => 'contact_name',
				'sort_order'   => 'A',
			),
			'customers_' . $page
		);
	}

	public function get_customer( $wp_user_id, $customer_id ) {
		return $this->request(
			$wp_user_id,
			'/contacts/' . rawurlencode( $customer_id ),
			array(),
			'customer_' . $customer_id
		);
	}

	// -------------------------------------------------------------------------
	// Presupuestos (Estimates)
	// -------------------------------------------------------------------------

	public function get_estimates( $wp_user_id, $page = 1, $per_page = 25, $status = '' ) {
		$params = array(
			'page'        => $page,
			'per_page'    => $per_page,
			'sort_column' => 'date',
			'sort_order'  => 'D',
		);

		if ( $status ) {
			$params['status'] = $status;
		}

		return $this->request(
			$wp_user_id,
			'/estimates',
			$params,
			'estimates_' . $page . '_' . $status
		);
	}

	public function get_estimate( $wp_user_id, $estimate_id ) {
		return $this->request(
			$wp_user_id,
			'/estimates/' . rawurlencode( $estimate_id ),
			array(),
			'estimate_' . $estimate_id
		);
	}

	// -------------------------------------------------------------------------
	// Facturas (Invoices)
	// -------------------------------------------------------------------------

	public function get_invoices( $wp_user_id, $page = 1, $per_page = 25, $status = '' ) {
		$params = array(
			'page'        => $page,
			'per_page'    => $per_page,
			'sort_column' => 'date',
			'sort_order'  => 'D',
		);

		if ( $status ) {
			$params['status'] = $status;
		}

		return $this->request(
			$wp_user_id,
			'/invoices',
			$params,
			'invoices_' . $page . '_' . $status
		);
	}

	public function get_invoice( $wp_user_id, $invoice_id ) {
		return $this->request(
			$wp_user_id,
			'/invoices/' . rawurlencode( $invoice_id ),
			array(),
			'invoice_' . $invoice_id
		);
	}

	// -------------------------------------------------------------------------
	// Proyectos (Projects)
	// -------------------------------------------------------------------------

	public function get_projects( $wp_user_id, $page = 1, $per_page = 25, $status = '' ) {
		$params = array(
			'page'     => $page,
			'per_page' => $per_page,
		);

		if ( $status ) {
			$params['filter_by'] = 'Status.' . ucfirst( $status );
		}

		return $this->request(
			$wp_user_id,
			'/projects',
			$params,
			'projects_' . $page . '_' . $status
		);
	}

	public function get_project( $wp_user_id, $project_id ) {
		return $this->request(
			$wp_user_id,
			'/projects/' . rawurlencode( $project_id ),
			array(),
			'project_' . $project_id
		);
	}

	public function get_project_tasks( $wp_user_id, $project_id ) {
		return $this->request(
			$wp_user_id,
			'/projects/' . rawurlencode( $project_id ) . '/tasks',
			array(),
			'project_tasks_' . $project_id
		);
	}

	// -------------------------------------------------------------------------
	// Request interno con caché
	// -------------------------------------------------------------------------

	private function request( $wp_user_id, $endpoint, $params = array(), $cache_key = '' ) {
		if ( $cache_key ) {
			$cached = $this->get_cache( $wp_user_id, $cache_key );
			if ( $cached !== false ) {
				return $cached;
			}
		}

		$access_token = $this->auth->get_valid_access_token( $wp_user_id );

		if ( is_wp_error( $access_token ) ) {
			return $access_token;
		}

		$token_record = $this->auth->get_token( $wp_user_id );
		$org_id       = $token_record ? $token_record->organization_id : '';

		if ( $org_id ) {
			$params['organization_id'] = $org_id;
		}

		$url = self::BASE_URL . $endpoint;
		if ( ! empty( $params ) ) {
			$url .= '?' . http_build_query( $params );
		}

		$response = wp_remote_get(
			$url,
			array(
				'timeout' => 20,
				'headers' => array(
					'Authorization' => 'Zoho-oauthtoken ' . $access_token,
					'Content-Type'  => 'application/json;charset=UTF-8',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$http_code = wp_remote_retrieve_response_code( $response );
		$body      = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $http_code === 401 ) {
			$new_token = $this->auth->refresh_access_token( $wp_user_id );
			if ( is_wp_error( $new_token ) ) {
				return $new_token;
			}
			return $this->request( $wp_user_id, $endpoint, $params, $cache_key );
		}

		if ( $http_code >= 400 ) {
			$msg = $body['message'] ?? sprintf( __( 'Error HTTP %d de Zoho API.', 'zoho-books-connector' ), $http_code );
			return new WP_Error( 'zoho_api_error', $msg );
		}

		if ( $cache_key ) {
			$this->set_cache( $wp_user_id, $cache_key, $body );
		}

		return $body;
	}

	// -------------------------------------------------------------------------
	// Caché en base de datos
	// -------------------------------------------------------------------------

	private function get_cache( $wp_user_id, $key ) {
		global $wpdb;

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT data, expires_at FROM {$wpdb->prefix}zbc_cache
				WHERE cache_key = %s AND wp_user_id = %d AND expires_at > %s",
				$key,
				$wp_user_id,
				current_time( 'mysql' )
			)
		);

		if ( ! $row ) {
			return false;
		}

		return json_decode( $row->data, true );
	}

	private function set_cache( $wp_user_id, $key, $data ) {
		global $wpdb;

		$expires_at = date( 'Y-m-d H:i:s', time() + self::CACHE_TTL );

		$wpdb->replace(
			$wpdb->prefix . 'zbc_cache',
			array(
				'cache_key'  => $key,
				'wp_user_id' => $wp_user_id,
				'data'       => wp_json_encode( $data ),
				'expires_at' => $expires_at,
			),
			array( '%s', '%d', '%s', '%s' )
		);
	}

	public function clear_cache( $wp_user_id ) {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'zbc_cache', array( 'wp_user_id' => $wp_user_id ), array( '%d' ) );
	}
}
