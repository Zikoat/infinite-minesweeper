/**
 * Created by sisc0606 on 19.08.2017.
 */
import * as Layouts from "./Layouts";
import * as PIXI from "pixi.js";
import { Chunk } from "./Chunk";
import { CHUNK_SIZE } from "./Chunk";
import FieldStorage from "./FieldStorage";
import seedrandom from "seedrandom";
import Cell from "./Cell";
import { close } from "fs";

const EventEmitter = PIXI.utils.EventEmitter;

export type ChunkedField = Record<number, Record<number, Chunk>>;

export default class Field extends EventEmitter {
  // do not call any of the cell's functions in the field class, to prevent
  // infinite loops

  public fieldData: ChunkedField;
  public chunksToSave: any;
  public probability: number;
  public safeRadius: number;
  public pristine: boolean;
  public gameOver: boolean;
  public neighborPosition: any;
  public score: number;
  public visibleChunks: any;
  public fieldStorage?: FieldStorage;
  public fieldName: string;
  private rng: seedrandom.PRNG;
  private seed?: string;

  constructor(
    probability = 0.5,
    safeRadius = 1,
    fieldStorage: FieldStorage | undefined,
    fieldName: string,
    seed: string | undefined = undefined
  ) {
    super();

    this.fieldData = {};
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
    this.rng = seedrandom(seed);
    this.seed = seed;

    // todo someday:
    // be able to change the options through an object
    // overwrite mine state
    // freeze mode
  }
  getChunk(x: number, y: number) {
    return this.fieldData[x][y];
  }
  getCell(x: number, y: number) {
    let chunkX = Math.floor(x / CHUNK_SIZE);
    let chunkY = Math.floor(y / CHUNK_SIZE);
    this.generateChunk(chunkX, chunkY);

    if (this.fieldData[chunkX][chunkY].getCellFromGlobalCoords === undefined) {
      throw new Error("Failed to generate chunk");
    }

    return this.fieldData[chunkX][chunkY].getCellFromGlobalCoords(x, y);
  }
  open(x: number, y: number) {
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
      this.score -= 100;
      this.emit("cellChanged", cell);
      return false;
    }
    this.score++;

    // generating of neighbors. we generate the cells when a neighbor is opened
    let neighbors = this.getNeighbors(cell.x, cell.y);
    for (var i = 0; i < neighbors.length; i++) {
      if (neighbors[i].isMine === undefined) {
        this.generateCell(neighbors[i].x, neighbors[i].y);
      }
    }

    // we emit the event before doing the floodfill
    this.emit("cellChanged", cell);

    // floodfill
    if (this.value(cell.x, cell.y) === 0) {
      this.getNeighbors(cell.x, cell.y) // get all the neighbors
        .filter((neighbor: { isOpen: any }) => !neighbor.isOpen) // filter the array, so only the closed neighbors are in it
        .forEach((closedNeighbor: { x: number; y: number }) => {
          this.open(closedNeighbor.x, closedNeighbor.y);
        });
    }

    return openedCells.length >= 1;
  }

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
    if (!(x in this.fieldData)) this.fieldData[x] = {};
    if (!(y in this.fieldData[x])) {
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
      this.fieldData[x][y] = loadedChunk;
      if (this.fieldData[x][y] === undefined)
        this.fieldData[x][y] = new Chunk(x, y, this);
      else {
        this.fieldData[x][y].getAll().forEach((cell) => {
          if (cell.isOpen || cell.isFlagged) {
            this.emit("cellChanged", cell);
          }
        });
      }
    }
  }
  showChunk(x: number, y: number) {
    if (!(x in this.fieldData)) this.fieldData[x] = {};
    if (!(y in this.fieldData[x])) {
      let chunk = this.fieldStorage.loadChunk(this.fieldName, x, y, this);
      if (!(chunk === undefined)) {
        this.fieldData[x][y] = chunk;
        this.fieldData[x][y].getAll().forEach((cell) => {
          if (cell.isOpen || cell.isFlagged) {
            this.emit("cellChanged", cell);
          }
        });
      }
    }
  }
  unloadChunk(x: string, y: string) {
    this.fieldData[x][y].getAll().forEach((cell) => {
      if (!(cell.sprite === undefined)) {
        cell.sprite.parent.removeChild(cell.sprite);
      }
    });
    delete this.fieldData[x][y];
  }
  generateCell(
    x: number,
    y: number,
    isFlagged = false,
    isMine: boolean | undefined = undefined
  ): Cell {
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
      if (isMine === undefined) isMine = this.rng() < this.probability;
      cell.isMine = isMine;
      cell.isFlagged = isFlagged;
      return cell;
    } else {
      console.warn(x, y, "is already generated");
      return cell;
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
    let rows = Object.keys(this.fieldData);
    for (var i = 0; i < rows.length; i++) {
      let columns = Object.keys(this.fieldData[rows[i]]);
      for (var j = 0; j < columns.length; j++) {
        let chunk = this.getChunk(rows[i], columns[j]);
        let fromChunk = chunk.getAll();
        for (let k in fromChunk) cells.push(fromChunk[k]);
      }
    }
    return cells;
  }
  value(x: number, y: number): number | null {
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
    for (let x in this.fieldData) {
      for (let y in this.fieldData[x]) {
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

    for (let dy = Math.floor(-r); dy < Math.ceil(r); dy++) {
      for (let dx = Math.floor(-r); dx < Math.ceil(r); dx++) {
        // if the cell is in a circle with radius r
        if (r ** 2 > dx ** 2 + dy ** 2) {
          let x = x0 + dx;
          let y = y0 + dy;
          // we generate the cell, and overwrite the isMine state
          this.generateCell(x, y, false, false);
        }
      }
    }
  }
  toJSON() {
    const fieldToStore: any = {};
    fieldToStore.probability = this.probability;
    fieldToStore.safeRadius = this.safeRadius;
    fieldToStore.pristine = this.pristine;
    fieldToStore.fieldName = this.fieldName;
    fieldToStore.score = this.score;

    return fieldToStore;
  }
}
