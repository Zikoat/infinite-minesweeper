/**
 * Created by sisc0606 on 19.08.2017.
 */

import { Cell } from "src/Cell";
import { Field } from "src/Field";

function openCellsSimple(_field: Field) {}

function flagCellsSimple(field: Field) {
  field.getAll().forEach((cell) => {
    const neighbors = field.getNeighbors(cell.x, cell.y);
    const closedNeighbors = neighbors.filter((cell) => !cell.isOpen);
    if (neighbors.filter((c) => c.isMine).length === closedNeighbors.length) {
      closedNeighbors.forEach((cell) => field.flag(cell.x, cell.y));
    }
  });
}

export default class SimpleBot {
  openQueue: Cell[];
  flagQueue: Cell[];

  constructor(private field: Field) {
    this.openQueue = [];
    this.flagQueue = [];
  }

  step() {
    console.log(`there are ${this.flagQueue.length} cells to flag`);
    console.log(`there are ${this.openQueue.length} cells to open`);

    const toFlag = this.flagQueue.pop(); // type cell or undefined
    if (toFlag) {
      if (toFlag.isFlagged) {
        console.log("is already flagged:", toFlag);
        return;
      }
      this.field.flag(toFlag.x, toFlag.y);
      console.log("flagged");
      return toFlag;
    }

    const toOpen = this.openQueue.pop();
    if (toOpen) {
      this.field.open(toOpen.x, toOpen.y);
      console.log("opened");
      return toOpen;
    }

    this.flagToQueue();
    this.openToQueue();
  }

  flagToQueue() {
    this.field.getAll().forEach((cell) => {
      const neighbors = this.field.getNeighbors(cell.x, cell.y);
      const closedNeighbors = neighbors.filter((cell) => !cell.isOpen);
      if (neighbors.filter((c) => c.isMine).length === closedNeighbors.length) {
        closedNeighbors.forEach((neighbor) => {
          if (!neighbor.isFlagged) this.flagQueue.push(neighbor);
        });
      }
    });
  }

  openToQueue() {
    this.field
      .getAll()
      .filter(
        (cell) =>
          cell.isOpen && this.field.getNeighbors(cell.x, cell.y).length !== 0
      )
      .forEach((cell) => {
        const neighboringCells = this.field.getNeighbors(cell.x, cell.y);
        const neighboringMinesAmount = neighboringCells.filter(
          (c) => c.isMine
        ).length;

        const restNeighbors = neighboringCells.filter(
          (neighbor) => !(neighbor.isFlagged || neighbor.isOpen)
        );

        if (restNeighbors.length === neighboringMinesAmount)
          restNeighbors.forEach((neighbor) => this.openQueue.push(neighbor));
      });
  }

  runBotSimple() {
    let prevOpened = -1;
    while (
      this.field.getAll().filter((cell) => cell.isOpen).length !== prevOpened
    ) {
      prevOpened = this.field.getAll().filter((cell) => cell.isOpen).length;
      flagCellsSimple(this.field);
      openCellsSimple(this.field);
    }
  }

  logStats() {
    const all = this.field.getAll();
    console.log("all:", all.length);
    console.log("flags:", all.filter((cell) => cell.isFlagged).length);
    const opened = all.filter((cell) => cell.isOpen);
    console.log("opened:", opened.length);
    if (
      all.length - opened.length !==
      all.filter((cell) => !cell.isOpen).length
    )
      console.warn(
        "openDiff:",
        all.length - opened.length - all.filter((cell) => !cell.isOpen).length
      );
    console.log("closed:", all.length - opened.length);
  }
}
