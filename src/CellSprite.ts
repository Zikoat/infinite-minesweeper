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
  private lorez: PIXI.Sprite;

  public constructor(
    cell: Cell,
    neighborCount: NeighborCount | null,
    parent: PIXI.Container,
    playAnimation: boolean,
  ) {
    this.neighborCount = neighborCount;
    // todo when we zoom out a lot, we should use single-pixel texture. could do white with tint, and then remove alpha on top layer.
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
    this.lorez = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.lorez.width = CELL_WIDTH;
    this.lorez.height = CELL_WIDTH;
    this.lorez.anchor.set(0.5);
    this.lorez.tint = cellTexture.lorezTint;
    this.lorez.x = x;
    this.lorez.y = y;
    const lorezLayer = parent.getChildByName("lorez") as PIXI.Container;
    const foregroundLayer = parent.getChildByName("fg") as PIXI.Container;
    foregroundLayer.addChild(this.front, this.back);
    lorezLayer.addChild(this.lorez);

    if (playAnimation) this.playUpdateAnimation();
  }

  public update(cell: Cell) {
    const cellTexture = this.getCellTexture(cell);
    this.back.texture = cellTexture.back;
    this.front.texture = cellTexture.front;
    this.lorez.tint = cellTexture.lorezTint;

    this.playUpdateAnimation();
  }

  private playUpdateAnimation() {
    const animationTime = 0.2;

    TweenMax.from(this.front.scale, animationTime, {
      x: 0,
      y: 0,
    });
    // TweenMax.from(this.lorez.scale, {
    //   x: 5,
    //   y: 5,
    //   duration: animationTime,
    // });
    // TweenMax.from(this.front, 0.2, {
    //   x: "+=" + this.back.width / 2,
    //   y: "+=" + this.back.width / 2,
    // });
    TweenMax.from(this.back, animationTime, { alpha: 0 });
  }

  private getCellTexture(cell: Cell): {
    back: MyTexture;
    front: MyTexture;
    lorezTint: number;
  } {
    const textures = getTextures();

    let back: PIXI.Texture;
    let front: PIXI.Texture;
    let lorezTint: number;

    if (cell.isOpen) {
      back = textures.open;
      if (cell.isMine) {
        front = textures.mineWrong;
        lorezTint = 0xff0000;
      } else if (this.neighborCount !== null && this.neighborCount > 0) {
        type NeighborCountOpen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

        front = textures[this.neighborCount as NeighborCountOpen];
        lorezTint =
          lorezTintNeighborCount[this.neighborCount as NeighborCountOpen];
      } else {
        front = PIXI.Texture.EMPTY;
        lorezTint = 0x444444;
      }
    } else {
      back = textures.closed;
      if (cell.isFlagged) {
        front = textures.flag;
        lorezTint = 0xa0a0a0;
      } else {
        front = PIXI.Texture.EMPTY;
        lorezTint = 0x000000;
      }
    }

    assert(front);
    assert(back);

    return {
      back,
      front,
      lorezTint,
    };
  }
}
const lorezTintNeighborCount = [
  undefined,
  0x2525a6, //1
  0x125412, //2
  0xa54747, //3
  0x613293, //4
  0x662b2b, //5
  0x00cccc, //6
  0xffffff, //7
  0xaa00ff, //8 todo, we need to make the 8 stand out when zoomed out.
] as const;
