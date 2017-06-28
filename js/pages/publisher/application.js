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

var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clientApplicationInstance;
	var newApplicationId

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

	getAllApplications();
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

	function fillEditApplicationFields(selected) {
		for (var i = 0; i < clientApplicationInstance.applications.length; i++) {
			if (clientApplicationInstance.applications[i].name === selected) {
				$("#editApplicationName").val(clientApplicationInstance.applications[i].name)
				$("#editApplicationStatusSelect").selectpicker('val', clientApplicationInstance.applications[i].status)
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#myApplications").show();
			$("#editApplication").hide();
			$("#newApplication").hide();
		} else if ($(e.target).attr('id') === 'nav3') {
			if (localStorage.getItem('editableApplicationName')) {
				var appName = localStorage.getItem('editableApplicationName')
				$("#editApplicationSelect").selectpicker('val', appName).selectpicker('refresh')
				fillEditApplicationFields(appName);
				localStorage.removeItem('editableApplicationName')
			}
			$("#myApplications").hide();
			$("#editApplication").show();
			$("#newApplication").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			$("#myApplications").hide();
			$("#editApplication").hide();
			$("#newApplication").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#myApplications").show();
		$("#editApplication").hide();
		$("#newApplication").hide();
	}
	else if (window.location.hash === '#newApplication')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#editApplication')
		$('.nav-tabs a[id="nav3"]').tab('show');
	else if (window.location.hash === '#myApplications')
		$('.nav-tabs a[id="nav1"]').tab('show');

	$('#editApplicationSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillEditApplicationFields(selected)
	});

	function getAllApplications() {
		var accountURLWithAT = wrapAccessToken(publisher_url + 'clients/' + userId, publisherAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["publisherAccount", "applications"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				$('#editApplicationSelect').find('option').remove()
				clientApplicationInstance = accountResult
				for (var i = 0; i < accountResult.applications.length; i++) {
					$('#editApplicationSelect').append($('<option>', {
						value: accountResult.applications[i].id,
						text: accountResult.applications[i].name
					})).selectpicker('refresh');
				}
				$('#editApplicationSelect').trigger("chosen:updated")

				fillTable(accountResult.applications)

				$("#publisherUsername").html(localStorage.getItem('publisherCompanyName'));
				$("#publisherEmail").html(localStorage.getItem('publisherEmail'));

				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	}

	function fillTable(applicationsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < applicationsArray.length; i++) {
			var statusColor
			if (applicationsArray[i].status === 'Enable') statusColor = 'bg-blue'
			else if (applicationsArray[i].status === 'Disable') statusColor = 'bg-deep-orange'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + applicationsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + applicationsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + applicationsArray[i].operatingSystem + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + applicationsArray[i].credit + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + applicationsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="applicationEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="placementInfo m-l-5 m-r-5 btn bg-amber waves-effect"><i class="material-icons">details</i></button>' +
				'<button type="button" class="applicationDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable({
			"scrollX": true
		});
	}

	$(document).on("click", ".applicationEdit", function (e) {
		e.preventDefault();
		var appName = $(this).parent().siblings().eq(1).text()
		localStorage.setItem('editableApplicationName', appName)
		$('.nav-tabs a[id="nav3"]').tab('show');
	})

	$(document).on("click", ".placementInfo", function (e) {
		e.preventDefault();
		var appName = $(this).parent().siblings().eq(1).text()
		localStorage.setItem('myApplicationSelectPlacement', appName)
		return window.location.href = 'placement.html'
	})

	$(document).on("click", ".applicationDelete", function (e) {
		e.preventDefault();
		var appId = $(this).parent().siblings().eq(0).text()
		swal({
			title: "Are You Sure?",
			text: "You won't be able to recover the application after removing it.",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "No, Cancel!",
			closeOnConfirm: false,
			closeOnCancel: true
		}, function (isConfirm) {
			if (isConfirm) {
				var applicationURLWithAT = wrapAccessToken(publisher_url + 'clients/' + userId + '/applications/' + appId, publisherAccessToken)
				$.ajax({
					url: applicationURLWithAT,
					type: "DELETE",
					success: function (applicationResult) {
						swal("Deleted!", "Your application successfuly has been deleted.", "success");
						getAllApplications()
					},
					error: function (xhr, status, error) {
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
			}
		});

	})

	$("#myApplicationsSearch").click(function (e) {
		e.preventDefault();
		var status = [],
			os = []
		if ($('#myApplicationsStatus').val())
			status = $('#myApplicationsStatus').val()
		if ($('#myApplicationsOSSelect').val())
			os = $('#myApplicationsOSSelect').val()

		var limit = $('#myApplicationsLimit').val()

		var filter = {}
		if (status.length > 0 || os.length > 0) {
			filter.where = {}
			filter.where.and = []
			if (status.length > 0)
				filter.where.and.push({
					'status': {
						'inq': status
					}
				})
			if (os.length > 0)
				filter.where.and.push({
					'operatingSystem': {
						'inq': os
					}
				})
		}
		filter.limit = limit

		var appURLwithAT = wrapAccessToken(publisher_url + 'clients/' + userId + '/applications', publisherAccessToken)
		var appURL = wrapFilter(appURLwithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: appURL,
			type: "GET",
			success: function (appResult) {
				fillTable(appResult)
				$('.page-loader-wrapper').fadeOut();
			},
			error: function (xhr, status, error) {
				$('.page-loader-wrapper').fadeOut();
				alert(xhr.responseText);
			}
		});
	})

	$("#newApplicationAddApplication").click(function (e) {
		e.preventDefault();
		if (!$('#newApplicationName').val() || !$('#newApplicationOSSelect').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#newApplicationName').val(),
			operatingSystem: $('#newApplicationOSSelect').find('option:selected').text()
		}
		var appURL = wrapAccessToken(publisher_url + 'clients/' + userId + '/applications', publisherAccessToken);
		$.ajax({
			url: appURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "POST",
			success: function (appResult) {
				getAllApplications()
				newApplicationId = appResult.id
				swal("Congrates!", "You have successfuly created an application. Lets go for adding placement.", "success");
			},
			error: function (xhr, status, error) {
				swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
				alert(xhr.responseText);
			}
		});
	})

	$("#newApplicationAddPlacement").click(function (e) {
		e.preventDefault();
		if (!newApplicationId)
			return swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
		localStorage.setItem('newCreatedApplication', newApplicationId)
		return window.location.href = 'placement.html#addPlacement'
	})

	$("#editApplicationSave").click(function (e) {
		e.preventDefault();
		var appName = $('#editApplicationSelect').find('option:selected').text()
		var appId
		for (var i = 0; clientApplicationInstance.applications.length; i++)
			if (clientApplicationInstance.applications[i].name === appName)
				appId = clientApplicationInstance.applications[i].id
		if (!appName || !appId || !$('#editApplicationName').val() || !$('#editApplicationStatusSelect').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#editApplicationName').val(),
			status: $('#editApplicationStatusSelect').val().find('option:selected').text()
		}
		var appURL = wrapAccessToken(publisher_url + 'clients/' + userId + '/applications/' + appId, publisherAccessToken);
		$.ajax({
			url: appURL,
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (appResult) {
				getAllApplications()
				swal("Congrates!", "You have successfuly edited an application.", "success");
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

});