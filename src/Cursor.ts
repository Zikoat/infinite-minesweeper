import { textures } from "./Textures";
import { TweenMax, Power4 } from "gsap";
import * as PIXI from "pixi.js";

/**
 * bug: cursor jitters when dragging field
 */

export default class Cursor extends PIXI.Sprite {
  pointX;
  pointY;

  constructor(x = 0, y = 0, texture: PIXI.Texture<PIXI.Resource>) {
    super(texture);
    this.pointX = x;
    this.pointY = y;

    this.moveTo(x, y);
  }
  moveTo(x: number, y: number) {
    const foreground = this.parent?.getChildByName("fg")?.getGlobalPosition();
    if (!foreground) {
      console.warn("Tried to move cursor, but foreground is not defined");
      return;
    }

    this.pointX = x;
    this.pointY = y;
    let pos = this.parent.getChildByName("fg").getGlobalPosition();

    // let pos = new PIXI.Point(0, 0);

    const newX = pos.x + this.pointX * this.width;
    const newY = pos.y + this.pointY * this.width;

    TweenMax.to(this, 0.1, { x: newX, y: newY, ease: Power4.easeOut });
  }
  move(dx: number, dy: number) {
    this.moveTo(this.pointX + dx, this.pointY + dy);
  }
  getX() {
    return this.pointX;
  }
  getY() {
    return this.pointY;
  }
}
