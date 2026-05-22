<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ZBC_User_Portal {

	private $auth;
	private $api;

	public function __construct() {
		$this->auth = new ZBC_Auth();
		$this->api  = new ZBC_API();
	}

	public function init() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_ajax_zbc_get_section_data', array( $this, 'ajax_get_section_data' ) );
		add_action( 'wp_ajax_zbc_get_detail', array( $this, 'ajax_get_detail' ) );
		add_action( 'wp_ajax_zbc_refresh_cache', array( $this, 'ajax_refresh_cache' ) );
	}

	public function enqueue_assets() {
		wp_enqueue_style( 'zbc-portal', ZBC_PLUGIN_URL . 'assets/css/portal.css', array(), ZBC_VERSION );
		wp_enqueue_script( 'zbc-portal', ZBC_PLUGIN_URL . 'assets/js/portal.js', array( 'jquery' ), ZBC_VERSION, true );

		wp_localize_script(
			'zbc-portal',
			'zbcPortal',
			array(
				'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
				'nonce'         => wp_create_nonce( 'zbc_portal_nonce' ),
				'isConnected'   => is_user_logged_in() ? $this->auth->is_connected( get_current_user_id() ) : false,
				'connectNonce'  => wp_create_nonce( 'zbc_connect' ),
				'disconnectNonce' => wp_create_nonce( 'zbc_disconnect' ),
				'i18n'          => array(
					'loading'      => __( 'Cargando...', 'zoho-books-connector' ),
					'error'        => __( 'Error al cargar los datos.', 'zoho-books-connector' ),
					'noData'       => __( 'No hay datos disponibles.', 'zoho-books-connector' ),
					'connecting'   => __( 'Conectando con Zoho...', 'zoho-books-connector' ),
					'disconnecting' => __( 'Desconectando...', 'zoho-books-connector' ),
					'refreshing'   => __( 'Actualizando...', 'zoho-books-connector' ),
					'close'        => __( 'Cerrar', 'zoho-books-connector' ),
					'viewDetail'   => __( 'Ver detalle', 'zoho-books-connector' ),
					'prevPage'     => __( 'Anterior', 'zoho-books-connector' ),
					'nextPage'     => __( 'Siguiente', 'zoho-books-connector' ),
				),
			)
		);
	}

	public function ajax_get_section_data() {
		check_ajax_referer( 'zbc_portal_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( array( 'message' => __( 'No autenticado.', 'zoho-books-connector' ) ) );
		}

		$user_id  = get_current_user_id();
		$section  = sanitize_key( $_POST['section'] ?? '' );
		$page     = max( 1, (int) ( $_POST['page'] ?? 1 ) );
		$per_page = min( 100, max( 5, (int) ( $_POST['per_page'] ?? 25 ) ) );
		$status   = sanitize_key( $_POST['status'] ?? '' );

		if ( ! $this->auth->is_connected( $user_id ) ) {
			wp_send_json_error( array(
				'message'  => __( 'No conectado a Zoho Books.', 'zoho-books-connector' ),
				'not_connected' => true,
			) );
		}

		$data = null;

		switch ( $section ) {
			case 'customers':
				$data = $this->api->get_customers( $user_id, $page, $per_page );
				break;
			case 'estimates':
				$data = $this->api->get_estimates( $user_id, $page, $per_page, $status );
				break;
			case 'invoices':
				$data = $this->api->get_invoices( $user_id, $page, $per_page, $status );
				break;
			case 'projects':
				$data = $this->api->get_projects( $user_id, $page, $per_page, $status );
				break;
			default:
				wp_send_json_error( array( 'message' => __( 'Sección inválida.', 'zoho-books-connector' ) ) );
		}

		if ( is_wp_error( $data ) ) {
			wp_send_json_error( array( 'message' => $data->get_error_message() ) );
		}

		$formatted = $this->format_section_data( $section, $data );
		wp_send_json_success( $formatted );
	}

	public function ajax_get_detail() {
		check_ajax_referer( 'zbc_portal_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error();
		}

		$user_id = get_current_user_id();
		$type    = sanitize_key( $_POST['type'] ?? '' );
		$id      = sanitize_text_field( $_POST['id'] ?? '' );

		if ( ! $this->auth->is_connected( $user_id ) || empty( $id ) ) {
			wp_send_json_error();
		}

		$data = null;

		switch ( $type ) {
			case 'customer':
				$data = $this->api->get_customer( $user_id, $id );
				break;
			case 'estimate':
				$data = $this->api->get_estimate( $user_id, $id );
				break;
			case 'invoice':
				$data = $this->api->get_invoice( $user_id, $id );
				break;
			case 'project':
				$raw   = $this->api->get_project( $user_id, $id );
				$tasks = $this->api->get_project_tasks( $user_id, $id );
				$data  = is_wp_error( $raw ) ? $raw : array_merge( $raw, array( 'tasks_data' => $tasks ) );
				break;
			default:
				wp_send_json_error();
		}

		if ( is_wp_error( $data ) ) {
			wp_send_json_error( array( 'message' => $data->get_error_message() ) );
		}

		wp_send_json_success( array( 'type' => $type, 'data' => $data ) );
	}

	public function ajax_refresh_cache() {
		check_ajax_referer( 'zbc_portal_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error();
		}

		$this->api->clear_cache( get_current_user_id() );
		wp_send_json_success( array( 'message' => __( 'Caché actualizado.', 'zoho-books-connector' ) ) );
	}

	private function format_section_data( $section, $raw ) {
		$page_context = $raw['page_context'] ?? array();
		$result       = array(
			'items'       => array(),
			'total'       => $page_context['total'] ?? 0,
			'page'        => $page_context['page'] ?? 1,
			'per_page'    => $page_context['per_page'] ?? 25,
			'has_more'    => $page_context['has_more_page'] ?? false,
		);

		switch ( $section ) {
			case 'customers':
				foreach ( $raw['contacts'] ?? array() as $c ) {
					$result['items'][] = array(
						'id'       => $c['contact_id'],
						'name'     => $c['contact_name'],
						'email'    => $c['email'],
						'phone'    => $c['phone'],
						'status'   => $c['status'],
						'balance'  => $c['outstanding_receivable_amount_bcy'] ?? 0,
						'currency' => $c['currency_code'] ?? '',
					);
				}
				break;

			case 'estimates':
				foreach ( $raw['estimates'] ?? array() as $e ) {
					$result['items'][] = array(
						'id'         => $e['estimate_id'],
						'number'     => $e['estimate_number'],
						'customer'   => $e['customer_name'],
						'date'       => $e['date'],
						'expiry'     => $e['expiry_date'] ?? '',
						'total'      => $e['total'],
						'status'     => $e['status'],
						'currency'   => $e['currency_code'] ?? '',
					);
				}
				break;

			case 'invoices':
				foreach ( $raw['invoices'] ?? array() as $inv ) {
					$result['items'][] = array(
						'id'         => $inv['invoice_id'],
						'number'     => $inv['invoice_number'],
						'customer'   => $inv['customer_name'],
						'date'       => $inv['date'],
						'due_date'   => $inv['due_date'] ?? '',
						'total'      => $inv['total'],
						'balance'    => $inv['balance'],
						'status'     => $inv['status'],
						'currency'   => $inv['currency_code'] ?? '',
					);
				}
				break;

			case 'projects':
				foreach ( $raw['projects'] ?? array() as $p ) {
					$result['items'][] = array(
						'id'           => $p['project_id'],
						'name'         => $p['project_name'],
						'customer'     => $p['customer_name'] ?? '',
						'status'       => $p['status'],
						'billing_type' => $p['billing_type'] ?? '',
						'rate'         => $p['rate'] ?? 0,
						'currency'     => $p['currency_code'] ?? '',
						'description'  => $p['description'] ?? '',
					);
				}
				break;
		}

		return $result;
	}
}
