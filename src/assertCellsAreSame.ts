import { Cell } from "./Cell";
import { assert } from "./assert";

export function assertCellsAreSame(cellA: Cell, cellB: Cell): void {
  assert(cellA.isOpen === cellB.isOpen);
  assert(cellA.isMine === cellB.isMine);
  assert(cellA.isFlagged === cellB.isFlagged);
  assert(cellA.x === cellB.x);
  assert(cellA.y === cellB.y);
}
