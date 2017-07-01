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

function generateQueryString(data) {
	var ret = []
	for (var d in data)
		if (data[d])
			ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]))
	return ret.join("&")
}

var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clientsArray = [];
	var applicationsArray = []
	var placementsArray = []

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

	function fillEditPlacementsnFields(selected) {
		for (var i = 0; i < placementsArray.length; i++) {
			if (placementsArray[i].name === selected) {
				$("#editPlacementName").val(placementsArray[i].name)
				$("#editPlacementStyle").selectpicker('val', placementsArray[i].style)
				$("#editPlacementOnlineCapacity").val(placementsArray[i].onlineCapacity)
				$("#editPlacementOfflineCapacity").val(placementsArray[i].offlineCapacity)
				$("#editPlacementBeginningTime").val(fullDateConvertor(placementsArray[i].beginningTime))
				$("#editPlacementEndingTime").val(fullDateConvertor(placementsArray[i].endingTime))
				$("#editPlacementPriority").selectpicker('val', placementsArray[i].priority)
				break
			}
		}
	}

	function fillSettingPlacementFields(selected) {
		for (var i = 0; i < placementsArray.length; i++) {
			if (placementsArray[i].name === selected) {
				$("#selectSettingUserLabel").selectpicker('val', placementsArray[i].settingModel.userLabel)
				$("#selectSettingCategory").selectpicker('val', placementsArray[i].settingModel.category)
				$("#selectSettingCountry").selectpicker('val', placementsArray[i].settingModel.country)
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#myPlacements").show();
			$("#editPlacement").hide();
			$("#selectSetting").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			if (localStorage.getItem('editablePlacementName')) {
				var placementName = localStorage.getItem('editablePlacementName')
				$("#editPlacementSelect").selectpicker('val', placementName)
				fillEditPlacementsnFields(placementName);
				$("#selectSettingSelect").selectpicker('val', placementName)
				fillSettingPlacementFields(placementName);
				localStorage.removeItem("editablePlacementName")
			}
			$("#myPlacements").hide();
			$("#selectSetting").show();
			$("#editPlacement").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#myPlacements").show();
		$("#editPlacement").hide();
		$("#selectSetting").hide();
	} else if (window.location.hash === '#editPlacement')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#myPlacements')
		$('.nav-tabs a[id="nav1"]').tab('show');

	$('#editPlacementSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillEditPlacementFields(selected)
	});

	$('#selectSettingSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillSettingPlacementFields(selected)
	});

	function getAccountModel() {
		var accountURLWithAT = wrapAccessToken(publisher_url + 'applications', publisherAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["placements"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (applications) {
				clientsArray = []
				applicationsArray = []
				placementsArray = []
				
				$('#myPlacementsClients').find('option').remove()
				$('#myPlacementsSelectApplication').find('option').remove()
				$('#selectSettingSelect').find('option').remove()
				$('#editPlacementSelect').find('option').remove()
				for (var i = 0; i < applications.length; i++) {
					if (clientsArray.indexOf(applications[i].clientId) == -1) {
						clientsArray.push(applications[i].clientId)
						$('#myPlacementsClients').append($('<option>', {
							value: applications[i].clientId,
							text: applications[i].clientId
						})).selectpicker('refresh');
					}
					$('#myPlacementsSelectApplication').append($('<option>', {
						value: applications[i].id,
						text: applications[i].name
					})).selectpicker('refresh');
					applicationsArray.push(applications[i])
				}

				for (var i = 0; i < applications.length; i++) {
					var group = $('<optgroup label="' + applications[i].name + '"/>');
					for (j = 0; j < applications[i].placements.length; j++) {
						$('<option />').html(applications[i].placements[j].name).appendTo(group);
						placementsArray.push(applications[i].placements[j])
					}
					group.appendTo('#editPlacementSelect');
					$('#editPlacementSelect').selectpicker('refresh');
				}
				for (var i = 0; i < applications.length; i++) {
					var group = $('<optgroup label="' + applications[i].name + '"/>');
					for (j = 0; j < applications[i].placements.length; j++) {
						$('<option />').html(applications[i].placements[j].name).appendTo(group);
					}
					group.appendTo('#selectSettingSelect');
					$('#selectSettingSelect').selectpicker('refresh');
				}

				$('#editPlacementSelect').trigger("chosen:updated")
				$('#selectSettingSelect').trigger("chosen:updated")

				$('#myPlacementsClients').trigger("chosen:updated")
				$('#myPlacementsSelectApplication').trigger("chosen:updated")

				fillTable(placementsArray)

				$("#adminUsername").html(localStorage.getItem('AdminCompanyName'));
				$("#adminEmail").html(localStorage.getItem('adminEmail'));

				$("#sharedBudget").html('Budget: $' + accountResult.publisherAccount.budget);
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	}

	function fillTable(placementsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < placementsArray.length; i++) {
			var statusColor
			if (placementsArray[i].status === 'Enable') statusColor = 'bg-blue'
			else if (placementsArray[i].status === 'Disable') statusColor = 'bg-deep-orange'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].applicationId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].clientId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + placementsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].style + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + placementsArray[i].minCredit + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + placementsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="placementEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="placementDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".placementEdit", function (e) {
		e.preventDefault();
		NProgress.start();
		var appId = $(this).parent().siblings().eq(1).text()
		var placementId = $(this).parent().siblings().eq(0).text()
		var placementName
		for (var i = 0; i < placementsArray.length; i++)
			if (placementsArray[i].id == placementId)
				placementName = placementsArray[i].name
		localStorage.setItem('editablePlacementName', placementName)
		$('.nav-tabs a[id="nav2"]').tab('show');
		NProgress.done();
	})

	$(document).on("click", ".placementDelete", function (e) {
		e.preventDefault();
		NProgress.start();
		var appId = $(this).parent().siblings().eq(1).text()
		var placementId = $(this).parent().siblings().eq(0).text()
		swal({
			title: "Are You Sure?",
			text: "You won't be able to recover the placement after removing it.",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "No, Cancel!",
			closeOnConfirm: false,
			closeOnCancel: true
		}, function (isConfirm) {
			if (isConfirm) {
				var placementURLWithAT = wrapAccessToken(publisher_url + 'applications/' + appId + '/placements/' + placementId, publisherAccessToken)
				$.ajax({
					url: placementURLWithAT,
					type: "DELETE",
					success: function (placementResult) {
						swal("Deleted!", "Your placement successfuly has been deleted.", "success");
						getAccountModel()
						NProgress.done();
					},
					error: function (xhr, status, error) {
						NProgress.done();
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
			}
			else 
				NProgress.done();
		});

	})

	$("#myPlacementsSearch").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var style = [],
			priority = [],
			application = [],
			client = [],
			limit,
			beginningTime,
			endingTime

		if ($('#myPlacementsStyle').val())
			style = $('#myPlacementsStyle').val()
		if ($('#myPlacementsPriority').val())
			priority = $('#myPlacementsPriority').val()
		if ($('#myPlacementsSelectApplication').val())
			application = $('#myPlacementsSelectApplication').val()
		if ($('#myPlacementsClients').val())
			client = $('#myPlacementsClients').val()

		if ($('#myPlacementsBeginningTime').val())
			beginningTime = fullTimeConvertor($('#myPlacementsBeginningTime').val())

		if ($('#myPlacementsEndingTime').val())
			endingTime = fullTtimeConvertor($('#myPlacementsEndingTime').val())

		var limit = $('#myPlacementssLimit').val()

		var filter = {}
		if (priority || style.length > 0  || application.length > 0 || client.length > 0 || beginningTime || endingTime) {
			filter.where = {}
			filter.where.and = []
			if (style.length > 0)
				filter.where.and.push({
					'style': {
						'inq': style
					}
				})
			if (priority)
				filter.where.and.push({
					'priority': 
						priority
					}
				)
			if (application.length > 0)
				filter.where.and.push({
					'applicationId': {
						'inq': application
					}
				})
			if (client.length > 0)
				filter.where.and.push({
					'clientId': {
						'inq': client
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
		filter.fields = {
			'settingModel': false
		}

		var placementURLWithAT = wrapAccessToken(publisher_url + 'placements', publisherAccessToken)
		var placementFilterURL = wrapFilter(placementURLWithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: placementFilterURL,
			type: "GET",
			success: function (placementResult) {
				fillTable(placementResult)
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

	$("#editPlacementButton").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var placementName = $('#editPlacementSelect').find('option:selected').text()
		var appId, placementId
		for (var i = 0; i < placementsArray.length; i++)
			if (placementsArray[i].name === placementName) {
				appId = placementsArray[i].applicationId
				placementId = placementsArray[i].id
			}
		if (!appId || !placementId || !placementName || !$('#editPlacementName').val() || !$('#editPlacementOnlineCapacity').val() || !$('#editPlacementOfflineCapacity').val() || !$('#editPlacementBeginningTime').val() || !$('#editPlacementEndingTime').val() || !$('#editPlacementStyle').find('option:selected').text() || !$('#editPlacementPriority').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#editPlacementName').val(),
			onlineCapacity: $('#editPlacementOnlineCapacity').val(),
			offlineCapacity: $('#editPlacementOfflineCapacity').val(),
			beginningTime: fullTimeConvertor($('#editPlacementBeginningTime').val()),
			endingTime: fullTimeConvertor($('#editPlacementEndingTime').val()),
			style: $('#editPlacementStyle').find('option:selected').text(),
			priority: $('#editPlacementPriority').find('option:selected').text(),
		}
		var placementURL = wrapAccessToken(publisher_url + 'applications/' + appId + '/placements/' + placementId, publisherAccessToken);
		$.ajax({
			url: placementURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (placementResult) {
				getAccountModel()
				NProgress.done();
				swal("Congrates!", "You have successfuly edited a placement.", "success");
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
		var placementName = $('#selectSettingSelect').find('option:selected').text()
		var applicationId, placementId
		for (var i = 0; i < placementsArray.length; i++)
			if (placementsArray[i].name === placementName) {
				applicationId = placementsArray[i].applicationId
				placementId = placementsArray[i].id
			}
		if (!applicationId || !placementName || !placementId ||
			$('#selectSettingCategory').find('option:selected').text().length == 0 ||
			$('#selectSettingCountry').find('option:selected').text().length == 0 ||
			$('#selectSettingUserLabel').find('option:selected').text().length == 0
		){
			NProgress.done();
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		}

		var data = {
			category: $('#selectSettingCategory').find('option:selected').map(function () {
				return this.value
			}).get(),
			country: $('#selectSettingCountry').find('option:selected').map(function () {
				return this.value
			}).get(),
			userLabel: $('#selectSettingUserLabel').find('option:selected').map(function () {
				return this.value
			}).get()
		}
		var settingURL = wrapAccessToken(publisher_url + 'placements/' + placementId + '/setting', publisherAccessToken);
		$.ajax({
			url: settingURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (settingResult) {
				getAccountModel()
				NProgress.done();
				swal("Congrates!", "You have successfuly edited the setting of a placement.", "success");
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