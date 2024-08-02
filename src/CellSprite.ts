import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";
import { Cell } from "./Cell";
import { assert } from "./assert";
import { getTextures } from "./Textures";

export const scale = 3;
const cellWidth = 16 * scale;

type MyTexture = PIXI.Texture;

type NeighborCount = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// todo rename to neighborcount
function numberToValueNumber(value: number): NeighborCount {
  assert(value % 1 === 0);
  assert(value >= 0);
  assert(value <= 8);

  return value as NeighborCount;
}

export class CellSprite {
  private value: NeighborCount | null;
  private back: PIXI.Sprite;
  private front: PIXI.Sprite;

  constructor(cell: Cell, value: number | null, parent: PIXI.Container) {
    this.value = value === null ? null : numberToValueNumber(value);
    const cellTexture = this.getCellTexture(cell);
    this.back = new PIXI.Sprite(cellTexture.back);
    this.front = new PIXI.Sprite(cellTexture.front);
    this.back.width = cellWidth;
    this.back.height = cellWidth;
    this.front.width = cellWidth;
    this.front.height = cellWidth;
    const width = this.back.width;
    const x = cell.x * width;
    const y = cell.y * width;
    this.front.x = x;
    this.front.y = y;
    this.back.x = x;
    this.back.y = y;
    this.back.name = "bg";
    this.front.name = "fg";
    parent.addChild(this.back, this.front);
    this.playUpdateAnimation();
  }

  public update(cell: Cell, playAnimation = true) {
    const cellTexture = this.getCellTexture(cell);
    this.back.texture = cellTexture.back;
    this.front.texture = cellTexture.front;

    if (playAnimation) this.playUpdateAnimation();
  }

  // todo don't run update animation then updating all cells to improve performance on load and reload.
  private playUpdateAnimation() {
    TweenMax.from(this.front.scale, 0.2, { x: 0, y: 0 });
    TweenMax.from(this.front, 0.2, {
      x: "+=" + (this.back.width / scale) * 1.5,
      y: "+=" + (this.back.width / scale) * 1.5,
    });
    TweenMax.from(this.back, 0.2, { alpha: 0 });
  }

  private getCellTexture(cell: Cell): {
    back: MyTexture;
    front: MyTexture;
  } {
    // todo create a getter, maybe call load every time
    const textures = getTextures();

    let back;
    let front;

    if (cell.isOpen) {
      back = textures.open;
      if (cell.isMine) front = textures.mineWrong;
      else if (this.value !== null && this.value > 0)
        front = textures[this.value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8];
      else front = textures.open;
    } else {
      back = textures.closed;
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
