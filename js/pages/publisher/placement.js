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

var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clientInstance;
	var fullApplicationResult
	var totalPlacementsArray = []

	var userId, publisherAccessToken, coreAccessToken
	if (localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
	else
		return window.location.href = '../AAA/sign-in.html';
	if (localStorage.getItem('publisherAccessToken'))
		publisherAccessToken = localStorage.getItem('publisherAccessToken')
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

	function fillEditPlacementsnFields(selected) {
		for (var i = 0; i < totalPlacementsArray.length; i++) {
			if (totalPlacementsArray[i].name === selected) {
				$("#editPlacementName").val(totalPlacementsArray[i].name)
				$("#editPlacementStyle").selectpicker('val', totalPlacementsArray[i].style)
				$("#editPlacementOnlineCapacity").val(totalPlacementsArray[i].onlineCapacity)
				$("#editPlacementOfflineCapacity").val(totalPlacementsArray[i].offlineCapacity)
				$("#editPlacementBeginningTime").val(totalPlacementsArray[i].beginningTime)
				$("#editPlacementEndingTime").val(totalPlacementsArray[i].endingTime)
				$("#editPlacementPriority").selectpicker('val', totalPlacementsArray[i].priority)
				break
			}
		}
	}

	function fillSettingPlacementFields(selected) {
		for (var i = 0; i < totalPlacementsArray.length; i++) {
			if (totalPlacementsArray[i].name === selected) {
				$("#selectSettingUserLabel").selectpicker('val', totalPlacementsArray[i].settingModel.userLabel)
				$("#selectSettingCategory").selectpicker('val', totalPlacementsArray[i].settingModel.category)
				$("#selectSettingCountry").selectpicker('val', totalPlacementsArray[i].settingModel.country)
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#myPlacements").show();
			$("#editPlacement").hide();
			$("#addPlacement").hide();
			$("#selectSetting").hide();
		} else if ($(e.target).attr('id') === 'nav3') {
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
			$("#addPlacement").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			if (localStorage.getItem('newCreatedApplication')) {
				var appName = localStorage.getItem('newCreatedApplication')
				$("#addPlacementSelectApplication").selectpicker('val', appName)
				localStorage.removeItem("newCreatedApplication")
			}
			$("#myPlacements").hide();
			$("#editPlacement").hide();
			$("#addPlacement").show();
			$("#selectSetting").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#myPlacements").show();
		$("#editPlacement").hide();
		$("#addPlacement").hide();
		$("#selectSetting").hide();
	} else if (window.location.hash === '#addPlacement')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#editPlacement')
		$('.nav-tabs a[id="nav3"]').tab('show');
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
		var accountURLWithAT = wrapAccessToken(publisher_url + 'clients/' + userId, publisherAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["publisherAccount", "applications"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				clientInstance = accountResult
				var applicationURLWithAT = wrapAccessToken(publisher_url + 'clients/' + userId + '/applications', publisherAccessToken)
				var applicationURL = wrapFilter(applicationURLWithAT, '{"include":["placements"]}')
				$.ajax({
					url: applicationURL,
					type: "GET",
					success: function (applicationResult) {
						totalPlacementsArray = []
						fullApplicationResult = applicationResult
						$('#addPlacementSelectApplication').find('option').remove()
						$('#myPlacementsSelectApplication').find('option').remove()
						$('#selectSettingSelect').find('option').remove()
						$('#editPlacementSelect').find('option').remove()
						for (var i = 0; i < accountResult.applications.length; i++) {
							$('#addPlacementSelectApplication').append($('<option>', {
								value: accountResult.applications[i].id,
								text: accountResult.applications[i].name
							})).selectpicker('refresh');
							$('#myPlacementsSelectApplication').append($('<option>', {
								value: accountResult.applications[i].id,
								text: accountResult.applications[i].name
							})).selectpicker('refresh');
						}

						for (var i = 0; i < applicationResult.length; i++) {
							var group = $('<optgroup label="' + applicationResult[i].name + '"/>');
							for (j = 0; j < applicationResult[i].placements.length; j++) {
								$('<option />').html(applicationResult[i].placements[j].name).appendTo(group);
								totalPlacementsArray.push(applicationResult[i].placements[j])
							}
							group.appendTo('#editPlacementSelect');
							$('#editPlacementSelect').selectpicker('refresh');
						}
						for (var i = 0; i < applicationResult.length; i++) {
							var group = $('<optgroup label="' + applicationResult[i].name + '"/>');
							for (j = 0; j < applicationResult[i].placements.length; j++) {
								$('<option />').html(applicationResult[i].placements[j].name).appendTo(group);
							}
							group.appendTo('#selectSettingSelect');
							$('#selectSettingSelect').selectpicker('refresh');
						}

						$('#editPlacementSelect').trigger("chosen:updated")
						$('#selectSettingSelect').trigger("chosen:updated")

						$('#addPlacementSelectApplication').trigger("chosen:updated")
						$('#myPlacementsSelectApplication').trigger("chosen:updated")

						fillTable(totalPlacementsArray)

						if (localStorage.getItem('myApplicationSelectPlacement')) {
							var appName = localStorage.getItem('myApplicationSelectPlacement')
							$("#myPlacementsSelectApplication").selectpicker('val', appName).selectpicker('refresh')
							localStorage.removeItem("myApplicationSelectPlacement")
						}
					},
					error: function (xhr, status, error) {
						$('.page-loader-wrapper').fadeOut();
						alert(xhr.responseText);
					}
				});
				$("#publisherUsername").html(localStorage.getItem('publisherCompanyName'));
				$("#publisherEmail").html(localStorage.getItem('publisherEmail'));

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
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + placementsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].style + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + placementsArray[i].minCredit + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].priority + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(placementsArray[i].beginningTime) + '<br>' + dateConvertor(placementsArray[i].endingTime) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + placementsArray[i].onlineCapacity + '<br>' + placementsArray[i].offlineCapacity + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + placementsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="placementEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="placementDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable({
			"scrollX": true
		});
	}

	$(document).on("click", ".placementEdit", function (e) {
		e.preventDefault();
		var appId = $(this).parent().siblings().eq(1).text()
		var placementId = $(this).parent().siblings().eq(0).text()
		var placementName, appName
		for (var i = 0; i < totalPlacementsArray.length; i++)
			if (totalPlacementsArray[i].id == placementId)
				placementName = totalPlacementsArray[i].name
		for (var i = 0; i < clientInstance.applications.length; i++)
			if (clientInstance.applications[i].id == appId)
				appName = clientInstance.applications[i].name
		localStorage.setItem('editablePlacementName', placementName)
		$('.nav-tabs a[id="nav3"]').tab('show');
	})

	$(document).on("click", ".placementDelete", function (e) {
		e.preventDefault();
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
					},
					error: function (xhr, status, error) {
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
			}
		});

	})

	$("#myPlacementSearch").click(function (e) {
		e.preventDefault();
		var style = [],
			priority = [],
			limit,
			beginningTime,
			endingTime

			myPlacementsEndingTime
			myPlacementsBeginningTime

		if ($('#myPlacementsStyle').val())
			style = $('#myPlacementsStyle').val()
		if ($('#myPlacementsPriority').val())
			priority = $('#myPlacementsPriority').val()

		if ($('#myPlacementsBeginningTime').val())
			beginningTime = timeConvertor($('#myPlacementsBeginningTime').val())

		if ($('#myPlacementsEndingTime').val())
			endingTime = timeConvertor($('#myPlacementsEndingTime').val())

		var limit = $('#myPlacementssLimit').val()

		var filter = {}
		if (priority.length > 0 || style.length > 0 || beginningTime || endingTime) {
			filter.where = {}
			filter.where.and = []
			if (status.length > 0)
				filter.where.and.push({
					'style': {
						'inq': style
					}
				})
			if (style.length > 0)
				filter.where.and.push({
					'priority': {
						'inq': priority
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

		var placementURLWithAT = wrapAccessToken(publisher_url + 'placements/getAllPlacements?accountHashId=' + userId, publisherAccessToken)
		var placementFilterURL = wrapFilter(placementURLWithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: placementFilterURL,
			type: "GET",
			success: function (placementResult) {
				fillTable(placementResult)
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	})

	$("#editPlacementButton").click(function (e) {
		e.preventDefault();
		var placementName = $('#editPlacementSelect').find('option:selected').text()
		var appId, placementId
		for (var i = 0; i < totalPlacementsArray.length; i++)
			if (totalPlacementsArray[i].name === placementName) {
				appId = totalPlacementsArray[i].applicationId
				placementId = totalPlacementsArray[i].id
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
				swal("Congrates!", "You have successfuly edited a placement.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#addPlacementButton").click(function (e) {
		e.preventDefault();
		var applicationName = $('#addPlacementSelectApplication').find('option:selected').text()
		var applicationId
		for (var i = 0; i < clientInstance.applications.length; i++)
			if (clientInstance.applications[i].name === applicationName)
				applicationId = clientInstance.applications[i].id
		if (!applicationId || !applicationName || !$('#addPlacementName').val() || !$('#addPlacementOnlineCapacity').val() || !$('#addPlacementOfflineCapacity').val() || !$('#addPlacementBeginningTime').val() || !$('#addPlacementEndingTime').val() || !$('#addPlacementStyle').find('option:selected').text() || !$('#addPlacementPriority').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#addPlacementName').val(),
			onlineCapacity: $('#addPlacementOnlineCapacity').val(),
			offlineCapacity: $('#addPlacementOfflineCapacity').val(),
			beginningTime: fullTimeConvertor($('#addPlacementBeginningTime').val()),
			endingTime: fullTimeConvertor($('#addPlacementEndingTime').val()),
			style: $('#addPlacementStyle').find('option:selected').text(),
			priority: $('#addPlacementPriority').find('option:selected').text(),
		}
		var placementURL = wrapAccessToken(publisher_url + 'applications/' + applicationId + '/placements', publisherAccessToken);
		$.ajax({
			url: placementURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (placementResult) {
				localStorage.setItem("newAddedPlacement", placementResult.name)
				localStorage.setItem('newAddedPlacementApplication', applicationName)
				getAccountModel()
				swal("Congrates!", "You have successfuly created a placement. Lets go for adding setting and content.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#saveSettingButton").click(function (e) {
		e.preventDefault();
		var placementName = $('#selectSettingSelect').find('option:selected').text()
		var applicationId, placementId
		for (var i = 0; i < totalPlacementsArray.length; i++)
			if (totalPlacementsArray[i].name === placementName) {
				applicationId = totalPlacementsArray[i].applicationId
				placementId = totalPlacementsArray[i].id
			}
		if (!applicationId || !placementName || !placementId ||
			$('#selectSettingCategory').find('option:selected').text().length == 0 ||
			$('#selectSettingCountry').find('option:selected').text().length == 0 ||
			$('#selectSettingUserLabel').find('option:selected').text().length == 0
		)
			return swal("Oops!", "You should enter required field of prepared form.", "warning");

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
				swal("Congrates!", "You have successfuly edited the setting of a placement.", "success");
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