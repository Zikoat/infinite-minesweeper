import Cursor from "./Cursor";

export default class Controls {
	static addControls(rootObject, field, cursorTexture) {
		Controls.field = field;
		
		Controls.addMouseControls(rootObject);
		Controls.addKeyboardControls();
		Controls.removeUIEventBubbling();

		// todo move into own addCursor method
		Controls.cursor = new Cursor(0, 0, cursorTexture, rootObject.getChildByName("bg").texture.width);
		rootObject.addChildAt(Controls.cursor, 2);

	}

	static addMouseControls(rootObject) {
		rootObject
			.on('mousedown', Controls._onDragStart)
			.on('mouseup', Controls._onDragEnd)
			.on('pointerupoutside', Controls._onDragEnd)
			.on('pointermove', Controls._onDragMove)
			.on('rightclick', Controls._onRightClick);
	}

	static addKeyboardControls() {
		window.addEventListener("keydown", event => {
			if(event.keyCode == 37){
				moveViewTo(cursor.getX()-1, cursor.getY());
				cursor.move(-1,0);
				mouseInput = false;
				document.getElementsByTagName("BODY")[0].style.cursor = "none";
			}else if(event.keyCode == 38){
				moveViewTo(cursor.getX(), cursor.getY()-1);
				cursor.move(0,-1);
				mouseInput = false;
				document.getElementsByTagName("BODY")[0].style.cursor = "none";
			}else if(event.keyCode == 40){
				moveViewTo(cursor.getX(), cursor.getY()+1);
				cursor.move(0,+1);
				mouseInput = false;
				document.getElementsByTagName("BODY")[0].style.cursor = "none";
			}else if(event.keyCode == 39){
				moveViewTo(cursor.getX()+1, cursor.getY());
				cursor.move(1,0);
				mouseInput = false;
				document.getElementsByTagName("BODY")[0].style.cursor = "none";
			}else if(event.keyCode == 88){
				open();
				mouseInput = false;
			}else if(event.keyCode == 90){
				flag();
				mouseInput = false;
			}
		},false);
	}

	static removeUIEventBubbling() {
		let uiElements = document.getElementsByClassName('ui');
		for (let element of uiElements) {
			element.addEventListener('click', (event)=>{event.stopPropagation();}, false);
		}
	}

	static _onDragStart(event) {
		const foreground = this.getChildByName("fg");
		
		this.dragging = true;
		this.hasDragged = false;

		this.dragPoint = event.data.getLocalPosition(foreground);
		this.startPosition = {x : foreground.position.x, y : foreground.position.y};
	}

	static _onDragEnd() {
		if(this.hasDragged) {
			this.dragging = false;
		} else {
			// if the mousebutton didnt move, it means the user clicked
			this.dragging = false;
			Controls.open();
		}
	}
	static _onDragMove(event) {
		const width = this.getChildByName("bg").texture.width;
		
		if (this.dragging) {
			var newPosition = event.data.getLocalPosition(this.parent);
			let x = Math.floor( newPosition.x - this.dragPoint.x );
			let y = Math.floor( newPosition.y - this.dragPoint.y );
			
			const foreground = this.getChildByName("fg");
			const background = this.getChildByName("bg");

			foreground.position.set(x,y);
			background.tilePosition.set(x,y);
			if(Math.pow(this.startPosition.x-x,2)+Math.pow(this.startPosition.y-y,2)>Math.pow(width,2)/9) {
				this.hasDragged = true;
			}
		}
		if(Controls.mouseInput){
			let position = event.data.getLocalPosition(this.getChildByName("fg"));
			let x = Math.floor(position.x/width);
			let y = Math.floor(position.y/width);
			Controls.cursor.moveTo(x, y);
		}
		Controls.mouseInput = true;
		document.getElementsByTagName("BODY")[0].style.cursor = "default";
	}

	static _onRightClick(event){
		Controls.flag();
	}

	static open(){
		const x = Controls.cursor.getX();
		const y = Controls.cursor.getY();

		console.log(`opened ${x}, ${y}`);
		Controls.field.open(x, y);
	}

	static flag(){
		const x = Controls.cursor.getX();
		const y = Controls.cursor.getY();
		const cell = Controls.field.getCell(x, y);
		const isOpen = cell.isOpen;
		const closedNeighbors = Controls.field.getNeighbors(x, y).filter(cell=>!cell.isOpen);
		cell.flag();
		if (!isOpen) {
			//console.log(`flagged ${x}, ${y}`);
		} else if (closedNeighbors.length === cell.value()) {
			closedNeighbors.forEach(neighbor=>{
				neighbor.flag();
			})
			console.log(`flagged the neighbors of ${x}, ${y}`);
		}
	}

	// todo move keyboard controls here
	
	static moveViewTo(newx, newy) {
		const width = Controls.rootObject.getChildByName("bg").texture.width;
		const x = newx*width;
		const y = newy*width;
		fieldContainer.position.set(-x+Math.floor(window.innerWidth/width/2)*width,-y+Math.floor(window.innerHeight/width/2)*width);
		background.tilePosition.set(-x+Math.floor(window.innerWidth/width/2)*width,-y+Math.floor(window.innerHeight/width/2)*width);
	}
}