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
var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var clientInstance;

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

	getAllUsers();
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

	function getAllUsers() {
		var accountURLWithAT = wrapAccessToken(coreEngine_url + 'clients', coreAccessToken)
		$.ajax({
			url: accountURLWithAT,
			type: "GET",
			success: function (accountResult) {
				clientInstance = accountResult
				fillTable(accountResult)
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

	function fillTable(usersArray) {
		$('#tab_logic>tbody').empty()
		for (var i = 0; i < usersArray.length; i++) {
			var statusColor
			if (usersArray[i].emailVerified == true)
				statusColor = 'bg-green'
			else if (usersArray[i].emailVerified == false)
				statusColor = 'bg-deep-orange'

			var str = ''
			if (usersArray[i].clientType) {
				if (usersArray[i].clientType[0])
					str += usersArray[i].clientType[0]
				if (usersArray[i].clientType[1])
					str += '<br>' + usersArray[i].clientType[1]
			}
			if (!str)
				str = 'System'

			$('#tab_logic').append('<tr id="addr' + (i) + '"></tr>');
			$('#addr' + i).html(
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + usersArray[i].id + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + usersArray[i].username + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + usersArray[i].email + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + usersArray[i].companyName + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + dateConvertor(usersArray[i].time) + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + usersArray[i].registrationCountry + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;">' + str + '</td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 5%;"><span class="label font-13 ' + statusColor + '">' + usersArray[i].emailVerified.toString() + '</span></td>' +
				'<td align="center" style="vertical-align: middle; white-space: nowrap; width: 1%;">' +
				'<button type="button" class="userEdit m-l-5 m-r-5 btn bg-green waves-effect"><i class="material-icons">mode_edit</i></button>' +
				'<button type="button" class="userDelete m-l-5 m-r-5 btn bg-red waves-effect"><i class="material-icons">clear</i></button>' +
				'</td>'
			);
		}
		$('.js-basic-example').DataTable();
	}

	function tabHandler(e) {
		if ($(e.target).attr('id') === 'nav1') {
			$("#generalInfo").show();
			$("#announcerInfo").hide();
			$("#publisherInfo").hide();
		} else if ($(e.target).attr('id') === 'nav2') {
			$("#generalInfo").hide();
			$("#announcerInfo").show();
			$("#publisherInfo").hide();
		} else if ($(e.target).attr('id') === 'nav3') {
			$("#generalInfo").hide();
			$("#announcerInfo").hide();
			$("#publisherInfo").show();
		}
	}

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		tabHandler(e)
	});

	$(document).on("click", ".userEdit", function (e) {
		e.preventDefault();
		var userId = $(this).parent().siblings().eq(0).text()
		var model
		for (var i = 0; i < clientInstance.length; i++) {
			if (clientInstance[i].id === userId) {
				$("#myInfoID").val(userId);
				$("#myInfoUsername").val(clientInstance[i].username);
				$("#myInfoEmail").val(clientInstance[i].email);
				$("#myInfoCompany").val(clientInstance[i].companyName);
				$("#myInfoIP").val(clientInstance[i].registrationIPAddress);
				$("#myInfoVerify").selectpicker('val', clientInstance[i].emailVerified.toString());
				$("#myInfoCountry").selectpicker('val', clientInstance[i].registrationCountry);
				if (clientInstance[i].announcerAccountModel) {
					$("#myInfoAnnouncerAccountrType").selectpicker('val', clientInstance[i].announcerAccountModel.type);
					$("#myInfoAnnouncerBudget").val(Number(clientInstance[i].announcerAccountModel.budget));
					$("#myInfoPublisherAccountrType").selectpicker('val', clientInstance[i].publisherAccountModel.type);
					$("#myInfoPublisherCredit").val(Number(clientInstance[i].publisherAccountModel.credit));
				}
				break
			}
		}
		$('#defaultModal .modal-content').removeAttr('class').addClass('modal-content');
		$("#generalInfo").show();
		$("#announcerInfo").hide();
		$("#publisherInfo").hide();
		$('#defaultModal').modal('show');
	})

	$(document).on("click", ".userDelete", function (e) {
		e.preventDefault();
		NProgress.start();
		var userId = $(this).parent().siblings().eq(0).text()
		swal({
			title: "Are You Sure?",
			text: "You won't be able to recover the user after removing it.",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "No, Cancel!",
			closeOnConfirm: false,
			closeOnCancel: true
		}, function (isConfirm) {
			if (isConfirm) {
				var accountURLWithAT = wrapAccessToken(coreEngine_url + 'clients/' + userId, coreAccessToken)
				$.ajax({
					url: accountURLWithAT,
					type: "DELETE",
					success: function (accountResult) {
						swal("Deleted!", "Your user successfuly has been deleted.", "success");
						getAllUsers()
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

	$("#myUsersSearch").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var userType = [],
			verify = [],
			country = [],
			username, email, companyName,
			beginningTime, endingTime, limit

		if ($('#myUsersType').val())
			userType = $('#myUsersType').val()
		if ($('#myUsersVerify').val())
			verify = $('#myUsersVerify').val()
		if ($('#myUsersCountry').val())
			country = $('#myUsersCountry').find('option:selected').map(function () {
				return this.value
			}).get()

		if ($('#myUsersUsername').val())
			username = $('#myUsersUsername').val()
		if ($('#myUsersEmail').val())
			email = $('#myUsersEmail').val()
		if ($('#myUsersCompany').val())
			companyName = $('#myUsersCompany').val()

		if ($('#myUsersBeginningTime').val())
			beginningTime = timeConvertor($('#myUsersBeginningTime').val())

		if ($('#myUsersEndingTime').val())
			endingTime = timeConvertor($('#myUsersEndingTime').val())

		var limit = $('#myUsersLimit').val()

		var filter = {}
		if (userType.length > 0 || verify.length > 0 || country.length > 0 || username || email || companyName || beginningTime || endingTime) {
			filter.where = {}
			filter.where.and = []
			if (userType.length > 0)
				filter.where.and.push({
					'clientType': {
						'inq': userType
					}
				})
			if (verify.length > 0)
				filter.where.and.push({
					'emailVerified': {
						'inq': verify
					}
				})
			if (country.length > 0)
				filter.where.and.push({
					'registrationCountry': {
						'inq': country
					}
				})
			if (username)
				filter.where.and.push({
					'username': {
						'like': username
					}
				})
			if (email)
				filter.where.and.push({
					'email': {
						'like': email
					}
				})
			if (companyName)
				filter.where.and.push({
					'companyName': {
						'like': companyName
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

		var accountURLwithAT = wrapAccessToken(coreEngine_url + 'clients/', coreAccessToken)
		var accountURL = wrapFilter(accountURLwithAT, JSON.stringify(filter))
		$('.page-loader-wrapper').fadeIn();
		$.ajax({
			url: accountURL,
			type: "GET",
			success: function (accountResult) {
				fillTable(accountResult)
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

	$("#myInfoGeneralSearch").click(function (e) {
		e.preventDefault();
		NProgress.start();
		var userId = $('#myInfoID').val()
		if (!userId || !$('#myInfoAnnouncerAccountrType').val() || !$('#myInfoAnnouncerBudget').val() || !$('#myInfoPublisherAccountrType').val() || !$('#myInfoPublisherCredit').val()) {
			NProgress.done();
			return swal("Oops!", "You should enter required field of prepared form.", "warning");
		}

		var announcerData = {
			type: $('#myInfoAnnouncerAccountrType').val(),
			budget: Number($('#myInfoAnnouncerBudget').val())
		}
		var publisherData = {
			type: $('#myInfoPublisherAccountrType').val(),
			credit: Number($('#myInfoPublisherCredit').val())
		}
		var announcerURL = wrapAccessToken(announcer_url + 'clients/' + userId + '/announcerAccount', announcerAccessToken);
		$.ajax({
			url: announcerURL,
			data: JSON.stringify(announcerData),
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			type: "PUT",
			success: function (announcerResult) {
				var publisherURL = wrapAccessToken(publisher_url + 'clients/' + userId + '/pubisherAccount', publisherAccessToken);
				$.ajax({
					url: publisherURL,
					data: JSON.stringify(publisherData),
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					type: "PUT",
					success: function (publisherResult) {
						getAllUsers()
						NProgress.done();
						swal("Congrates!", "You have successfuly edited an account.", "success");
					},
					error: function (xhr, status, error) {
						NProgress.done();
						swal("Oops!", "Something went wrong, Please try again somehow later.", "error");
						alert(xhr.responseText);
					}
				});
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