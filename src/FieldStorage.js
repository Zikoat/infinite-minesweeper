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
		field.on("save", (chunks)=>{
			//FieldStorage.save(field, saveName);
			chunks.forEach((chunk)=>{
				FieldStorage.saveChunk(chunk,saveName);
			});
			FieldStorage.save(field, saveName);
		});
	}
	static compress(field) { // returns JSON string;
		const stringifiedField = JSON.stringify(field);
		// FieldStorage.logStats(field, stringifiedField);

		return stringifiedField;
	}
	static saveChunk(chunk,id){
		localStorage.setItem(id+chunk.x+";"+chunk.y, JSON.stringify(chunk));
	}
	static loadChunk(id,x,y,field){
		
		var chunk = new Chunk(x,y,field);
		if(localStorage.getItem(id+chunk.x+";"+chunk.y)){
			var data = JSON.parse(localStorage.getItem(id+chunk.x+";"+chunk.y));
			
			for(let i = 0;i<CHUNK_SIZE;i++){
				for(let j = 0;j<CHUNK_SIZE;j++){
					let cell = new Cell(x*CHUNK_SIZE+i,y*CHUNK_SIZE+j,field);

					let cellPointer = (i*CHUNK_SIZE+j)*3;
					cell.isOpen = (data.charAt(cellPointer) == true);
					const isMine = data.charAt(cellPointer+1);
					cell.isMine = isMine == "2"?undefined:isMine == "1"?true:false;
					cell.isFlagged = (data.charAt(cellPointer+2) == true);
					chunk.cells[i][j] = cell;
				}
			}
			return chunk;
		}
		
		return undefined;
	}
	static decompress(compressedField) {
		// when stringifying, we have changed the class into an object, and we 
		// need to recreate the class from the data
		let recoveredField = JSON.parse(compressedField);
		let field = new Field();
		field.score = recoveredField.score;	
		field.probability = recoveredField.probability;
		return field;
	}
	static logStats(field, string) {
		const cellsCount = field.getAll().length;
		const compressedByteCount = unescape(encodeURI(string)).length;
		const ratio = compressedByteCount / cellsCount;
		console.log(`saved ${compressedByteCount} bytes with a compression ratio of ${ratio.toPrecision(5)} bytes/cell`);
		console.log(string);
	}
}