/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import {load} from "./Textures";


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
			else texture.front = Textures[cell.value()];
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
var fieldContainer = new PIXI.Container();

var background;
var clickHandler = new PIXI.Container();
clickHandler.interactive = true;
app.stage.addChild(clickHandler);
var defaultField;

var width;
var counter = 0;
var Textures;

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
		.filter(cell=>cell.isOpen)
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
	
	clickHandler.addChildAt(background, 0);
	clickHandler.addChildAt(fieldContainer, 1);
	
	clickHandler
		.on('mousedown', onDragStart)
		.on('mouseup', onDragEnd)
		.on('pointerupoutside', onDragEnd)
		.on('pointermove', onDragMove)
		.on("rightclick", onRightClick);
	
	document.addEventListener('contextmenu', event => event.preventDefault());
	Textures = Tex;
	updateAllCells(defaultField);
	centerField(0,0);
}

function onDragStart(event) {
	this.data = event.data;
	this.dragging = true;
	this.hasDragged = false;
	this.dragPoint = event.data.getLocalPosition(fieldContainer);
}

function onDragEnd() {
	if(this.hasDragged) {
		this.dragging = false;
		this.data = null;
	} else {
		this.dragging = false;
		this.data = null;
		let x = Math.floor(this.dragPoint.x / width);
		let y = Math.floor(this.dragPoint.y / width);
		updateCells(defaultField.open(x, y));
		console.log("clicked "+x+", "+y);
	}
}

function onDragMove() {
	if (this.dragging) {
		var newPosition = this.data.getLocalPosition(this.parent);
		let x = newPosition.x - this.dragPoint.x;
		let y = newPosition.y - this.dragPoint.y;
		
		fieldContainer.position.set(x,y);
		background.tilePosition.set(x,y);
		this.hasDragged = true;
	}
}
/** center the field around a coordinate */
function centerField(x,y){
	if(x==="undefined") x=0;
	if(y==="undefined") y=0;
	
	let centerX = app.renderer.width/2;
	let centerY = app.renderer.height/2;
	
	let newX = -x*width + centerX;
	let newY = -y*width + centerY;
	fieldContainer.position.set(newX,newY);
	background.tilePosition.set(newX,newY);
}

function onRightClick(event){
	// reminder: use selector
	let position = event.data.getLocalPosition(fieldContainer);
	
	let x = Math.floor(position.x / width);
	let y = Math.floor(position.y / width);
	
	defaultField.flag(x,y);
	updateCell(defaultField, x, y);
}
