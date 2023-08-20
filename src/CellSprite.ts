import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";
import { Cell } from "./Cell";
import { LoaderResource } from "pixi.js";

export const scale = 3;
const cellWidth = 16 * scale;

export class CellSprite extends PIXI.Container {
  private value: number | null;
  // class for creating and updating sprites
  constructor(cell: Cell, value: number | null) {
    super();
    this.value = value;
    let cellTexture = this.getCellTexture(cell);
    let back = new PIXI.Sprite(cellTexture.back.texture);
    let front = new PIXI.Sprite(cellTexture.front.texture);
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
    let back = this.getChildAt(0) as PIXI.Sprite;
    let front = this.getChildAt(1) as PIXI.TilingSprite;

    let cellTexture = this.getCellTexture(cell);
    back.texture = cellTexture.back;
    front.texture = cellTexture.front;

    this.playUpdateAnimation();
  }

  playUpdateAnimation() {
    let front = this.getChildByName("fg") as PIXI.Sprite;
    let back = this.getChildByName("bg") as PIXI.TilingSprite;
    console.log();
    TweenMax.from(front.scale, 0.2, { x: 0, y: 0 });
    TweenMax.from(front, 0.2, {
      x: "+=" + (back.width / scale) * 1.5,
      y: "+=" + (back.width / scale) * 1.5,
    });
    TweenMax.from(back, 0.2, { alpha: 0 });
  }

  getCellTexture(cell: Cell): { back: LoaderResource; front: LoaderResource } {
    const textures = PIXI.Loader.shared.resources;

    let back: LoaderResource | undefined = undefined;
    let front: LoaderResource | undefined = undefined;

    if (cell.isOpen) {
      back = textures.open;
      if (cell.isMine) front = textures.mineWrong;
      else if (this.value !== null && this.value > 0)
        front = textures[this.value];
      else front = textures.open;
    } else {
      back = textures.closed;
      front = cell.isFlagged
        ? textures.flag
        : (PIXI.Texture.EMPTY as LoaderResource);
    }
    let texture: { back: LoaderResource; front: LoaderResource } = {
      back,
      front,
    };

    return texture;
  }
}
