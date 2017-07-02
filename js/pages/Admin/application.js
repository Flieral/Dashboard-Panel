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
	var clientsArray = []
	var applicationsArray = []

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
		for (var i = 0; i < applicationsArray.length; i++) {
			if (applicationsArray[i].name === selected) {
				$("#editApplicationName").val(applicationsArray[i].name)
				$("#editApplicationStatusSelect").selectpicker('val', applicationsArray[i].status)
				break
			}
		}
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#myApplications").show();
			$("#editApplication").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			if (localStorage.getItem('editableApplicationName')) {
				var appName = localStorage.getItem('editableApplicationName')
				$("#editApplicationSelect").selectpicker('val', appName).selectpicker('refresh')
				fillEditApplicationFields(appName);
				localStorage.removeItem('editableApplicationName')
			}
			$("#myApplications").hide();
			$("#editApplication").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	if (!window.location.hash) {
		$("#myApplications").show();
		$("#editApplication").hide();
	} else if (window.location.hash === '#editApplication')
		$('.nav-tabs a[id="nav2"]').tab('show');
	else if (window.location.hash === '#myApplications')
		$('.nav-tabs a[id="nav1"]').tab('show');

	$('#editApplicationSelect').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
		var selected = $(this).find('option').eq(clickedIndex).text()
		fillEditApplicationFields(selected)
	});

	function getAllApplications() {
		var accountURLWithAT = wrapAccessToken(publisher_url + 'clients', publisherAccessToken)
		var accountURL = wrapFilter(accountURLWithAT, '{"include":["applications"]}')
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				$('#editApplicationSelect').find('option').remove()
				$('#myApplicationsClients').find('option').remove()
				clientApplicationInstance = accountResult
				for (var j = 0; j < accountResult.length; j++) {
					for (var i = 0; i < accountResult[j].applications.length; i++) {
						$('#editApplicationSelect').append($('<option>', {
							value: accountResult[j].applications[i].id,
							text: accountResult[j].applications[i].name
						})).selectpicker('refresh');
						applicationsArray.push(accountResult[j].applications[i])
					}
					clientsArray.push(accountResult[j])
					$('#myApplicationsClients').append($('<option>', {
						value: accountResult[j].id,
						text: accountResult[j].username
					})).selectpicker('refresh');					
				}

				$('#editApplicationSelect').trigger("chosen:updated")
				$('#myApplicationsClients').trigger("chosen:updated")

				fillTable(applicationsArray)

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

	function fillTable(applicationsArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < applicationsArray.length; i++) {
			var statusColor
			if (applicationsArray[i].status === 'Enable') statusColor = 'bg-blue'
			else if (applicationsArray[i].status === 'Disable') statusColor = 'bg-deep-orange'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + applicationsArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + applicationsArray[i].clientId + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 10%;">' + applicationsArray[i].name + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + applicationsArray[i].operatingSystem + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">$' + applicationsArray[i].credit + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + applicationsArray[i].status + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="applicationEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="applicationDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	$(document).on("click", ".applicationEdit", function (e) {
		e.preventDefault();
		var appName = $(this).parent().siblings().eq(2).text()
		localStorage.setItem('editableApplicationName', appName)
		$('.nav-tabs a[id="nav2"]').tab('show');
	})

	$(document).on("click", ".applicationDelete", function (e) {
		e.preventDefault();
		NProgress.start();
		var appId = $(this).parent().siblings().eq(0).text()
		var userId = $(this).parent().siblings().eq(1).text()
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

	$("#myApplicationsSearch").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var status = [],
			clients = [],
			os = []
		if ($('#myApplicationsStatus').val())
			status = $('#myApplicationsStatus').val()
		if ($('#myApplicationsOSSelect').val())
			os = $('#myApplicationsOSSelect').val()
		if ($('#myApplicationsClients').val())
			clients = $('#myApplicationsClients').val()

		var limit = $('#myApplicationsLimit').val()

		var filter = {}
		if (status.length > 0 || os.length > 0 || clients.length > 0) {
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
			if (clients.length > 0)
				filter.where.and.push({
					'clientId': {
						'inq': clients
					}
				})
		}
		filter.limit = limit

		var appURLwithAT = wrapAccessToken(publisher_url + 'applications', publisherAccessToken)
		var appURL = wrapFilter(appURLwithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: appURL,
			type: "GET",
			success: function (appResult) {
				fillTable(appResult)
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

	$("#editApplicationSave").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var appName = $('#editApplicationSelect').find('option:selected').text()
		var appId, userId
		for (var i = 0; i < applicationsArray.length; i++)
			if (applicationsArray[i].name === appName) {
				appId = applicationsArray[i].id
				userId = applicationsArray[i].clientId
				break
			}
		if (!appName || !appId || !$('#editApplicationName').val() || !$('#editApplicationStatusSelect').find('option:selected').text())
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		var data = {
			name: $('#editApplicationName').val(),
			status: $('#editApplicationStatusSelect').find('option:selected').text()
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
				NProgress.done();
				swal("Congrates!", "You have successfuly edited an application.", "success");
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