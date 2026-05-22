<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ZBC_Shortcodes {

	public function init() {
		add_shortcode( 'zoho_portal', array( $this, 'render_portal' ) );
		add_shortcode( 'zoho_customers', array( $this, 'render_customers' ) );
		add_shortcode( 'zoho_estimates', array( $this, 'render_estimates' ) );
		add_shortcode( 'zoho_invoices', array( $this, 'render_invoices' ) );
		add_shortcode( 'zoho_projects', array( $this, 'render_projects' ) );
	}

	public function render_portal( $atts ) {
		if ( ! is_user_logged_in() ) {
			return $this->login_required_html();
		}
		ob_start();
		include ZBC_PLUGIN_DIR . 'public/views/portal.php';
		return ob_get_clean();
	}

	public function render_customers( $atts ) {
		$atts = shortcode_atts( array( 'per_page' => 25 ), $atts );
		if ( ! is_user_logged_in() ) {
			return $this->login_required_html();
		}
		ob_start();
		$section  = 'customers';
		$per_page = (int) $atts['per_page'];
		include ZBC_PLUGIN_DIR . 'public/views/section.php';
		return ob_get_clean();
	}

	public function render_estimates( $atts ) {
		$atts = shortcode_atts( array( 'per_page' => 25, 'status' => '' ), $atts );
		if ( ! is_user_logged_in() ) {
			return $this->login_required_html();
		}
		ob_start();
		$section  = 'estimates';
		$per_page = (int) $atts['per_page'];
		$status   = sanitize_key( $atts['status'] );
		include ZBC_PLUGIN_DIR . 'public/views/section.php';
		return ob_get_clean();
	}

	public function render_invoices( $atts ) {
		$atts = shortcode_atts( array( 'per_page' => 25, 'status' => '' ), $atts );
		if ( ! is_user_logged_in() ) {
			return $this->login_required_html();
		}
		ob_start();
		$section  = 'invoices';
		$per_page = (int) $atts['per_page'];
		$status   = sanitize_key( $atts['status'] );
		include ZBC_PLUGIN_DIR . 'public/views/section.php';
		return ob_get_clean();
	}

	public function render_projects( $atts ) {
		$atts = shortcode_atts( array( 'per_page' => 25, 'status' => '' ), $atts );
		if ( ! is_user_logged_in() ) {
			return $this->login_required_html();
		}
		ob_start();
		$section  = 'projects';
		$per_page = (int) $atts['per_page'];
		$status   = sanitize_key( $atts['status'] );
		include ZBC_PLUGIN_DIR . 'public/views/section.php';
		return ob_get_clean();
	}

	private function login_required_html() {
		return '<div class="zbc-notice zbc-notice-warning">' .
			sprintf(
				/* translators: %s: link to login page */
				__( 'Debes <a href="%s">iniciar sesión</a> para ver esta información.', 'zoho-books-connector' ),
				esc_url( wp_login_url( get_permalink() ) )
			) .
			'</div>';
	}
}
