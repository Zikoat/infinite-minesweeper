import { TweenMax, Power4 } from "gsap";
import * as PIXI from "pixi.js";
import { CELL_WIDTH } from "./CellSprite";
import { getTextures } from "./Textures";
import { assert } from "./assert";
import { CellCoord, WorldCoord } from "./CoordTypes";

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

  public moveTo(x: WorldCoord, y: WorldCoord) {
    this.cellCoordX = worldCoordToCellCoord(x);
    this.cellCoordY = worldCoordToCellCoord(y);

    assert(this.cellCoordX % 1 === 0);
    assert(this.cellCoordY % 1 === 0);

    TweenMax.to(this, 0.1, {
      x: cellCoordToWorldCoord(this.cellCoordX),
      y: cellCoordToWorldCoord(this.cellCoordY),
      ease: Power4.easeOut,
    });
  }

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
  return Math.floor(worldCoord / CELL_WIDTH) as CellCoord;
}
