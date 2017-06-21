function initSparkline() {
    $(".sparkline").each(function () {
        var $this = $(this);
        $this.sparkline('html', $this.data());
    });
}

function initVectorMap() {
    $('#world-map-markers').vectorMap({
        map: 'world_mill_en',
        normalizeFunction: 'polynomial',
        hoverOpacity: 0.7,
        hoverColor: false,
        zoomOnScroll: false,
        backgroundColor: 'transparent',
        regionStyle: {
            initial: {
                fill: 'rgba(210, 214, 222, 1)',
                "fill-opacity": 1,
                stroke: 'none',
                "stroke-width": 0,
                "stroke-opacity": 1
            },
            hover: {
                "fill-opacity": 0.7,
                cursor: 'pointer'
            },
            selected: {
                fill: 'yellow'
            },
            selectedHover: {}
        },
        markerStyle: {
            initial: {
                fill: '#009688',
                stroke: '#000'
            }
        },
        markers: [
            { latLng: [41.90, 12.45], name: 'Vatican City' },
            { latLng: [43.73, 7.41], name: 'Monaco' },
            { latLng: [-0.52, 166.93], name: 'Nauru' },
            { latLng: [-8.51, 179.21], name: 'Tuvalu' },
            { latLng: [43.93, 12.46], name: 'San Marino' },
            { latLng: [47.14, 9.52], name: 'Liechtenstein' },
            { latLng: [7.11, 171.06], name: 'Marshall Islands' },
            { latLng: [17.3, -62.73], name: 'Saint Kitts and Nevis' },
            { latLng: [3.2, 73.22], name: 'Maldives' },
            { latLng: [35.88, 14.5], name: 'Malta' },
            { latLng: [12.05, -61.75], name: 'Grenada' },
            { latLng: [13.16, -61.23], name: 'Saint Vincent and the Grenadines' },
            { latLng: [13.16, -59.55], name: 'Barbados' },
            { latLng: [17.11, -61.85], name: 'Antigua and Barbuda' },
            { latLng: [-4.61, 55.45], name: 'Seychelles' },
            { latLng: [7.35, 134.46], name: 'Palau' },
            { latLng: [42.5, 1.51], name: 'Andorra' }
        ]
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

var announcer_url = "http://127.0.0.1:3000/api/";
var coreEngine_url = "http://127.0.0.1:3015/api/";

$(document).ready(function () {
    var nowTime = Math.floor((new Date).getTime())
    var todayTime = nowTime - 86400000
    var yesterdayTime = todayTime - 86400000
    var lastWeekTime = nowTime - 604800000

    var userId, serviceAccessToken, coreAccessToken
    if(localStorage.getItem('userId'))
		userId = localStorage.getItem('userId')
    else
		window.location.href = '../../../pages/AAA/sign-in.html';
    if(localStorage.getItem('serviceAccessToken'))
      	serviceAccessToken = localStorage.getItem('serviceAccessToken')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';
    if(localStorage.getItem('coreAccessToken'))
      	coreAccessToken = localStorage.getItem('coreAccessToken')
	else
		window.location.href = '../../../pages/AAA/sign-in.html';

	var accountURLWithAT = wrapAccessToken(announcer_url + 'clients/' + userId, serviceAccessToken)
	var accountURL = wrapFilter(accountURLWithAT,'{"include":["announcerAccount", "campaigns"]}')
	$.ajax({
		url: accountURL,
		type: "GET",
		success: function (accountResult) {
            localStorage.setItem('announcerCompanyName', accountResult.companyName);
            localStorage.setItem('announcerEmail', accountResult.email);
			var subcampaignURLWithAT = wrapAccessToken(announcer_url + 'subcampaigns/getAllSubcampaigns?accountHashId=' + userId, serviceAccessToken)
            var subcampaignFilterURL = wrapFilter(subcampaignURLWithAT, JSON.stringify({'where':{'clientId': userId}, 'fields': {'settingModel': false}}))
			$.ajax({
				url: subcampaignFilterURL,
				type: "GET",
				success: function (subcampaignResult) {
                    var statisticsURLWithAT = wrapAccessToken(coreEngine_url + 'statistics/getAllStatistics?accountHashId=' + userId, coreAccessToken)
                    $.ajax({
                        url: statisticsURLWithAT,
                        type: "GET",
                        success: function (statisticsResult) {
                            var totalCamps = 0, createdCamps = 0, approvedCamps = 0, startedCamps = 0, finishedCamps = 0, suspendedCamps = 0;
                            var totalSubcamps = 0, createdSubcamps = 0, approvedSubcamps = 0, startedSubcamps = 0, finishedSubcamps = 0, suspendedSubcamps = 0;
                            var todayClicks = 0, yesterdayClicks = 0, lastWeekClicks = 0;
                            var clicks = 0, impressions = 0, reports = 0, remBudget = 0;

                            totalCamps = accountResult.campaigns.length
                            for (var i = 0; i < totalCamps; i++) {
                                if (accountResult.campaigns[i].status == 'Created')
                                    createdCamps++
                                else if (accountResult.campaigns[i].status == 'Approved')
                                    approvedCamps++
                                else if (accountResult.campaigns[i].status == 'Started')
                                    startedCamps++
                                else if (accountResult.campaigns[i].status == 'Finished')
                                    finishedCamps++
                                else if (accountResult.campaigns[i].status == 'Suspended')
                                    suspendedCamps++
                            }

                            totalSubcamps = subcampaignResult.length
                            for (var i = 0; i < totalSubcamps; i++) {
                                if (subcampaignResult[i].status == 'Created')
                                    createdSubcamps++
                                else if (subcampaignResult[i].status == 'Approved')
                                    approvedSubcamps++
                                else if (subcampaignResult[i].status == 'Started')
                                    startedSubcamps++
                                else if (subcampaignResult[i].status == 'Finished')
                                    finishedSubcamps++
                                else if (subcampaignResult[i].status == 'Suspended')
                                    suspendedSubcamps++
                            }

                            clicks = statisticsResult.click.length
                            impressions = statisticsResult.view.length
                            reports = statisticsResult.report.length
                            remBudget = accountResult.announcerAccount.budget

                            for (var i = 0; i < statisticsResult.click.length; i++) {
                                if (statisticsResult.click[i].actionInfo.time < nowTime && statisticsResult.click[i].actionInfo.time > todayTime)
                                    todayClicks++
                                if (statisticsResult.click[i].actionInfo.time < todayTime && statisticsResult.click[i].actionInfo.time > yesterdayTime)
                                    yesterdayClicks++
                                if (statisticsResult.click[i].actionInfo.time < nowTime && statisticsResult.click[i].actionInfo.time > lastWeekTime)
                                    lastWeekClicks++
                            }

                            $("#today_clicks").html(todayClicks);
                            $("#yesterday_clicks").html(yesterdayClicks);
                            $("#last_week_clicks").html(lastWeekClicks);

                            $("#total_camps").html(totalCamps);
                            $("#created_camps").html(createdCamps);
                            $("#approved_camps").html(approvedCamps);
                            $("#started_camps").html(startedCamps);
                            $("#finished_camps").html(finishedCamps);
                            $("#suspended_camps").html(suspendedCamps);

                            $("#total_subcamps").html(totalSubcamps);
                            $("#created_subcamps").html(createdSubcamps);
                            $("#approved_subcamps").html(approvedSubcamps);
                            $("#started_subcamps").html(startedSubcamps);
                            $("#finished_subcamps").html(finishedSubcamps);
                            $("#suspended_subcamps").html(suspendedSubcamps);

                            $("#announcerUsername").html(accountResult.companyName);
                            $("#announcerEmail").html(accountResult.email);

                            $("#dashboard_click").attr({"data-to" : clicks});
                            $("#dashboard_view").attr({"data-to" : impressions});
                            $("#dashboard_report").attr({"data-to" : reports});
                            $("#dashboard_budget").attr({"data-to" : remBudget});

                            var sp = '0,' + lastWeekClicks + ',' + yesterdayClicks + ',' + todayClicks
                            $("#sparkData").html(sp);

                            $('.page-loader-wrapper').fadeOut();
                            $('.count-to').countTo();
                            initSparkline();
                            initVectorMap();
                        },
                        error: function(xhr, status, error) {
                            $('.page-loader-wrapper').fadeOut();
                            alert(xhr.responseText);
                        }
                    });
				},
				error: function(xhr, status, error) {
					$('.page-loader-wrapper').fadeOut();
					alert(xhr.responseText);
				}
			});
		},
		error: function(xhr, status, error) {
			$('.page-loader-wrapper').fadeOut();
			alert(xhr.responseText);
		}
	});
});