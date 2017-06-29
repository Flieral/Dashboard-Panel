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

var announcer_url = "http://149.202.30.89:3000/api/";
var coreEngine_url = "http://149.202.30.89:3015/api/";

$(document).ready(function () {
	var totalTransactions = []
	var totalSubcampaignArray = []

	var userId, announcerAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('announcerAccessToken'))
		announcerAccessToken = localStorage.getItem('announcerAccessToken')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('coreAccessToken'))
		coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		return window.location.href = '../AAA/sign-in.html';

	initDateTimePicker();
	initJQueryTable();
	getAccountModel();

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

	$("#announcerUsername").html(localStorage.getItem('announcerCompanyName'));
	$("#announcerEmail").html(localStorage.getItem('announcerEmail'));

	$('.page-loader-wrapper').fadeOut();

	function getAccountModel() {
		var campaignURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns', announcerAccessToken)
		var campaignURL = wrapFilter(campaignURLWithAT, '{"include":["subcampaigns"]}')
		$.ajax({
			url: campaignURL,
			type: "GET",
			success: function (campaignResult) {
				$('#transactionSubcampaign').find('option').remove()
				for (var i = 0; i < campaignResult.length; i++) {
					var group = $('<optgroup label="' + campaignResult[i].name + '"/>');
					for (j = 0; j < campaignResult[i].subcampaigns.length; j++)
						$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
					group.appendTo('#transactionSubcampaign');
					$('#transactionSubcampaign').selectpicker('refresh');
				}
				$('#transactionSubcampaign').trigger("chosen:updated")
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	}

	function fillTable(transactionArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < totalSubcampaignArray.length; i++) {
			var statusColor
			if (transactionArray[i].status === 'Open') statusColor = 'bg-green'
			else if (transactionArray[i].status === 'Checkout') statusColor = 'bg-light-blue'
			else if (transactionArray[i].status === 'Suspend') statusColor = 'bg-deep-orange'
			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].campaignHashId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].subcampaignHashId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(transactionArray[i].time) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].event + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + transactionArray[i].price + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + transactionArray[i].status + '</span></td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$("#transactionSearchButton").click(function (e) {
		e.preventDefault();
		var status = []
		var events = []
		var subcampaignFilter = []
		var beginningTime
		var endingTime

		if ($('#transactionStatus').val())
			status = $('#transactionStatus').val()

		if ($('#transactionEvent').val())
			events = $('#transactionEvent').val()

		if ($('#transactionSubcampaign').val())
			subcampaignFilter = $('#transactionSubcampaign').val()

		if ($('#transactionBeginningTime').val())
			beginningTime = timeConvertor($('#transactionBeginningTime').val())

		if ($('#transactionEndingTime').val())
			endingTime = timeConvertor($('#transactionEndingTime').val())

		var limit = $('#transactionLimit').val()

		var transactionURLWithAT = wrapAccessToken(coreEngine_url + 'statistics/getAllTransactions?accountHashId=' + userId + '&isAnnouncer=true', coreAccessToken)
		if (events.length > 0)
			transactionURLWithAT = wrapFilter(transactionURLWithAT, {
				'where': {
					'event': {
						inq: events
					}
				}
			})
		$.ajax({
			url: transactionURLWithAT,
			type: "GET",
			success: function (transactionResult) {
				var responseArray = []
				for (var i = 0; i < transactionResult.length; i++) {
					var time = transactionResult[i].time
					var stat = transactionResult[i].status
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

				var finalResult = []
				if (subcampaignFilter.length > 0) {
					for (var i = 0; i < responseArray.length; i++) {
						if (finalResult.length == limit)
							break
						if (subcampaignFilter.indexOf(responseArray[i].subcampaignHashId) >= 0)
							finalResult.push()
					}
				}

				fillTable(finalResult)
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