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

function fullTimeConvertor(myDate) {
	var parts = myDate.split(" ")
	var doublePart = parts[5].split(":")
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return Math.floor((new Date(parseInt(parts[3]), months.indexOf(parts[2]), parseInt(parts[1]), parseInt(doublePart[0]), parseInt(doublePart[1]))).getTime())
}

function dateConvertor(myDate) {
	var d = new Date(myDate)
	var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return ('' + weekday[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear())
}

function fullDateConvertor(myDate) {
	var d = new Date(myDate)
	var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	return ('' + weekday[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' - ' + d.getHours() + ':' + d.getMinutes())
}

var announcer_url = "http://127.0.0.1:3000/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clients = []
	var campaigns = []
	var editableCampaignId
	var newCampaignId

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

	getAllCampaigns();
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

	function fillEditCampaignFields(selected) {
		for (var i = 0; i < campaigns.length; i++) {
			if (campaigns[i].name === selected) {
				editableCampaignId = campaigns[i].id
				$("#editCampaignName").val(campaigns[i].name)
				$("#editCampaignBudget").val(campaigns[i].budget)
				if (campaigns[i].status === 'Stopped')
					$("#editCampaignStatus").selectpicker('val', 'Stop')
				else
					$("#editCampaignStatus").selectpicker('val', 'Unstop')
				$("#editCampaignBeginningTime").val(fullDateConvertor(campaigns[i].beginningTime))
				$("#editCampaignEndingTime").val(fullDateConvertor(campaigns[i].endingTime))
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#myCampaigns").show();
			$("#editCampaign").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			if (localStorage.getItem('editableCampaignName')) {
				var campName = localStorage.getItem('editableCampaignName')
				$("#editCampaignSelect").selectpicker('val', campName).selectpicker('refresh')
				fillEditCampaignFields(campName);
				localStorage.removeItem('editableCampaignName')
			}
			$("#myCampaigns").hide();
			$("#editCampaign").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#myCampaigns").show();
		$("#editCampaign").hide();
	} else if (window.location.hash === '#editCampaign')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#myCampaigns')
		$('.nav-tabs a[id="nav1"]').tab('show');

	$('#editCampaignSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillEditCampaignFields(selected)
	});

	function getAllCampaigns() {
		var accountURLWithAT = wrapAccessToken(announcer_url + 'clients', announcerAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["campaigns"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				clients = []
				campaigns = []
				$('#editCampaignSelect').find('option').remove()
				$('#myCampaignsClients').find('option').remove()
				clientCampaignInstance = accountResult
				for (var j = 0; j < accountResult.length; j++) {
					for (var i = 0; i < accountResult[j].campaigns.length; i++) {
						campaigns.push(accountResult[j].campaigns[i])
						$('#editCampaignSelect').append($('<option>', {
							value: accountResult[j].campaigns[i].id,
							text: accountResult[j].campaigns[i].name
						})).selectpicker('refresh');
					}
					clients.push(accountResult[j])
					$('#myCampaignsClients').append($('<option>', {
						value: accountResult[j].id,
						text: accountResult[j].username
					})).selectpicker('refresh');					
				}
				$('#editCampaignSelect').trigger("chosen:updated")
				$('#myCampaignsClients').trigger("chosen:updated")

				fillTable(campaigns)

				$("#adminUsername").html(localStorage.getItem('AdminCompanyName'));
				$("#adminEmail").html(localStorage.getItem('adminEmail'));

				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	}

	function fillTable(campaignsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < campaignsArray.length; i++) {
			var statusColor
			if (campaignsArray[i].status === 'Pending') statusColor = 'bg-orange'
			else if (campaignsArray[i].status === 'Suspend') statusColor = 'bg-red'
			else if (campaignsArray[i].status === 'Approved') statusColor = 'bg-green'
			else if (campaignsArray[i].status === 'Created') statusColor = 'bg-grey'
			else if (campaignsArray[i].status === 'Finished') statusColor = 'bg-indigo'
			else if (campaignsArray[i].status === 'Started') statusColor = 'bg-blue'
			else if (campaignsArray[i].status === 'Stopped') statusColor = 'bg-deep-orange'
			else if (campaignsArray[i].status === 'UnStopped') statusColor = 'bg-teal'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + campaignsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + campaignsArray[i].clientId + '</td>' +				
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + campaignsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + campaignsArray[i].mediaStyle + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + campaignsArray[i].startStyle + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + campaignsArray[i].budget + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(campaignsArray[i].beginningTime) + '<br>' + dateConvertor(campaignsArray[i].endingTime) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + campaignsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="campaignEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="campaignDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".campaignEdit", function (e) {
		e.preventDefault();
		var campName = $(this).parent().siblings().eq(2).text()
		localStorage.setItem('editableCampaignName', campName)
		$('.nav-tabs a[id="nav2"]').tab('show');
	})

	$(document).on("click", ".campaignDelete", function (e) {
		e.preventDefault();
		NProgress.start();
		var campId = $(this).parent().siblings().eq(0).text()
		var userId = $(this).parent().siblings().eq(1).text()
		swal({
			title: "Are You Sure?",
			text: "You won't be able to recover the campaign after removing it.",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "No, Cancel!",
			closeOnConfirm: false,
			closeOnCancel: true
		}, function (isConfirm) {
			if (isConfirm) {
				var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns/' + campId, announcerAccessToken)
				$.ajax({
					url: subcampaignURLWithAT,
					type: "DELETE",
					success: function (subcampaignResult) {
						swal("Deleted!", "Your campaign successfuly has been deleted.", "success");
						getAllCampaigns()
						NProgress.done();
					},
					error: function (xhr, status, error) {
						NProgress.done();
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
			} else
				NProgress.done();
		});

	})

	$("#myCampaignsSearch").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var status = [],
			mediaStyle = [],
			startStyle = [],
			clients = [],
			beginningTime, endingTime, limit
		if ($('#myCampaignsStatus').val())
			status = $('#myCampaignsStatus').val()
		if ($('#myCampaignsMediaStyle').val())
			mediaStyle = $('#myCampaignsMediaStyle').val()
		if ($('#myCampaignsStartStyle').val())
			startStyle = $('#myCampaignsStartStyle').val()
		if ($('#myCampaignsClients').val())
			clients = $('#myCampaignsClients').val()

		if ($('#myCampaignsBeginningTime').val())
			beginningTime = timeConvertor($('#myCampaignsBeginningTime').val())

		if ($('#myCampaignsEndingTime').val())
			endingTime = timeConvertor($('#myCampaignsEndingTime').val())

		var limit = $('#myCampaignsLimit').val()

		var filter = {}
		if (status.length > 0 || mediaStyle.length > 0 || startStyle.length > 0 || clients.length > 0 || beginningTime || endingTime) {
			filter.where = {}
			filter.where.and = []
			if (status.length > 0)
				filter.where.and.push({
					'status': {
						'inq': status
					}
				})
			if (mediaStyle.length > 0)
				filter.where.and.push({
					'mediaStyle': {
						'inq': mediaStyle
					}
				})
			if (startStyle.length > 0)
				filter.where.and.push({
					'startStyle': {
						'inq': startStyle
					}
				})
			if (clients.length > 0)
				filter.where.and.push({
					'clientId': {
						'inq': clients
					}
				})
			if (beginningTime)
				filter.where.and.push({
					'beginningTime': {
						'gte': beginningTime
					}
				})
			if (endingTime)
				filter.where.and.push({
					'endingTime': {
						'lte': endingTime
					}
				})
		}
		filter.limit = limit

		var campURLwithAT = wrapAccessToken(announcer_url + 'campaigns', announcerAccessToken)
		var campaignURL = wrapFilter(campURLwithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: campaignURL,
			type: "GET",
			success: function (campaignResult) {
				fillTable(campaignResult)
				NProgress.done();
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				NProgress.done();
				alert(xhr.responseText);
			}
		});
	})

	$("#editCampaignsSave").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var campaignName = $('#editCampaignSelect').find('option:selected').text()
		var campaignId, userId
		for (var i = 0; i < campaigns.length; i++)
			if (campaigns[i].name === campaignName){
				campaignId = campaigns[i].id
				userId = campaigns[i].clientId
			}
		if (!campaignName || !campaignId || !$('#editCampaignName').val() || !$('#editCampaignBeginningTime').val() || !$('#editCampaignEndingTime').val() || !$('#editCampaignBudget').val() || !$('#editCampaignStatus').find('option:selected').text()) {
			NProgress.done();
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		}
		var data = {
			name: $('#editCampaignName').val(),
			beginningTime: fullTimeConvertor($('#editCampaignBeginningTime').val()),
			endingTime: fullTimeConvertor($('#editCampaignEndingTime').val()),
			budget: Number($('#editCampaignBudget').val())
		}
		if ($('#editCampaignStatus').find('option:selected').text() === 'Stoped' || $('#editCampaignStatus').find('option:selected').text() === 'Unstoped')
			data.status = $('#editCampaignStatus').find('option:selected').text()
		var campaignURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns/' + campaignId, announcerAccessToken);
		$.ajax({
			url: campaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (coreResult) {
				getAllCampaigns()
				NProgress.done();
				swal("Congrates!", "You have successfuly edited a campaign.", "success");
			},
			error: function (xhr, status, error) {
				NProgress.done();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
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