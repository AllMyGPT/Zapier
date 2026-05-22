/* global zbcPortal, jQuery */
(function ($) {
	'use strict';

	var ZBC = {
		state: {},

		init: function () {
			this.bindGlobalEvents();

			if ($('#zbc-portal').length) {
				this.initPortal();
			}

			$('.zbc-section-wrapper').each(function () {
				var section = $(this).data('section');
				ZBC.loadSection(section, 1, $(this).data('per-page') || 25, $(this).data('status') || '');
			});
		},

		initPortal: function () {
			if (zbcPortal.isConnected) {
				this.loadSection('customers', 1, 25, '');
			}

			// Tab switching
			$(document).on('click', '.zbc-tab-btn', function () {
				var tab = $(this).data('tab');
				$('.zbc-tab-btn').removeClass('active');
				$(this).addClass('active');
				$('.zbc-tab-panel').removeClass('active');
				$('#zbc-panel-' + tab).addClass('active');

				if (!ZBC.state[tab]) {
					ZBC.loadSection(tab, 1, 25, '');
				}
			});
		},

		bindGlobalEvents: function () {
			// Connect
			$(document).on('click', '#zbc-connect-btn', function () {
				$(this).prop('disabled', true).text(zbcPortal.i18n.connecting);
				$.post(zbcPortal.ajaxUrl, {
					action: 'zbc_connect_zoho',
					nonce: zbcPortal.connectNonce
				}, function (res) {
					if (res.success && res.data.auth_url) {
						window.location.href = res.data.auth_url;
					} else {
						ZBC.showNotice('error', res.data.message || zbcPortal.i18n.error);
						$('#zbc-connect-btn').prop('disabled', false);
					}
				});
			});

			// Disconnect
			$(document).on('click', '#zbc-disconnect-btn', function () {
				if (!confirm(zbcPortal.i18n.disconnecting + '?')) return;
				$(this).prop('disabled', true).text(zbcPortal.i18n.disconnecting);
				$.post(zbcPortal.ajaxUrl, {
					action: 'zbc_disconnect_zoho',
					nonce: zbcPortal.disconnectNonce
				}, function (res) {
					if (res.success) {
						window.location.reload();
					}
				});
			});

			// Refresh cache
			$(document).on('click', '#zbc-refresh-btn', function () {
				var $btn = $(this);
				$btn.prop('disabled', true).text(zbcPortal.i18n.refreshing);
				$.post(zbcPortal.ajaxUrl, {
					action: 'zbc_refresh_cache',
					nonce: zbcPortal.nonce
				}, function () {
					ZBC.state = {};
					$btn.prop('disabled', false);
					var activeTab = $('.zbc-tab-btn.active').data('tab') || 'customers';
					ZBC.loadSection(activeTab, 1, 25, '');
				});
			});

			// Status filter
			$(document).on('change', '.zbc-status-filter', function () {
				var section = $(this).data('section');
				var status  = $(this).val();
				ZBC.state[section] = null;
				ZBC.loadSection(section, 1, ZBC.getPerPage(section), status);
			});

			// Per-page selector
			$(document).on('change', '.zbc-per-page', function () {
				var section  = $(this).data('section');
				var per_page = parseInt($(this).val(), 10);
				ZBC.state[section] = null;
				ZBC.loadSection(section, 1, per_page, ZBC.getStatus(section));
			});

			// Detail view
			$(document).on('click', '.zbc-view-detail', function () {
				var type = $(this).data('type');
				var id   = $(this).data('id');
				ZBC.openDetail(type, id);
			});

			// Modal close
			$(document).on('click', '.zbc-modal-close, .zbc-modal-overlay', function (e) {
				if ($(e.target).hasClass('zbc-modal-overlay') || $(e.target).hasClass('zbc-modal-close') || $(e.target).closest('.zbc-modal-close').length) {
					$('.zbc-modal-overlay').hide();
					$('body').css('overflow', '');
				}
			});

			// Escape key
			$(document).on('keydown', function (e) {
				if (e.key === 'Escape') {
					$('.zbc-modal-overlay').hide();
					$('body').css('overflow', '');
				}
			});

			// Pagination
			$(document).on('click', '.zbc-pagination-btn', function () {
				var section  = $(this).data('section');
				var page     = parseInt($(this).data('page'), 10);
				var per_page = ZBC.getPerPage(section);
				var status   = ZBC.getStatus(section);
				ZBC.loadSection(section, page, per_page, status);
			});
		},

		loadSection: function (section, page, per_page, status) {
			var $container  = $('[data-section="' + section + '"].zbc-data-container');
			var $pagination = $('[data-section="' + section + '"].zbc-pagination');

			if (!$container.length) return;

			$container.html('<div class="zbc-loading"><div class="zbc-spinner"></div>' + zbcPortal.i18n.loading + '</div>');
			$pagination.empty();

			$.post(zbcPortal.ajaxUrl, {
				action:   'zbc_get_section_data',
				nonce:    zbcPortal.nonce,
				section:  section,
				page:     page,
				per_page: per_page,
				status:   status || ''
			}, function (res) {
				if (!res.success) {
					if (res.data && res.data.not_connected) {
						$container.html('<div class="zbc-notice zbc-notice-warning">' + (res.data.message || zbcPortal.i18n.error) + '</div>');
					} else {
						$container.html('<div class="zbc-notice zbc-notice-error">' + (res.data && res.data.message ? res.data.message : zbcPortal.i18n.error) + '</div>');
					}
					return;
				}

				var data = res.data;
				ZBC.state[section] = { page: page, per_page: per_page, status: status, total: data.total };

				var html = ZBC.renderTable(section, data.items);
				$container.html(html);
				ZBC.renderPagination($pagination, section, data);
			}).fail(function () {
				$container.html('<div class="zbc-notice zbc-notice-error">' + zbcPortal.i18n.error + '</div>');
			});
		},

		renderTable: function (section, items) {
			if (!items || !items.length) {
				return '<p class="zbc-empty-state">' + zbcPortal.i18n.noData + '</p>';
			}

			var html = '<div class="zbc-table-wrapper"><table class="zbc-table"><thead><tr>';

			switch (section) {
				case 'customers':
					html += '<th>Nombre</th><th>Email</th><th>Teléfono</th><th>Estado</th><th class="zbc-amount">Saldo</th><th></th>';
					break;
				case 'estimates':
					html += '<th>Número</th><th>Cliente</th><th>Fecha</th><th>Vence</th><th class="zbc-amount">Total</th><th>Estado</th><th></th>';
					break;
				case 'invoices':
					html += '<th>Número</th><th>Cliente</th><th>Fecha</th><th>Vto.</th><th class="zbc-amount">Total</th><th class="zbc-amount">Saldo</th><th>Estado</th><th></th>';
					break;
				case 'projects':
					html += '<th>Proyecto</th><th>Cliente</th><th>Tipo</th><th>Estado</th><th></th>';
					break;
			}

			html += '</tr></thead><tbody>';

			items.forEach(function (item) {
				html += '<tr>';
				switch (section) {
					case 'customers':
						html += '<td><strong>' + ZBC.esc(item.name) + '</strong></td>';
						html += '<td>' + ZBC.esc(item.email || '—') + '</td>';
						html += '<td>' + ZBC.esc(item.phone || '—') + '</td>';
						html += '<td>' + ZBC.pill(item.status) + '</td>';
						html += '<td class="zbc-amount">' + ZBC.formatAmount(item.balance, item.currency) + '</td>';
						html += '<td><button class="zbc-btn zbc-btn-outline zbc-btn-sm zbc-view-detail" data-type="customer" data-id="' + ZBC.esc(item.id) + '">Ver</button></td>';
						break;
					case 'estimates':
						html += '<td><strong>' + ZBC.esc(item.number) + '</strong></td>';
						html += '<td>' + ZBC.esc(item.customer) + '</td>';
						html += '<td>' + ZBC.formatDate(item.date) + '</td>';
						html += '<td>' + (item.expiry ? ZBC.formatDate(item.expiry) : '—') + '</td>';
						html += '<td class="zbc-amount">' + ZBC.formatAmount(item.total, item.currency) + '</td>';
						html += '<td>' + ZBC.pill(item.status) + '</td>';
						html += '<td><button class="zbc-btn zbc-btn-outline zbc-btn-sm zbc-view-detail" data-type="estimate" data-id="' + ZBC.esc(item.id) + '">Ver</button></td>';
						break;
					case 'invoices':
						html += '<td><strong>' + ZBC.esc(item.number) + '</strong></td>';
						html += '<td>' + ZBC.esc(item.customer) + '</td>';
						html += '<td>' + ZBC.formatDate(item.date) + '</td>';
						html += '<td>' + (item.due_date ? ZBC.formatDate(item.due_date) : '—') + '</td>';
						html += '<td class="zbc-amount">' + ZBC.formatAmount(item.total, item.currency) + '</td>';
						html += '<td class="zbc-amount">' + ZBC.formatAmount(item.balance, item.currency) + '</td>';
						html += '<td>' + ZBC.pill(item.status) + '</td>';
						html += '<td><button class="zbc-btn zbc-btn-outline zbc-btn-sm zbc-view-detail" data-type="invoice" data-id="' + ZBC.esc(item.id) + '">Ver</button></td>';
						break;
					case 'projects':
						html += '<td><strong>' + ZBC.esc(item.name) + '</strong></td>';
						html += '<td>' + ZBC.esc(item.customer || '—') + '</td>';
						html += '<td>' + ZBC.esc(ZBC.billingLabel(item.billing_type)) + '</td>';
						html += '<td>' + ZBC.pill(item.status) + '</td>';
						html += '<td><button class="zbc-btn zbc-btn-outline zbc-btn-sm zbc-view-detail" data-type="project" data-id="' + ZBC.esc(item.id) + '">Ver</button></td>';
						break;
				}
				html += '</tr>';
			});

			html += '</tbody></table></div>';
			return html;
		},

		renderPagination: function ($el, section, data) {
			if (data.total <= data.per_page) return;

			var total_pages = Math.ceil(data.total / data.per_page);
			var html = '';

			html += '<button class="zbc-pagination-btn" data-section="' + section + '" data-page="' + (data.page - 1) + '" ' + (data.page <= 1 ? 'disabled' : '') + '>← Anterior</button>';
			html += '<span class="zbc-pagination-info">Pág. ' + data.page + ' de ' + total_pages + ' (' + data.total + ' registros)</span>';
			html += '<button class="zbc-pagination-btn" data-section="' + section + '" data-page="' + (data.page + 1) + '" ' + (!data.has_more ? 'disabled' : '') + '>Siguiente →</button>';

			$el.html(html);
		},

		openDetail: function (type, id) {
			var $modal = $('#zbc-detail-modal');
			if (!$modal.length) {
				$modal = $('[id^="zbc-detail-modal-"]').first();
			}

			$modal.find('.zbc-modal-title').text('Cargando...');
			$modal.find('.zbc-modal-body').html('<div class="zbc-loading"><div class="zbc-spinner"></div>' + zbcPortal.i18n.loading + '</div>');
			$modal.show();
			$('body').css('overflow', 'hidden');

			$.post(zbcPortal.ajaxUrl, {
				action: 'zbc_get_detail',
				nonce:  zbcPortal.nonce,
				type:   type,
				id:     id
			}, function (res) {
				if (!res.success) {
					$modal.find('.zbc-modal-body').html('<div class="zbc-notice zbc-notice-error">' + zbcPortal.i18n.error + '</div>');
					return;
				}
				var html = ZBC.renderDetail(res.data.type, res.data.data);
				$modal.find('.zbc-modal-title').text(html.title);
				$modal.find('.zbc-modal-body').html(html.body);
			}).fail(function () {
				$modal.find('.zbc-modal-body').html('<div class="zbc-notice zbc-notice-error">' + zbcPortal.i18n.error + '</div>');
			});
		},

		renderDetail: function (type, data) {
			var title = '', body = '';

			switch (type) {
				case 'customer':
					var c = data.contact || data;
					title = c.contact_name || 'Cliente';
					body += ZBC.detailGrid([
						{ label: 'Nombre', value: c.contact_name },
						{ label: 'Email', value: c.email },
						{ label: 'Teléfono', value: c.phone },
						{ label: 'Móvil', value: c.mobile },
						{ label: 'Estado', value: ZBC.pill(c.status) },
						{ label: 'Moneda', value: c.currency_code },
						{ label: 'Saldo pendiente', value: ZBC.formatAmount(c.outstanding_receivable_amount_bcy, c.currency_code) },
						{ label: 'Sitio web', value: c.website },
					]);
					if (c.billing_address) {
						body += '<div class="zbc-detail-section-title">Dirección de facturación</div>';
						body += ZBC.detailGrid([
							{ label: 'Dirección', value: [c.billing_address.address, c.billing_address.city, c.billing_address.country].filter(Boolean).join(', ') },
						]);
					}
					break;

				case 'estimate':
					var e = data.estimate || data;
					title = 'Presupuesto ' + (e.estimate_number || '');
					body += ZBC.detailGrid([
						{ label: 'Número', value: e.estimate_number },
						{ label: 'Cliente', value: e.customer_name },
						{ label: 'Fecha', value: ZBC.formatDate(e.date) },
						{ label: 'Vence', value: e.expiry_date ? ZBC.formatDate(e.expiry_date) : '—' },
						{ label: 'Moneda', value: e.currency_code },
						{ label: 'Subtotal', value: ZBC.formatAmount(e.sub_total, e.currency_code) },
						{ label: 'Impuesto', value: ZBC.formatAmount(e.tax_total, e.currency_code) },
						{ label: 'Total', value: '<strong>' + ZBC.formatAmount(e.total, e.currency_code) + '</strong>' },
						{ label: 'Estado', value: ZBC.pill(e.status) },
					]);
					if (e.line_items && e.line_items.length) {
						body += ZBC.lineItemsTable(e.line_items, e.currency_code);
					}
					break;

				case 'invoice':
					var inv = data.invoice || data;
					title = 'Factura ' + (inv.invoice_number || '');
					body += ZBC.detailGrid([
						{ label: 'Número', value: inv.invoice_number },
						{ label: 'Cliente', value: inv.customer_name },
						{ label: 'Fecha', value: ZBC.formatDate(inv.date) },
						{ label: 'Vencimiento', value: inv.due_date ? ZBC.formatDate(inv.due_date) : '—' },
						{ label: 'Moneda', value: inv.currency_code },
						{ label: 'Subtotal', value: ZBC.formatAmount(inv.sub_total, inv.currency_code) },
						{ label: 'Impuesto', value: ZBC.formatAmount(inv.tax_total, inv.currency_code) },
						{ label: 'Total', value: '<strong>' + ZBC.formatAmount(inv.total, inv.currency_code) + '</strong>' },
						{ label: 'Saldo', value: '<strong>' + ZBC.formatAmount(inv.balance, inv.currency_code) + '</strong>' },
						{ label: 'Estado', value: ZBC.pill(inv.status) },
					]);
					if (inv.line_items && inv.line_items.length) {
						body += ZBC.lineItemsTable(inv.line_items, inv.currency_code);
					}
					break;

				case 'project':
					var p = data.project || data;
					var tasks_data = data.tasks_data || {};
					title = p.project_name || 'Proyecto';
					body += ZBC.detailGrid([
						{ label: 'Nombre', value: p.project_name },
						{ label: 'Cliente', value: p.customer_name || '—' },
						{ label: 'Estado', value: ZBC.pill(p.status) },
						{ label: 'Tipo facturación', value: ZBC.billingLabel(p.billing_type) },
						{ label: 'Tarifa', value: p.rate ? ZBC.formatAmount(p.rate, p.currency_code) : '—' },
						{ label: 'Descripción', value: p.description || '—' },
					]);
					var tasks = tasks_data.tasks || [];
					if (tasks.length) {
						body += '<div class="zbc-detail-section-title">Tareas (' + tasks.length + ')</div>';
						body += '<div class="zbc-table-wrapper"><table class="zbc-table"><thead><tr><th>Tarea</th><th>Descripción</th><th class="zbc-amount">Horas estimadas</th></tr></thead><tbody>';
						tasks.forEach(function (t) {
							body += '<tr><td>' + ZBC.esc(t.task_name) + '</td><td>' + ZBC.esc(t.description || '—') + '</td><td class="zbc-amount">' + (t.estimated_hours || '—') + '</td></tr>';
						});
						body += '</tbody></table></div>';
					}
					break;

				default:
					title = 'Detalle';
					body = '<pre style="white-space:pre-wrap;font-size:12px;">' + JSON.stringify(data, null, 2) + '</pre>';
			}

			return { title: title, body: body };
		},

		detailGrid: function (fields) {
			var html = '<div class="zbc-detail-grid">';
			fields.forEach(function (f) {
				if (f.value === undefined || f.value === null || f.value === '') return;
				html += '<div class="zbc-detail-item"><label>' + ZBC.esc(f.label) + '</label><span>' + f.value + '</span></div>';
			});
			html += '</div>';
			return html;
		},

		lineItemsTable: function (items, currency) {
			var html = '<div class="zbc-detail-section-title">Líneas (' + items.length + ')</div>';
			html += '<div class="zbc-table-wrapper"><table class="zbc-table"><thead><tr><th>Descripción</th><th class="zbc-amount">Cant.</th><th class="zbc-amount">Precio</th><th class="zbc-amount">Total</th></tr></thead><tbody>';
			items.forEach(function (li) {
				html += '<tr><td>' + ZBC.esc(li.name || li.description || '—') + '</td>';
				html += '<td class="zbc-amount">' + (li.quantity || 1) + '</td>';
				html += '<td class="zbc-amount">' + ZBC.formatAmount(li.rate, currency) + '</td>';
				html += '<td class="zbc-amount">' + ZBC.formatAmount(li.item_total, currency) + '</td>';
				html += '</tr>';
			});
			html += '</tbody></table></div>';
			return html;
		},

		pill: function (status) {
			var labels = {
				active: 'Activo', inactive: 'Inactivo', draft: 'Borrador', sent: 'Enviado',
				accepted: 'Aceptado', declined: 'Rechazado', invoiced: 'Facturado', expired: 'Expirado',
				paid: 'Pagado', overdue: 'Vencido', void: 'Anulada', partially_paid: 'Parcial',
				completed: 'Completado'
			};
			var label = labels[status] || status || '—';
			return '<span class="zbc-pill zbc-pill-' + ZBC.esc(status) + '">' + label + '</span>';
		},

		billingLabel: function (type) {
			var labels = {
				fixed_cost_for_project: 'Coste fijo',
				based_on_project_hours: 'Por horas (proyecto)',
				based_on_staff_hours: 'Por horas (equipo)',
				based_on_task_hours: 'Por horas (tarea)'
			};
			return labels[type] || type || '—';
		},

		formatAmount: function (amount, currency) {
			if (amount === undefined || amount === null) return '—';
			var num = parseFloat(amount);
			if (isNaN(num)) return '—';
			return (currency ? currency + ' ' : '') + num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		},

		formatDate: function (dateStr) {
			if (!dateStr) return '—';
			var parts = dateStr.split('-');
			if (parts.length !== 3) return ZBC.esc(dateStr);
			return parts[2] + '/' + parts[1] + '/' + parts[0];
		},

		esc: function (str) {
			if (str === null || str === undefined) return '';
			return String(str)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		},

		getPerPage: function (section) {
			var $sel = $('.zbc-per-page[data-section="' + section + '"]');
			return $sel.length ? parseInt($sel.val(), 10) : 25;
		},

		getStatus: function (section) {
			var $sel = $('.zbc-status-filter[data-section="' + section + '"]');
			return $sel.length ? $sel.val() : '';
		},

		showNotice: function (type, message) {
			var $notice = $('<div class="zbc-notice zbc-notice-' + type + '">' + message + '</div>');
			$('.zbc-portal, .zbc-section-wrapper').first().prepend($notice);
			setTimeout(function () { $notice.fadeOut(400, function () { $(this).remove(); }); }, 5000);
		}
	};

	$(document).ready(function () {
		ZBC.init();
	});

}(jQuery));
