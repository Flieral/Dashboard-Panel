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
var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clients = [];
	var campaings = [];
	var subcampaigns = [];
	var applications = [];
	var placements = [];
	var statisticsArray = []

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
							var getAllTransactions_url = coreEngine_url + "statistics?access_token=" + coreAccessToken;
							ajaxHelper(getAllTransactions_url, null, "GET", function (err, resultAll) {
								if (err) {
									$('.page-loader-wrapper').fadeOut();
									return alert(err);
								}
								$('#statisticsInformationAnnouncer').find('option').remove()
								$('#statisticsInformationPublisher').find('option').remove()
								for (var i = 0; i < result_Clients.length; i++) {
									var itemToPush = {
										id: result_Clients[i].id,
										name: result_Clients[i].username
									};
									$('#statisticsInformationAnnouncer').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									$('#statisticsInformationPublisher').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									clients.push(itemToPush);
								}
								$('#statisticsInformationCampaign').find('option').remove();
								for (var i = 0; i < result_Campaigns.length; i++) {
									var itemToPush = {
										id: result_Campaigns[i].id,
										name: result_Campaigns[i].name
									};
									$('#statisticsInformationCampaign').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									campaings.push(itemToPush);
								}
								$('#statisticsInformationSubcampaign').find('option').remove();
								for (var i = 0; i < result_Subcampaigns.length; i++) {
									var itemToPush = {
										id: result_Subcampaigns[i].id,
										name: result_Subcampaigns[i].name
									};
									$('#statisticsInformationSubcampaign').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									subcampaigns.push(itemToPush);
								}
								$('#statisticsInformationApplication').find('option').remove();
								for (var i = 0; i < result_Applications.length; i++) {
									var itemToPush = {
										id: result_Applications[i].id,
										name: result_Applications[i].name
									};
									$('#statisticsInformationApplication').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									applications.push(itemToPush);
								}
								$('#statisticsInformationPlacement').find('option').remove();
								for (var i = 0; i < result_Placements.length; i++) {
									var itemToPush = {
										id: result_Placements[i].id,
										name: result_Placements[i].name
									};
									$('#statisticsInformationPlacement').append($('<option>', {
										value: itemToPush.id,
										text: itemToPush.id
									})).selectpicker('refresh');
									placements.push(itemToPush);
								}

								statisticsArray = resultAll
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

	function fillTable(statisticsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < statisticsArray.length; i++) {
			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + statisticsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + statisticsArray[i].announcerInfo.announcerHashId + '</br>' + statisticsArray[i].announcerInfo.campaignHashId + '</br>' + statisticsArray[i].announcerInfo.subcampaignHashId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + statisticsArray[i].publisherInfo.publisherHashId + '</br>' + statisticsArray[i].publisherInfo.applicationHashId + '</br>' + statisticsArray[i].publisherInfo.placementHashId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(statisticsArray[i].actionInfo.time) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + statisticsArray[i].actionInfo.event + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="userInfo m-l-5 m-r-5 btn bg-amber waves-effect"><i class="material-icons">details</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".userInfo", function (e) {
		e.preventDefault();
		var statId = $(this).parent().siblings().eq(0).text()
		var model
		for (var i = 0; i < statisticsArray.length; i++)
			if (statisticsArray[i].id === statId)
				model = statisticsArray[i]
		$('#myInfoID').val(model.userInfo.userId);
		$('#myInfoOS').val(model.userInfo.os);
		$('#myInfoCountry').val(model.userInfo.country);
		$('#myInfoLanguage').val(model.userInfo.language);
		$('#myInfoDevice').val(model.userInfo.device);
		$('#myInfoUserLabel').val(model.userInfo.userLabel);
		$('#myInfoConnection').val(model.userInfo.connection);

		$('#defaultModal .modal-content').removeAttr('class').addClass('modal-content');
		$('#defaultModal').modal('show');
	})

	$("#statisticsInformationSearchButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var events = []
		var beginningTime
		var endingTime

		var announcerFilter = [];
		var campaignFilter = [];
		var subcampaignFilter = [];
		var publisherFilter = [];
		var applicationFilter = [];
		var placementFilter = [];

		if ($('#statisticsInformationEvent').val())
			events = $('#statisticsInformationEvent').val()

		var limit = $('#statisticsInformationLimit').val()

		if ($('#statisticsInformationBeginningTime').val())
			beginningTime = timeConvertor($('#statisticsInformationBeginningTime').val())

		if ($('#statisticsInformationEndingTime').val())
			endingTime = timeConvertor($('#statisticsInformationEndingTime').val())

		if ($('#statisticsInformationAnnouncer').val())
			announcerFilter = $('#statisticsInformationAnnouncer').val()

		if ($('#statisticsInformationCampaign').val())
			campaignFilter = $('#statisticsInformationCampaign').val()

		if ($('#statisticsInformationSubcampaign').val())
			subcampaignFilter = $('#statisticsInformationSubcampaign').val()

		if ($('#statisticsInformationPublisher').val())
			publisherFilter = $('#statisticsInformationPublisher').val()

		if ($('#statisticsInformationApplication').val())
			applicationFilter = $('#statisticsInformationApplication').val()

		if ($('#statisticsInformationPlacement').val())
			placementFilter = $('#statisticsInformationPlacement').val()

		var statisticsURLWithAT = wrapAccessToken(coreEngine_url + 'statistics', coreAccessToken)
		if (events.length > 0)
			statisticsURLWithAT = wrapFilter(statisticsURLWithAT, {
				'where': {
					'actionInfo.event': {
						inq: events
					}
				}
			})
		$.ajax({
			url: transactionURLWithAT,
			type: "GET",
			success: function (statisticsResult) {
				var responseArray = []
				for (var i = 0; i < statisticsResult.length; i++) {
					var time = statisticsResult[i].actionInfo.time
						if (beginningTime && endingTime) {
							if (time >= beginningTime && time <= endingTime)
								responseArray.push(statisticsResult[i])
						} else if (beginningTime) {
							if (time >= beginningTime)
								responseArray.push(statisticsResult[i])
						} else if (endingTime) {
							if (time <= endingTime)
								responseArray.push(statisticsResult[i])
						} else
							responseArray.push(statisticsResult[i])
				}

				if (responseArray.length > 0 && announcerFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (announcerFilter.indexOf(responseArray[i].announcerInfo.announcerHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && campaignFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (campaignFilter.indexOf(responseArray[i].announcerInfo.campaignHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && subcampaignFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (subcampaignFilter.indexOf(responseArray[i].announcerInfo.subcampaignHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && publisherFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (publisherFilter.indexOf(responseArray[i].publisherInfo.publisherHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && applicationFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (applicationFilter.indexOf(responseArray[i].publisherInfo.applicationHashId) >= 0)
							innerResult.push(responseArray[i])
					responseArray = innerResult
				}

				if (responseArray.length > 0 && placementFilter.length > 0) {
					var innerResult = []
					for (var i = 0; i < responseArray.length; i++)
						if (placementFilter.indexOf(responseArray[i].publisherInfo.placementHashId) >= 0)
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