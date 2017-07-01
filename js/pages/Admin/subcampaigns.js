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
	var clientsArray = [];
	var campaignsArray = []
	var subcampaignsArray = []
	var editableSubcampaignId
	var editableSettingId
	var prefredSubcampaign

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
		for (var i = 0; i < subcampaignsArray.length; i++) {
			if (subcampaignsArray[i].name === selected) {
				$("#editSubcampaignName").val(subcampaignsArray[i].name)
				$("#editSubcampaignStyle").selectpicker('val', subcampaignsArray[i].style)
				$("#editSubcampaignMinBudget").val(subcampaignsArray[i].minBudget)
				$("#editSubcampaignPlan").selectpicker('val', subcampaignsArray[i].plan)
				$("#editSubcampaignPrice").val(subcampaignsArray[i].price)
				break
			}
		}
	}

	function fillSettingSubcampaignFields(selected) {
		for (var i = 0; i < subcampaignsArray.length; i++) {
			if (subcampaignsArray[i].name === selected) {
				$("#selectSettingPriority").selectpicker('val', subcampaignsArray[i].settingModel.priority)
				$("#selectSettingUserLabel").selectpicker('val', subcampaignsArray[i].settingModel.userLabel)
				$("#selectSettingDevice").selectpicker('val', subcampaignsArray[i].settingModel.device)
				$("#selectSettingCategory").selectpicker('val', subcampaignsArray[i].settingModel.category)
				$("#selectSettingCountry").selectpicker('val', subcampaignsArray[i].settingModel.country)
				$("#selectSettingLanguage").selectpicker('val', subcampaignsArray[i].settingModel.language)
				$("#selectSettingOS").selectpicker('val', subcampaignsArray[i].settingModel.os)
				$("#selectSettingConnection").selectpicker('val', subcampaignsArray[i].settingModel.connection)
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#mySubcampaigns").show();
			$("#editSubcampaign").hide();
			$("#selectSetting").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
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
			$("#editSubcampaign").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#mySubcampaigns").show();
		$("#editSubcampaign").hide();
		$("#selectSetting").hide();
	} else if (window.location.hash === '#editSubcampaign')
		$('.nav-tabs a[id="nav2"]').tab('show');
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
		var accountURLWithAT = wrapAccessToken(announcer_url + 'campaigns', announcerAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["subcampaigns"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (campaigns) {
				clientsArray = []
				campaignsArray = []
				subcampaignsArray = []
				$('#mySubcampaignsClients').find('option').remove()
				$('#mySubcampaignSelectCampaign').find('option').remove()
				$('#selectSettingSelect').find('option').remove()
				$('#editSubcampaignSelect').find('option').remove()
				for (var i = 0; i < campaigns.length; i++) {
					if (clientsArray.indexOf(campaigns[i].clientId) == -1) {
						clientsArray.push(campaigns[i].clientId)
						$('#mySubcampaignsClients').append($('<option>', {
							value: campaigns[i].clientId,
							text: campaigns[i].clientId
						})).selectpicker('refresh');
					}

					$('#mySubcampaignSelectCampaign').append($('<option>', {
						value: campaigns[i].id,
						text: campaigns[i].name
					})).selectpicker('refresh');
					campaignsArray.push(campaigns[i])
				}

				for (var i = 0; i < campaigns.length; i++) {
					var group = $('<optgroup label="' + campaigns[i].name + '"/>');
					for (j = 0; j < campaigns[i].subcampaigns.length; j++) {
						$('<option />').html(campaigns[i].subcampaigns[j].name).appendTo(group);
						subcampaignsArray.push(campaigns[i].subcampaigns[j])
					}
					group.appendTo('#editSubcampaignSelect');
					$('#editSubcampaignSelect').selectpicker('refresh');
				}
				for (var i = 0; i < campaigns.length; i++) {
					var group = $('<optgroup label="' + campaigns[i].name + '"/>');
					for (j = 0; j < campaigns[i].subcampaigns.length; j++) {
						$('<option />').html(campaigns[i].subcampaigns[j].name).appendTo(group);
					}
					group.appendTo('#selectSettingSelect');
					$('#selectSettingSelect').selectpicker('refresh');
				}

				$('#editSubcampaignSelect').trigger("chosen:updated")
				$('#selectSettingSelect').trigger("chosen:updated")
				$('#mySubcampaignSelectCampaign').trigger("chosen:updated")
				$('#mySubcampaignsClients').trigger("chosen:updated")

				fillTable(subcampaignsArray)

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
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + subcampaignsArray[i].clientId + '</td>' +
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
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".subcampaignEdit", function (e) {
		e.preventDefault();
		NProgress.start();
		var campId = $(this).parent().siblings().eq(1).text()
		var subcampId = $(this).parent().siblings().eq(0).text()
		var subcampaignName
		for (var i = 0; i < subcampaignsArray.length; i++)
			if (subcampaignsArray[i].id == subcampId)
				subcampaignName = subcampaignsArray[i].name
		localStorage.setItem('editableSubcampaignName', subcampaignName)
		NProgress.done();
		$('.nav-tabs a[id="nav2"]').tab('show');
	})

	$(document).on("click", ".subcampaignDelete", function (e) {
		e.preventDefault();
		NProgress.start();
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
				var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'campaigns/' + campId + '/subcampaigns/' + subcampId, announcerAccessToken)
				$.ajax({
					url: subcampaignURLWithAT,
					type: "DELETE",
					success: function (subcampaignResult) {
						swal("Deleted!", "Your subcampaign successfuly has been deleted.", "success");
						getAccountModel()
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

	$("#mySubcampaignsSearch").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var status = [],
			style = [],
			plan = [],
			campaign = [],
			client = [],
			limit

		if ($('#mySubcampaignsClients').val())
			client = $('#mySubcampaignsClients').val()
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
		if (status.length > 0 || style.length > 0 || plan.length > 0 || campaign.length > 0 || client.length) {
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
			if (client.length > 0)
				filter.where.and.push({
					'clientId': {
						'inq': client
					}
				})
		}
		filter.limit = limit
		filter.fields = {
			'settingModel': false
		}

		var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'subcampaigns', announcerAccessToken)
		var subcampaignFilterURL = wrapFilter(subcampaignURLWithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: subcampaignFilterURL,
			type: "GET",
			success: function (subcampaignResult) {
				fillTable(subcampaignResult)
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

	$("#editSubcamapignButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var subcampaignName = $('#editSubcampaignSelect').find('option:selected').text()
		var campaignId, subcampaignId
		for (var i = 0; i < subcampaignsArray.length; i++)
			if (subcampaignsArray[i].name === subcampaignName) {
				campaignId = subcampaignsArray[i].campaignId
				subcampaignId = subcampaignsArray[i].id
			}
		if (!campaignId || !subcampaignId || !subcampaignName || !$('#editSubcampaignName').val() || !$('#editSubcampaignMinBudget').val() || !$('#editSubcampaignPrice').val() || !$('#editSubcampaignStyle').find('option:selected').text() || !$('#editSubcampaignPlan').find('option:selected').text()) {
			NProgress.done();
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		}
		var data = {
			name: $('#editSubcampaignName').val(),
			minBudget: Number($('#editSubcampaignMinBudget').val()),
			style: $('#editSubcampaignStyle').find('option:selected').text(),
			plan: $('#editSubcampaignPlan').find('option:selected').text(),
			price: Number($('#editSubcampaignPrice').val())
		}
		var subcampaignURL = wrapAccessToken(announcer_url + 'campaigns/' + campaignId + '/subcampaigns/' + subcampaignId, announcerAccessToken);
		$.ajax({
			url: subcampaignURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (subcampaignResult) {
				getAccountModel()
				NProgress.done();
				swal("Congrates!", "You have successfuly edited a subcampaign.", "success");
			},
			error: function (xhr, status, error) {
				NProgress.done();
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#saveSettingButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var subcampaignName = $('#selectSettingSelect').find('option:selected').text()
		var campaignId, subcampaignId
		for (var i = 0; i < subcampaignsArray.length; i++)
			if (subcampaignsArray[i].name === subcampaignName) {
				campaignId = subcampaignsArray[i].campaignId
				subcampaignId = subcampaignsArray[i].id
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
		) {
			NProgress.done();
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		}

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
		var settingURL = wrapAccessToken(announcer_url + 'subcampaigns/' + subcampaignId + '/setting', announcerAccessToken);
		$.ajax({
			url: settingURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (settingResult) {
				getAccountModel()
				NProgress.done();
				swal("Congrates!", "You have successfuly edited the setting of a subcampaign.", "success");
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

})