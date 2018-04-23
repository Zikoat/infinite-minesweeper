import { textures } from "./Textures";

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
		this.x = pos.x+x*this.width;
		this.y = pos.y+y*this.width;
	}
	move(dx,dy){
		this.pointX += dx;
		this.pointY += dy;
		let pos = this.parent.getChildByName("fg").getGlobalPosition();
		this.x = pos.x+this.pointX*this.width;
		this.y = pos.y+this.pointY*this.width;
	}
	getX(){
		return this.pointX;
	}
	getY(){
		return this.pointY;
	}
}