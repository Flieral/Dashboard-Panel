function showNotification(colorName, text, placementFrom, placementAlign, animateEnter, animateExit) {
	if (colorName === null || colorName === '') { colorName = 'bg-black'; }
	if (text === null || text === '') { text = 'Turning standard Bootstrap alerts'; }
	if (animateEnter === null || animateEnter === '') { animateEnter = 'animated fadeInDown'; }
	if (animateExit === null || animateExit === '') { animateExit = 'animated fadeOutUp'; }
	var allowDismiss = true;

	$.notify({
		message: text
	},
		{
			type: colorName,
			allow_dismiss: allowDismiss,
			newest_on_top: true,
			timer: 1000,
			placement: {
				from: placementFrom,
				align: placementAlign
			},
			animate: {
				enter: animateEnter,
				exit: animateExit
			},
			template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
			'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
			'<span data-notify="icon"></span> ' +
			'<span data-notify="title">{1}</span> ' +
			'<span data-notify="message">{2}</span>' +
			'<div class="progress" data-notify="progressbar">' +
			'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
			'</div>' +
			'<a href="{3}" target="{4}" data-notify="url"></a>' +
			'</div>'
		});
}

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

function generateQueryString(data) {
    var ret = []
    for (var d in data)
      if (data[d])
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]))
    return ret.join("&")
}

