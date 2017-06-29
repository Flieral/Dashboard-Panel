function wrapAccessToken(url, accessToken) {
	if (url.indexOf('?') !== -1)
		return url + '&access_token=' + accessToken
	else
		return url + '?access_token=' + accessToken
}

function wrapFilter(url, filter) {
	if (url.indexOf('?') !== -1)
		return url + '&filter=' + filter
	else
		return url + '?filter=' + filter
}

function timeConvertor(myDate) {
	var parts = myDate.split(" ")
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return Math.floor((new Date(parseInt(parts[3]), months.indexOf(parts[2]), parseInt(parts[1]))).getTime())
}

function dateConvertor(myDate) {
	var d = new Date(myDate)
	var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return ('' + weekday[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear())
}

var publisher_url = "http://149.202.30.89:3005/api/";
var coreEngine_url = "http://149.202.30.89:3015/api/";

$(document).ready(function () {
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
				'copy', 'csv', 'excel', 'pdf', 'print'
			]
		});
	}

	$("#publisherUsername").html(localStorage.getItem('publisherCompanyName'));
	$("#publisherEmail").html(localStorage.getItem('publisherEmail'));

	$('.page-loader-wrapper').fadeOut();

	function fillTable(receiptsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < receiptsArray.length; i++) {
			var statusColor
			if (receiptsArray[i].status === 'Unchecked') statusColor = 'bg-deep-orange'
			else if (receiptsArray[i].status === 'Checked') statusColor = 'bg-green'
			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + receiptsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(receiptsArray[i].time) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 20%;">' + JSON.stringify(receiptsArray[i].data) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + receiptsArray[i].data.price + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + receiptsArray[i].status + '</span></td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$("#receiptInformationSearchButton").click(function (e) {
		e.preventDefault();
		var status
		var beginningTime
		var endingTime

		if ($('#receiptInformationStatus').val())
			status = $('#receiptInformationStatus').val()

		if ($('#receiptInformationBeginningTime').val())
			beginningTime = timeConvertor($('#receiptInformationBeginningTime').val())

		if ($('#receiptInformationEndingTime').val())
			endingTime = timeConvertor($('#receiptInformationEndingTime').val())

		var limit = $('#receiptInformationLimit').val()

		var receiptURLWithAT = wrapAccessToken(coreEngine_url + 'statistics/getAllReceipts?accountHashId=' + userId, publisherAccessToken)
		$.ajax({
			url: receiptURL,
			type: "GET",
			success: function (receiptResult) {
				var responseArray = []
				for (var i = 0; i < receiptResult.length; i++) {
					var time = receiptResult[i].time
					var stat = receiptResult[i].status
					if (responseArray.length == limit)
						break
					if (status.length > 0) {
						if (status.indexOf(stat) >= 0) {
							if (beginningTime && endingTime) {
								if (time >= beginningTime && time <= endingTime)
									responseArray.push(receiptResult[i])
							} else if (beginningTime) {
								if (time >= beginningTime)
									responseArray.push(receiptResult[i])
							} else if (endingTime) {
								if (time <= endingTime)
									responseArray.push(receiptResult[i])
							} else
								responseArray.push(receiptResult[i])
						}
					} else {
						if (beginningTime && endingTime) {
							if (time >= beginningTime && time <= endingTime)
								responseArray.push(receiptResult[i])
						} else if (beginningTime) {
							if (time >= beginningTime)
								responseArray.push(receiptResult[i])
						} else if (endingTime) {
							if (time <= endingTime)
								responseArray.push(receiptResult[i])
						} else
							responseArray.push(receiptResult[i])
					}
				}

				fillTable(responseArray)
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
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