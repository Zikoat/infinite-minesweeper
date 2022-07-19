import { textures, width } from "./Textures";
import { TweenMax } from "gsap";
import * as PIXI from "pixi.js";

export default class CellSprite extends PIXI.Container {
  // class for creating and updating sprites
  constructor(cell) {
    super();
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

  update(cell) {
    let back = this.getChildAt(0);
    let front = this.getChildAt(1);

    let cellTexture = this.getCellTexture(cell);
    back.texture = cellTexture.back;
    front.texture = cellTexture.front;
    this.playUpdateAnimation();
  }

  playUpdateAnimation(cell) {
    let currentY = this.position.y;
    let currentX = this.position.x;
    let front = this.getChildByName("fg");
    let back = this.getChildByName("bg");

    TweenMax.from(front.scale, 0.2, { x: 0, y: 0 });
    TweenMax.from(front, 0.2, { x: "+=8", y: "+=8" });
    TweenMax.from(back, 0.2, { alpha: 0 });
  }

  getCellTexture(cell) {
    const textures = PIXI.Loader.shared.resources;

    var texture = {};

    if (cell.isOpen) {
      texture.back = textures.open;
      if (cell.isMine) texture.front = textures.mineWrong;
      else if (cell.value() > 0) texture.front = textures[cell.value()];
      else texture.front = textures.open;
    } else {
      texture.back = textures.closed;
      texture.front = cell.isFlagged ? textures.flag : PIXI.Texture.EMPTY;
    }
    return texture;
  }
}
