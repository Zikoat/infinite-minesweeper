
export default class Cursor extends PIXI.Sprite{
	
	constructor(x = 0, y = 0, Tex,fieldContainer) {
		super(Tex.cursor);

		this.pointX = x;
		this.pointY = y;
		this.fieldContainer = fieldContainer;
		moveTo(x,y);
	}
	moveTo(x, y) {
		this.pointX = x;
		this.pointY = y;
		let pos = this.fieldContainer.getGlobalPosition();
		this.x = pos.x+x*this.width;
		this.y = pos.y+y*this.width;
	}
	move(dx,dy){
		this.pointX += dx;
		this.pointY += dy;
		let pos = this.fieldContainer.getGlobalPosition();
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