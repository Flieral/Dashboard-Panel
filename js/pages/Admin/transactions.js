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
	var clients = [];
	var campaings = [];
	var subcampaigns = [];
	var applications = [];
	var placements = [];

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
			var getCampaign_url = announcer_url + "campaigns?access_token=" + announcerAccessToken;
			ajaxHelper(getCampaign_url, null, "GET", function (err, result_Campaigns) {
				if (err) {
					$('.page-loader-wrapper').fadeOut();
					return alert(err);
				}
				var getSubcampaign_url = announcer_url + "subcampaigns?access_token=" + announcerAccessToken;
				ajaxHelper(getSubcampaign_url, null, "GET", function (err, result_Subcampaigns) {
					if (err) {
						$('.page-loader-wrapper').fadeOut();
						return alert(err);
					}
					var getApplications_url = publisher_url + "applications?access_token=" + publisherAccessToken;
					ajaxHelper(getApplications_url, null, "GET", function (err, result_Applications) {
						if (err) {
							$('.page-loader-wrapper').fadeOut();
							return alert(err);
						}
						var getPlacements_url = publisher_url + "placements?access_token=" + publisherAccessToken;
						ajaxHelper(getPlacements_url, null, "GET", function (err, result_Placements) {
							if (err) {
								$('.page-loader-wrapper').fadeOut();
								return alert(err);
							}
							var getAllTransactions_url = coreEngine_url + "transactions?access_token=" + coreAccessToken;
							ajaxHelper(getAllTransactions_url, null, "GET", function (err, resultAll) {
								if (err) {
									$('.page-loader-wrapper').fadeOut();
									return alert(err);
								}
								$('#transactionAnnouncer').find('option').remove()
								$('#transactionPublisher').find('option').remove()
								for (var i = 0; i < result_Clients.length; i++) {
									var itemToPush = {
										id: result_Clients[i].id,
										name: result_Clients[i].username
									};
									$('#transactionAnnouncer').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									$('#transactionPublisher').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									clients.push(itemToPush);
								}
								$('#transactionCampaign').find('option').remove();
								for (var i = 0; i < result_Campaigns.length; i++) {
									var itemToPush = {
										id: result_Campaigns[i].id,
										name: result_Campaigns[i].name
									};
									$('#transactionCampaign').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									campaings.push(itemToPush);
								}
								$('#transactionSubcampaign').find('option').remove();
								for (var i = 0; i < result_Subcampaigns.length; i++) {
									var itemToPush = {
										id: result_Subcampaigns[i].id,
										name: result_Subcampaigns[i].name
									};
									$('#transactionSubcampaign').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									subcampaigns.push(itemToPush);
								}
								$('#transactionApplication').find('option').remove();
								for (var i = 0; i < result_Applications.length; i++) {
									var itemToPush = {
										id: result_Applications[i].id,
										name: result_Applications[i].name
									};
									$('#transactionApplication').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									applications.push(itemToPush);
								}
								$('#transactionPlacement').find('option').remove();
								for (var i = 0; i < result_Placements.length; i++) {
									var itemToPush = {
										id: result_Placements[i].id,
										name: result_Placements[i].name
									};
									$('#transactionPlacement').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									placements.push(itemToPush);
								}

								fillTable(resultAll);

								$("#adminUsername").html(localStorage.getItem('AdminCompanyName'));
								$("#adminEmail").html(localStorage.getItem('adminEmail'));

								$('.page-loader-wrapper').fadeOut();
							})
						})
					})
				})
			})
		})
	}

	function fillTable(transactionArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < transactionArray.length; i++) {
			var statusColor
			if (transactionArray[i].status === 'Open') statusColor = 'bg-green'
			else if (transactionArray[i].status === 'Checkout') statusColor = 'bg-light-blue'
			else if (transactionArray[i].status === 'Suspend') statusColor = 'bg-deep-orange'
			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].announcerHashId + '</br>' + transactionArray[i].campaignHashId + '</br>' + transactionArray[i].subcampaignHashId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + transactionArray[i].publisherHashId + '</br>' + transactionArray[i].applicationHashId + '</br>' + transactionArray[i].placementHashId + '</td>' +
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
		NProgress.start();
		var status = []
		var events = []
		var beginningTime
		var endingTime

		var announcerFilter = [];
		var campaignFilter = [];
		var subcampaignFilter = [];
		var publisherFilter = [];
		var applicationFilter = [];
		var placementFilter = [];

		if ($('#transactionStatus').val())
			status = $('#transactionStatus').val()

		if ($('#transactionEvent').val())
			events = $('#transactionEvent').val()

		var limit = $('#transactionLimit').val()

		if ($('#transactionBeginningTime').val())
			beginningTime = timeConvertor($('#transactionBeginningTime').val())

		if ($('#transactionEndingTime').val())
			endingTime = timeConvertor($('#transactionEndingTime').val())

		if ($('#transactionAnnouncer').val())
			announcerFilter = $('#transactionAnnouncer').val()

		if ($('#transactionCampaign').val())
			campaignFilter = $('#transactionCampaign').val()

		if ($('#transactionSubcampaign').val())
			subcampaignFilter = $('#transactionSubcampaign').val()

		if ($('#transactionPublisher').val())
			publisherFilter = $('#transactionPublisher').val()

		if ($('#transactionApplication').val())
			applicationFilter = $('#transactionApplication').val()

		if ($('#transactionPlacement').val())
			placementFilter = $('#transactionPlacement').val()

		var transactionURLWithAT = wrapAccessToken(coreEngine_url + 'transactions', coreAccessToken)
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
									responseArray.push(transactionResult[i])
							} else if (beginningTime) {
								if (time >= beginningTime)
									responseArray.push(transactionResult[i])
							} else if (endingTime) {
								if (time <= endingTime)
									responseArray.push(transactionResult[i])
							} else
								responseArray.push(transactionResult[i])
						}
					} else {
						if (beginningTime && endingTime) {
							if (time >= beginningTime && time <= endingTime)
								responseArray.push(transactionResult[i])
						} else if (beginningTime) {
							if (time >= beginningTime)
								responseArray.push(transactionResult[i])
						} else if (endingTime) {
							if (time <= endingTime)
								responseArray.push(transactionResult[i])
						} else
							responseArray.push(transactionResult[i])
					}
				}

				if (responseArray.length > 0 && announcerFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (announcerFilter.indexOf(responseArray[i].announcerHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && campaignFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (campaignFilter.indexOf(responseArray[i].campaignHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && subcampaignFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (subcampaignFilter.indexOf(responseArray[i].subcampaignHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && publisherFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (publisherFilter.indexOf(responseArray[i].publisherHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && applicationFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (applicationFilter.indexOf(responseArray[i].applicationHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && placementFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (placementFilter.indexOf(responseArray[i].placementHashId) >= 0)
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