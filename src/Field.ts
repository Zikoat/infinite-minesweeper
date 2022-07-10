/**
 * Created by sisc0606 on 19.08.2017.
 */
import Cell from "./Cell";
import * as Layouts from "./Layouts";
import * as PIXI from "pixi.js";

const EventEmitter = PIXI.utils.EventEmitter;

type ChunkedField = Record<number, Record<number, Chunk>>;

import { Chunk } from "./Chunk";
import { CHUNK_SIZE } from "./Chunk";
import FieldStorage from "./FieldStorage";
/**
 * events:
 * changedCells, if any cells have been changed, returns an array of the cells that have been changed
 * wrongMove, if a wrong cell has been pressed (open mine or flag non-mine), returns the cell that was pressed
 */
export default class Field extends EventEmitter {
  // do not call any of the cell's functions in the field class, to prevent
  // infinite loops

  private field: ChunkedField;
  private chunksToSave: any;
  public probability: number;
  public safeRadius: number;
  public pristine: boolean;
  public gameOver: boolean;
  public neighborPosition: any;
  public score: number;
  public visibleChunks: any;
  public fieldStorage?: FieldStorage;
  private fieldName: string;

  constructor(
    probability = 0.5,
    safeRadius = 1,
    fieldStorage: FieldStorage,
    fieldName: string
  ) {
    super();

    this.field = {};
    // this is the probability that a mine is a cell
    this.probability = probability;
    // the field is pristine if no cells are opened, set this to true again with
    // Field.restart()
    this.pristine = true;
    // makes the first click not press a mine, radius is a float and checks in a circle
    this.safeRadius = safeRadius;
    this.gameOver = false;

    this.neighborPosition = Layouts.normal;
    this.score = 0;
    this.chunksToSave = [];
    this.visibleChunks = [];
    this.fieldStorage = fieldStorage;
    this.fieldName = fieldName;
    // todo someday:
    // be able to change the options through an object
    // overwrite mine state
    // freeze mode
  }
  getChunk(x: number, y: number) {
    return this.field[x][y];
  }
  getCell(x: number, y: number) {
    // if the row or cell is not created, we will get an error: cant read property of undefined
    let chunkX = Math.floor(x / CHUNK_SIZE);
    let chunkY = Math.floor(y / CHUNK_SIZE);
    this.generateChunk(chunkX, chunkY);
	
	if(this.field[chunkX][chunkY].getCellFromGlobalCoords === undefined){
		console.log("fucky wucky is aboard")
	}

    return this.field[chunkX][chunkY].getCellFromGlobalCoords(x, y);
  }
  open(x: number, y: number) {
	console.log(`opening ${x}, ${y}`)
    // returns an array of all the opened cells: [Cell, Cell, Cell, ...]
    // todo sanitize input

    if (this.pristine) this.setSafeCells(x, y);
    let cell = this.getCell(x, y);

    if (!this.isEligibleToOpen(x, y)) {
      return false;
    }

    //todo better generation
    if (cell.isMine === undefined) {
      cell = this.generateCell(x, y, cell.isFlagged);
    }

    cell.isOpen = true;

    let openedCells = [];
    openedCells.push(cell);

    if (cell.isMine) {
      // console.log("game over, you stepped on a mine:", cell);
      this.score -= 100;
      this.emit("cellChanged", cell);
      return false;
    }
    this.score++;

    // generating of neighbors. we generate the cells when a neighbor is opened
    let neighbors = cell.getNeighbors();
    for (var i = 0; i < neighbors.length; i++) {
      if (neighbors[i].isMine === undefined) {
        // debugging
        // console.log("opened neighbor is undefined, generating", neighbors[i].x, neighbors[i].y);
        this.generateCell(neighbors[i].x, neighbors[i].y);
      }
    }

    // we emit the event before doing the floodfill
    this.emit("cellChanged", cell);

    // floodfill
    if (cell.value() === 0) {
      cell
        .getNeighbors() // get all the neighbors
        .filter((neighbor: { isOpen: any }) => !neighbor.isOpen) // filter the array, so only the closed neighbors are in it
        .forEach((closedNeighbor: { open: () => void }) => {
          closedNeighbor.open();
        });
    }

    return openedCells.length >= 1;
  }
  // save(){
  // this.emit("save",this.chunksToSave.slice(0));
  // this.chunksToSave = [];
  // }
  flag(x: number, y: number) {
    let cell = this.getCell(x, y);
    if (!cell.isOpen) {
      cell.isFlagged = !cell.isFlagged;
      this.emit("cellChanged", cell);
    }
    let chunkX = Math.floor(x / CHUNK_SIZE);
    let chunkY = Math.floor(y / CHUNK_SIZE);
    if (!this.chunksToSave.includes(this.getChunk(chunkX, chunkY))) {
      this.chunksToSave.push(this.getChunk(chunkX, chunkY));
    }
  }
  getNeighbors(x: any, y: any) {
    let neighbors = [];
    for (var i = 0; i <= this.neighborPosition.length - 1; i++) {
      let newX = x + this.neighborPosition[i][0];
      let newY = y + this.neighborPosition[i][1];
      neighbors.push(this.getCell(newX, newY));
    }
    return neighbors;
  }
  generateChunk(x: number, y: number) {
    if (!(x in this.field)) this.field[x] = {};
    if (!(y in this.field[x])) {
      if (!this.fieldStorage)
        throw new Error(
          "FieldStorage is not defined, but generateChunk called."
        );
		const loadedChunk = this.fieldStorage.loadChunk(
			this.fieldName,
			x,
			y,
			this
		  );
      this.field[x][y] = loadedChunk;
      if (this.field[x][y] === undefined)
        this.field[x][y] = new Chunk(x, y, this);
      else {
        this.field[x][y].getAll().forEach((cell) => {
          if (cell.isOpen || cell.isFlagged) {
            this.emit("cellChanged", cell);
          }
        });
      }
    }
  }
  showChunk(x: number, y: number) {
    if (!(x in this.field)) this.field[x] = {};
    if (!(y in this.field[x])) {
      let chunk = this.fieldStorage.loadChunk(this.fieldName, x, y, this);
      if (!(chunk === undefined)) {
        this.field[x][y] = chunk;
        this.field[x][y].getAll().forEach((cell) => {
          if (cell.isOpen || cell.isFlagged) {
            this.emit("cellChanged", cell);
          }
        });
      }
    }
  }
  unloadChunk(x: string, y: string) {
    this.field[x][y].getAll().forEach((cell) => {
      if (!(cell.sprite === undefined)) {
        cell.sprite.parent.removeChild(cell.sprite);
      }
    });
    delete this.field[x][y];
  }
  generateCell(x: number, y: number, isFlagged = false, isMine = undefined) {
    //calculates coordinates of a chunk
    let chunkX = Math.floor(x / CHUNK_SIZE);
    let chunkY = Math.floor(y / CHUNK_SIZE);
    //generates a chunk if it isn't already generated
    this.generateChunk(chunkX, chunkY);
    if (!this.chunksToSave.includes(this.getChunk(chunkX, chunkY))) {
      this.chunksToSave.push(this.getChunk(chunkX, chunkY));
    }
    //gets a reference to a cell that we want to generate from the chunk
    let cell = this.getChunk(chunkX, chunkY).getCellFromGlobalCoords(x, y);

    //if isMine field of the cell is undefined we calculate it
    if (cell.isMine === undefined) {
      //todo: seed based generation
      if (isMine === undefined) isMine = Math.random() < this.probability;
      cell.isMine = isMine;
      cell.isFlagged = isFlagged;
      return cell;
    } else {
      console.warn(x, y, "is already generated");
    }
  }
  restart() {
    // todo
    this.pristine = true;
    // todo: delete all of the rows, update all of the cells
  }
  getAll() {
    // returns all the cells, in a 1-dimensonal array, for easy iteration
    // includes all af the open cells, and their neighbors(the border)
    let cells = [];
    let rows = Object.keys(this.field);
    for (var i = 0; i < rows.length; i++) {
      let columns = Object.keys(this.field[rows[i]]);
      for (var j = 0; j < columns.length; j++) {
        let chunk = this.getChunk(rows[i], columns[j]);
        let fromChunk = chunk.getAll();
        for (let k in fromChunk) cells.push(fromChunk[k]);
      }
    }
    return cells;
  }
  value(x: number, y: number) {
    // returns the amount of surrounding mines
    let cell = this.getCell(x, y);
    // it does not make sense to request the value of a closed cell
    if (cell.isOpen === false) return null;
    else return this.getNeighbors(x, y).filter((cell) => cell.isMine).length;
  }
  checkForErrors() {
    // debugging
    let cells = this.getAll();
    let openedCells = cells.filter((cell) => cell.isOpen);

    if (openedCells.some((cell) => cell.isFlagged))
      console.error(
        "cell is flagged and open",
        openedCells.filter((cell) => cell.isFlagged)
      );

    let undefinedCells = cells.filter((cell) => cell.isMine === undefined);
    if (undefinedCells.length > 0)
      console.error("undefined cells", undefinedCells);
  }
  isEligibleToOpen(x: number, y: number) {
    // returns a bool, whether this cell can be opened
    //if(this.gameOver) return false;
    let cell = this.getCell(x, y);
    if (cell.isFlagged) return false;
    if (cell.isOpen) return false;
    return true;
  }
  setVisibleChunk(x: any, y: any) {
    this.visibleChunks.push({ x: x, y: y });
  }
  loadVisibleChunks() {
    for (let x in this.field) {
      for (let y in this.field[x]) {
        let remove = true;
        for (let i = 0; i < this.visibleChunks.length; i++) {
          if (this.visibleChunks[i].x == x && this.visibleChunks[i].y == y)
            remove = false;
        }
        if (remove) {
          this.unloadChunk(x, y);
        }
      }
    }
    for (let i = 0; i < this.visibleChunks.length; i++) {
      this.showChunk(this.visibleChunks[i].x, this.visibleChunks[i].y);
    }
    this.visibleChunks = [];
  }
  setSafeCells(x0: number, y0: number) {
    // initiate the field with a circle of cells that aren't mines
    this.pristine = false;
    let r = this.safeRadius;

    // console.log("safeRadius", this.safeRadius);

    for (let dy = Math.floor(-r); dy < Math.ceil(r); dy++) {
      for (let dx = Math.floor(-r); dx < Math.ceil(r); dx++) {
        // if the cell is in a circle with radius r
        if (r ** 2 > dx ** 2 + dy ** 2) {
          let x = x0 + dx;
          let y = y0 + dy;
          // we generate the cell, and overwrite the isMine state
          this.generateCell(x, y, false, false);
        }
        // one-lined version
        // if(r**2>dx**2+dy**2) this.open(x0+dx, y0+dx);
      }
    }
  }
  toJSON() {
  	const fieldToStore: any = {};
  	fieldToStore.probability = this.probability;
  	fieldToStore.score = this.score;
  	return fieldToStore;
  }
}
