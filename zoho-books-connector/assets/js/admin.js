/* global zbcAdmin, jQuery */
(function ($) {
	'use strict';

	$(document).ready(function () {

		// Save settings
		$('#zbc-save-settings').on('click', function () {
			var $btn = $(this);
			$btn.text(zbcAdmin.i18n.saving).prop('disabled', true);

			$.post(zbcAdmin.ajaxUrl, {
				action:         'zbc_save_settings',
				nonce:          zbcAdmin.nonce,
				client_id:      $('#zbc_client_id').val(),
				client_secret:  $('#zbc_client_secret').val(),
				portal_page_id: $('#zbc_portal_page').val()
			}, function (res) {
				if (res.success) {
					showNotice('success', res.data.message || zbcAdmin.i18n.saved);
				} else {
					showNotice('error', res.data.message || 'Error al guardar.');
				}
				$btn.text('Guardar configuración').prop('disabled', false);
			}).fail(function () {
				showNotice('error', 'Error de conexión.');
				$btn.text('Guardar configuración').prop('disabled', false);
			});
		});

		// Test connection
		$('#zbc-test-connection').on('click', function () {
			var $btn = $(this);
			$btn.text(zbcAdmin.i18n.testing).prop('disabled', true);

			$.post(zbcAdmin.ajaxUrl, {
				action: 'zbc_test_connection',
				nonce:  zbcAdmin.nonce
			}, function (res) {
				if (res.success) {
					showNotice('success', res.data.message);
				} else {
					showNotice('error', res.data.message);
				}
				$btn.text('Verificar credenciales').prop('disabled', false);
			});
		});

		// Clear cache
		$('#zbc-clear-cache').on('click', function () {
			var $btn = $(this);
			$btn.text(zbcAdmin.i18n.clearing).prop('disabled', true);

			$.post(zbcAdmin.ajaxUrl, {
				action: 'zbc_clear_cache',
				nonce:  zbcAdmin.nonce
			}, function (res) {
				if (res.success) {
					showNotice('success', res.data.message || zbcAdmin.i18n.cleared);
				} else {
					showNotice('error', 'Error al limpiar caché.');
				}
				$btn.text('Limpiar caché').prop('disabled', false);
			});
		});

		// Admin disconnect user
		$(document).on('click', '.zbc-admin-disconnect', function () {
			var $btn   = $(this);
			var userId = $btn.data('user-id');
			var name   = $btn.data('name');

			if (!confirm(zbcAdmin.i18n.confirm_disc + ' (' + name + ')?')) return;

			$btn.text('Desconectando...').prop('disabled', true);

			$.post(zbcAdmin.ajaxUrl, {
				action:  'zbc_admin_disconnect_user',
				nonce:   zbcAdmin.nonce,
				user_id: userId
			}, function (res) {
				if (res.success) {
					$btn.closest('tr').fadeOut(300, function () { $(this).remove(); });
					showNotice('success', zbcAdmin.i18n.disconnected);
				} else {
					$btn.text('Desconectar').prop('disabled', false);
					showNotice('error', 'Error al desconectar.');
				}
			});
		});

		// Toggle secret visibility
		$('.zbc-toggle-secret').on('click', function () {
			var $input = $('#zbc_client_secret');
			var isPass = $input.attr('type') === 'password';
			$input.attr('type', isPass ? 'text' : 'password');
			$(this).text(isPass ? 'Ocultar' : 'Mostrar');
		});

		// Copy redirect URI
		$('.zbc-copy-btn').on('click', function () {
			var text = $(this).data('copy');
			if (navigator.clipboard) {
				navigator.clipboard.writeText(text).then(function () {
					showNotice('success', 'URI copiada al portapapeles.');
				});
			} else {
				var $tmp = $('<input>').val(text).appendTo('body').select();
				document.execCommand('copy');
				$tmp.remove();
				showNotice('success', 'URI copiada al portapapeles.');
			}
		});

		function showNotice(type, message) {
			var $notice = $('#zbc-notice');
			$notice.removeClass('zbc-notice-success zbc-notice-error zbc-notice-info')
				.addClass('zbc-notice-' + type)
				.text(message)
				.show();
			setTimeout(function () { $notice.fadeOut(400); }, 5000);
		}
	});

}(jQuery));
