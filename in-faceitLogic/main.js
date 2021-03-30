var nick, profileInfo, guid, 
	lifetime, matchesCount, matches, 
	normalizedMatches;
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

	console.log(nick,profileInfo,guid,
		lifetime,matchesCount,matches);
	console.log(local);
}

const onStart = async () => {
	await getData();
	normalizedMatches = normalizeMatchesData(matches);
	console.log(normalizedMatches);
	var monthlyD = toMonthlyData(normalizedMatches);
	console.log(monthlyD);
	makeGraphByDataAndType(monthlyD, graphTypes[0]);
	setInterval(updateTable, 500);
}

const recWait = () => 
	!$("thead").length ? 
		!console.log("I'm waiting") && setTimeout(recWait,500) : 
		updateLocal(onStart);
recWait();