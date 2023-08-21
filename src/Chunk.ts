import { Cell } from "./Cell";

export const CHUNK_SIZE = 32;
export class Chunk {
  x: number;
  y: number;
  cells: Cell[][];

  constructor(x: number, y: number) {
    console.log(" creating new chunkS");
    this.x = x;
    this.y = y;
    this.cells = [];
    for (let i = 0; i < CHUNK_SIZE; i++) {
      this.cells[i] = [];
      for (let j = 0; j < CHUNK_SIZE; j++) {
        this.cells[i][j] = new Cell(x * CHUNK_SIZE + i, y * CHUNK_SIZE + j);
      }
    }
  }
  getCell(x: number, y: number) {
    return this.cells[x][y];
  }

  getCellFromGlobalCoords(x: number, y: number) {
    return this.cells[x - this.x * CHUNK_SIZE][y - this.y * CHUNK_SIZE];
  }

  getAll() {
    const ans = [];
    let i, j;
    for (i in this.cells) {
      for (j in this.cells[i]) {
        ans.push(this.cells[i][j]);
      }
    }
    return ans;
  }
  toJSON() {
    let ans = "";
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_SIZE; y++) {
        ans += this.cells[x][y].toJSON();
      }
    }
    return ans;
  }
}
