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
	var clientCampaignInstance;
	var editableCampaignId
	var newCampaignId

	var userId, serviceAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('serviceAccessToken'))
		serviceAccessToken = localStorage.getItem('serviceAccessToken')
	else
		window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('coreAccessToken'))
		coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		window.location.href = '../AAA/sign-in.html';

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
		for (var i = 0; i < clientCampaignInstance.campaigns.length; i++) {
			if (clientCampaignInstance.campaigns[i].name === selected) {
				editableCampaignId = clientCampaignInstance.campaigns[i].id
				$("#editCampaignName").val(clientCampaignInstance.campaigns[i].name)
				$("#editCampaignBudget").val(clientCampaignInstance.campaigns[i].budget)
				if (clientCampaignInstance.campaigns[i].status === 'Stopped')
					$("#editCampaignStatus").selectpicker('val', 'Stop')
				else
					$("#editCampaignStatus").selectpicker('val', 'Unstop')
				$("#editCampaignBeginningTime").val(fullDateConvertor(clientCampaignInstance.campaigns[i].beginningTime))
				$("#editCampaignEndingTime").val(fullDateConvertor(clientCampaignInstance.campaigns[i].endingTime))
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#myCampaigns").show();
			$("#editCampaign").hide();
			$("#newCampaign").hide();
		} else if ($(e.target).attr('id') === 'nav3') {
			if (localStorage.getItem('editableCampaignName')) {
				var campName = localStorage.getItem('editableCampaignName')
				$("#editCampaignSelect").selectpicker('val', campName).selectpicker('refresh')
				fillEditCampaignFields(campName);
				localStorage.removeItem('editableCampaignName')
			}
			$("#myCampaigns").hide();
			$("#editCampaign").show();
			$("#newCampaign").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			$("#myCampaigns").hide();
			$("#editCampaign").hide();
			$("#newCampaign").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#myCampaigns").show();
		$("#editCampaign").hide();
		$("#newCampaign").hide();
	}
	else if (window.location.hash === '#newCampaign')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#editCampaign')
		$('.nav-tabs a[id="nav3"]').tab('show');
	else if (window.location.hash === '#myCampaigns')
		$('.nav-tabs a[id="nav1"]').tab('show');

	$('#editCampaignSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillEditCampaignFields(selected)
	});

	function getAllCampaigns() {
		var accountURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId, serviceAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["announcerAccount", "campaigns"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				$('#editCampaignSelect').find('option').remove()
				clientCampaignInstance = accountResult
				for (var i = 0; i < accountResult.campaigns.length; i++) {
					$('#editCampaignSelect').append($('<option>', {
						value: accountResult.campaigns[i].id,
						text: accountResult.campaigns[i].name
					})).selectpicker('refresh');
				}
				$('#editCampaignSelect').trigger("chosen:updated")

				fillTable(accountResult.campaigns)

				$("#announcerUsername").html(localStorage.getItem('announcerCompanyName'));
				$("#announcerEmail").html(localStorage.getItem('announcerEmail'));

				$("#sharedBudget").html('Budget: $' + accountResult.announcerAccount.budget);
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
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + campaignsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + campaignsArray[i].mediaStyle + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + campaignsArray[i].startStyle + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + campaignsArray[i].budget + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(campaignsArray[i].beginningTime) + '<br>' + dateConvertor(campaignsArray[i].endingTime) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + campaignsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="campaignEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="subcampaignInfo m-l-5 m-r-5 btn bg-amber waves-effect"><i class="material-icons">details</i></button>' +
				'<button type="button" class="campaignDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".campaignEdit", function (e) {
		e.preventDefault();
		var campName = $(this).parent().siblings().eq(1).text()
		localStorage.setItem('editableCampaignName', campName)
		$('.nav-tabs a[id="nav3"]').tab('show');
	})

	$(document).on("click", ".subcampaignInfo", function (e) {
		e.preventDefault();
		var campName = $(this).parent().siblings().eq(1).text()
		localStorage.setItem('myCampaignSelectSubcampaign', campName)
		window.location.href = 'subcampaign.html'
	})

	$(document).on("click", ".campaignDelete", function (e) {
		e.preventDefault();
		var campId = $(this).parent().siblings().eq(0).text()
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
				var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns/' + campId, serviceAccessToken)
				$.ajax({
					url: subcampaignURLWithAT,
					type: "DELETE",
					success: function (subcampaignResult) {
						swal("Deleted!", "Your campaign successfuly has been deleted.", "success");
						getAllCampaigns()
					},
					error: function (xhr, status, error) {
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
			}
		});

	})

	$("#myCampaignsSearch").click(function (e) {
		e.preventDefault();
		var status = [],
			mediaStyle = [],
			startStyle = [],
			beginningTime, endingTime, limit
		if ($('#myCampaignsStatus').val())
			status = $('#myCampaignsStatus').val()
		if ($('#myCampaignsMediaStyle').val())
			mediaStyle = $('#myCampaignsMediaStyle').val()
		if ($('#myCampaignsStartStyle').val())
			startStyle = $('#myCampaignsStartStyle').val()

		if ($('#myCampaignsBeginningTime').val())
			beginningTime = timeConvertor($('#myCampaignsBeginningTime').val())

		if ($('#myCampaignsEndingTime').val())
			endingTime = timeConvertor($('#myCampaignsEndingTime').val())

		var limit = $('#myCampaignsLimit').val()

		var filter = {}
		if (status.length > 0 || mediaStyle.length > 0 || startStyle.length > 0 || beginningTime || endingTime) {
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

		var campURLwithAT = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns', serviceAccessToken)
		var campaignURL = wrapFilter(campURLwithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: campaignURL,
			type: "GET",
			success: function (campaignResult) {
				fillTable(campaignResult)
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	})

	$("#newCampaignsAddCampaign").click(function (e) {
		e.preventDefault();
		if (!$('#newCampaignName').val() || !$('#newCampaignBeginningTime').val() || !$('#newCampaignEndingTime').val() || !$('#newCampaignBudget').val() || !$('#newCampaignMediaStyle').find('option:selected').text() || !$('#newCampaignStartStyle').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#newCampaignName').val(),
			mediaStyle: $('#newCampaignMediaStyle').find('option:selected').text(),
			startStyle: $('#newCampaignStartStyle').find('option:selected').text(),
			beginningTime: fullTimeConvertor($('#newCampaignBeginningTime').val()),
			endingTime: fullTimeConvertor($('#newCampaignEndingTime').val()),
			budget: Number($('#newCampaignBudget').val())
		}
		var campaignURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns', serviceAccessToken);
		$.ajax({
			url: campaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (campaignResult) {
				getAllCampaigns()
				newCampaignId = campaignResult.id
				swal("Congrates!", "You have successfuly created a campaign. Lets go for adding subcamapigns.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#newCampaignsAddSubcampaign").click(function (e) {
		e.preventDefault();
		if (!newCampaignId)
			return swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
		localStorage.setItem('newCreatedCampaign', newCampaignId)
		window.location.href = 'subcampaign.html#addSubcampaign'
	})

	$("#editCampaignsSave").click(function (e) {
		e.preventDefault();
		var campaignName = $('#editCampaignSelect').find('option:selected').text()
		var campaignId
		for (var i = 0; clientCampaignInstance.campaigns.length; i++)
			if (clientCampaignInstance.campaigns[i].name === campaignName)
				campaignId = clientCampaignInstance.campaigns[i].id
		if (!campaignName || !campaignId || !$('#editCampaignName').val() || !$('#editCampaignBeginningTime').val() || !$('#editCampaignEndingTime').val() || !$('#editCampaignBudget').val() || !$('#editCampaignStatus').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#editCampaignName').val(),
			beginningTime: fullTimeConvertor($('#editCampaignBeginningTime').val()),
			endingTime: fullTimeConvertor($('#editCampaignEndingTime').val()),
			budget: Number($('#editCampaignBudget').val())
		}
		if ($('#editCampaignStatus').find('option:selected').text() === 'Stoped' || $('#editCampaignStatus').find('option:selected').text() === 'Unstoped')
			data.status = $('#editCampaignStatus').find('option:selected').text()
		var campaignURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns/' + campaignId, serviceAccessToken);
		$.ajax({
			url: campaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (coreResult) {
				getAllCampaigns()
				swal("Congrates!", "You have successfuly edited a campaign.", "success");
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
		window.location.href = '../AAA/sign-in.html'
	})

});