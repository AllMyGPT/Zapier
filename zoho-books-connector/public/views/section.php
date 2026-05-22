<?php
if ( ! defined( 'ABSPATH' ) ) exit;

$auth      = new ZBC_Auth();
$user_id   = get_current_user_id();
$connected = $auth->is_connected( $user_id );

if ( ! $connected ) : ?>
<div class="zbc-connect-prompt zbc-inline">
	<p><?php esc_html_e( 'Conecta tu cuenta de Zoho Books para ver los datos.', 'zoho-books-connector' ); ?></p>
	<button type="button" class="zbc-btn zbc-btn-primary" id="zbc-connect-btn">
		<?php esc_html_e( 'Conectar con Zoho Books', 'zoho-books-connector' ); ?>
	</button>
</div>
<?php return; endif; ?>

<div class="zbc-section-wrapper"
	data-section="<?php echo esc_attr( $section ); ?>"
	data-per-page="<?php echo esc_attr( $per_page ); ?>"
	data-status="<?php echo esc_attr( $status ?? '' ); ?>">

	<div class="zbc-panel-header">
		<?php if ( in_array( $section, array( 'estimates', 'invoices', 'projects' ), true ) && empty( $status ) ) : ?>
		<div class="zbc-panel-filters">
			<select class="zbc-status-filter" data-section="<?php echo esc_attr( $section ); ?>">
				<option value=""><?php esc_html_e( 'Todos los estados', 'zoho-books-connector' ); ?></option>
				<?php if ( $section === 'estimates' ) : ?>
					<option value="draft"><?php esc_html_e( 'Borrador', 'zoho-books-connector' ); ?></option>
					<option value="sent"><?php esc_html_e( 'Enviado', 'zoho-books-connector' ); ?></option>
					<option value="accepted"><?php esc_html_e( 'Aceptado', 'zoho-books-connector' ); ?></option>
					<option value="declined"><?php esc_html_e( 'Rechazado', 'zoho-books-connector' ); ?></option>
					<option value="invoiced"><?php esc_html_e( 'Facturado', 'zoho-books-connector' ); ?></option>
					<option value="expired"><?php esc_html_e( 'Expirado', 'zoho-books-connector' ); ?></option>
				<?php elseif ( $section === 'invoices' ) : ?>
					<option value="draft"><?php esc_html_e( 'Borrador', 'zoho-books-connector' ); ?></option>
					<option value="sent"><?php esc_html_e( 'Enviada', 'zoho-books-connector' ); ?></option>
					<option value="overdue"><?php esc_html_e( 'Vencida', 'zoho-books-connector' ); ?></option>
					<option value="paid"><?php esc_html_e( 'Pagada', 'zoho-books-connector' ); ?></option>
					<option value="partially_paid"><?php esc_html_e( 'Parcialmente pagada', 'zoho-books-connector' ); ?></option>
				<?php elseif ( $section === 'projects' ) : ?>
					<option value="active"><?php esc_html_e( 'Activos', 'zoho-books-connector' ); ?></option>
					<option value="inactive"><?php esc_html_e( 'Inactivos', 'zoho-books-connector' ); ?></option>
					<option value="completed"><?php esc_html_e( 'Completados', 'zoho-books-connector' ); ?></option>
				<?php endif; ?>
			</select>
		</div>
		<?php endif; ?>
	</div>

	<div class="zbc-data-container" data-section="<?php echo esc_attr( $section ); ?>"></div>
	<div class="zbc-pagination" data-section="<?php echo esc_attr( $section ); ?>"></div>

	<div class="zbc-modal-overlay" id="zbc-detail-modal-<?php echo esc_attr( $section ); ?>" style="display:none;" role="dialog">
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
</div>
