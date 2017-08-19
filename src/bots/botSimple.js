/**
 * Created by sisc0606 on 19.08.2017.
 */
function openCellsSimple(field){
	field.getAll()
		.forEach(cell=>{
			if(
				cell.value()===
				cell.getNeighbors()
					.filter(cell2=>cell2.isFlagged)
					.length
			) cell.getNeighbors()
				.filter(cell=>!cell.isFlagged)
				.forEach(cell=>cell.open());
		});
}
function flagCellsSimple(field){
	field.getAll()
		.forEach(cell=>{
			let neighbors = cell.getNeighbors();
			let closedNeighbors = neighbors.filter(cell=>!cell.isOpen);
			if(cell.value() === closedNeighbors.length){
				closedNeighbors.forEach(cell=>cell.flag());
			}
		});
}
export default function runBotSimple(field){
	let steps = 0;
	let prevOpened = -1;
	while(field.getAll().filter(cell=>cell.isOpen).length!==prevOpened){
		steps++;
		prevOpened = field.getAll().filter(cell=>cell.isOpen).length;
		flagCellsSimple(field);
		openCellsSimple(field);
	}
	let all = field.getAll();
	console.log("all:", all.length);
	console.log("flags:", all.filter(cell=>cell.isFlagged).length);
	let opened = all.filter(cell=>cell.isOpen);
	console.log("opened:", opened.length);
	if(all.length-opened.length!==all.filter(cell=>!cell.isOpen).length)
		console.warn("openDiff:", all.length-opened.length-all.filter(cell=>!cell.isOpen).length);
	console.log("closed:", all.length-opened.length);
	return {steps:steps};
}