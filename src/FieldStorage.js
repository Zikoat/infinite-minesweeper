import Field from "./Field.js";
import Cell from "./Cell.js";
import {Chunk} from "./Chunk.js";
import {CHUNK_SIZE} from "./Chunk.js";

export default class FieldStorage {
	static save(field, id) { // saves a Field
		const compressedField = FieldStorage.compress(field);
		localStorage.setItem(id, compressedField);
		// console.log(`saved: ${compressedField}`);
	}
	static load(id) { // returns a Field
		const compressedField = localStorage.getItem(id);
		const field = FieldStorage.decompress(compressedField);
		return field;
	}
	static registerAutoSave(field, saveName) {
		let timeSinceLastSave = 0;
		let lastInteractionTime = Date.now();
		FieldStorage.timerID = 0;

		field.on("cellChanged", ()=>{
			console.log(FieldStorage.timerID);

			clearTimeout(FieldStorage.timerID);
			FieldStorage.timerID = setTimeout(()=>{
				console.log("trying to save");
				FieldStorage.save(field, saveName);
			}, 1000);
		});

	}
	static compress(field) { // returns JSON string;
		const stringifiedField = JSON.stringify(field);
		// FieldStorage.logStats(field, stringifiedField);

		return stringifiedField;
	}
	static decompress(compressedField) {
		// when stringifying, we have changed the class into an object, and we 
		// need to recreate the class from the data
		let recoveredField = JSON.parse(compressedField);
		let field = new Field();
		
		for (const property in recoveredField) {
			field[property] = recoveredField[property];	
		}
		console.log(field.pristine);
		for (const row in recoveredField.field) {
			for (const column in recoveredField.field[row]) {
				const recoveredChunk = recoveredField.field[row][column];
				let chunk = new Chunk(parseInt(row), parseInt(column), field);
				for (const row1 in recoveredField.field[row][column].cells) {
					for (const column1 in recoveredField.field[row][column].cells[row1]) {
						const recoveredCell = recoveredField.field[row][column].cells[row1][column1];
						let cell = new Cell(parseInt(row1)+parseInt(row)*CHUNK_SIZE, parseInt(column1)+parseInt(column)*CHUNK_SIZE, field);
				

						cell.isOpen = (recoveredCell.charAt(0) == true);
						const isMine = recoveredCell.charAt(1);
						cell.isMine = isMine == "2"?undefined:isMine == "1"?true:false;
						cell.isFlagged = (recoveredCell.charAt(2) == true);
						chunk.cells[row1][column1] = cell;
					}
				}
				field.field[row][column] = chunk;
			}
		}

		return field;
	}
	static logStats(field, string) {
		const cellsCount = field.getAll().length;
		const compressedByteCount = unescape(encodeURI(string)).length;
		const ratio = compressedByteCount / cellsCount;
		console.log(`saved ${compressedByteCount} bytes with a compression ratio of ${ratio.toPrecision(5)} bytes/cell`);
		//console.log(string);
	}
}