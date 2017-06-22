var publisher_url = "http://127.0.0.1:3005/api/clients/change-password";
var announcer_url = "http://127.0.0.1:3000/api/clients/change-password";

$(document).ready(function () {
	$("#chng_btn").click(function () {
		var data = {
			oldPassword: $('#password').val(),
			newPassword: $('#confirm').val()
		}
		$.ajax({
			url: announcer_url,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (result) {
				$("#div1").html(result);
			},
			error: function (result) {
				$("#div1").html(result);
			}
		});
	});
});