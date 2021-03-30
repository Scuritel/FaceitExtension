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

const updateTable = () => 
	updateLocal(() => addStatsToTable(matches, getColumns()));
