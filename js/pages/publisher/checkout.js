function wrapAccessToken(url, accessToken) {
	if (url.indexOf('?') !== -1)
		return url + '&access_token=' + accessToken
	else
		return url + '?access_token=' + accessToken
}

var publisher_url = "http://149.202.30.89:3005/api/";
var coreEngine_url = "http://149.202.30.89:3015/api/";

$(document).ready(function () {
	var transactionIds = []
	var priceValue = 0

	var userId, publisherAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('publisherAccessToken'))
		publisherAccessToken = localStorage.getItem('publisherAccessToken')
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
				var coreAccountURL = wrapAccessToken(coreEngine_url + 'statistics/getPublisherPayable?accountHashId=' + userId, coreAccessToken);
				$.ajax({
					url: coreAccountURL,
					type: "GET",
					success: function (accountResult) {
						$("#publisherUsername").html(localStorage.getItem('publisherCompanyName'));
						$("#publisherEmail").html(localStorage.getItem('publisherEmail'));
						$("#checkoutIP").val(ipAddress);
						$("#cgeckoutTime").val((new Date()).toLocaleString());
						priceValue = accountResult.payable
						transactionIds = accountResult.transactionIds
						$("#sharedCredit").html('Publisher Payable Credit: $' + priceValue);
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

	$("#refinementButton").click(function (e) {
		e.preventDefault();
		var checkoutURL = wrapAccessToken(coreEngine_url + 'statistics/publisherCheckout?accessTokenId=' + publisherAccessToken + '&accountHashId=' + userId, coreAccessToken);
		var receiptData = {
			fakeData: 'Fake Data',
			price: priceValue
		}
		var data = {
			receiptData: JSON.stringify(receiptData),
			transactionIds: transactionIds
		}
		$.ajax({
			url: checkoutURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (checkoutResult) {
				$("#sharedCredit").html('Publisher Payable Credit: $0');
				swal("Congrates!", "Checkout Successfuly Done.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#signOutButton").click(function (e) {
		e.preventDefault();
		localStorage.clear()
		return window.location.href = '../AAA/sign-in.html'
	})

});