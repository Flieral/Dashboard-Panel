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
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('serviceAccessToken'))
		serviceAccessToken = localStorage.getItem('serviceAccessToken')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('coreAccessToken'))
		coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		return window.location.href = '../AAA/sign-in.html';

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

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#mySubcampaigns").show();
			$("#editSubcampaign").hide();
			$("#addSubcampaign").hide();
			$("#contentProviding").hide();
			$("#selectSetting").hide();
		} else if ($(e.target).attr('id') === 'nav3') {
			if (localStorage.getItem('editableSubcampaignName')) {
				var subcampName = localStorage.getItem('editableSubcampaignName')
				$("#editSubcampaignSelect").selectpicker('val', subcampName)
				fillEditSubcampaignFields(subcampName);
				$("#selectSettingSelect").selectpicker('val', subcampName)
				fillSettingSubcampaignFields(subcampName);
				localStorage.removeItem("editableSubcampaignName")
			}
			$("#mySubcampaigns").hide();
			$("#selectSetting").show();
			$("#contentProviding").hide();
			$("#editSubcampaign").show();
			$("#addSubcampaign").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			if (localStorage.getItem('newCreatedCampaign')) {
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
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#mySubcampaigns").show();
		$("#editSubcampaign").hide();
		$("#addSubcampaign").hide();
		$("#contentProviding").hide();
		$("#selectSetting").hide();
	} else if (window.location.hash === '#addSubcampaign')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#editSubcampaign')
		$('.nav-tabs a[id="nav3"]').tab('show');
	else if (window.location.hash === '#mySubcampaigns')
		$('.nav-tabs a[id="nav1"]').tab('show');

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
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["announcerAccount", "campaigns"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				clientInstance = accountResult
				var campaignURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId + '/campaigns', serviceAccessToken)
				var campaignURL = wrapFilter(campaignURLWithAT, '{"include":["subcampaigns"]}')
				$.ajax({
					url: campaignURL,
					type: "GET",
					success: function (campaignResult) {
						totalSubcampaignsArray = []
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

						for (var i = 0; i < campaignResult.length; i++) {
							var group = $('<optgroup label="' + campaignResult[i].name + '"/>');
							for (j = 0; j < campaignResult[i].subcampaigns.length; j++) {
								$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
								totalSubcampaignsArray.push(campaignResult[i].subcampaigns[j])
							}
							group.appendTo('#editSubcampaignSelect');
							$('#editSubcampaignSelect').selectpicker('refresh');
						}
						for (var i = 0; i < campaignResult.length; i++) {
							var group = $('<optgroup label="' + campaignResult[i].name + '"/>');
							for (j = 0; j < campaignResult[i].subcampaigns.length; j++) {
								$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
							}
							group.appendTo('#selectSettingSelect');
							$('#selectSettingSelect').selectpicker('refresh');
						}
						for (var i = 0; i < campaignResult.length; i++) {
							var group = $('<optgroup label="' + campaignResult[i].name + '"/>');
							for (j = 0; j < campaignResult[i].subcampaigns.length; j++) {
								$('<option />').html(campaignResult[i].subcampaigns[j].name).appendTo(group);
							}
							group.appendTo('#contentProvidingSelect');
							$('#contentProvidingSelect').selectpicker('refresh');
						}

						$('#editSubcampaignSelect').trigger("chosen:updated")
						$('#selectSettingSelect').trigger("chosen:updated")
						$('#contentProvidingSelect').trigger("chosen:updated")

						if (localStorage.getItem("newAddedSubcampaign")) {
							var subcampName = localStorage.getItem("newAddedSubcampaign")
							var campaignName = localStorage.getItem("newAddedSubcampaignCampaign")
							$("#selectSettingSelect").selectpicker('val', subcampName)
							$("#selectSettingSelect").selectpicker('refresh');
							$("#contentProvidingSelect").selectpicker('val', subcampName)
							$("#contentProvidingSelect").selectpicker('refresh');
							$("#addSubcampaignSelectCampaign").selectpicker('val', campaignName)
							$("#addSubcampaignSelectCampaign").selectpicker('refresh');
							$('#selectSettingSelect').selectpicker('render')
							$('#contentProvidingSelect').selectpicker('render')
							$('#addSubcampaignSelectCampaign').selectpicker('render')
							fillSettingSubcampaignFields(subcampName);
							localStorage.removeItem("newAddedSubcampaignCampaign")
							localStorage.removeItem("newAddedSubcampaign")
						}

						$('#addSubcampaignSelectCampaign').trigger("chosen:updated")
						$('#mySubcampaignSelectCampaign').trigger("chosen:updated")

						fillTable(totalSubcampaignsArray)

						if (localStorage.getItem('myCampaignSelectSubcampaign')) {
							var campName = localStorage.getItem('myCampaignSelectSubcampaign')
							$("#mySubcampaignSelectCampaign").selectpicker('val', campName).selectpicker('refresh')
							localStorage.removeItem("myCampaignSelectSubcampaign")
						}
					},
					error: function (xhr, status, error) {
						$('.page-loader-wrapper').fadeOut();
						alert(xhr.responseText);
					}
				});
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

	function fillTable(subcampaignsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < subcampaignsArray.length; i++) {
			var statusColor
			if (subcampaignsArray[i].status === 'Pending') statusColor = 'bg-orange'
			else if (subcampaignsArray[i].status === 'Suspend') statusColor = 'bg-red'
			else if (subcampaignsArray[i].status === 'Approved') statusColor = 'bg-green'
			else if (subcampaignsArray[i].status === 'Created') statusColor = 'bg-grey'
			else if (subcampaignsArray[i].status === 'Finished') statusColor = 'bg-indigo'
			else if (subcampaignsArray[i].status === 'Started') statusColor = 'bg-blue'
			else if (subcampaignsArray[i].status === 'Stopped') statusColor = 'bg-deep-orange'
			else if (subcampaignsArray[i].status === 'UnStopped') statusColor = 'bg-teal'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].campaignId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + subcampaignsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].style + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + subcampaignsArray[i].minBudget + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].plan + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + subcampaignsArray[i].price + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + subcampaignsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="subcampaignEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="subcampaignDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable({
			"scrollX": true
		});
	}

	$(document).on("click", ".subcampaignEdit", function (e) {
		e.preventDefault();
		var campId = $(this).parent().siblings().eq(1).text()
		var subcampId = $(this).parent().siblings().eq(0).text()
		var subcampaignName, campaignName
		for (var i = 0; i < totalSubcampaignsArray.length; i++)
			if (totalSubcampaignsArray[i].id == subcampId)
				subcampaignName = totalSubcampaignsArray[i].name
		for (var i = 0; i < clientInstance.campaigns.length; i++)
			if (clientInstance.campaigns[i].id == campId)
				campaignName = clientInstance.campaigns[i].name
		localStorage.setItem('editableSubcampaignName', subcampaignName)
		$('.nav-tabs a[id="nav3"]').tab('show');
	})

	$(document).on("click", ".subcampaignDelete", function (e) {
		e.preventDefault();
		var campId = $(this).parent().siblings().eq(1).text()
		var subcampId = $(this).parent().siblings().eq(0).text()
		swal({
			title: "Are You Sure?",
			text: "You won't be able to recover the subcampaign after removing it.",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "No, Cancel!",
			closeOnConfirm: false,
			closeOnCancel: true
		}, function (isConfirm) {
			if (isConfirm) {
				var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'campaigns/' + campId + '/subcampaigns/' + subcampId, serviceAccessToken)
				$.ajax({
					url: subcampaignURLWithAT,
					type: "DELETE",
					success: function (subcampaignResult) {
						swal("Deleted!", "Your subcampaign successfuly has been deleted.", "success");
						getAccountModel()
					},
					error: function (xhr, status, error) {
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
			}
		});

	})

	$("#mySubcampaignsSearch").click(function (e) {
		e.preventDefault();
		var status = [],
			style = [],
			plan = [],
			campaign = [],
			limit

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
				filter.where.and.push({
					'status': {
						'inq': status
					}
				})
			if (style.length > 0)
				filter.where.and.push({
					'style': {
						'inq': style
					}
				})
			if (plan.length > 0)
				filter.where.and.push({
					'plan': {
						'inq': plan
					}
				})
			if (campaign.length > 0)
				filter.where.and.push({
					'campaignId': {
						'inq': campaign
					}
				})
		}
		filter.limit = limit
		filter.fields = {
			'settingModel': false
		}

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
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	})

	$("#editSubcamapignButton").click(function (e) {
		e.preventDefault();
		var subcampaignName = $('#editSubcampaignSelect').find('option:selected').text()
		var campaignId, subcampaignId
		for (var i = 0; i < totalSubcampaignsArray.length; i++)
			if (totalSubcampaignsArray[i].name === subcampaignName) {
				campaignId = totalSubcampaignsArray[i].campaignId
				subcampaignId = totalSubcampaignsArray[i].id
			}
		if (!campaignId || !subcampaignId || !subcampaignName || !$('#editSubcampaignName').val() || !$('#editSubcampaignMinBudget').val() || !$('#editSubcampaignPrice').val() || !$('#editSubcampaignStyle').find('option:selected').text() || !$('#editSubcampaignPlan').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#editSubcampaignName').val(),
			minBudget: Number($('#editSubcampaignMinBudget').val()),
			style: $('#editSubcampaignStyle').find('option:selected').text(),
			plan: $('#editSubcampaignPlan').find('option:selected').text(),
			price: Number($('#editSubcampaignPrice').val())
		}
		var subcampaignURL = wrapAccessToken(announcer_url + 'campaigns/' + campaignId + '/subcampaigns/' + subcampaignId, serviceAccessToken);
		$.ajax({
			url: subcampaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (subcampaignResult) {
				getAccountModel()
				swal("Congrates!", "You have successfuly edited a subcampaign.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#addSubcamapignButton").click(function (e) {
		e.preventDefault();
		var campaignName = $('#addSubcampaignSelectCampaign').find('option:selected').text()
		var campaignId
		for (var i = 0; i < clientInstance.campaigns.length; i++)
			if (clientInstance.campaigns[i].name === campaignName)
				campaignId = clientInstance.campaigns[i].id
		if (!campaignId || !campaignName || !$('#addSubcampaignName').val() || !$('#addSubcampaignMinBudget').val() || !$('#addSubcampaignPrice').val() || !$('#addSubcampaignStyle').find('option:selected').text() || !$('#addSubcampaignPlan').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#addSubcampaignName').val(),
			minBudget: Number($('#addSubcampaignMinBudget').val()),
			style: $('#addSubcampaignStyle').find('option:selected').text(),
			plan: $('#addSubcampaignPlan').find('option:selected').text(),
			price: Number($('#addSubcampaignPrice').val())
		}
		var subcampaignURL = wrapAccessToken(announcer_url + 'campaigns/' + campaignId + '/subcampaigns', serviceAccessToken);
		$.ajax({
			url: subcampaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (subcampaignResult) {
				localStorage.setItem("newAddedSubcampaign", subcampaignResult.name)
				localStorage.setItem('newAddedSubcampaignCampaign', campaignName)
				getAccountModel()
				swal("Congrates!", "You have successfuly created a subcampaign. Lets go for adding setting and content.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#sendContentButton").click(function (e) {
		e.preventDefault();
		var subcampaignName = $('#contentProvidingSelect').find('option:selected').text()
		var campaignId, subcampaignId
		for (var i = 0; i < totalSubcampaignsArray.length; i++)
			if (totalSubcampaignsArray[i].name === subcampaignName) {
				campaignId = totalSubcampaignsArray[i].campaignId
				subcampaignId = totalSubcampaignsArray[i].id
			}
		if (!campaignId || !subcampaignName || !subcampaignId || !$('#contentProvidingHeader').val() || !$('#contentProvidingHolding').val() || !$('#contentProvidingSubtitle').val() || !$('#contentProvidingTemplate').find('option:selected').text() || !$('#contentProvidingType').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var isStatic = false
		if ($('#contentProvidingType').find('option:selected').text() === 'Static')
			isStatic = true
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
		var subcampaignURL = wrapAccessToken(announcer_url + 'containers/uploadFile?' + queryString, serviceAccessToken);
		$.ajax({
			url: subcampaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (subcampaignResult) {
				getAccountModel()
				$("#selectSettingSelect").selectpicker('val', subcampaignResult.name)
				$("#contentProvidingSelect").selectpicker('val', subcampaignResult.name)
				swal("Congrates!", "You have successfuly added a content to a subcampaign.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#saveSettingButton").click(function (e) {
		e.preventDefault();
		var subcampaignName = $('#selectSettingSelect').find('option:selected').text()
		var campaignId, subcampaignId
		for (var i = 0; i < totalSubcampaignsArray.length; i++)
			if (totalSubcampaignsArray[i].name === subcampaignName) {
				campaignId = totalSubcampaignsArray[i].campaignId
				subcampaignId = totalSubcampaignsArray[i].id
			}
		if (!campaignId || !subcampaignName || !subcampaignId ||
			!$('#selectSettingPriority').find('option:selected').text() ||
			$('#selectSettingCategory').find('option:selected').text().length == 0 ||
			$('#selectSettingCountry').find('option:selected').text().length == 0 ||
			$('#selectSettingLanguage').find('option:selected').text().length == 0 ||
			$('#selectSettingDevice').find('option:selected').text().length == 0 ||
			$('#selectSettingOS').find('option:selected').text().length == 0 ||
			$('#selectSettingUserLabel').find('option:selected').text().length == 0 ||
			$('#selectSettingConnection').find('option:selected').text().length == 0
		)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

		var data = {
			priority: $('#selectSettingPriority').find('option:selected').text(),
			category: $('#selectSettingCategory').find('option:selected').map(function () {
				return this.value
			}).get(),
			country: $('#selectSettingCountry').find('option:selected').map(function () {
				return this.value
			}).get(),
			language: $('#selectSettingLanguage').find('option:selected').map(function () {
				return this.value
			}).get(),
			device: $('#selectSettingDevice').find('option:selected').map(function () {
				return this.value
			}).get(),
			os: $('#selectSettingOS').find('option:selected').map(function () {
				return this.value
			}).get(),
			userLabel: $('#selectSettingUserLabel').find('option:selected').map(function () {
				return this.value
			}).get(),
			connection: $('#selectSettingConnection').find('option:selected').map(function () {
				return this.value
			}).get()
		}
		var settingURL = wrapAccessToken(announcer_url + 'subcampaigns/' + subcampaignId + '/setting', serviceAccessToken);
		$.ajax({
			url: settingURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (settingResult) {
				getAccountModel()
				swal("Congrates!", "You have successfuly edited the setting of a subcampaign.", "success");
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

})