var announcer_url = "http://127.0.0.1:3000/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clientInstance;
	var fullCampaignResult
	var campaignsArray = []
	var totalSubcampaignsArray = []
	var editableSubcampaignId
	var editableSettingId
	var prefredSubcampaign

	var userId, serviceAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';
	if (localStorage.getItem('serviceAccessToken'))
		serviceAccessToken = localStorage.getItem('serviceAccessToken')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';
	if (localStorage.getItem('coreAccessToken'))
		coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';

	getAccountModel();
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

	function fillEditSubcampaignFields(selected) {
		for (var i = 0; i < totalSubcampaignsArray.length; i++) {
			if (totalSubcampaignsArray[i].name === selected) {
				editableSubcampaignId = totalSubcampaignsArray[i].id
				$("#editSubcampaignName").val(totalSubcampaignsArray[i].name)
				$("#editSubcampaignStyle").selectpicker('val', totalSubcampaignsArray[i].style)
				$("#editSubcampaignMinBudget").val(totalSubcampaignsArray[i].minBudget)
				$("#editSubcampaignPlan").selectpicker('val', totalSubcampaignsArray[i].plan)
				$("#editSubcampaignPrice").val(totalSubcampaignsArray[i].price)
				break
			}
		}
	}

	function fillSettingSubcampaignFields(selected) {
		for (var i = 0; i < totalSubcampaignsArray.length; i++) {
			if (totalSubcampaignsArray[i].name === selected) {
				editableSettingId = totalSubcampaignsArray[i].id
				$("#selectSettingPriority").selectpicker('val', totalSubcampaignsArray[i].settingModel.priority)
				$("#selectSettingUserLabel").selectpicker('val', totalSubcampaignsArray[i].settingModel.userLabel)
				$("#selectSettingDevice").selectpicker('val', totalSubcampaignsArray[i].settingModel.device)
				$("#selectSettingCategory").selectpicker('val', totalSubcampaignsArray[i].settingModel.category)
				$("#selectSettingCountry").selectpicker('val', totalSubcampaignsArray[i].settingModel.country)
				$("#selectSettingLanguage").selectpicker('val', totalSubcampaignsArray[i].settingModel.language)
				$("#selectSettingOS").selectpicker('val', totalSubcampaignsArray[i].settingModel.os)
				$("#selectSettingConnection").selectpicker('val', totalSubcampaignsArray[i].settingModel.connection)
				break
			}
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		if($(e.target).attr('id') === 'nav1' || window.location.hash === '#mySubcampaigns') {
			$("#mySubcampaigns").show();
			$("#editSubcampaign").hide();
			$("#addSubcampaign").hide();
			$("#contentProviding").hide();
			$("#selectSetting").hide();
		} else if($(e.target).attr('id') === 'nav3' || window.location.hash === '#editSubcampaign') {
			if(localStorage.getItem('editableSubcampaignName')) {
				var subcampName = localStorage.getItem('editableSubcampaignName')
				$("#editSubcampaignSelect").selectpicker('val', subcampName)
				fillEditSubcampaignFields(subcampName);
				$("#selectSettingSelect").selectpicker('val', subcampName)
				fillSettingSubcampaignFields(subcampName);
			}
			$("#mySubcampaigns").hide();
			$("#selectSetting").show();
			$("#contentProviding").hide();
			$("#editSubcampaign").show();
			$("#addSubcampaign").hide();
		} else if($(e.target).attr('id') === 'nav2' || window.localStorage.hash === '#addSubcampaign') {
			if(localStorage.getItem('newCreatedCampaign')) {
				var campName = localStorage.getItem('newCreatedCampaign')
				$("#addSubcampaignSelectCampaign").selectpicker('val', campName)
				localStorage.removeItem("newCreatedCampaign")
			}
			$("#mySubcampaigns").hide();
			$("#editSubcampaign").hide();
			$("#addSubcampaign").show();
			$("#contentProviding").show();
			$("#selectSetting").show();
		}
	});

	$("#mySubcampaigns").show();
	$("#editSubcampaign").hide();
	$("#addSubcampaign").hide();
	$("#contentProviding").hide();
	$("#selectSetting").hide();

	$('#editSubcampaignSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillEditSubcampaignFields(selected)
	});

	$('#selectSettingSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillSettingSubcampaignFields(selected)
	});

	function getAccountModel() {
		var accountURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId, serviceAccessToken)
		var accountURL = wrapFilter(accountURLWithAT,'{"include":["announcerAccount", "campaigns"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				clientInstance = accountResult
				var campaignURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns', serviceAccessToken)
				var campaignURL = wrapFilter(campaignURLWithAT,'{"include":["subcampaigns"]}')
				$.ajax({
					url: campaignURL,
					type: "GET",
					success: function (campaignResult) {
						fullCampaignResult = campaignResult
						$('#addSubcampaignSelectCampaign').find('option').remove()
						$('#mySubcampaignSelectCampaign').find('option').remove()
						$('#selectSettingSelect').find('option').remove()
						$('#contentProvidingSelect').find('option').remove()
						$('#editSubcampaignSelect').find('option').remove()
						for (var i = 0; i < accountResult.campaigns.length; i++) {
							$('#addSubcampaignSelectCampaign').append($('<option>', {
								value: accountResult.campaigns[i].id,
								text: accountResult.campaigns[i].name
							})).selectpicker('refresh');
							$('#mySubcampaignSelectCampaign').append($('<option>', {
								value: accountResult.campaigns[i].id,
								text: accountResult.campaigns[i].name
							})).selectpicker('refresh');
						}
						$('#addSubcampaignSelectCampaign').trigger("chosen:updated")
						$('#mySubcampaignSelectCampaign').trigger("chosen:updated")

						for (var i = 0; i < campaignResult.length; i++) {
							var group = $('<optgroup label=' + campaignResult[i].name + '/>');
							for (j = 0; j < campaignResult[i].subcampaigns.length; j++) {
								$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
								totalSubcampaignsArray.push(campaignResult[i].subcampaigns[j])
							}
							group.appendTo('#editSubcampaignSelect');
							$('#editSubcampaignSelect').selectpicker('refresh');
						}
						for (var i = 0; i < campaignResult.length; i++) {
							var group = $('<optgroup label=' + campaignResult[i].name + '/>');
							for (j = 0; j < campaignResult[i].subcampaigns.length; j++) {
								$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
							}
							group.appendTo('#selectSettingSelect');
							$('#selectSettingSelect').selectpicker('refresh');
						}
						for (var i = 0; i < campaignResult.length; i++) {
							var group = $('<optgroup label=' + campaignResult[i].name + '/>');
							for (j = 0; j < campaignResult[i].subcampaigns.length; j++) {
								$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
							}
							group.appendTo('#contentProvidingSelect');
							$('#contentProvidingSelect').selectpicker('refresh');
						}

						$('#editSubcampaignSelect').trigger("chosen:updated")
						$('#selectSettingSelect').trigger("chosen:updated")
						$('#contentProvidingSelect').trigger("chosen:updated")

						fillTable(totalSubcampaignsArray)
					},
					error: function(xhr, status, error) {
						$('.page-loader-wrapper').fadeOut();
						alert(xhr.responseText);
					}
				});
				$("#announcerUsername").html(localStorage.getItem('announcerCompanyName'));
				$("#announcerEmail").html(localStorage.getItem('announcerEmail'));

				$("#sharedBudget").html('Budget: $' + accountResult.announcerAccount.budget);
				$('.page-loader-wrapper').fadeOut();
			},
			error: function(xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	}

	function fillTable(subcampaignsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < subcampaignsArray.length; i++) {
			var statusColor
			if (subcampaignsArray[i].status === 'Pending') statusColor = 'bg-orange'
			else if (subcampaignsArray[i].status === 'Suspend') statusColor = 'bg-red'
			else if (subcampaignsArray[i].status === 'Approved')statusColor = 'bg-green'
			else if (subcampaignsArray[i].status === 'Created')statusColor = 'bg-grey'
			else if (subcampaignsArray[i].status === 'Finished')statusColor = 'bg-indigo'
			else if (subcampaignsArray[i].status === 'Started')statusColor = 'bg-blue'
			else if (subcampaignsArray[i].status === 'Stopped')statusColor = 'bg-deep-orange'
			else if (subcampaignsArray[i].status === 'UnStopped')statusColor = 'bg-teal'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].campaignId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + subcampaignsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].style + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + subcampaignsArray[i].minBudget + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].plan + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + subcampaignsArray[i].price + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 '+ statusColor + '">' + subcampaignsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' + 
					'<button type="button" id="subcampaignEdit" class="m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' + 
					'<button type="button" id="subcampaignDelete" class="m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$("#subcampaignEdit").click(function (e) {
		//fix
        e.preventDefault();
		var campId, subcampId
	})

	$("#subcampaignDelete").click(function (e) {
		//fix
        e.preventDefault();
		var campId, subcampId
	})

    $("#mySubcampaignsSearch").click(function (e) {
        e.preventDefault();
		var status = [], style = [], plan = [], campaign = [], limit
		if ($('#mySubcampaignSelectCampaign').val())
			campaign = $('#mySubcampaignSelectCampaign').val()
		if ($('#mySubcampaignStatus').val())
			status = $('#mySubcampaignStatus').val()
		if ($('#mySubcampaignStyle').val())
			style = $('#mySubcampaignStyle').val()
		if ($('#mySubcampaignPlan').val())
			plan = $('#mySubcampaignPlan').val()

		var limit = $('#mySubcampaignLimit').val()

		var filter = {}
		if (status.length > 0 || style.length > 0 || plan.length > 0 || campaign.length > 0) {
			filter.where = {}
			filter.where.and = []
			if (status.length > 0)
				filter.where.and.push({'status': { 'inq': status }})
			if (style.length > 0)
				filter.where.and.push({'style': { 'inq': style }})
			if (plan.length > 0)
				filter.where.and.push({'plan': { 'inq': plan }})
			if (campaign.length > 0)
				filter.where.and.push({'campaignId': { 'inq': campaign }})
		}
		filter.limit = limit
		filter.fields = {'settingModel': false}
		
		var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'subcampaigns/getAllSubcampaigns?accountHashId=' + userId, serviceAccessToken)
		var subcampaignFilterURL = wrapFilter(subcampaignURLWithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: subcampaignFilterURL,
			type: "GET",
			success: function (subcampaignResult) {
				fillTable(subcampaignResult)
				$('.page-loader-wrapper').fadeOut();
			},
			error: function(xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	})

	$("#editSubcamapignButton").click(function (e) {
        e.preventDefault();
		var subcampaignId = $('editSubcampaignSelect').val()
		var campaignId
		for (var i = 0; i < totalSubcampaignsArray.length; i++)
			if (totalSubcampaignsArray[i].id === subcampaignId)
				campaignId = totalSubcampaignsArray[i].campaignId
		var data = {
			name : $('#editSubcampaignName').val(),
			minBudget : $('#editSubcampaignMinBudget').val(),
			style : $('#editSubcampaignStyle').find('option:selected').text(),
			plan : $('#editSubcampaignPlan').find('option:selected').text(),
			price : $('#editSubcampaignPrice').val()
		}
		$('.page-loader-wrapper').fadeIn();
		var subcampaignURL = wrapAccessToken(announcer_url + 'campaigns/' + campaignId + '/subcampaigns/' + subcampaignId, serviceAccessToken);
		$.ajax({
			url: settingURL,
			data: data,
			type: "PUT",
			success: function (subcampaignResult) {
				getAccountModel()
				$('.page-loader-wrapper').fadeOut();
				swal("Congrates!", "You have successfuly edited a subcampaign.", "success");
			},
			error: function(xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#addSubcamapignButton").click(function (e) {
        e.preventDefault();
		var campaignId = $('addSubcampaignSelectCampaign').val()
		var data = {
			name : $('#addSubcampaignName').val(),
			minBudget : $('#addSubcampaignMinBudget').val(),
			style : $('#addSubcampaignStyle').find('option:selected').text(),
			plan : $('#addSubcampaignPlan').find('option:selected').text(),
			price : $('#addSubcampaignPrice').val()
		}
		$('.page-loader-wrapper').fadeIn();
		var subcampaignURL = wrapAccessToken(announcer_url + 'campaigns/' + campaignId + '/subcampaigns', serviceAccessToken);
		$.ajax({
			url: subcampaignURL,
			data: data,
			type: "POST",
			success: function (subcampaignResult) {
				getAccountModel()
				$("#selectSettingSelect").selectpicker('val', subcampaignResult.name)
				$("#contentProvidingSelect").selectpicker('val', subcampaignResult.name)
				$('.page-loader-wrapper').fadeOut();
				swal("Congrates!", "You have successfuly created a subcampaign. Lets go for adding setting and content.", "success");
			},
			error: function(xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#sendContentButton").click(function (e) {
        e.preventDefault();
		var subcampaignId = $('contentProvidingSelect').val()
		var campaignId
		for (var i = 0; i < totalSubcampaignsArray.length; i++)
			if (totalSubcampaignsArray[i].id === subcampaignId)
				campaignId = totalSubcampaignsArray[i].campaignId
		var isStatic = $('#contentProvidingType').find('option:selected').text()
		var templateId = $('#contentProvidingTemplate').find('option:selected').text()
		var data = {
			header: $('#contentProvidingHeader').val(),
			time: (new Date()).toLocaleString(),
			holding: $('#contentProvidingHolding').val(),
			subtitle: $('#contentProvidingSubtitle').val(),
		}
		var queryData = {
			campaignHashId: campaignId,
			subcampaignHashId: subcampaignId,
			isStatic: isStatic,
			templateId: templateId,
			data: JSON.stringify(data)
		}
		var queryString = generateQueryString(queryData)
		$('.page-loader-wrapper').fadeIn();
		var subcampaignURL = wrapAccessToken(announcer_url + 'containers/uploadFile?' + queryString, serviceAccessToken);
		$.ajax({
			url: subcampaignURL,
			data: data,
			type: "POST",
			success: function (subcampaignResult) {
				getAccountModel()
				$("#selectSettingSelect").selectpicker('val', subcampaignResult.name)
				$("#contentProvidingSelect").selectpicker('val', subcampaignResult.name)
				$('.page-loader-wrapper').fadeOut();
				swal("Congrates!", "You have successfuly added a content to a subcampaign.", "success");
			},
			error: function(xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#saveSettingButton").click(function (e) {
        e.preventDefault();
		var subcampaignId = $('selectSettingSelect').val()
		var data = {
			priority : $('#selectSettingPriority').find('option:selected').text(),
			category : $('#selectSettingCategory').find('option:selected').map(function(){return this.value}).get(),
			country : $('#selectSettingCountry').find('option:selected').map(function(){return this.value}).get(),
			language : $('#selectSettingLanguage').find('option:selected').map(function(){return this.value}).get(),
			device : $('#selectSettingDevice').find('option:selected').map(function(){return this.value}).get(),
			os: $('#selectSettingOS').find('option:selected').map(function(){return this.value}).get(),
			userLabel: $('#selectSettingUserLabel').find('option:selected').map(function(){return this.value}).get(),
			connection: $('#selectSettingConnection').find('option:selected').map(function(){return this.value}).get()
		}
		$('.page-loader-wrapper').fadeIn();
		var settingURL = wrapAccessToken(announcer_url + 'subcampaigns/' + subcampaignId + '/setting', serviceAccessToken);
		$.ajax({
			url: settingURL,
			data: data,
			type: "PUT",
			success: function (settingResult) {
				getAccountModel()
				$('.page-loader-wrapper').fadeOut();
				swal("Congrates!", "You have successfuly edited the setting of a subcampaign.", "success");
			},
			error: function(xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

})
