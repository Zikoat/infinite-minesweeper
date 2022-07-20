import { Type } from "class-transformer";
import Cell from "./Cell";
import { SimpleNumberStorage } from "./SimpleNumberStorage";
import "reflect-metadata";

interface CellData {
  get(x: number, y: number): Cell;
  set(x: number, y: number, cell: Cell): void;
  compress(): string;
  decompress(compressed: string): CellData;
  getAll(): Cell[];
}

export class SimpleCellData implements CellData {
  @Type(() => SimpleNumberStorage)
  public numberStorage = new SimpleNumberStorage();

  constructor() {}

  getAll(): Cell[] {
    const numbers = this.numberStorage.getAll();
    return numbers.map((val) => {
      return this.numberToCell(val.x, val.y, val.value);
    });
  }

  private cellToNumber(cell: Cell): number {
    let output = "";
    output += cell.isMine ? "1" : "0";
    output += cell.isMine === undefined ? "1" : "0";
    output += cell.isFlagged ? "1" : "0";
    output += cell.isOpen ? "1" : "0";

    return parseInt(output, 2);
  }
  private numberToCell(x: number, y: number, input: number | null): Cell {
    const cell = new Cell(x, y);

    if (input === null) return cell;
    const stringified = input.toString(2).padStart(4, "0");
    cell.isMine = stringified[1] === "1" ? undefined : stringified[0] === "1";
    cell.isFlagged = stringified[2] === "1";

    cell.isOpen = stringified[3] === "1";

    return cell;
  }

  get(x: number, y: number): Cell {
    return this.numberToCell(x, y, this.numberStorage.get(x, y));
  }
  set(x: number, y: number, cell: Cell): void {
    this.numberStorage.set(x, y, this.cellToNumber(cell));
  }
  compress(): string {
    throw new Error("Method not implemented.");
  }
  decompress(compressed: string): CellData {
    throw new Error("Method not implemented.");
  }
}
