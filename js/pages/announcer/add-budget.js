function wrapAccessToken(url, accessToken) {
	if (url.indexOf('?') !== -1)
		return url + '&access_token=' + accessToken
	else
		return url + '?access_token=' + accessToken
}

var announcer_url = "http://127.0.0.1:3000/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var userId, serviceAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';
	if (localStorage.getItem('serviceAccessToken'))
		serviceAccessToken = localStorage.getItem('serviceAccessToken')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';
	if (localStorage.getItem('coreAccessToken'))
		coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';

	getAccountBalance()

	function getAccountBalance() {
		var ipAddress, country
		$.ajax({
			url: 'http://ip-api.com/json',
			type: "GET",
			success: function (result) {
				ipAddress = result.query + ' (' + result.country + ')'
				var accountURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/announcerAccount', serviceAccessToken);
				$.ajax({
					url: accountURL,
					type: "GET",
					success: function (accountResult) {
						$("#announcerUsername").html(localStorage.getItem('announcerCompanyName'));
						$("#announcerEmail").html(localStorage.getItem('announcerEmail'));
						$("#addBudgetIP").val(ipAddress);
						$("#addBudgetTime").val((new Date()).toLocaleString());
						$("#sharedBudget").html('Budget: $' + accountResult.budget);
						$('.page-loader-wrapper').fadeOut();
					},
					error: function (xhr, status, error) {
						$('.page-loader-wrapper').fadeOut();
						alert(xhr.responseText);
					}
				});
			}
		});
	}


	$("#addBudgetButton").click(function (e) {
		e.preventDefault();
		var data = {
			budget: $('#AddBudgetMoney').val()
		}
		$('.page-loader-wrapper').fadeIn();
		var accountURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/announcerAccountModel', serviceAccessToken);
		$.ajax({
			url: accountURL,
			data: data,
			type: "PUT",
			success: function (accountResult) {
				$("#sharedBudget").html('Budget: $' + accountResult.budget);
				$('.page-loader-wrapper').fadeOut();
				swal("Congrates!", "You have successfuly increated your budget.", "success");
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})
});