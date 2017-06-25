function wrapAccessToken(url, accessToken) {
	if (url.indexOf('?') !== -1)
		return url + '&access_token=' + accessToken
	else
		return url + '?access_token=' + accessToken
}

var announcer_url = "http://127.0.0.1:3000/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var refineValue = 0
	var userId, serviceAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('serviceAccessToken'))
		serviceAccessToken = localStorage.getItem('serviceAccessToken')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('coreAccessToken'))
		coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		return window.location.href = '../AAA/sign-in.html';

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
		if (!$('#AddBudgetMoney').val())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		var data = {
			budget: Number($('#AddBudgetMoney').val())
		}
		var accountURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/announcerAccount', serviceAccessToken);
		$.ajax({
			url: accountURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (accountResult) {
				$("#sharedBudget").html('Budget: $' + accountResult.budget);
				swal("Congrates!", "You have successfuly increated your budget.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#refinementButton").click(function (e) {
		e.preventDefault();
		var value = $(this).text()
		if (value === 'Calculate Refinement') {
			var getRefinement = wrapAccessToken(announcer_url + 'clients/' + userId + '/getRefinement?accountHashId=' + userId, serviceAccessToken);
			$.ajax({
				url: getRefinement,
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				type: "POST",
				success: function (refinementResult) {
					refineValue = refinementResult.response
					$("#refinementValue").html('Refine: $' + refinementResult.response);
					$(this).html('Checkout')
				},
				error: function (xhr, status, error) {
					swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
					alert(xhr.responseText);
				}
			});
		}
		else {
			var checkoutURL = wrapAccessToken(coreEngine_url + 'statistics/announcerCheckout', coreAccessToken);
			var data = {
				fakeData: 'Fake Data',
				price: refineValue
			}
			$.ajax({
				url: checkoutURL,
				data: JSON.stringify(data),
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				type: "POST",
				success: function (checkoutResult) {
					$("#refinementValue").html('Refine: $0');
					swal("Congrates!", "Checkout Successfuly Done.", "success");
				},
				error: function (xhr, status, error) {
					swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
					alert(xhr.responseText);
				}
			});
		}
	})

	$("#signOutButton").click(function (e) {
		e.preventDefault();
		localStorage.clear()
		return window.location.href = '../AAA/sign-in.html'
	})

});