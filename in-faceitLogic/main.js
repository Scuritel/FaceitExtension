var nick, profileInfo, guid, 
	lifetime, matchesCount, matches, 
	normalizedMatches, monthlyData, dailyData;
var local = {
	'c2':[false,'kd'],
	'c3':[false,'kr'],
	'i6':[false,'k'],
	'i7':[false,'a'],
	'i8':[false,'d'],
	'i13':[false,'h'],
	'c4':[false,'hp'],
	'i9':[false,'mvp'],
	'i14':[false,'tk'],
	'i15':[false,'qk'],
	'i16':[false,'pk']
}

const updateLocal = (callback) => {
	try {
		chrome.storage.sync.get(
			Object.keys(local), 
			(r) => r && 
				!Object.keys(r).forEach(x=>local[x]=r[x]) && 
				callback()
		);
	}
	catch {
		document.location.reload();
	}
}

const getData = async () => {
	nick = await getNick();
	profileInfo = await getProfileInfoByNick(nick);
	guid = getGuidByProfileInfo(profileInfo);
	lifetime = await getLifetimeStats(guid);
	matchesCount = getMatchesCount(lifetime);
	matches = await getMatchStats(guid, matchesCount);

	normalizedMatches = normalizeMatchesData(matches);
	monthlyData = toMonthlyData(normalizedMatches);
	dailyData = toDailyData(normalizedMatches);

	console.log(nick,profileInfo,guid,
		lifetime,matchesCount,matches);
	console.log(local);

	console.log(normalizedMatches, monthlyData, dailyData);
}

const removeAllListeners = (element) => {
	element = $(element)[0];
	elClone = element.cloneNode(true);
	element.parentNode.replaceChild(elClone, element);
}

const setManageElements = () => {
	const updGraph = () => setTimeout(getGraphParams, 150);
	removeAllListeners($("select"));
	removeAllListeners($(".performance-stats a"));
	$("select").on('click', getGraphParams);
	$(".performance-stats a").on('click', getGraphParams);
}

const onStart = async () => {
	await getData();
	setManageElements()

	makeGraphByDataAndType(normalizedMatches, graphTypes[0]);

	setInterval(updateTable, 500);
}

const recWait = () => 
	!$("thead").length ? 
		!console.log("I'm waiting") && setTimeout(recWait,500) : 
		updateLocal(onStart);
recWait();