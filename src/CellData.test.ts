import { test } from "uvu";
import * as assert from "uvu/assert";
import { Cell } from "./Cell";
import { SimpleCellData } from "./CellData";

test("SimpleCellData should be able to store all type of cells", () => {
  const cell = new Cell(1, 1);
  assertCellCanBeSaved(cell);
  cell.isFlagged = true;
  assertCellCanBeSaved(cell);
  cell.isFlagged = false;
  assertCellCanBeSaved(cell);
  cell.isOpen = false;
  assertCellCanBeSaved(cell);
  cell.isOpen = true;
  assertCellCanBeSaved(cell);
  cell.isMine = undefined;
  assertCellCanBeSaved(cell);
  cell.isMine = false;
  assertCellCanBeSaved(cell);
  cell.isMine = true;
  assertCellCanBeSaved(cell);
});

test("SimpleCellData should return a cell with correct properties if the cell has not been set yet", () => {
  const cellData = new SimpleCellData();
  const cell = cellData.get(0, 0);
  assert.is(cell.isFlagged, false, "isflagged");
  assert.is(cell.isMine, undefined, "ismine");
  assert.is(cell.isOpen, false, "isopen");
});

function assertCellCanBeSaved(cell: Cell) {
  const cellData = new SimpleCellData();
  cellData.set(cell.x, cell.y, cell);
  const newCell = cellData.get(cell.x, cell.y);
  assertCellsAreSame(cell, newCell);
}

export function assertCellsAreSame(cellA: Cell, cellB: Cell): void {
  assert.equal(cellA.isOpen, cellB.isOpen);
  assert.equal(cellA.isMine, cellB.isMine);
  assert.equal(cellA.isFlagged, cellB.isFlagged);
  assert.equal(cellA.x, cellB.x);
  assert.equal(cellA.y, cellB.y);
}
test.run();
