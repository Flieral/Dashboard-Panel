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

var publisher_url = "http://127.0.0.1:3005/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
	var nowTime = Math.floor((new Date).getTime())
	var todayTime = nowTime - 86400000
	var yesterdayTime = todayTime - 86400000
	var lastWeekTime = nowTime - 604800000

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

	var accountURLWithAT = wrapAccessToken(publisher_url + 'clients/' + userId, publisherAccessToken)
	var accountURL = wrapFilter(accountURLWithAT, '{"include":["publisherAccount", "applications"]}')
	$.ajax({
		url: accountURL,
		type: "GET",
		success: function (accountResult) {
			localStorage.setItem('publisherCompanyName', accountResult.companyName);
			localStorage.setItem('publisherEmail', accountResult.email);
			var placementURLWithAT = wrapAccessToken(publisher_url + 'placements/getAllPlacements?accountHashId=' + userId, publisherAccessToken)
			var placementFilterURL = wrapFilter(placementURLWithAT, JSON.stringify({
				'where': {
					'clientId': userId
				}
			}))
			$.ajax({
				url: placementFilterURL,
				type: "GET",
				success: function (placementResult) {
					var statisticsURLWithAT = wrapAccessToken(coreEngine_url + 'statistics/getAllStatistics?accountHashId=' + userId, coreAccessToken)
					$.ajax({
						url: statisticsURLWithAT,
						type: "GET",
						success: function (statisticsResult) {
							var transactionURLWithAT = wrapAccessToken(coreEngine_url + 'statistics/getAllTransactions?accountHashId=' + userId + '&isAnnouncer=false', coreAccessToken)
							$.ajax({
								url: transactionURLWithAT,
								type: "GET",
								success: function (transactionResult) {

									var totalApps = 0,
										disableApps = 0,
										enableApps = 0;
									var totalPlacements = 0,
										disablePlacements = 0,
										enablePlacements = 0;
									var todayClicks = 0,
										yesterdayClicks = 0,
										lastWeekClicks = 0;
									var clicks = 0,
										impressions = 0,
										reports = 0,
										revenue = 0;
									var categorySat = 0,
										countrySat = 0,
										languageSat = 0;
									var openTransactions = 0,
										checkoutTransactions = 0;
									var donutDevice = 0,
										donutOS = 0,
										donutConnection = 0,
										donutUserLebl = 0;

									totalApps = accountResult.applications.length
									for (var i = 0; i < totalApps; i++) {
										if (accountResult.applications[i].status === 'Disable')
											disableApps++
										else if (accountResult.applications[i].status === 'Enable')
											enableApps++
									}

									totalPlacements = placementResult.length
									for (var i = 0; i < totalPlacements; i++) {
										if (placementResult[i].status === 'Disable')
											disablePlacements++
										else if (placementResult[i].status === 'Enable')
											enablePlacements++
									}

									clicks = statisticsResult.click.length
									impressions = statisticsResult.view.length
									reports = statisticsResult.report.length
									revenue = accountResult.publisherAccount.credit

									for (var i = 0; i < statisticsResult.click.length; i++) {
										if (statisticsResult.click[i].actionInfo.time < nowTime && statisticsResult.click[i].actionInfo.time > todayTime)
											todayClicks++
										if (statisticsResult.click[i].actionInfo.time < todayTime && statisticsResult.click[i].actionInfo.time > yesterdayTime)
											yesterdayClicks++
										if (statisticsResult.click[i].actionInfo.time < nowTime && statisticsResult.click[i].actionInfo.time > lastWeekTime)
											lastWeekClicks++
									}

									for (var i = 0; i < transactionResult.length; i++) {
										if (transactionResult[i].status === 'Open')
											openTransactions++
										if (transactionResult[i].status === 'Checkout')
											checkoutTransactions++
									}

									$("#userGreeting").html("Welcome, " + accountResult.username.charAt(0).toUpperCase() + accountResult.username.slice(1) + "!");

									$("#today_clicks").html(todayClicks);
									$("#yesterday_clicks").html(yesterdayClicks);
									$("#last_week_clicks").html(lastWeekClicks);

									$("#total_apps").html(totalApps);
									$("#disable_apps").html(disableApps);
									$("#enable_apps").html(enableApps);

									$("#total_placements").html(totalPlacements);
									$("#disable_placements").html(disablePlacements);
									$("#enable_placements").html(enablePlacements);

									$("#publisherUsername").html(accountResult.companyName);
									$("#publisherEmail").html(accountResult.email);

									$("#dashboard_click").attr({
										"data-to": clicks
									});
									$("#dashboard_view").attr({
										"data-to": impressions
									});
									$("#dashboard_report").attr({
										"data-to": reports
									});
									$("#dashboard_revenue").attr({
										"data-to": revenue
									});

									$("#checkoutTransactions").attr({
										"data-to": checkoutTransactions
									});
									$("#openTransactions").attr({
										"data-to": openTransactions
									});

									Morris.Donut({
											element: 'donut_device',
											data: [{
													label: 'Phone',
													value: 100
											}, {
															label: 'Tablet',
															value: 0
													}, {
															label: 'Application',
															value: 0
													}, {
															label: 'Web',
															value: 0
													}],
											colors: ['rgb(233, 30, 99)', 'rgb(0, 188, 212)', 'rgb(255, 152, 0)', 'rgb(0, 150, 136)'],
											formatter: function (y) {
													return y + '%'
											}
									});

									Morris.Donut({
											element: 'donut_os',
											data: [{
													label: 'Android',
													value: 0
											}, {
															label: 'iOS',
															value: 100
													}, {
															label: 'WP',
															value: 0
													}, {
															label: 'HTML',
															value: 0
													}, {
															label: 'Unix',
															value: 0
													}, {
															label: 'Windows',
															value: 0
													}],
											colors: ['rgb(255, 152, 0)', 'rgb(0, 150, 136)', 'rgb(233, 30, 99)', 'rgb(0, 188, 212)', 'rgb(233, 30, 99)', 'rgb(0, 188, 212)'],
											formatter: function (y) {
													return y + '%'
											}
									});

									Morris.Donut({
											element: 'donut_connection',
											data: [{
													label: 'WiFi',
													value: 100
											}, {
															label: 'Cellular',
															value: 0
													}],
											colors: ['rgb(255, 152, 0)', 'rgb(0, 188, 212)'],
											formatter: function (y) {
													return y + '%'
											}
									});

									Morris.Donut({
											element: 'donut_user',
											data: [{
													label: 'General',
													value: 0
											}, {
															label: 'Average',
															value: 100
													}, {
															label: 'Advance',
															value: 0
													}],
											colors: ['rgb(0, 150, 136)', 'rgb(0, 188, 212)', 'rgb(255, 152, 0)'],
											formatter: function (y) {
													return y + '%'
											}
									});

									$('.page-loader-wrapper').fadeOut();
									$('.count-to').countTo();

								},
								error: function (xhr, status, error) {
									$('.page-loader-wrapper').fadeOut();
									alert(xhr.responseText);
								}
							});
						},
						error: function (xhr, status, error) {
							$('.page-loader-wrapper').fadeOut();
							alert(xhr.responseText);
						}
					});
				},
				error: function (xhr, status, error) {
					$('.page-loader-wrapper').fadeOut();
					alert(xhr.responseText);
				}
			});
		},
		error: function (xhr, status, error) {
			$('.page-loader-wrapper').fadeOut();
			alert(xhr.responseText);
		}
	});

	$("#signOutButton").click(function (e) {
		e.preventDefault();
		localStorage.clear()
		return window.location.href = '../AAA/sign-in.html'
	})

	$("#checkoutRedirect").click(function (e) {
		e.preventDefault();
		return window.location.href = 'checkout.html'
	})

	$("#newApplicationRedirect").click(function (e) {
		e.preventDefault();
		return window.location.href = 'application.html#newApplication'
	})

	$("#addPlacementRedirect").click(function (e) {
		e.preventDefault();
		return window.location.href = 'placement.html#addPlacement'
	})

});