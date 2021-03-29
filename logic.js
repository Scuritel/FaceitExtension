//myid=5beab55c-6521-454c-b39d-ea077399295d
//https://api.faceit.com/stats/v1/stats/time/users/%userid/games/csgo?page=%page&size=%size
//&page is optional
//&size limit is 2000
//i17=Team Win

//elo=Elo

//m1=Matches
//m2=Wins
//m3=Kills
//m4=Deaths
//m5=Assists
//m6=MVPs
//m7=K/D Ratio
//m8=Rounds
//m9=Headshots
//m10=Triple Kills
//m11=Quadro Kills
//m12=Penta Kills
//m13=Total Headshots %
//m14=K/R Ratio
//m15=Total K/D Ratio
//m16=Total K/R Ratio
//m17=Total Headshots %
//m18=Total Headshots per Match

//k1=Average Kills
//k2=Average Deaths
//k3=Average Assists
//k4=Average MVPs
//k5=Average K/D Ratio
//k6=Win Rate %
//k7=Headshots per Match
//k8=Average Headshots %
//k9=Average K/R Ratio
//k10=Average Triple Kills
//k11=Average Quadro Kills
//k12=Average Penta Kills
//k13=Team Average K/D Ratio
//k14=Team Average K/R Ratio
//k15=Team Average Headshots %
//k16=Team Headshots per Match

//c1
//c2=K/D Ratio
//c3=K/R Ratio
//c4=Headshots %
//c5=Final Score
//c6=Team K/D Ratio
//c7=Team K/R Ratio
//c8=Team Headshots %
//c9=Team Headshots

//s0=Recent Results
//s1=Current Win Streak
//s2=Longest Win Streak

//i0=Region
//i1=Map
//i2=Winner
//i3=First Half Score
//i4=Second Half Score
//i5=Team
//i6=Kills
//i7=Assists
//i8=Deaths
//i9=MVPs
//i10=Result
//i12=Rounds
//i13=Headshots
//i14=Triple Kills
//i15=Quadro Kills
//i16=Penta Kills
//i18=Score
//i19=Overtime score

const ajaxJson = (url) => 
	$.ajax({
		url:url,
		method:'get'
	});

const getNick = () => 
	document.location.pathname.match(/\/*\/players\/([\w\d]+)\/stats\/csgo/)[1];

const getProfileInfoByNick = async (nick) => 
	(await ajaxJson("https://api.faceit.com/core/v1/nicknames/"+nick)).payload;

const getGuidByProfileInfo = (info) => 
	info.guid;

const getMatchStats = (guid, size, page = 0) => 
	ajaxJson(`https://api.faceit.com/stats/v1/stats/time/users/${guid}/games/csgo?page=${page}&size=${size}`);

const getLifetimeStats = (guid) =>
	ajaxJson(`https://api.faceit.com/stats/v1/stats/users/${guid}/games/csgo`);

const getMapStats = async (guid) =>
	(await getLifetimeStats(guid)).segments[0].segments;

const getMatchesCount = (lifetimeStats) => 
	lifetimeStats.lifetime.m1;

const addStatsToTable = (info, columns) => {
	$(".newAdded").remove();

	let mapHeader = $("th").filter((i,x)=>$(x).find("div").text()=="Map");
	for (let i = 0; i < columns.length; i++) {
		mapHeader.before(`<th class="newAdded">${local[columns[i]][1]}</th>`);
	}

	const toFill = $("tr").length-1;
	for (let i = 0; i < toFill; i++) {
		let row = $($("tr")[i+1]);
		let mapVal = row.find("td").filter((i,x)=>$(x).find("img").length);
		for (let j = 0; j < columns.length; j++) {
			mapVal.before(`<td class="newAdded">${info[i][columns[j]]}</td>`);
		}
	}
}

var nick, profileInfo, guid, lifetime, matchesCount, matches;
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

const getColumns = () => Object.keys(local).filter(x=>local[x][0]);
const updateLocal = (callback) => {
	try {
		chrome.storage.sync.get(
			Object.keys(local), 
			(r) => r && !Object.keys(r).forEach(x=>local[x]=r[x]) && callback()
		);
	}
	catch {
		document.location.reload();
	}
}
const update = () => 
	updateLocal(() => addStatsToTable(matches, getColumns()));


const onStart = async () => {
	const columns = getColumns();
	nick = await getNick();
	profileInfo = await getProfileInfoByNick(nick);
	guid = getGuidByProfileInfo(profileInfo);
	lifetime = await getLifetimeStats(guid);
	matchesCount = getMatchesCount(lifetime);
	matches = await getMatchStats(guid, matchesCount);

	console.log(nick,profileInfo,guid,lifetime,matchesCount,matches);
	console.log(local);

	setInterval(update,500);
}

const recWait = () => 
	!$("thead").length ? 
		!console.log("I'm waiting") && setTimeout(recWait,500) : 
		updateLocal(onStart);
recWait();
