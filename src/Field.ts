/**
 * Created by sisc0606 on 19.08.2017.
 */
import * as Layouts from "./Layouts";
import * as PIXI from "pixi.js";
import { Chunk } from "./Chunk";
import seedrandom from "seedrandom";
import { Cell } from "./Cell";
import { SimpleCellData } from "./CellData";
import { Type } from "class-transformer";
import "reflect-metadata";
import { Layout } from "./Layouts";

export type ChunkedField = Record<number, Record<number, Chunk>>;

export class Field extends PIXI.EventEmitter {
  public fieldData: ChunkedField;
  public probability: number;
  public safeRadius: number;
  public pristine: boolean;
  public gameOver: boolean;
  public neighborPosition: Layout;
  public score: number;
  public visibleChunks: { x: number; y: number }[];

  public fieldName: string;
  private rng: seedrandom.PRNG;

  // todo use zod to validate. deprecate class-transformer
  @Type(() => SimpleCellData)
  public cellData = new SimpleCellData();

  public constructor(
    probability = 0.5,
    safeRadius = 1,
    fieldName: string,
    seed: string | undefined = undefined,
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

    // todo someday:
    // be able to change the options through an object
    // overwrite mine state
    // freeze mode
  }

  public getCell(x: number, y: number): Cell {
    return this.cellData.get(x, y);
  }

