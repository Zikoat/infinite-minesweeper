class Cursor {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	moveTo(x, y) {
		this.x = x;
		this.y = y;
		// send move event
	}
	displace(dx, dy) {
		this.moveTo(this.x + dx, this.y + dy);
	}
}