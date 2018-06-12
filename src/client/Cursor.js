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
		// tile coordinates
		this.pointX = x;
		this.pointY = y;
		
		// pixel coordinates
		let pos = this.parent.getChildByName("fg").getGlobalPosition();
		
		const newX = pos.x+this.pointX*this.width;
		const newY = pos.y+this.pointY*this.width;

		TweenMax.to(this, 0.1, {x: newX, y:newY, ease:Power4.easeOut});
	}
	move(dx,dy){ // tile coordinate
		this.moveTo(this.pointX + dx, this.pointY + dy);
	}
	getX(){ // tile coordinate, is good
		return this.pointX;
	}
	getY(){ // tile coordinate
		return this.pointY;
	}
}