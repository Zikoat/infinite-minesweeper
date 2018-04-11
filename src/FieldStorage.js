import Field from "./Field.js";
import Cell from "./Cell.js";

export default class FieldStorage {
	static save(field, id) { // saves a Field
		const compressedField = FieldStorage.compress(field);
		localStorage.setItem(id, compressedField);
	}
	static load(id) { // returns a Field
		const compressedField = localStorage.getItem(id);
		const field = FieldStorage.decompress(compressedField);
		return field;
	}
	static compress(field) { // returns JSON string;
		const stringifiedField = JSON.stringify(field, (key, value)=>{
			if(key == "sprite" || key == "parent") {
				return undefined;
			} else {
				return value;
			}
		});
		//FieldStorage.logStats(field, stringifiedField);

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

		for (const row in recoveredField.field) {
			for (const column in recoveredField.field[row]) {
				const recoveredCell = recoveredField.field[row][column];
				let cell = new Cell(
					recoveredCell.x,
					recoveredCell.y,
					field);
				cell.isOpen = recoveredCell.isOpen;
				cell.isMine = recoveredCell.isMine;
				cell.isFlagged = recoveredCell.isFlagged;

				field.field[row][column] = cell;
			}
		}

		return field;
	}
	static logStats(field, string) {
		const cellsCount = field.getAll().length;
		const compressedByteCount = unescape(encodeURI(string)).length;
		const ratio = compressedByteCount / cellsCount;
		console.log(`saved ${compressedByteCount} bytes with a compression ratio of ${ratio.toPrecision(5)} bytes/cell`);
	}
}