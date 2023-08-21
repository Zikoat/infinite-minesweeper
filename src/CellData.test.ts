import { test, expect } from "vitest";

import { Cell } from "./Cell";
import { SimpleCellData } from "./CellData";
import { assertCellsAreSame } from "./assertCellsAreSame";
import assert from "assert";

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
  expect(cell.isFlagged).toBe(false);
  assert(cell.isMine === undefined, "ismine");
  assert(cell.isOpen === false, "isopen");
});

function assertCellCanBeSaved(cell: Cell) {
  const cellData = new SimpleCellData();
  cellData.set(cell.x, cell.y, cell);
  const newCell = cellData.get(cell.x, cell.y);
  assertCellsAreSame(cell, newCell);
}
