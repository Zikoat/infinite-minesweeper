import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";
import { Cell } from "./Cell";
import { assert } from "./assert";
import { getTextures } from "./Textures";
import { CellWidth } from "./CoordTypes";

export const CELL_WIDTH = 16 as CellWidth;

type MyTexture = PIXI.Texture;

type NeighborCount = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function numberToNeighborCount(
  value: number | null,
): NeighborCount | null {
  if (value === null) return value;
  assert(value % 1 === 0);
  assert(value >= 0);
  assert(value <= 8);

  return value as NeighborCount;
}

export class CellSprite {
  public neighborCount: NeighborCount | null;
  private back: PIXI.Sprite;
  private front: PIXI.Sprite;

  public constructor(
    cell: Cell,
    neighborCount: NeighborCount | null,
    parent: PIXI.Container,
    playAnimation: boolean,
  ) {
    this.neighborCount = neighborCount;
    const cellTexture = this.getCellTexture(cell);
    this.back = new PIXI.Sprite(cellTexture.back);
    this.front = new PIXI.Sprite(cellTexture.front);
    this.back.width = CELL_WIDTH;
    this.back.height = CELL_WIDTH;
    this.front.width = CELL_WIDTH;
    this.front.height = CELL_WIDTH;
    this.front.anchor.set(0.5);
    this.front.scale = 0.85;
    this.back.anchor.set(0.5);

    // shit this should use cell-space to world space helpers
    const x = cell.x * CELL_WIDTH + CELL_WIDTH / 2;
    const y = cell.y * CELL_WIDTH + CELL_WIDTH / 2;
    this.front.x = x;
    this.front.y = y;
    this.back.x = x;
    this.back.y = y;
    this.back.zIndex = 1;
    this.front.zIndex = 2;
    parent.addChild(this.back, this.front);
    if (playAnimation) this.playUpdateAnimation();
  }

  public update(cell: Cell) {
    const cellTexture = this.getCellTexture(cell);
    this.back.texture = cellTexture.back;
    this.front.texture = cellTexture.front;

    this.playUpdateAnimation();
  }

  // todo don't run update animation then updating all cells to improve performance on load and reload.
  private playUpdateAnimation() {
    TweenMax.from(this.front.scale, 0.2, { x: 0, y: 0 });
    // TweenMax.from(this.front, 0.2, {
    //   x: "+=" + this.back.width / 2,
    //   y: "+=" + this.back.width / 2,
    // });
    TweenMax.from(this.back, 0.2, { alpha: 0 });
  }

  private getCellTexture(cell: Cell): {
    back: MyTexture;
    front: MyTexture;
  } {
    const textures = getTextures();

    let back: PIXI.Texture;
    let front: PIXI.Texture;

    if (cell.isOpen) {
      back = textures.open;
      if (cell.isMine) front = textures.mineWrong;
      else if (this.neighborCount !== null && this.neighborCount > 0)
        front = textures[this.neighborCount as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8];
      else front = PIXI.Texture.EMPTY;
    } else {
      back = PIXI.Texture.EMPTY;
      front = cell.isFlagged ? textures.flag : PIXI.Texture.EMPTY;
    }

    assert(front);
    assert(back);

    const texture: { back: MyTexture; front: MyTexture } = {
      back,
      front,
    };

    return texture;
  }
}
