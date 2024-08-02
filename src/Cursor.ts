import { TweenMax, Power4 } from "gsap";
import * as PIXI from "pixi.js";
import { scale } from "./CellSprite";

/**
 * bug: cursor jitters when dragging field
 */

export default class Cursor extends PIXI.Sprite {
  private pointX: number;
  private pointY: number;

  public constructor(x = 0, y = 0, texture: PIXI.Texture) {
    super(texture);
    this.pointX = x;
    this.pointY = y;
    this.scale = { x: scale, y: scale };

    this.moveTo(x, y);
  }

  public moveTo(x: number, y: number) {
    const pos = this.parent?.getChildByName("fg")?.getGlobalPosition();
    if (!pos) {
      console.warn("Tried to move cursor, but foreground is not defined");
      return;
    }

    this.pointX = x;
    this.pointY = y;

    const newX = pos.x + this.pointX * this.width;
    const newY = pos.y + this.pointY * this.width;

    TweenMax.to(this, 0.1, { x: newX, y: newY, ease: Power4.easeOut });
  }

  public move(dx: number, dy: number) {
    this.moveTo(this.pointX + dx, this.pointY + dy);
  }

  public getX() {
    return this.pointX;
  }

  public getY() {
    return this.pointY;
  }
}
