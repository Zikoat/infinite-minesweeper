import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";
import { Cell } from "./Cell";
import { LoaderResource } from "pixi.js";

export class CellSprite extends PIXI.Container {
  private value: number | null;
  // class for creating and updating sprites
  constructor(cell: Cell, value: number | null) {
    super();
    this.value = value;
    let cellTexture = this.getCellTexture(cell);
    let back = new PIXI.Sprite(cellTexture.back.texture);
    let front = new PIXI.Sprite(cellTexture.front.texture);
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
    let back = this.getChildAt(0);
    let front = this.getChildAt(1);

    let cellTexture = this.getCellTexture(cell);
    back.texture = cellTexture.back;
    front.texture = cellTexture.front;
    this.playUpdateAnimation();
  }

  playUpdateAnimation() {
    let front = this.getChildByName("fg");
    let back = this.getChildByName("bg");

    TweenMax.from(front.scale, 0.2, { x: 0, y: 0 });
    TweenMax.from(front, 0.2, { x: "+=8", y: "+=8" });
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
