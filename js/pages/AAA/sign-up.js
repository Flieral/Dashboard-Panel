var publisher_url = "http://127.0.0.1:3005/api/clients";
var announcer_url = "http://127.0.0.1:3000/api/clients";

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

	var country, ipAddress, localTime;
	time = Math.floor((new Date).getTime())
	$.ajax({
		url: 'http://ip-api.com/json',
		type: "GET",
		success: function (result) {
			country = result.countryCode
			ipAddress = result.query
		},
		error: function (result) {
			country = 'US'
			ipAddress = '192.168.1.1'
		}
	});

	$("#signup_btn").click(function (e) {
		e.preventDefault();
		NProgress.start();
		if ($('#checkbox').is(':checked') == false) {
			NProgress.done();
			swal("Wait!", "In order to continue, You shuold be agreed with Flieral terms and policies.", "error");
			return
		}

		if ($('#announcerRadio').is(':checked') == false)
			var serviceToRequest = publisher_url;
		else
			var serviceToRequest = announcer_url;
		var data = {
			companyName: $('#companyName').val(),
			email: $('#email').val().toLowerCase(),
			password: $('#password').val(),
			username: $('#username').val().toLowerCase(),
			time: time,
			registrationCountry: country,
			registrationIPAddress: ipAddress
		}
		$.ajax({
			url: serviceToRequest,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (result) {
				NProgress.done();
				swal("Congrates!", "Thank you for your registering. We have received your regiestration information and send you a confirmation email. Please verify your email address.", "success");
			},
			error: function (xhr, status, error) {
				NProgress.done();
				showNotification('alert-danger', 'Oops! Something went wrong, Please try again somehow later.', 'top', 'right', 'animated fadeIn', 'animated fadeOut');
				// alert(xhr.responseText);
			}
		});
	});
});