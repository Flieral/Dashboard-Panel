/*--------------------Functions------------------*/
function ajaxHelperWithNumbers(url, data, type, callback) {
	$.ajax({
		url: url,
		type: type,
		data: JSON.stringify(data),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function (result) {
			callback(null, result);
		},
		error: function (error) {
			callback(error, null);
		}
	});
}

function ajaxHelperWONumbers(url, data, type, callback) {
	$.ajax({
		url: url,
		type: type,
		data: data,
		success: function (result) {
			callback(null, result);
		},
		error: function (error) {
			callback(error, null);
		}
	});
}

function wrapAccessToken(url, accessToken) {
	if (url.indexOf('?') !== -1)
		return url + '&access_token=' + accessToken
	else
		return url + '?access_token=' + accessToken
}

function getTimeStamp(dateString) {
	var dateTimeParts = dateString.split(' ');
	var timeParts = dateTimeParts[1].split(':');
	var dateParts = dateTimeParts[0].split('-');
	var date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
	return date.getTime();
}
/*-----------------------------------------------------------------------------------------*/


/*--------------------Global Variables----------------------*/

var announcer_url = "http://127.0.0.1:3000/api/";

var types = {
	post: "POST",
	get: "GET",
	put: "PUT",
	delete: "DELETE"
}

var user1 = {
	username: 'ann1',
	email: 'ann1@yahoo.com',
	password: '123456',
	companyName: 'ann1comp',
	registrationCountry: 'RU',
	registrationIPAddress: '5.75.192.161'
};
var user2 = {
	username: 'ann2',
	email: 'ann2@yahoo.com',
	password: '123456',
	companyName: 'ann2comp',
	registrationCountry: 'RU',
	registrationIPAddress: '5.75.192.161'
};
var user3 = {
	username: 'ann3',
	email: 'ann3@yahoo.com',
	password: '123456',
	companyName: 'ann3comp',
	registrationCountry: 'RU',
	registrationIPAddress: '5.75.192.161'
};
var clientId1, clientId2, clientId3, aT1, aT2, aT3;

/*-----------------------------------------------------------------------------------------*/

/*--------------------Sign In Accounts----------------------*/
$('#signInBtn').click(function () {
	var loginURL = 'http://localhost:3000/api/clients/login';
	ajaxHelperWONumbers(loginURL, {
		username: user1.username,
		password: user1.password
	}, types.post, function (err, result1) {
		if (err)
			return console.log('\n error in login : ' + user1.username);
		clientId1 = result1.userId;
		aT1 = result1.id;
		ajaxHelperWONumbers(loginURL, {
			username: user2.username,
			password: user2.password
		}, types.post, function (err, result2) {
			if (err)
				return console.log('\n error in login : ' + user2.username);
			clientId2 = result2.userId;
			aT2 = result2.id;
			ajaxHelperWONumbers(loginURL, {
				username: user3.username,
				password: user3.password
			}, types.post, function (err, result3) {
				if (err)
					return console.log('\n error in login : ' + user2.username);
				clientId3 = result3.userId;
				aT3 = result3.id;
				console.log('success sign in for all 3!!!');
				$('#signInBtn').addClass('hidden');
				$('#addBudgetBtn').removeClass('hidden');
			});
		});
	});
});

/*-----------------------------------------------------------------------------------------*/


/*--------------------Add Budget to Accounts----------------------*/
$('#addBudgetBtn').click(function () {
	var accountURL1 = wrapAccessToken(announcer_url + 'clients/' + clientId1 + '/announcerAccount', aT1);
	ajaxHelperWithNumbers(accountURL1, {
		budget: 65000
	}, types.put, function (err, result1) {
		if (err)
			return console.log('\n error in budget for account: ' + user1.username);
		var accountURL2 = wrapAccessToken(announcer_url + 'clients/' + clientId2 + '/announcerAccount', aT2);
		ajaxHelperWithNumbers(accountURL2, {
			budget: 38000
		}, types.put, function (err, result2) {
			if (err)
				return console.log('\n error in budget for account: ' + user2.username);
			var accountURL3 = wrapAccessToken(announcer_url + 'clients/' + clientId3 + '/announcerAccount', aT3);
			ajaxHelperWithNumbers(accountURL3, {
				budget: 24000
			}, types.put, function (err, result3) {
				if (err)
					return console.log('\n error in budget for account: ' + user3.username);
				console.log('\n success in add bugdet for 3!!!');
				$('#addBudgetBtn').addClass('hidden');
				$('#createCampBtn').removeClass('hidden');
			});
		});
	});
});
/*-----------------------------------------------------------------------------------------*/

/*--------------------Create Campaigns for Accounts----------------------*/
var campaignId11, campaignId12, campaignId13, campaignId21, campaignId22, campaignId23, campaignId31, campaignId32, campaignId33;

