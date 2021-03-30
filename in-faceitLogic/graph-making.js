//if you will change this, be sure that you need to change 
//normalizeMatchData funnction
const graphTypes = ['elo','kr','kd','hs','hs%'];

const monthNames = 
	["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", 
	  "December"];

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
			if (knd[j] - bottomLine >= 0 && knd[j] - topLine < 0)
				currentData[knd[j]] = normdata[knd[j]];
		}
		//console.log(currentData);
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

		monthData[monthName] = avgData;
	}

	return monthData;
}

//makes normalized match data monthly graph data by averaging
const toDailyData = (normdata) => {
	const date = new Date();
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
		type = "avg. " + type;
	}
	console.log(graphLabels, graphData);
	console.log(Object.values(graphData));


	makeGraphByLabelData(graphLabels, Object.values(graphData), type);
}

//must get parameter as in scheme: ["June", "Today"], [156,489], "damage"
const makeGraphByLabelData = (labels, data, type) => {
	const cpar = $(".performance-stats__locked").parent();
	cpar.children().remove();
	cpar.append('<canvas class="mypremium" style="width: 100%; height:100%"><p>Ur browser suck dick. Sorry :\(</p></canvas>');
	const canvas = $(".mypremium")[0];
	const width = canvas.width = cpar.width();
	const  height = canvas.height = cpar.height();

	const ctx = canvas.getContext('2d');
	var myChart = new Chart(ctx, {
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