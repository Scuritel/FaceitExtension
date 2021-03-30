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

const getColumns = () => 
	Object.keys(local).filter(x=>local[x][0]);