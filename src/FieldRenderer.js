/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import {load} from "./Textures";
import FieldStorage from "./FieldStorage";
import Controls from "./Controls"

class CellSprite extends PIXI.Container{ // class for creating and updating sprites
	
	constructor(cell){
		super();
		this.x = cell.x * width;
		this.y = cell.y * width;
		let textures = this.chooseTexture(cell);
		let back = new PIXI.Sprite(textures.back);
		let front = new PIXI.Sprite(textures.front);
		this.addChildAt(back, 0);
		this.addChildAt(front, 1);
		fieldContainer.addChild(this);
	}
	
	update(cell){
		let back = this.getChildAt(0);
		let front = this.getChildAt(1);
		
		let textures = this.chooseTexture(cell);
		back.texture = textures.back;
		front.texture = textures.front;
	}
	
	chooseTexture(cell){
		var texture = {};
		
		if(cell.isOpen) {
			texture.back = Textures.open;
			if(cell.isMine) texture.front = Textures.mineWrong;
			else if(cell.value()>0)texture.front = Textures[cell.value()];
			else texture.front = Textures.open;
		} else {
			texture.back = Textures.closed;
			texture.front = cell.isFlagged ? Textures.flag : PIXI.Texture.EMPTY;
		}
		return texture;
	}
}

export default class FieldRenderer /*extends PIXI.Application*/ {
	constructor(field){
		defaultField = field;
		
		defaultField.on("cellChanged", (cell)=>{
			updateCell(defaultField, cell.x, cell.y);
		});

		load().then(setup);
	}
	updateCell(x,y){
		updateCell(defaultField, x, y);
	}
}

var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
window.addEventListener('resize', function(event){
	app.renderer.resize(window.innerWidth, window.innerHeight);
	background.width = app.renderer.width;
	background.height = app.renderer.height;
});

var fieldContainer = new PIXI.Container();
var background;
var clickHandler = new PIXI.Container();
clickHandler.interactive = true;
app.stage.addChild(clickHandler);
var defaultField;

var width;
var counter = 0;
var Textures;
var cursor;

export function updateCell(field, x, y){
	// debugging
	counter++;
	if(counter % 1000 === 100){
		console.log(`update counter is ${counter}, checking field`);
		field.checkForErrors();
	}
	
	let cell = field.getCell(x, y);
	
	if(cell.sprite===undefined){
		cell.sprite = new CellSprite(cell);
	}
	else {
		// debugging
		//console.log("updating", x, y);
		cell.sprite.update(cell);
	}
}
function updateCells(array){
	array.forEach(cell=>{
		updateCell(defaultField, cell.x, cell.y);
	});
}
function updateAllCells(field){
	field.getAll()
		.filter(cell=> cell.isOpen || cell.isFlagged)
		.forEach(cell=>updateCell(field, cell.x, cell.y));
}

function setup(Tex){
	width = Tex.closed.width;
	
	background = new PIXI.extras.TilingSprite(
		Tex.closed,
		app.renderer.width,
		app.renderer.height
	);
	background.tint = 0xffffff;
	
	background.name = "bg";
	fieldContainer.name = "fg";

	clickHandler.addChildAt(background, 0);
	clickHandler.addChildAt(fieldContainer, 1);
	
	Controls.addControls(clickHandler, defaultField, Tex.cursor);
	clickHandler
	
	// todo move to controls
	// disable right click context menu
	document.addEventListener('contextmenu', event => event.preventDefault());

	Textures = Tex;
	updateAllCells(defaultField);
	centerField(0,0);

	document.getElementById("score").innerHTML = field.score;
}

/** center the field around a coordinate */
function centerField (x = 0, y = 0) {
	// x and y are tile coordinates
	let centerX = app.renderer.width/2;
	let centerY = app.renderer.height/2;
	let newX = Math.floor( -x*width + centerX );
	let newY = Math.floor( -y*width + centerY );
	// newX and newY are pixel-coordinates
	fieldContainer.position.set(newX,newY);
	background.tilePosition.set(newX,newY);
}