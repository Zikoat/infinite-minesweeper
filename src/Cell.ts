import Field from "./Field";

/**
 * Created by sisc0606 on 19.08.2017.
 */
export default class Cell {
  x: number;
  y: number;
  isOpen: boolean;
  isMine?: boolean;
  isFlagged: boolean | undefined;
  // the cell class only holds the information of the cell, and also mirrors
  // the functions in the field that take x/y arguments. this allows chaining,
  // like this:
  // f.getCell(10,10).open()
  constructor(x: number, y: number, isFlagged?: boolean, isMine?: boolean) {
    this.x = x;
    this.y = y;
    this.isOpen = false;
    this.isMine = isMine;
    this.isFlagged = isFlagged;
  }

  toJSON() {
    const open = this.isOpen ? "1" : "0";
    const mine = this.isMine === undefined ? "2" : this.isMine ? "1" : "0";
    const flagged = this.isFlagged ? "1" : "0";
    return open + mine + flagged;
  }
}