  public open(x: number, y: number): Cell[] {
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y))
      throw new Error(
        `Open was passed (${x},${y}), but it should be passed safe integers`,
      );

    if (this.pristine) this.setSafeCells(x, y);
    let cell = this.getCell(x, y);

    if (cell.isOpen) {
      const neighbors = this.getNeighbors(x, y);

      const closedUnflaggedNeighbors = neighbors.filter(
        (cell) => !cell.isFlagged && !cell.isOpen,
      );

      const value = this.value(x, y);
      const changedCells = [];

      const flaggedNeighbors = neighbors.filter(
        (cell) => cell.isFlagged || (cell.isOpen && cell.isMine), // Open mines should be treated as flags when chording
      );

      if (flaggedNeighbors.length === value) {
        for (const closedUnflaggedNeighbor of closedUnflaggedNeighbors) {
          const newOpenedCells = this.open(
            closedUnflaggedNeighbor.x,
            closedUnflaggedNeighbor.y,
          );
          changedCells.push(...newOpenedCells);
        }
        return changedCells;
      }

      const closedNeighbors = neighbors.filter(
        (cell) => !cell.isOpen || (cell.isOpen && cell.isMine),
      );

      if (closedNeighbors.length === value) {
        for (const closedUnflaggedNeighbor of closedUnflaggedNeighbors) {
          const newFlaggedCells = this.flag(
            closedUnflaggedNeighbor.x,
            closedUnflaggedNeighbor.y,
          );
          changedCells.push(...newFlaggedCells);
        }
        return changedCells;
      }
    }

    if (cell.isFlagged || cell.isOpen) {
      return [];
    }

    if (cell.isMine === undefined) {
      cell.isMine = this.rng() < this.probability;
      this._setCell(cell.x, cell.y, cell);
    }

    this._setCell(x, y, { isOpen: true });
    cell = this.getCell(x, y);

    if (cell.isMine) {
      this.score -= 100;
      this.emit("cellChanged", cell);
      return [];
    }
    this.score++;

    // generating of neighbors. we generate the cells when a neighbor is opened
    const neighbors = this.getNeighbors(cell.x, cell.y);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (neighbor.isMine === undefined) {
        neighbor.isMine = this.rng() < this.probability;
        this._setCell(neighbor.x, neighbor.y, neighbor);
        // this.generateCell(neighbors[i].x, neighbors[i].y);
      }
    }
    // we emit the event before doing the floodfill
    this.emit("cellChanged", cell);

    const openedCells = [];
    openedCells.push(cell);

    // floodfill
    if (this.value(cell.x, cell.y) === 0) {
      const neighbors = this.getNeighbors(cell.x, cell.y);
      const closedNeighbors = neighbors;
      for (const neighbor of closedNeighbors) {
        const updatedNeighbor = this.getCell(neighbor.x, neighbor.y);
        if (!updatedNeighbor.isOpen && !updatedNeighbor.isFlagged) {
          const openedNeighbors = this.open(
            updatedNeighbor.x,
            updatedNeighbor.y,
          );
          openedCells.push(...openedNeighbors);
        }
      }
    }

    return openedCells;
  }

  /**
   * If the cell is closed, it toggles the flag.
   *
   * If the cell is open, chords flags.
   * @returns Changed cells
   */
  public flag(x: number, y: number): Cell[] {
    console.log("flagging", x, y);
    const cell = this.getCell(x, y);
    if (!cell.isOpen) {
      cell.isFlagged = !cell.isFlagged;
      this._setCell(x, y, cell);
      // todo remove this, we should base on return value of flag.
      this.emit("cellChanged", cell);
      return [cell];
    } else {
      const closedNeighbors = this.getNeighbors(x, y).filter(
        (cell) => !cell.isOpen || (cell.isMine && cell.isOpen),
      );
      if (closedNeighbors.length === this.value(x, y)) {
        for (const closedNeighbor of closedNeighbors) {
          if (!closedNeighbor.isFlagged) {
            this.flag(closedNeighbor.x, closedNeighbor.y);
          }
        }
      }
    }
    return [];
  }

  public getNeighbors(x: number, y: number) {
    const neighbors = [];
    for (let i = 0; i <= this.neighborPosition.length - 1; i++) {
      const newX = x + this.neighborPosition[i][0];
      const newY = y + this.neighborPosition[i][1];
      neighbors.push(this.getCell(newX, newY));
    }
    return neighbors;
  }

  public restart() {
    // todo
    this.pristine = true;
    // todo: delete all of the rows, update all of the cells
    throw Error("not implemented");
  }

  public getAll(): Cell[] {
    return this.cellData.getAll();
  }

  public value(x: number, y: number): number | null {
    // returns the amount of surrounding mines
    const cell = this.getCell(x, y);
    // it does not make sense to request the value of a closed cell
    if (cell.isOpen === false) return null;
    else return this.getNeighbors(x, y).filter((cell) => cell.isMine).length;
  }

  public setVisibleChunk(x: number, y: number) {
    this.visibleChunks.push({ x: x, y: y });
  }

  public loadVisibleChunks() {
    for (let i = 0; i < this.visibleChunks.length; i++) {
      this.showChunk(this.visibleChunks[i].x, this.visibleChunks[i].y);
    }
    this.visibleChunks = [];
  }

  private showChunk(x: number, y: number) {
    const showChunk = this.getCoordinatesInChunk(x, y);
    for (const cellCoords of showChunk) {
      const cell = this.getCell(cellCoords.x, cellCoords.y);
      if (cell.isOpen || cell.isFlagged) {
        this.emit("cellChanged", cell);
      }
    }
    return;
  }

  private getCoordinatesInChunk(
    x: number,
    y: number,
  ): { x: number; y: number }[] {
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

  private setSafeCells(x0: number, y0: number) {
    // initiate the field with a circle of cells that aren't mines
    this.pristine = false;
    const r = this.safeRadius;

    for (let dy = Math.floor(-r); dy < Math.ceil(r); dy++) {
      for (let dx = Math.floor(-r); dx < Math.ceil(r); dx++) {
        // if the cell is in a circle with radius r
        if (r ** 2 > dx ** 2 + dy ** 2) {
          const x = x0 + dx;
          const y = y0 + dy;
          // we generate the cell, and overwrite the isMine state
          this._setCell(x, y, { isFlagged: false, isMine: false });
          // this.generateCell(x, y, false, false);
        }
      }
    }
  }

  public _setCell(x: number, y: number, cell: Partial<Cell>) {
    const gottenCell = this.cellData.get(x, y);
    if (cell.isMine !== undefined) gottenCell.isMine = cell.isMine;
    if (cell.isFlagged !== undefined) gottenCell.isFlagged = cell.isFlagged;
    if (cell.isOpen !== undefined) gottenCell.isOpen = cell.isOpen;
    this.cellData.set(x, y, gottenCell);
  }
}
