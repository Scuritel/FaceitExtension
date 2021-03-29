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
const nameToLocal = (name) => {
	let l;
	switch (name) {
		case "k/d":
			l = 'c2';
			break;
		case "k/r":
			l = 'c3';
			break;
		case "kills":
			l = 'i6';
			break;
		case "assists":
			l = 'i7';
			break;
		case "deaths":
			l = 'i8';
			break;
		case "headshots":
			l = 'i13';
			break;
		case "headshot %":
			l = 'c4';
			break;
		case "mvps":
			l = 'i9';
			break;
		case "triple kills":
			l = 'i14';
			break;
		case "quadro kills":
			l = 'i15';
			break;
		case "aces":
			l = 'i16';
			break;
		case "all":
			break;
		default:
			console.log(name);
			throw "Oh fuck, here we go again"
			break;
	}
	return l;
}
const localToName = (l) => {
	const names = $(".name").map((i,x)=>x.innerText);
	return names.filter((i,x)=>nameToLocal(x)==l)[0];
}
function updateLocal() {
	chrome.storage.sync.get(
		Object.keys(local), 
		(r) => r && !Object.keys(r).forEach(x=>local[x]=r[x]) && updateCheckboxes() && console.log("All locals set")
	);
}
function updateStorage() {
	chrome.storage.sync.set(local, function() {
		console.log('All storage set');
		chrome.storage.sync.get(Object.keys(local), (r)=>console.log(r));
	});
}
function updateCheckboxes() {
	const rows = $("tr.rstat");
	for (let i = 0; i < rows.length; i++) {
		let r = $(rows[i]);
		
		let inp = r.find("input");
		let n = r.find(".name");
		let t = r.find(".tag");
		let l = nameToLocal(n.text());
		if (l) {
			inp[0].checked = local[l][0];
			t.text(local[l][1]);
		}
	}
	const all = $($("tr.rstat").filter((i,x)=>$(x).find(".name").text() === "all")[0]);
	if (Object.values(local).every(x=>x[0])) {
		all.find("input")[0].checked = true;
		all.find("input")[0].indeterminate = false;
	}
	else if (Object.values(local).some(x=>x[0])) {
		all.find("input")[0].checked = false;
		all.find("input")[0].indeterminate = true;
	}
	else if (!Object.values(local).some(x=>x[0])) {
		all.find("input")[0].checked = false;
		all.find("input")[0].indeterminate = false;
	}
	return true;
}

$(".rstat>input").on('click', (e)=>{
	//console.log(e)
	const parent = $(e.target.parentElement.parentElement);
	const active = e.target.checked;
	const name = parent.find(".name").text();
	const tag = parent.find(".tag").text();
	
	if (name === "all") {
		let k = Object.keys(local);
		for(let i = 0; i < k.length; i++) {
			local[k[i]][0]=active;
			local[k[i]][1]=$(".name").filter((j,x)=>x.innerText==localToName(k[i])).parent().find(".tag").text();
		}
		updateCheckboxes();
	}
	else {
		const l = nameToLocal(name);
		local[l][0] = active;
		local[l][1] = tag;
	}
	console.log(local);
	console.log(name);
	updateCheckboxes();
	updateStorage();
})
updateLocal();console.log(local);