import { textures } from "./Textures";
import { TweenMax, Power4 } from "gsap";

export default class Cursor extends PIXI.Sprite{

	constructor(x = 0, y = 0) {
		super(textures.cursor);
		this.pointX = x;
		this.pointY = y;

		moveTo(x,y);
	}
	moveTo(x, y) {
		this.pointX = x;
		this.pointY = y;
		let pos = this.parent.getChildByName("fg").getGlobalPosition();

		const newX = pos.x+this.pointX*this.width;
		const newY = pos.y+this.pointY*this.width;

		TweenMax.to(this, 0.1, {x: newX, y:newY, ease:Power4.easeOut});
	}
	move(dx,dy){
		this.moveTo(this.pointX + dx, this.pointY + dy);
	}
	getX(){
		return this.pointX;
	}
	getY(){
		return this.pointY;
	}
}