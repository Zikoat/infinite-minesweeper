import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";
import { Cell } from "./Cell";

import assert from "assert";

export const scale = 3;
const cellWidth = 16 * scale;

type MyTexture = PIXI.Texture<PIXI.Resource>;

export class CellSprite extends PIXI.Container {
  private value: number | null;
  // class for creating and updating sprites
  constructor(cell: Cell, value: number | null) {
    super();
    this.value = value;
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
    const textures = PIXI.Loader.shared.resources;

    let back;
    let front;

    if (cell.isOpen) {
      back = textures.open.texture;
      if (cell.isMine) front = textures.mineWrong.texture;
      else if (this.value !== null && this.value > 0)
        front = textures[this.value].texture;
      else front = textures.open.texture;
    } else {
      back = textures.closed.texture;
      front = cell.isFlagged ? textures.flag.texture : PIXI.Texture.EMPTY;
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
