import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";
import { Cell } from "./Cell";
import { assert } from "./assert";
import { load, textures } from "./Textures";

export const scale = 3;
const cellWidth = 16 * scale;

type MyTexture = PIXI.Texture<PIXI.Resource>;

type NeighborCount = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// todo rename to neighborcount
function numberToValueNumber(value: number): NeighborCount {
  assert(value % 1 === 0);
  assert(value >= 0);
  assert(value <= 8);

  return value as NeighborCount;
}

export class CellSprite extends PIXI.Container {
  private value: NeighborCount | null;
  // class for creating and updating sprites
  constructor(cell: Cell, value: number | null) {
    super();

    this.value = value === null ? null : numberToValueNumber(value);
    const cellTexture = this.getCellTexture(cell);
    const back = new PIXI.Sprite(cellTexture.back);
    const front = new PIXI.Sprite(cellTexture.front);
    back.width = cellWidth;
    back.height = cellWidth;
    front.width = cellWidth;
    front.height = cellWidth;
    const width = back.width;
    this.x = cell.x * width;
    this.y = cell.y * width;
    back.name = "bg";
    front.name = "fg";
    this.addChildAt(back, 0);
    this.addChildAt(front, 1);
    this.playUpdateAnimation();
  }

  update(cell: Cell) {
    const back = this.getChildAt(0) as PIXI.Sprite;
    const front = this.getChildAt(1) as PIXI.TilingSprite;

    const cellTexture = this.getCellTexture(cell);
    back.texture = cellTexture.back;
    front.texture = cellTexture.front;

    this.playUpdateAnimation();
  }

  playUpdateAnimation() {
    const front = this.getChildByName("fg") as PIXI.Sprite;
    const back = this.getChildByName("bg") as PIXI.TilingSprite;
    console.log();
    TweenMax.from(front.scale, 0.2, { x: 0, y: 0 });
    TweenMax.from(front, 0.2, {
      x: "+=" + (back.width / scale) * 1.5,
      y: "+=" + (back.width / scale) * 1.5,
    });
    TweenMax.from(back, 0.2, { alpha: 0 });
  }

  getCellTexture(cell: Cell): {
    back: MyTexture;
    front: MyTexture;
  } {
    // todo create a getter, maybe call load every time
    const textures = {
      open: PIXI.Assets.get("open") as PIXI.Texture,
      mineWrong: PIXI.Assets.get("mineWrong") as PIXI.Texture,
      closed: PIXI.Assets.get("closed") as PIXI.Texture,
      flag: PIXI.Assets.get("flag") as PIXI.Texture,
      1: PIXI.Assets.get("1") as PIXI.Texture,
      2: PIXI.Assets.get("2") as PIXI.Texture,
      3: PIXI.Assets.get("3") as PIXI.Texture,
      4: PIXI.Assets.get("4") as PIXI.Texture,
      5: PIXI.Assets.get("5") as PIXI.Texture,
      6: PIXI.Assets.get("6") as PIXI.Texture,
      7: PIXI.Assets.get("7") as PIXI.Texture,
      8: PIXI.Assets.get("8") as PIXI.Texture,
    };

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
