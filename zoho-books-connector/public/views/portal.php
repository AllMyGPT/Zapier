<?php
if ( ! defined( 'ABSPATH' ) ) exit;
$auth       = new ZBC_Auth();
$user_id    = get_current_user_id();
$connected  = $auth->is_connected( $user_id );
$success_msg = isset( $_GET['zbc_success'] ) ? sanitize_text_field( urldecode( $_GET['zbc_success'] ) ) : '';
$error_msg   = isset( $_GET['zbc_error'] )   ? sanitize_text_field( urldecode( $_GET['zbc_error'] ) )   : '';
?>
<div class="zbc-portal" id="zbc-portal">

	<?php if ( $success_msg ) : ?>
		<div class="zbc-notice zbc-notice-success"><?php echo esc_html( $success_msg ); ?></div>
	<?php endif; ?>
	<?php if ( $error_msg ) : ?>
		<div class="zbc-notice zbc-notice-error"><?php echo esc_html( $error_msg ); ?></div>
	<?php endif; ?>

	<div class="zbc-portal-header">
		<div class="zbc-portal-user">
			<?php echo get_avatar( $user_id, 40 ); ?>
			<span class="zbc-portal-username"><?php echo esc_html( wp_get_current_user()->display_name ); ?></span>
		</div>
		<div class="zbc-portal-actions">
			<?php if ( $connected ) : ?>
				<span class="zbc-status zbc-status-active">
					<span class="zbc-status-dot"></span>
					<?php esc_html_e( 'Conectado a Zoho Books', 'zoho-books-connector' ); ?>
				</span>
				<button type="button" class="zbc-btn zbc-btn-outline zbc-btn-sm" id="zbc-refresh-btn"
					title="<?php esc_attr_e( 'Actualizar datos', 'zoho-books-connector' ); ?>">
					<span class="dashicons dashicons-update-alt"></span>
					<?php esc_html_e( 'Actualizar', 'zoho-books-connector' ); ?>
				</button>
				<button type="button" class="zbc-btn zbc-btn-danger zbc-btn-sm" id="zbc-disconnect-btn">
					<?php esc_html_e( 'Desconectar Zoho', 'zoho-books-connector' ); ?>
				</button>
			<?php else : ?>
				<span class="zbc-status zbc-status-inactive">
					<span class="zbc-status-dot"></span>
					<?php esc_html_e( 'No conectado', 'zoho-books-connector' ); ?>
				</span>
				<button type="button" class="zbc-btn zbc-btn-primary" id="zbc-connect-btn">
					<?php esc_html_e( 'Conectar con Zoho Books', 'zoho-books-connector' ); ?>
				</button>
			<?php endif; ?>
		</div>
	</div>

	<?php if ( $connected ) : ?>
	<div class="zbc-portal-tabs">
		<nav class="zbc-tabs-nav" role="tablist">
			<button class="zbc-tab-btn active" data-tab="customers" role="tab" aria-selected="true">
				<span class="dashicons dashicons-groups"></span>
				<?php esc_html_e( 'Clientes', 'zoho-books-connector' ); ?>
			</button>
			<button class="zbc-tab-btn" data-tab="estimates" role="tab">
				<span class="dashicons dashicons-clipboard"></span>
				<?php esc_html_e( 'Presupuestos', 'zoho-books-connector' ); ?>
			</button>
			<button class="zbc-tab-btn" data-tab="invoices" role="tab">
				<span class="dashicons dashicons-media-spreadsheet"></span>
				<?php esc_html_e( 'Facturas', 'zoho-books-connector' ); ?>
			</button>
			<button class="zbc-tab-btn" data-tab="projects" role="tab">
				<span class="dashicons dashicons-portfolio"></span>
				<?php esc_html_e( 'Proyectos', 'zoho-books-connector' ); ?>
			</button>
		</nav>

		<div class="zbc-tabs-content">
			<!-- Clientes -->
			<div class="zbc-tab-panel active" id="zbc-panel-customers">
				<div class="zbc-panel-header">
					<h3><?php esc_html_e( 'Clientes', 'zoho-books-connector' ); ?></h3>
					<div class="zbc-panel-filters">
						<select class="zbc-per-page" data-section="customers">
							<option value="10">10 <?php esc_html_e( 'por página', 'zoho-books-connector' ); ?></option>
							<option value="25" selected>25 <?php esc_html_e( 'por página', 'zoho-books-connector' ); ?></option>
							<option value="50">50 <?php esc_html_e( 'por página', 'zoho-books-connector' ); ?></option>
						</select>
					</div>
				</div>
				<div class="zbc-data-container" data-section="customers"></div>
				<div class="zbc-pagination" data-section="customers"></div>
			</div>

			<!-- Presupuestos -->
			<div class="zbc-tab-panel" id="zbc-panel-estimates">
				<div class="zbc-panel-header">
					<h3><?php esc_html_e( 'Presupuestos', 'zoho-books-connector' ); ?></h3>
					<div class="zbc-panel-filters">
						<select class="zbc-status-filter" data-section="estimates">
							<option value=""><?php esc_html_e( 'Todos los estados', 'zoho-books-connector' ); ?></option>
							<option value="draft"><?php esc_html_e( 'Borrador', 'zoho-books-connector' ); ?></option>
							<option value="sent"><?php esc_html_e( 'Enviado', 'zoho-books-connector' ); ?></option>
							<option value="accepted"><?php esc_html_e( 'Aceptado', 'zoho-books-connector' ); ?></option>
							<option value="declined"><?php esc_html_e( 'Rechazado', 'zoho-books-connector' ); ?></option>
							<option value="invoiced"><?php esc_html_e( 'Facturado', 'zoho-books-connector' ); ?></option>
							<option value="expired"><?php esc_html_e( 'Expirado', 'zoho-books-connector' ); ?></option>
						</select>
					</div>
				</div>
				<div class="zbc-data-container" data-section="estimates"></div>
				<div class="zbc-pagination" data-section="estimates"></div>
			</div>

			<!-- Facturas -->
			<div class="zbc-tab-panel" id="zbc-panel-invoices">
				<div class="zbc-panel-header">
					<h3><?php esc_html_e( 'Facturas', 'zoho-books-connector' ); ?></h3>
					<div class="zbc-panel-filters">
						<select class="zbc-status-filter" data-section="invoices">
							<option value=""><?php esc_html_e( 'Todos los estados', 'zoho-books-connector' ); ?></option>
							<option value="draft"><?php esc_html_e( 'Borrador', 'zoho-books-connector' ); ?></option>
							<option value="sent"><?php esc_html_e( 'Enviada', 'zoho-books-connector' ); ?></option>
							<option value="overdue"><?php esc_html_e( 'Vencida', 'zoho-books-connector' ); ?></option>
							<option value="paid"><?php esc_html_e( 'Pagada', 'zoho-books-connector' ); ?></option>
							<option value="partially_paid"><?php esc_html_e( 'Parcialmente pagada', 'zoho-books-connector' ); ?></option>
							<option value="void"><?php esc_html_e( 'Anulada', 'zoho-books-connector' ); ?></option>
						</select>
					</div>
				</div>
				<div class="zbc-data-container" data-section="invoices"></div>
				<div class="zbc-pagination" data-section="invoices"></div>
			</div>

			<!-- Proyectos -->
			<div class="zbc-tab-panel" id="zbc-panel-projects">
				<div class="zbc-panel-header">
					<h3><?php esc_html_e( 'Proyectos', 'zoho-books-connector' ); ?></h3>
					<div class="zbc-panel-filters">
						<select class="zbc-status-filter" data-section="projects">
							<option value=""><?php esc_html_e( 'Todos', 'zoho-books-connector' ); ?></option>
							<option value="active"><?php esc_html_e( 'Activos', 'zoho-books-connector' ); ?></option>
							<option value="inactive"><?php esc_html_e( 'Inactivos', 'zoho-books-connector' ); ?></option>
							<option value="completed"><?php esc_html_e( 'Completados', 'zoho-books-connector' ); ?></option>
						</select>
					</div>
				</div>
				<div class="zbc-data-container" data-section="projects"></div>
				<div class="zbc-pagination" data-section="projects"></div>
			</div>
		</div>
	</div>

	<!-- Modal de detalle -->
	<div class="zbc-modal-overlay" id="zbc-detail-modal" style="display:none;" role="dialog" aria-modal="true">
		<div class="zbc-modal">
			<div class="zbc-modal-header">
				<h3 class="zbc-modal-title"></h3>
				<button type="button" class="zbc-modal-close" aria-label="<?php esc_attr_e( 'Cerrar', 'zoho-books-connector' ); ?>">
					<span class="dashicons dashicons-no-alt"></span>
				</button>
			</div>
			<div class="zbc-modal-body"></div>
		</div>
	</div>

	<?php else : ?>
	<div class="zbc-connect-prompt">
		<div class="zbc-connect-icon">
			<span class="dashicons dashicons-cloud-upload" style="font-size:64px; width:64px; height:64px; color:#0070cc;"></span>
		</div>
		<h2><?php esc_html_e( '¡Conecta tu cuenta de Zoho Books!', 'zoho-books-connector' ); ?></h2>
		<p><?php esc_html_e( 'Accede a tus clientes, presupuestos, facturas y proyectos directamente desde esta página.', 'zoho-books-connector' ); ?></p>
		<button type="button" class="zbc-btn zbc-btn-primary zbc-btn-lg" id="zbc-connect-btn">
			<span class="dashicons dashicons-admin-network"></span>
			<?php esc_html_e( 'Conectar con Zoho Books', 'zoho-books-connector' ); ?>
		</button>
	</div>
	<?php endif; ?>

</div>
