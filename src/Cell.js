/**
 * Created by sisc0606 on 19.08.2017.
 */
export default class Cell {
	// the cell class only holds the information of the cell, and also mirrors
	// the functions in the field that take x/y arguments. this allows chaining,
	// like this:
	// f.getCell(10,10).open()
	constructor(x, y, parent=undefined, isFlagged=false, isMine=undefined){
		this.x = x;
		this.y = y;
		this.parent = parent;
		this.isOpen = false;
		this.isMine = isMine;
		this.isFlagged = isFlagged;
	}
	
	open(){// opens this cell
		if(this.parent===undefined) console.error("i don't know my parents", this);
		return this.parent.open(this.x, this.y);
	}
	
	flag(){// flags this cell
		if(this.parent===undefined) console.error("i don't know my parents", this);
		return this.parent.flag(this.x, this.y);
	}
	getNeighbors(){//returns an array of this cell's neighbors
		if(this.parent===undefined) console.error("i don't know my parents", this);
		return this.parent.getNeighbors(this.x, this.y);
	}
	value(){
		if(this.parent===undefined) console.error("i don't know my parents", this);
		return this.parent.value(this.x, this.y);
	}
}