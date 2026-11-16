<?php
if ( ! defined( 'ABSPATH' ) ) exit;
$admin = new ZBC_Admin();
$users = $admin->get_connected_users();
?>
<div class="wrap zbc-admin-wrap">
	<h1 class="zbc-admin-title">
		<span class="dashicons dashicons-admin-users"></span>
		<?php esc_html_e( 'Usuarios conectados a Zoho Books', 'zoho-books-connector' ); ?>
	</h1>

	<div id="zbc-notice" class="zbc-notice" style="display:none;"></div>

	<div class="zbc-admin-card">
		<?php if ( empty( $users ) ) : ?>
			<p class="zbc-empty-state">
				<?php esc_html_e( 'Ningún usuario ha conectado su cuenta de Zoho Books todavía.', 'zoho-books-connector' ); ?>
			</p>
		<?php else : ?>
			<table class="widefat striped zbc-users-table">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Usuario', 'zoho-books-connector' ); ?></th>
						<th><?php esc_html_e( 'Email', 'zoho-books-connector' ); ?></th>
						<th><?php esc_html_e( 'Organización ID', 'zoho-books-connector' ); ?></th>
						<th><?php esc_html_e( 'Token expira', 'zoho-books-connector' ); ?></th>
						<th><?php esc_html_e( 'Última actualización', 'zoho-books-connector' ); ?></th>
						<th><?php esc_html_e( 'Acciones', 'zoho-books-connector' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $users as $user ) :
						$expires    = strtotime( $user->expires_at );
						$is_expired = $expires <= time();
					?>
					<tr>
						<td>
							<strong><?php echo esc_html( $user->display_name ); ?></strong>
							<br><small><?php echo esc_html( '#' . $user->wp_user_id ); ?></small>
						</td>
						<td><?php echo esc_html( $user->user_email ); ?></td>
						<td><code><?php echo esc_html( $user->organization_id ?: '—' ); ?></code></td>
						<td>
							<span class="zbc-status <?php echo $is_expired ? 'zbc-status-expired' : 'zbc-status-active'; ?>">
								<?php echo $is_expired
									? esc_html__( 'Expirado', 'zoho-books-connector' )
									: esc_html( human_time_diff( time(), $expires ) . ' ' . __( 'restante', 'zoho-books-connector' ) );
								?>
							</span>
						</td>
						<td><?php echo esc_html( wp_date( get_option( 'date_format' ) . ' H:i', strtotime( $user->updated_at ) ) ); ?></td>
						<td>
							<button type="button"
								class="button button-small zbc-admin-disconnect"
								data-user-id="<?php echo esc_attr( $user->wp_user_id ); ?>"
								data-name="<?php echo esc_attr( $user->display_name ); ?>">
								<?php esc_html_e( 'Desconectar', 'zoho-books-connector' ); ?>
							</button>
						</td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>
</div>
