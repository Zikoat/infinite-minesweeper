import Cell from "./Cell";
import {Chunk} from "./Chunk";

export default class FieldData {
	public data: {};
	constructor () {
		this.data = {};
	}
	public getCell(x, y): Cell {
		return new Cell(x, y);
	}
	public getChunk(chunkX, chunkY): number {
		return 0;
	}
}