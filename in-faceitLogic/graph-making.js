//if you will change this, be sure that you need to change 
//normalizeMatchData funnction
const graphTypes = ['elo','kr','kd','hs','hs%'];

const monthNames = 
	["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", 
	  "December"];

Object.reverse = (object) => {
	var newObject = {};
	var keys = [];

	for (var key in object) {
		keys.push(key);
	}

	for (var i = keys.length - 1; i >= 0; i--) {
		var value = object[keys[i]];
		newObject[keys[i]]= value;
	}       

	return newObject;
}

const getGraphParams = (e) => {
	var el = $(e.target);
	let graphdata, graphtype;

	var gd = $("select").val();
	var gt = $(".performance-stats li.active a").text();

	if (el.val() == "") {
		if (el.find("span").length == 1) {
			el = el.find("span");
		}
		gt = el.text();
		console.log("That's type");
	}
	else {
		gd = el.val();
		gt = "Elo";
		console.log("That's data");
	}

	switch(gd) {
		case "string:match":
			graphdata = normalizedMatches;
			break;
		case "string:year":
			graphdata = monthlyData;
			break;
		case "string:month":
			graphdata = dailyData;
			break;
		default:
			console.log(gd);
			throw "Unknown graph data";
	}
	switch (gt) {
		case "Elo":
			graphtype = graphTypes[0];
			break;
		case "K/R Ratio":
			graphtype = graphTypes[1];
			break;
		case "K/D Ratio":
			graphtype = graphTypes[2];
			break;
		case "Headshots":
			graphtype = graphTypes[3];
			break;
		case "Headshots %":
			graphtype = graphTypes[4];
			break;
		default:
			console.log(gt);
			throw "Unknown graph data type";
	}
	console.log(gd, gt);
	makeGraphByDataAndType(graphdata, graphtype);
}





const normalizeMatchesData = (data) => {
	var newData = {}
	for (let i = 0; i < data.length;i++) {
		let match = data[i];
		
		newData[match.date] = {};
		newData[match.date][graphTypes[0]] = +match.elo;
		newData[match.date][graphTypes[1]] = +match.c3;
		newData[match.date][graphTypes[2]] = +match.c2;
		newData[match.date][graphTypes[3]] = +match.i13;
		newData[match.date][graphTypes[4]] = +match.c4;
	}
	return newData;
}

const averageData = (currentData) => {
	let kcd = Object.keys(currentData);
	let avgData = {};
	if (kcd.length > 0) {
		avgData = currentData[kcd[0]];
		let k = Object.keys(avgData);
		for (let j = 1; j < kcd.length; j++) {
			for (let k = 0; k < k.length;k++) {
				avgData[k] += currentData[kcd[j]][k];
			}
		}
		for (let k = 0; k < k.length;k++) {
			avgData[k] /= currentData.length;
		}
	}
	return avgData;
}

//makes normalized match data monthly graph data by averaging
const toMonthlyData = (normdata) => {
	var monthData = {}
	const knd = Object.keys(normdata);

	const date = new Date();

	date.setDate(1);
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);

	date.setFullYear(date.getFullYear()-1);

	const yearAgots = date.getTime();
	var bottomLine = -1;
	var topLine = yearAgots;

	for (let i = 0; i < 12; i++) {
		if (date.getMonth() == 11) {
			date.setFullYear(date.getFullYear()+1);
		}
		let monthName = monthNames[date.getMonth()];
		date.setMonth((date.getMonth()+1) % 12);
		bottomLine = topLine;
		topLine = date.getTime();

		//console.log(monthName, topLine-bottomLine, topLine, bottomLine);
		let currentData = {};
		for (let j = 0; j < knd.length; j++) {
			if (knd[j] - bottomLine >= 0 && topLine - knd[j] > 0)
				currentData[knd[j]] = normdata[knd[j]];
		}
		//console.log(currentData);
		let avgData = averageData(currentData);

		monthData[monthName] = avgData;
	}

	return Object.reverse(monthData);
}

//makes normalized match data monthly graph data by averaging
const toDailyData = (normdata) => {
	var dailyData = {}
	const knd = Object.keys(normdata);

	const date = new Date();

	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	//date.setMonth(date.getMonth()-3);console.log(date);
	const normNow = date.getTime();

	date.setMonth(date.getMonth()-1);

	const monthAgots = date.getTime();
	var bottomLine = -1;
	var topLine = monthAgots;

	while(normNow >= date.getTime()) {
		date.setDate(date.getDate()+1);
		bottomLine = topLine;
		topLine = date.getTime();

		//console.log(monthName, topLine-bottomLine, topLine, bottomLine);
		let currentData = {};
		for (let j = 0; j < knd.length; j++) {
			if (knd[j] - bottomLine >= 0 && topLine - knd[j] > 0)
				currentData[knd[j]] = normdata[knd[j]];
		}

		let avgData = averageData(currentData);

		dailyData[bottomLine] = avgData;
	}
	return Object.reverse(dailyData);
}




//data is normalized data
//type is what kind of data graph should show (elo, kr, kd, hs, hs%)
const makeGraphByDataAndType = (data, type) => {
	if (!graphTypes.some(x=>x==type)) {
		throw "Unknown type of graph";
	}

	var k = Object.keys(data);
	if (k.length > 20) {
		let data1 = {};
		for (let i = 0; i < 15; i++) {
			data1[k[i]] = data[k[i]];
		}
		data = data1;
	}

	k = Object.keys(data);
	var graphData = {};
	var graphLabels = [];
	var validTs = k.every(x=>!isNaN(+x));

	for (let i = 0; i < k.length; i++) {
		if (validTs) {
			let datestr = (new Date(+k[i])).toLocaleDateString();
			graphLabels[i] = datestr;
		}

		graphData[k[i]] = data[k[i]][type];
	}

	if (graphLabels.length == 0) {
		//that's monthly data
		graphLabels = Object.keys(graphData);
	}
	graphLabels = graphLabels.reverse();
	var graphDataset = Object.values(graphData).reverse();
	console.log(graphLabels, graphDataset);


	makeGraphByLabelData(graphLabels, graphDataset, type);
}

var myChart;
//must get parameter as in scheme: ["June", "Today"], [156,489], "damage"
const makeGraphByLabelData = (labels, data, type) => {
	var canvas = $(".mypremium")[0];
	if (!canvas) {
		const cpar = $(".performance-stats__locked").parent();
		cpar.children().remove();
		cpar.append('<canvas class="mypremium" style="width: 100%; height:100%">'+
						'<p>Ur browser suck dick. Sorry :\(</p>'+
					'</canvas>');
		canvas = $(".mypremium")[0];
		canvas.width = cpar.width();
		canvas.height = cpar.height();
	}
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);
	if (myChart) {
		myChart.clear();
		myChart.destroy();
	}


	myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [{
				label: type,
				data: data,
				backgroundColor: '#ff222222',
				borderColor: '#ee7733dd',
				borderWidth: 1
			}]
		},
		options: {
			elements: {
				line: {
					tension: 0 // makes one broken line (remove smoothing)
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		}
	});
}