$('#createCampBtn').click(function () {
	//first
	var createCampURL1 = wrapAccessToken(announcer_url + 'clients/' + clientId1 + '/campaigns', aT1);
	var data11 = {
		budget: 3500,
		beginningTime: getTimeStamp('25-06-2017 10:08'),
		endingTime: getTimeStamp('18-07-2017 15:40'),
		name: 'camp11',
		startStyle: 'Manual',
		mediaStyle: 'Education'
	};
	ajaxHelperWithNumbers(createCampURL1, data11, types.post, function (err, result11) {
		if (err)
			return console.log('\n error in campaign for create: ' + data11.name);
		campaignId11 = result11.id;
		var data12 = {
			budget: 7800,
			beginningTime: getTimeStamp('27-06-2017 10:08'),
			endingTime: getTimeStamp('14-07-2017 15:40'),
			name: 'camp12',
			startStyle: 'Manual',
			mediaStyle: 'Data'
		};
		ajaxHelperWithNumbers(createCampURL1, data12, types.post, function (err, result12) {
			if (err)
				return console.log('\n error in campaign for create: ' + data12.name);
			campaignId12 = result12.id;
			var data13 = {
				budget: 2200,
				beginningTime: getTimeStamp('29-06-2017 10:08'),
				endingTime: getTimeStamp('19-07-2017 12:40'),
				name: 'camp13',
				startStyle: 'Automatic',
				mediaStyle: 'Entertainment'
			};
			ajaxHelperWithNumbers(createCampURL1, data13, types.post, function (err, result13) {
				if (err)
					return console.log('\n error in campaign for create: ' + data13.name);
				campaignId13 = result13.id;
				console.log('\n success in create campaigns for account: ' + user1.username);
				//second
				var createCampURL2 = wrapAccessToken(announcer_url + 'clients/' + clientId2 + '/campaigns', aT2);
				var data21 = {
					budget: 2370,
					beginningTime: getTimeStamp('25-06-2017 10:08'),
					endingTime: getTimeStamp('18-07-2017 15:40'),
					name: 'camp21',
					startStyle: 'Manual',
					mediaStyle: 'Education'
				};
				ajaxHelperWithNumbers(createCampURL2, data21, types.post, function (err, result21) {
					if (err)
						return console.log('\n error in campaign for create: ' + data21.name);
					campaignId21 = result21.id;
					var data22 = {
						budget: 6340,
						beginningTime: getTimeStamp('27-06-2017 10:08'),
						endingTime: getTimeStamp('14-07-2017 15:40'),
						name: 'camp22',
						startStyle: 'Manual',
						mediaStyle: 'Data'
					};
					ajaxHelperWithNumbers(createCampURL2, data22, types.post, function (err, result22) {
						if (err)
							return console.log('\n error in campaign for create: ' + data22.name);
						campaignId22 = result22.id;
						var data23 = {
							budget: 9100,
							beginningTime: getTimeStamp('29-06-2017 10:08'),
							endingTime: getTimeStamp('19-07-2017 12:40'),
							name: 'camp23',
							startStyle: 'Automatic',
							mediaStyle: 'Entertainment'
						};
						ajaxHelperWithNumbers(createCampURL2, data23, types.post, function (err, result23) {
							if (err)
								return console.log('\n error in campaign for create: ' + data23.name);
							campaignId23 = result23.id;
							console.log('\n success in create campaigns for account: ' + user2.username);
							//third
							var createCampURL3 = wrapAccessToken(announcer_url + 'clients/' + clientId3 + '/campaigns', aT3);
							var data31 = {
								budget: 5250,
								beginningTime: getTimeStamp('25-06-2017 10:08'),
								endingTime: getTimeStamp('18-07-2017 15:40'),
								name: 'camp31',
								startStyle: 'Manual',
								mediaStyle: 'Education'
							};
							ajaxHelperWithNumbers(createCampURL3, data31, types.post, function (err, result31) {
								if (err)
									return console.log('\n error in campaign for create: ' + data31.name);
								campaignId31 = result31.id;
								var data32 = {
									budget: 4000,
									beginningTime: getTimeStamp('27-06-2017 10:08'),
									endingTime: getTimeStamp('14-07-2017 15:40'),
									name: 'camp32',
									startStyle: 'Manual',
									mediaStyle: 'Data'
								};
								ajaxHelperWithNumbers(createCampURL3, data32, types.post, function (err, result32) {
									if (err)
										return console.log('\n error in campaign for create: ' + data32.name);
									campaignId32 = result32.id;
									var data33 = {
										budget: 8500,
										beginningTime: getTimeStamp('29-06-2017 10:08'),
										endingTime: getTimeStamp('19-07-2017 12:40'),
										name: 'camp13',
										startStyle: 'Automatic',
										mediaStyle: 'Entertainment'
									};
									ajaxHelperWithNumbers(createCampURL3, data33, types.post, function (err, result33) {
										if (err)
											return console.log('\n error in campaign for create: ' + data33.name);
										campaignId33 = result33.id;
										console.log('\n success in create campaigns for account: ' + user3.username);
										$('#createCampBtn').addClass('hidden');
										$('#createSubcampBtn').removeClass('hidden');
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

/*-----------------------------------------------------------------------------------------*/

/*--------------------Create Subcampaigns for Campaigns----------------------*/

var subcampaignId111, subcampaignId112;
var subcampaignId121, subcampaignId122;
var subcampaignId131, subcampaignId132;
var subcampaignId211, subcampaignId212;
var subcampaignId221, subcampaignId222;
var subcampaignId231, subcampaignId232;
var subcampaignId311, subcampaignId312;
var subcampaignId321, subcampaignId322;
var subcampaignId331, subcampaignId332;
$('#createSubcampBtn').click(function () {
	//first account
	var createSubcampURL111 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId11 + '/subcampaigns', aT1);
	var createSubcampURL112 = createSubcampURL111;
	var createSubcampURL121 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId12 + '/subcampaigns', aT1);
	var createSubcampURL122 = createSubcampURL121;
	var createSubcampURL131 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId13 + '/subcampaigns', aT1);
	var createSubcampURL132 = createSubcampURL131;
	//second account
	var createSubcampURL211 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId21 + '/subcampaigns', aT2);
	var createSubcampURL212 = createSubcampURL211
	var createSubcampURL221 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId22 + '/subcampaigns', aT2);
	var createSubcampURL222 = createSubcampURL221;
	var createSubcampURL231 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId23 + '/subcampaigns', aT2);
	var createSubcampURL232 = createSubcampURL231;
	// third account
	var createSubcampURL311 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId31 + '/subcampaigns', aT3);
	var createSubcampURL312 = createSubcampURL311;
	var createSubcampURL321 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId32 + '/subcampaigns', aT3);
	var createSubcampURL322 = createSubcampURL321;
	var createSubcampURL331 = wrapAccessToken(announcer_url + 'campaigns/' + campaignId33 + '/subcampaigns', aT3);
	var createSubcampURL332 = createSubcampURL331;

	var data111 = {
		minBudget: 1300,
		name: 'subcamp111',
		style: 'Banner: Large',
		plan: 'CPV',
		price: 3
	};
	ajaxHelperWithNumbers(createSubcampURL111, data111, types.post, function (err, result111) {
		if (err)
			return console.log('\n error in subcampaign for create: ' + data111.name);
		subcampaignId111 = result111.id;
		var data112 = {
			minBudget: 1300,
			name: 'subcamp112',
			style: 'Banner: Large',
			plan: 'CPV',
			price: 3
		};
		ajaxHelperWithNumbers(createSubcampURL112, data112, types.post, function (err, result112) {
			if (err)
				return console.log('\n error in subcampaign for create: ' + data112.name);
			subcampaignId112 = result112.id;
			var data121 = {
				minBudget: 200,
				name: 'subcamp121',
				style: 'Banner: Large',
				plan: 'CPV',
				price: 3
			};
			ajaxHelperWithNumbers(createSubcampURL121, data121, types.post, function (err, result121) {
				if (err)
					return console.log('\n error in subcampaign for create: ' + data121.name);
				subcampaignId121 = result121.id;
				var data122 = {
					minBudget: 210,
					name: 'subcamp122',
					style: 'Banner: Large',
					plan: 'CPV',
					price: 3
				};
				ajaxHelperWithNumbers(createSubcampURL122, data122, types.post, function (err, result122) {
					if (err)
						return console.log('\n error in subcampaign for create: ' + data122.name);
					subcampaignId122 = result122.id;
					var data131 = {
						minBudget: 220,
						name: 'subcamp131',
						style: 'Banner: Large',
						plan: 'CPV',
						price: 3
					};
					ajaxHelperWithNumbers(createSubcampURL131, data131, types.post, function (err, result131) {
						if (err)
							return console.log('\n error in subcampaign for create: ' + data131.name);
						subcampaignId131 = result131.id;
						var data132 = {
							minBudget: 230,
							name: 'subcamp132',
							style: 'Banner: Large',
							plan: 'CPV',
							price: 3
						};
						ajaxHelperWithNumbers(createSubcampURL132, data132, types.post, function (err, result132) {
							if (err)
								return console.log('\n error in subcampaign for create: ' + data132.name);
							subcampaignId132 = result132.id;
							console.log('\n success in create subcampaigns for account: ' + user1.username)
							var data211 = {
								minBudget: 240,
								name: 'subcamp211',
								style: 'Banner: Large',
								plan: 'CPV',
								price: 3
							};
							ajaxHelperWithNumbers(createSubcampURL211, data211, types.post, function (err, result211) {
								if (err)
									return console.log('\n error in subcampaign for create: ' + data211.name);
								subcampaignId211 = result211.id;
								var data212 = {
									minBudget: 250,
									name: 'subcamp212',
									style: 'Banner: Large',
									plan: 'CPV',
									price: 3
								};
								ajaxHelperWithNumbers(createSubcampURL212, data212, types.post, function (err, result212) {
									if (err)
										return console.log('\n error in subcampaign for create: ' + data212.name);
									subcampaignId212 = result212.id;
									var data221 = {
										minBudget: 260,
										name: 'subcamp221',
										style: 'Banner: Large',
										plan: 'CPV',
										price: 3
									};
									ajaxHelperWithNumbers(createSubcampURL221, data221, types.post, function (err, result221) {
										if (err)
											return console.log('\n error in subcampaign for create: ' + data221.name);
										subcampaignId221 = result221.id;
										var data222 = {
											minBudget: 270,
											name: 'subcamp222',
											style: 'Banner: Large',
											plan: 'CPV',
											price: 3
										};
										ajaxHelperWithNumbers(createSubcampURL222, data222, types.post, function (err, result222) {
											if (err)
												return console.log('\n error in subcampaign for create: ' + data222.name);
											subcampaignId222 = result222.id;
											var data231 = {
												minBudget: 280,
												name: 'subcamp231',
												style: 'Banner: Large',
												plan: 'CPV',
												price: 3
											};
											ajaxHelperWithNumbers(createSubcampURL231, data231, types.post, function (err, result231) {
												if (err)
													return console.log('\n error in subcampaign for create: ' + data231.name);
												subcampaignId231 = result231.id;
												var data232 = {
													minBudget: 290,
													name: 'subcamp232',
													style: 'Banner: Large',
													plan: 'CPV',
													price: 3
												};
												ajaxHelperWithNumbers(createSubcampURL232, data232, types.post, function (err, result232) {
													if (err)
														return console.log('\n error in subcampaign for create: ' + data232.name);
													subcampaignId232 = result232.id;
													console.log('\n success in create subcampaigns for account: ' + user2.username)
													var data311 = {
														minBudget: 300,
														name: 'subcamp311',
														style: 'Banner: Large',
														plan: 'CPV',
														price: 3
													};
													ajaxHelperWithNumbers(createSubcampURL311, data311, types.post, function (err, result311) {
														if (err)
															return console.log('\n error in subcampaign for create: ' + data311.name);
														subcampaignId311 = result311.id;
														var data312 = {
															minBudget: 310,
															name: 'subcamp312',
															style: 'Banner: Large',
															plan: 'CPV',
															price: 3
														};
														ajaxHelperWithNumbers(createSubcampURL312, data312, types.post, function (err, result312) {
															if (err)
																return console.log('\n error in subcampaign for create: ' + data312.name);
															subcampaignId312 = result312.id;
															var data321 = {
																minBudget: 320,
																name: 'subcamp321',
																style: 'Banner: Large',
																plan: 'CPV',
																price: 3
															};
															ajaxHelperWithNumbers(createSubcampURL321, data321, types.post, function (err, result321) {
																if (err)
																	return console.log('\n error in subcampaign for create: ' + data321.name);
																subcampaignId321 = result321.id;
																var data322 = {
																	minBudget: 330,
																	name: 'subcamp322',
																	style: 'Banner: Large',
																	plan: 'CPV',
																	price: 3
																};
																ajaxHelperWithNumbers(createSubcampURL322, data322, types.post, function (err, result322) {
																	if (err)
																		return console.log('\n error in subcampaign for create: ' + data322.name);
																	subcampaignId322 = result322.id;
																	var data331 = {
																		minBudget: 340,
																		name: 'subcamp331',
																		style: 'Banner: Large',
																		plan: 'CPV',
																		price: 3
																	};
																	ajaxHelperWithNumbers(createSubcampURL331, data331, types.post, function (err, result331) {
																		if (err)
																			return console.log('\n error in subcampaign for create: ' + data331.name);
																		subcampaignId331 = result331.id;
																		var data332 = {
																			minBudget: 350,
																			name: 'subcamp332',
																			style: 'Banner: Large',
																			plan: 'CPV',
																			price: 3
																		};
																		ajaxHelperWithNumbers(createSubcampURL332, data332, types.post, function (err, result332) {
																			if (err)
																				return console.log('\n error in subcampaign for create: ' + data332.name);
																			subcampaignId332 = result332.id;
																			console.log('\n success in create subcampaigns for account: ' + user3.username);
																			console.log('\n success in create subcampaigns for All Accounts!!!');
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});
/*-----------------------------------------------------------------------------------------*/