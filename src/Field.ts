/**
 * Created by sisc0606 on 19.08.2017.
 */
import * as Layouts from "./Layouts";
import * as PIXI from "pixi.js";
import { Chunk } from "./Chunk";
import { CHUNK_SIZE } from "./Chunk";
import { FieldPersistence } from "./FieldPersistence";
import seedrandom from "seedrandom";
import { Cell } from "./Cell";
import { SimpleCellData } from "./CellData";
import { Type } from "class-transformer";

import "reflect-metadata";
const EventEmitter = PIXI.utils.EventEmitter;

export type ChunkedField = Record<number, Record<number, Chunk>>;

export class Field extends EventEmitter {
  public fieldData: ChunkedField;
  public probability: number;
  public safeRadius: number;
  public pristine: boolean;
  public gameOver: boolean;
  public neighborPosition: any;
  public score: number;
  public visibleChunks: any;

  public fieldName: string;
  private rng: seedrandom.PRNG;
  private seed?: string;

  @Type(() => SimpleCellData)
  public cellData = new SimpleCellData();

  constructor(
    probability = 0.5,
    safeRadius = 1,
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
    this.visibleChunks = [];
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
    const cell = this.cellData.get(x, y);
    return cell;
  }
  open(x: number, y: number): Cell[] {
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y))
      throw new Error(
        `Open was passed (${x},${y}), but it should be passed safe integers`
      );

    if (this.pristine) this.setSafeCells(x, y);
    let cell = this.getCell(x, y);

    if (!this.isEligibleToOpen(x, y)) {
      return [];
    }

    if (cell.isMine === undefined) {
      cell.isMine = this.rng() < this.probability;
      this.setCell(cell.x, cell.y, cell);
    }

    this.setCell(x, y, { isOpen: true });
    cell = this.getCell(x, y);

    let openedCells = [];
    openedCells.push(cell);

    if (cell.isMine) {
      this.score -= 100;
      this.emit("cellChanged", cell);
      return [];
    }
    this.score++;

    if (this.score > 1000) throw Error("probably a recursive loop");
    // generating of neighbors. we generate the cells when a neighbor is opened
    let neighbors = this.getNeighbors(cell.x, cell.y);
    for (var i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (neighbor.isMine === undefined) {
        neighbor.isMine = this.rng() < this.probability;
        this.setCell(neighbor.x, neighbor.y, neighbor);
        // this.generateCell(neighbors[i].x, neighbors[i].y);
      }
    }
    // we emit the event before doing the floodfill
    this.emit("cellChanged", cell);

    // floodfill
    if (this.value(cell.x, cell.y) === 0) {
      const neighbors = this.getNeighbors(cell.x, cell.y);
      const closedNeighbors = neighbors.filter(
        (neighbor: Cell) => !neighbor.isOpen && !neighbor.isFlagged
      ); // filter the array, so only the closed neighbors are in it
      for (const neighbor of closedNeighbors) {
        const openedNeighbors = this.open(neighbor.x, neighbor.y);
        openedCells.push(...openedNeighbors);
      }
    }

    return openedCells;
  }

  flag(x: number, y: number): Cell | null {
    let cell = this.getCell(x, y);
    if (!cell.isOpen) {
      cell.isFlagged = !cell.isFlagged;
      this.setCell(x, y, cell);
      this.emit("cellChanged", cell);
      return cell;
    }
    return null;
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

  showChunk(x: number, y: number) {
    const showChunk = this.getCoordinatesInChunk(x, y);
    for (const cellCoords of showChunk) {
      const cell = this.getCell(cellCoords.x, cellCoords.y);
      if (cell.isOpen || cell.isFlagged) {
        this.emit("cellChanged", cell);
      }
    }
    return;
  }

  getCoordinatesInChunk(x: number, y: number): { x: number; y: number }[] {
    const startCellX = 32 * x;
    const startCellY = 32 * y + 32;
    const endCellX = 32 * x;
    const endCellY = 32 * y + 32;

    const output: { x: number; y: number }[] = [];
    for (let i = startCellX; i <= endCellX; i++) {
      for (let j = startCellY; j <= endCellY; j++) {
        output.push({ x: i, y: j });
      }
    }
    return output;
  }

  unloadChunk(x: string, y: string) {
    this.fieldData[x][y].getAll().forEach((cell) => {
      if (!(cell.sprite === undefined)) {
        cell.sprite.parent.removeChild(cell.sprite);
      }
    });
    delete this.fieldData[x][y];
  }
  restart() {
    // todo
    this.pristine = true;
    // todo: delete all of the rows, update all of the cells
    throw Error("not implemented");
  }
  getAll(): Cell[] {
    return this.cellData.getAll();
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
          this.setCell(x, y, { isFlagged: false, isMine: false });
          // this.generateCell(x, y, false, false);
        }
      }
    }
  }

  setCell(x: number, y: number, cell: Partial<Cell>) {
    const gottenCell = this.cellData.get(x, y);
    if (cell.isMine !== undefined) gottenCell.isMine = cell.isMine;
    if (cell.isFlagged !== undefined) gottenCell.isFlagged = cell.isFlagged;
    if (cell.isOpen !== undefined) gottenCell.isOpen = cell.isOpen;
    this.cellData.set(x, y, gottenCell);
  }
}
