function wrapAccessToken(url, accessToken) {
	if (url.indexOf('?') !== -1)
		return url + '&access_token=' + accessToken
	else
		return url + '?access_token=' + accessToken
}

function wrapKeyValue(url, key, value) {
	if (url.indexOf('?') !== -1)
		return url + '&' + key + '=' + value
	else
		return url + '?' + key + '=' + value
}

function timeConvertor(myDate) {
	var parts = myDate.split(" ")
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return Math.floor((new Date(parseInt(parts[3]), months.indexOf(parts[2]), parseInt(parts[1]))).getTime())
}

function dateConvertor(myDate) {
	var d = new Date(Number(myDate))
	var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return ('' + weekday[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear())
}

function ajaxHelper(url, data, type, callback) {
	$.ajax({
		url: url,
		type: type,
		data: data,
		success: function (result) {
			callback(null, result);
		},
		error: function (error) {
			callback(error, null);
		}
	});
}

var announcer_url = "http://127.0.0.1:3000/api/";
var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {

	var adminId, coreAccessToken, announcerAccessToken, publisherAccessToken
	if (localStorage.getItem('adminId'))
		adminId = localStorage.getItem('adminId')
	else
		return window.location.href = '../AAA/sign-in-admin.html';
	if (localStorage.getItem('adminCoreAccessToken'))
		coreAccessToken = localStorage.getItem('adminCoreAccessToken')
	else
		return window.location.href = '../AAA/sign-in-admin.html';
	if (localStorage.getItem('adminAnnouncerAccessToken'))
		announcerAccessToken = localStorage.getItem('adminAnnouncerAccessToken')
	else
		return window.location.href = '../AAA/sign-in-admin.html';
	if (localStorage.getItem('adminPublisherAccessToken'))
		publisherAccessToken = localStorage.getItem('adminPublisherAccessToken')
	else
		return window.location.href = '../AAA/sign-in-admin.html';

	initDateTimePicker();
	initJQueryTable();

	function initDateTimePicker() {
		//Textare auto growth
		autosize($('textarea.auto-growth'));
		//Datetimepicker plugin
		$('.datetimepicker').bootstrapMaterialDatePicker({
			format: 'dddd DD MMMM YYYY - HH:mm',
			clearButton: true,
			weekStart: 1
		});

		$('.datepicker').bootstrapMaterialDatePicker({
			format: 'dddd DD MMMM YYYY',
			clearButton: true,
			weekStart: 1,
			time: false
		});

		$('.timepicker').bootstrapMaterialDatePicker({
			format: 'HH:mm',
			clearButton: true,
			date: false
		});
	}

	function initJQueryTable() {
		//Exportable table
		$('.js-exportable').DataTable({
			dom: 'Bfrtip',
			buttons: [
				'csv', 'excel'
			]
		});
		$('.js-basic-example').DataTable(
			{"searching": false,
				"ordering": false,
				"pageLength": 4,
				"iDisplayLength": 4,
				"lengthChange": false
			}
		);
	}

	function fillRateSearchesTable(resultArray) {
		$('#rate_tab_logic>tbody').empty()
		for (var i = 0; i < resultArray.length; i++) {
			$('#rate_tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + resultArray[i] + '</td>'
			);
		}
		$('#rate_tab_logic').DataTable();
	}

	function fillMostSearchesTable(resultArray) {
		$('#most_tab_logic>tbody').empty()
		for (var i = 0; i < resultArray.length; i++) {
			$('#most_tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + resultArray[i] + '</td>'
			);
		}
		$('#most_tab_logic').DataTable();
	}

	function fillSimilarSearchesTable(resultArray) {
		$('#similar_tab_logic>tbody').empty()
		for (var i = 0; i < resultArray.length; i++) {
			$('#similar_tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + resultArray[i] + '</td>'
			);
		}
		$('#similar_tab_logic').DataTable();
	}

	function fillRecommendationSearchesTable(resultArray) {
		$('#recom_tab_logic>tbody').empty()
		for (var i = 0; i < resultArray.length; i++) {
			$('#recom_tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + resultArray[i] + '</td>'
			);
		}
		$('#recom_tab_logic').DataTable();
	}

	function fillAllForSearchesTable(resultArray) {
		$('#all_for_tab_logic>tbody').empty()
		for (var i = 0; i < resultArray.length; i++) {
			$('#all_for_tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + resultArray[i] + '</td>'
			);
		}
		$('#all_for_tab_logic').DataTable();
	}

	function fillCountSearchesTable(result) {
		$('#count_tab_logic>tbody').empty()
		$('#count_tab_logic').append('<tr id="addr' + 0 + '"></tr>');
		$('#addr' + 0).html(
			'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + result + '</td>'
		);
		$('#count_tab_logic').DataTable();
	}

	function fillBySearchesTable(resultArray) {
		$('#by_tab_logic>tbody').empty()
		for (var i = 0; i < resultArray.length; i++) {
			$('#by_tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + resultArray[i] + '</td>'
			);
		}
		$('#by_tab_logic').DataTable();
	}

	$("#rateSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var selector

		if ($('#rateQuery').val())
			selector = $('#rateQuery').val()

		var url
		if (selector === 'Best Rated')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'bestRated', coreAccessToken)
		else if (selector === 'Worse Rated')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'worstRated', coreAccessToken)

		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillRateSearchesTable(result.response)
			NProgress.done();
		})
	})

	$("#mostSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var selector

		if ($('#mostQuery').val())
			selector = $('#mostQuery').val()

		var url
		if (selector === 'Most Liked')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'mostLiked', coreAccessToken)
		else if (selector === 'Most Disliked')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'mostDisliked', coreAccessToken)
		else if (selector === 'Most Reported')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'mostReported', coreAccessToken)
		else if (selector === 'Most Shared')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'mostShared', coreAccessToken)

		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillMostSearchesTable(result.response)
			NProgress.done();
		})
	})

	$("#similarSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var selector
		var option1

		if ($('#similarQuery').val())
			selector = $('#similarQuery').val()

		if ($('#similarIdentifier').val())
			option1 = $('#similarIdentifier').val()

		if (!option1)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		var url
		if (selector === 'Most Similar Users')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'mostSimilarUsers', coreAccessToken)
		else if (selector === 'Least Similar Users')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'leastSimilarUsers', coreAccessToken)

		url = wrapKeyValue(url, 'userId', option1)
		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillSimilarSearchesTable(result.response)
			NProgress.done();
		})
	})

	$("#recommendationSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var option1, option2

		if ($('#recommendationIdentifier').val())
			option1 = $('#recommendationIdentifier').val()

		if ($('#recommendationRecs').val())
			option2 = $('#recommendationRecs').val()

		if (!option1 || !option2)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		url = wrapAccessToken(coreEngine_url + 'interactions/' + 'recommendFor', coreAccessToken)

		url = wrapKeyValue(url, 'userId', option1)
		url = wrapKeyValue(url, 'numberOfRecs', Number(option2))
		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillRecommendationSearchesTable(result.response)
			NProgress.done();
		})
	})

	$("#allForSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var selector
		var option1

		if ($('#allForQuery').val())
			selector = $('#allForQuery').val()

		if ($('#allForUserIdentifier').val())
			option1 = $('#allForUserIdentifier').val()

		if (!option1)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		var url
		if (selector === 'All Liked For')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'allLikedFor', coreAccessToken)
		else if (selector === 'All Disliked For')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'allDislikedFor', coreAccessToken)
		else if (selector === 'All Reported For')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'allReportedFor', coreAccessToken)
		else if (selector === 'All Shared For')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'allSharedFor', coreAccessToken)

		url = wrapKeyValue(url, 'userId', option1)
		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillAllForSearchesTable(result.response)
			NProgress.done();
		})
	})

	$("#countSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var selector
		var option1

		if ($('#countQuery').val())
			selector = $('#countQuery').val()

		if ($('#countContentIdentifier').val())
			option1 = $('#countContentIdentifier').val()

		if (!option1)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		var url
		if (selector === 'Liked Count')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'likedCount', coreAccessToken)
		else if (selector === 'Disliked Count')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'dislikedCount', coreAccessToken)
		else if (selector === 'Reported Count')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'reportedCount', coreAccessToken)
		else if (selector === 'Shared Count')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'sharedCount', coreAccessToken)

		url = wrapKeyValue(url, 'contentId', option1)
		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillCountSearchesTable(result.response)
			NProgress.done();
		})
	})

	$("#bySearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var selector
		var option1

		if ($('#byQuery').val())
			selector = $('#byQuery').val()

		if ($('#byContentIdentifier').val())
			option1 = $('#byContentIdentifier').val()

		if (!option1)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		var url
		if (selector === 'Liked By')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'likedBy', coreAccessToken)
		else if (selector === 'Disliked By')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'dislikedBy', coreAccessToken)
		else if (selector === 'Reported By')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'reportedBy', coreAccessToken)
		else if (selector === 'Shared By')
			url = wrapAccessToken(coreEngine_url + 'interactions/' + 'sharedBy', coreAccessToken)

		url = wrapKeyValue(url, 'contentId', option1)
		ajaxHelper(url, null, "GET", function (err, result) {
			if (err) {
				NProgress.done();
				return alert(err);
			}
			fillBySearchesTable(result.response)
			NProgress.done();
		})
	})	

	$("#signOutButton").click(function (e) {
		e.preventDefault();
		localStorage.clear()
		return window.location.href = '../AAA/sign-in-admin.html'
	})

});