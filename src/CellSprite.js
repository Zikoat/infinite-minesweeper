import { textures, width } from "./Textures";

export default class CellSprite extends PIXI.Container{ // class for creating and updating sprites
	constructor(cell){
		super();
		this.x = cell.x * width;
		this.y = cell.y * width;
		let cellTexture = this.getCellTexture(cell);
		let back = new PIXI.Sprite(cellTexture.back);
		let front = new PIXI.Sprite(cellTexture.front);
		this.addChildAt(back, 0);
		this.addChildAt(front, 1);
	}
	
	update(cell){
		let back = this.getChildAt(0);
		let front = this.getChildAt(1);
		
		let cellTexture = this.getCellTexture(cell);
		back.texture = cellTexture.back;
		front.texture = cellTexture.front;
	}
	
	getCellTexture(cell){
		var texture = {};
		
		if(cell.isOpen) {
			texture.back = textures.open;
			if(cell.isMine) texture.front = textures.mineWrong;
			else if(cell.value()>0)texture.front = textures[cell.value()];
			else texture.front = textures.open;
		} else {
			texture.back = textures.closed;
			texture.front = cell.isFlagged ? textures.flag : PIXI.Texture.EMPTY;
		}
		return texture;
	}
}