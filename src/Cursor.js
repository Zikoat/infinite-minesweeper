import EventEmitter from 'eventemitter3';

export default class Cursor extends EventEmitter {
	constructor(x = 0, y = 0) {
		super();
		this.x = x;
		this.y = y;
	}
	moveTo(x, y) {
		this.x = x;
		this.y = y;
		this.emit('move', x, y);
	}
}