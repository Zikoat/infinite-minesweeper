import { TweenMax, Power4 } from "gsap";
import * as PIXI from "pixi.js";
import { CELL_WIDTH } from "./CellSprite";
import { getTextures } from "./Textures";
import type { Tagged } from "type-fest";

// todo move these to a different file
type Pos<T> = { x: T; y: T };
// A cell position is the index which is to find a specific cell in the game board.
type CellCoord = Tagged<number, "CellCoord">;
export type WorldCoord = Tagged<number, "WorldCoord">;
// A world position describes a place in the pixi scene graph where a sprite is located.
export type WorldPos = Pos<WorldCoord>;
export type CellWidth = Tagged<number, "CellWidth">;
export type ScreenCoord = Tagged<number, "ScreenCoord">;
// A screen position describes a position on the user's screen
export type ScreenPos = Pos<ScreenCoord>;

/**
 * bug todo: cursor jitters when dragging field
 */

export class Cursor extends PIXI.Sprite {
  private cellCoordX: CellCoord;
  private cellCoordY: CellCoord;

  public constructor(
    x: WorldCoord = 0 as WorldCoord,
    y: WorldCoord = 0 as WorldCoord,
  ) {
    const cursorTexture = getTextures().cursor;

    super(cursorTexture);
    this.cellCoordX = worldCoordToCellCoord(x);
    this.cellCoordY = worldCoordToCellCoord(y);
    this.zIndex = 3;

    this.moveTo(x, y);
  }

  // todo pass in local-for-foreground coordinates instead of cell coordinates to simplify transforms.
  public moveTo(x: WorldCoord, y: WorldCoord) {
    // const pos = {
    //   x: cellCoordToWorldCoord(x),
    //   y: cellCoordToWorldCoord(y),
    // } as WorldPos | undefined;

    this.cellCoordX = worldCoordToCellCoord(x);
    this.cellCoordY = worldCoordToCellCoord(y);

    const snappedWorldCoordX = cellCoordToWorldCoord(this.cellCoordX);
    const snappedWorldCoordY = cellCoordToWorldCoord(this.cellCoordY);

    // shit this should never happen, i think we might be initializing in incorrect order.
    // if (!pos) {
    //   console.warn("Tried to move cursor, but foreground is not defined");
    //   return;
    // }

    TweenMax.to(this, 0.1, {
      x: snappedWorldCoordX,
      y: snappedWorldCoordY,
      ease: Power4.easeOut,
    });
  }

  // private moveDelta(dx: CellCoord, dy: CellCoord) {
  //   this.moveTo(add(this.pointX, dx), add(this.pointY, dy));
  // }

  public getX() {
    return this.cellCoordX;
  }

  public getY() {
    return this.cellCoordY;
  }
}

function cellCoordToWorldCoord(cellCoord: CellCoord): WorldCoord {
  return (cellCoord * CELL_WIDTH) as WorldCoord;
}

export function worldCoordToCellCoord(worldCoord: WorldCoord): CellCoord {
  // shit we should migrate away from using scale here somehow
  return Math.floor(worldCoord / CELL_WIDTH) as CellCoord;
}
