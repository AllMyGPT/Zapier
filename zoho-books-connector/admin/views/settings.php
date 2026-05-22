<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<div class="wrap zbc-admin-wrap">
	<h1 class="zbc-admin-title">
		<span class="dashicons dashicons-businessman"></span>
		<?php esc_html_e( 'Zoho Books Connector — Configuración', 'zoho-books-connector' ); ?>
	</h1>

	<div id="zbc-notice" class="zbc-notice" style="display:none;"></div>

	<div class="zbc-admin-card">
		<h2><?php esc_html_e( 'Credenciales de la API de Zoho', 'zoho-books-connector' ); ?></h2>
		<p class="description">
			<?php
			printf(
				/* translators: %s: Zoho API Console URL */
				esc_html__( 'Registra tu aplicación en %s y copia el Client ID y Client Secret aquí.', 'zoho-books-connector' ),
				'<a href="https://api-console.zoho.com/" target="_blank" rel="noopener">api-console.zoho.com</a>'
			);
			?>
		</p>
		<p class="description">
			<strong><?php esc_html_e( 'Authorized Redirect URI:', 'zoho-books-connector' ); ?></strong>
			<code><?php echo esc_url( ( new ZBC_Auth() )->get_redirect_uri() ); ?></code>
			<button type="button" class="button button-small zbc-copy-btn"
				data-copy="<?php echo esc_attr( ( new ZBC_Auth() )->get_redirect_uri() ); ?>">
				<?php esc_html_e( 'Copiar', 'zoho-books-connector' ); ?>
			</button>
		</p>

		<table class="form-table">
			<tr>
				<th scope="row">
					<label for="zbc_client_id"><?php esc_html_e( 'Client ID', 'zoho-books-connector' ); ?></label>
				</th>
				<td>
					<input type="text" id="zbc_client_id" name="client_id"
						value="<?php echo esc_attr( zbc_get_option( 'client_id' ) ); ?>"
						class="regular-text" autocomplete="off" />
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="zbc_client_secret"><?php esc_html_e( 'Client Secret', 'zoho-books-connector' ); ?></label>
				</th>
				<td>
					<input type="password" id="zbc_client_secret" name="client_secret"
						value="<?php echo esc_attr( zbc_get_option( 'client_secret' ) ); ?>"
						class="regular-text" autocomplete="off" />
					<button type="button" class="button button-small zbc-toggle-secret">
						<?php esc_html_e( 'Mostrar', 'zoho-books-connector' ); ?>
					</button>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="zbc_portal_page"><?php esc_html_e( 'Página del portal', 'zoho-books-connector' ); ?></label>
				</th>
				<td>
					<?php
					wp_dropdown_pages( array(
						'id'               => 'zbc_portal_page',
						'name'             => 'portal_page_id',
						'selected'         => zbc_get_option( 'portal_page_id' ),
						'show_option_none' => __( '— Selecciona una página —', 'zoho-books-connector' ),
					) );
					?>
					<p class="description">
						<?php esc_html_e( 'Página donde colocarás el shortcode [zoho_portal]. Los usuarios serán redirigidos aquí tras autenticarse.', 'zoho-books-connector' ); ?>
					</p>
				</td>
			</tr>
		</table>

		<div class="zbc-btn-row">
			<button type="button" id="zbc-save-settings" class="button button-primary">
				<?php esc_html_e( 'Guardar configuración', 'zoho-books-connector' ); ?>
			</button>
			<button type="button" id="zbc-test-connection" class="button">
				<?php esc_html_e( 'Verificar credenciales', 'zoho-books-connector' ); ?>
			</button>
			<button type="button" id="zbc-clear-cache" class="button">
				<?php esc_html_e( 'Limpiar caché', 'zoho-books-connector' ); ?>
			</button>
		</div>
	</div>

	<div class="zbc-admin-card">
		<h2><?php esc_html_e( 'Shortcodes disponibles', 'zoho-books-connector' ); ?></h2>
		<table class="widefat striped zbc-shortcode-table">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Shortcode', 'zoho-books-connector' ); ?></th>
					<th><?php esc_html_e( 'Descripción', 'zoho-books-connector' ); ?></th>
					<th><?php esc_html_e( 'Atributos opcionales', 'zoho-books-connector' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>[zoho_portal]</code></td>
					<td><?php esc_html_e( 'Portal completo con todas las secciones y gestión de conexión', 'zoho-books-connector' ); ?></td>
					<td>—</td>
				</tr>
				<tr>
					<td><code>[zoho_customers]</code></td>
					<td><?php esc_html_e( 'Lista de clientes', 'zoho-books-connector' ); ?></td>
					<td><code>per_page="25"</code></td>
				</tr>
				<tr>
					<td><code>[zoho_estimates]</code></td>
					<td><?php esc_html_e( 'Presupuestos', 'zoho-books-connector' ); ?></td>
					<td><code>per_page="25" status="draft|sent|accepted|declined|invoiced|expired"</code></td>
				</tr>
				<tr>
					<td><code>[zoho_invoices]</code></td>
					<td><?php esc_html_e( 'Facturas', 'zoho-books-connector' ); ?></td>
					<td><code>per_page="25" status="draft|sent|overdue|paid|void|unpaid|partially_paid"</code></td>
				</tr>
				<tr>
					<td><code>[zoho_projects]</code></td>
					<td><?php esc_html_e( 'Proyectos', 'zoho-books-connector' ); ?></td>
					<td><code>per_page="25" status="active|inactive|completed"</code></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
