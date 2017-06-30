var publisher_url = "http://127.0.0.1:3005/api/clients/login";
var announcer_url = "http://127.0.0.1:3000/api/clients/login";
var coreEngine_url = "http://127.0.0.1:3015/api/clients/login";

$(document).ready(function () {
	function showNotification(colorName, text, placementFrom, placementAlign, animateEnter, animateExit) {
		if (colorName === null || colorName === '') {
			colorName = 'bg-black';
		}
		if (text === null || text === '') {
			text = 'Turning standard Bootstrap alerts';
		}
		if (animateEnter === null || animateEnter === '') {
			animateEnter = 'animated fadeInDown';
		}
		if (animateExit === null || animateExit === '') {
			animateExit = 'animated fadeOutUp';
		}
		var allowDismiss = true;

		$.notify({
			message: text
		}, {
			type: colorName,
			allow_dismiss: allowDismiss,
			newest_on_top: true,
			timer: 1000,
			placement: {
				from: placementFrom,
				align: placementAlign
			},
			animate: {
				enter: animateEnter,
				exit: animateExit
			},
			template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
				'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
				'<span data-notify="icon"></span> ' +
				'<span data-notify="title">{1}</span> ' +
				'<span data-notify="message">{2}</span>' +
				'<div class="progress" data-notify="progressbar">' +
				'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
				'</div>' +
				'<a href="{3}" target="{4}" data-notify="url"></a>' +
				'</div>'
		});
	}

	$("#login_btn").click(function (e) {
		e.preventDefault();
		var data = {
			password: $('#password').val()
		}
		if ($('#username').val().includes('@'))
			data.email = $('#username').val().toLowerCase();
		else
			data.username = $('#username').val().toLowerCase();
		$.ajax({
			url: publisher_url,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (publisherResult) {
				$.ajax({
					url: announcer_url,
					data: JSON.stringify(data),
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					type: "POST",
					success: function (announcerResult) {
						$.ajax({
							url: coreEngine_url,
							data: JSON.stringify(data),
							dataType: "json",
							contentType: "application/json; charset=utf-8",
							type: "POST",
							success: function (coreResult) {
								localStorage.setItem('AdminCompanyName', 'Flieral Inc.');
								localStorage.setItem('adminEmail', data.email);						
								localStorage.setItem('adminCoreAccessToken', coreResult.id);
								localStorage.setItem('adminId', announcerResult.userId);
								localStorage.setItem('adminAnnouncerAccessToken', announcerResult.id);
								localStorage.setItem('adminPublisherAccessToken', publisherResult.id);
								console.log('fucking success');
								window.location.href = '../Admin/users.html'
							},
							error: function (xhr, status, error) {
								showNotification('alert-danger', 'Oops! Something went wrong, Please try again somehow later.', 'top', 'right', 'animated fadeIn', 'animated fadeOut');
								// alert(xhr.responseText);
							}
						});
					},
					error: function (xhr, status, error) {
						showNotification('alert-danger', 'Oops! Something went wrong, Please try again somehow later.', 'top', 'right', 'animated fadeIn', 'animated fadeOut');
						// alert(xhr.responseText);
					}
				});
			},
			error: function (xhr, status, error) {
				showNotification('alert-danger', 'Oops! Something went wrong, Please try again somehow later.', 'top', 'right', 'animated fadeIn', 'animated fadeOut');
				// alert(xhr.responseText);
			}
		});
	});
});