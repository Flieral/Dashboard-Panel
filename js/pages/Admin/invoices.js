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
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var receiptsArray = []
	var clients = []

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
	getAllInfo();

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

	function getAllInfo() {
		var getClient_url = announcer_url + "clients?access_token=" + announcerAccessToken;
		ajaxHelper(getClient_url, null, "GET", function (err, result_Clients) {
			if (err) {
				$('.page-loader-wrapper').fadeOut();
				return alert(err);
			}
			var getAllReceipts_url = coreEngine_url + "receipts?access_token=" + coreAccessToken;
			ajaxHelper(getAllReceipts_url, null, "GET", function (err, resultAll) {
				if (err) {
					$('.page-loader-wrapper').fadeOut();
					return alert(err);
				}
				$('#receiptInformationAccount').find('option').remove()
				for (var i = 0; i < result_Clients.length; i++) {
					var itemToPush = {
						id: result_Clients[i].id,
						name: result_Clients[i].username
					};
					$('#receiptInformationAccount').append($('<option>', {
						value: itemToPush.id,
						text: itemToPush.id
					})).selectpicker('refresh');
					clients.push(itemToPush);
				}

				receiptsArray = resultAll
				fillTable(resultAll);

				$("#adminUsername").html(localStorage.getItem('AdminCompanyName'));
				$("#adminEmail").html(localStorage.getItem('adminEmail'));

				$('.page-loader-wrapper').fadeOut();
			})
		})
	}

	function fillTable(receiptsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < receiptsArray.length; i++) {
			var statusColor
			if (receiptsArray[i].status === 'Unchecked') statusColor = 'bg-deep-orange'
			else if (receiptsArray[i].status === 'Checked') statusColor = 'bg-green'
			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + receiptsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + receiptsArray[i].accountHashId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(receiptsArray[i].time) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + receiptsArray[i].data.price + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + receiptsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="receiptInfo m-l-5 m-r-5 btn bg-amber waves-effect"><i class="material-icons">details</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".userInfo", function (e) {
		e.preventDefault();
		var receiptId = $(this).parent().siblings().eq(0).text()
		var model
		for (var i = 0; i < receiptsArray.length; i++)
			if (receiptsArray[i].id === receiptId)
				model = receiptsArray[i]
		$('#defaultModal .modal-content').removeAttr('class').addClass('modal-content');
		$('#defaultModalLabelText').html(JSON.stringify(model.data, undefined, 2));
		$('#defaultModal').modal('show');
	})

	$("#receiptInformationSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var status
		var beginningTime
		var endingTime
		var accountFilter = []

		if ($('#receiptInformationStatus').val())
			status = $('#receiptInformationStatus').val()

		if ($('#receiptInformationBeginningTime').val())
			beginningTime = timeConvertor($('#receiptInformationBeginningTime').val())

		if ($('#receiptInformationEndingTime').val())
			endingTime = timeConvertor($('#receiptInformationEndingTime').val())

		if ($('#receiptInformationAccount').val())
			accountFilter = $('#receiptInformationAccount').val()

		var limit = $('#receiptInformationLimit').val()

		var receiptURLWithAT = wrapAccessToken(coreEngine_url + 'receipts', announcerAccessToken)
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

				if (responseArray.length > 0 && accountFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (accountFilter.indexOf(responseArray[i].accountHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				var finalResult = []
				for (var i = 0; i < responseArray.length; i++) {
					if (finalResult.length == limit)
						break
					finalResult.push(responseArray[i])
				}

				fillTable(finalResult)

				NProgress.done();
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				NProgress.done();
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	})

	$("#signOutButton").click(function (e) {
		e.preventDefault();
		localStorage.clear()
		return window.location.href = '../AAA/sign-in-admin.html'
	})

});