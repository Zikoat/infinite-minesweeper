/**
 * Created by sisc0606 on 19.08.2017.
 */
export class Cell {
  public x: number;
  public y: number;
  public isOpen: boolean;
  public isMine?: boolean;
  public isFlagged: boolean;

  public constructor(
    x: number,
    y: number,
    isFlagged: boolean = false,
    isMine?: boolean,
  ) {
    this.x = x;
    this.y = y;
    this.isOpen = false;
    this.isMine = isMine;
    this.isFlagged = isFlagged;
  }

  public toJSON() {
    const open = this.isOpen ? "1" : "0";
    const mine = this.isMine === undefined ? "2" : this.isMine ? "1" : "0";
    const flagged = this.isFlagged ? "1" : "0";
    return open + mine + flagged;
  }
}
