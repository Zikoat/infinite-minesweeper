/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import {load} from "./Textures";
import Cursor from "./Cursor";

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

var mouseInput = false;
window.addEventListener("keydown", event => {
	console.log(event.keyCode);
	if(event.keyCode == 65){
		moveViewTo(cursor.getX()-1, cursor.getY());
		cursor.move(-1,0);
		mouseInput = false;
		document.getElementsByTagName("BODY")[0].style.cursor = "none";
	}else if(event.keyCode == 87){
		moveViewTo(cursor.getX(), cursor.getY()-1);
		cursor.move(0,-1);
		mouseInput = false;
		document.getElementsByTagName("BODY")[0].style.cursor = "none";
	}else if(event.keyCode == 83){
		moveViewTo(cursor.getX(), cursor.getY()+1);
		cursor.move(0,+1);
		mouseInput = false;
		document.getElementsByTagName("BODY")[0].style.cursor = "none";
	}else if(event.keyCode == 68){
		moveViewTo(cursor.getX()+1, cursor.getY());
		cursor.move(1,0);
		mouseInput = false;
		document.getElementsByTagName("BODY")[0].style.cursor = "none";
	}else if(event.keyCode == 32){
		open();
		mouseInput = false;
	}else if(event.keyCode == 16){
		flag();
		mouseInput = false;
	}
	
},false);

let uiElements = document.getElementsByClassName('ui');
for (let element of uiElements) {
	element.addEventListener('click', event=>event.stopPropagation(), false)
}

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
	
	clickHandler.addChildAt(background, 0);
	clickHandler.addChildAt(fieldContainer, 1);
	cursor = new Cursor(0,0,Tex,fieldContainer);
	clickHandler.addChildAt(cursor, 2);
	
	clickHandler
		.on('mousedown', onDragStart)
		.on('mouseup', onDragEnd)
		.on('pointerupoutside', onDragEnd)
		.on('pointermove', onDragMove)
		.on('rightclick', onRightClick);
	
	// disable right click context menu
	document.addEventListener('contextmenu', event => event.preventDefault());
	Textures = Tex;
	updateAllCells(defaultField);
	centerField(0,0);
	cursor.moveTo(0,0);
	updateScore();
}

function onDragStart(event) {
	this.dragging = true;
	this.hasDragged = false;
	this.dragPoint = event.data.getLocalPosition(fieldContainer);
	this.startPosition = {x : fieldContainer.position.x, y : fieldContainer.position.y};
	
}

function onDragEnd() {
	if(this.hasDragged) {
		this.dragging = false;
	} else {
		// if the mousebutton didnt move, it means the user clicked
		this.dragging = false;
		open();
		
	}
}
function open(){
	let x = cursor.getX();
	let y = cursor.getY();

	console.log(`clicked ${x}, ${y}`);
	updateCells(defaultField.open(x, y));
	updateScore();
}
function flag(){
	updateCells(defaultField.flag(cursor.getX(),cursor.getY()));
	updateScore();
}
function onDragMove(event) {
	
	if (this.dragging) {
		var newPosition = event.data.getLocalPosition(this.parent);
		let x = Math.floor( newPosition.x - this.dragPoint.x );
		let y = Math.floor( newPosition.y - this.dragPoint.y );
		fieldContainer.position.set(x,y);
		background.tilePosition.set(x,y);
		if(Math.pow(this.startPosition.x-x,2)+Math.pow(this.startPosition.y-y,2)>Math.pow(width,2)/9)
			this.hasDragged = true;
	}
	if(mouseInput){
		let position = event.data.getLocalPosition(fieldContainer);
		let x = Math.floor(position.x/width);
		let y = Math.floor(position.y/width);
		cursor.moveTo(x, y);
	}
	mouseInput = true;
	document.getElementsByTagName("BODY")[0].style.cursor = "default";
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

function onRightClick(event){
	flag();
}

function moveViewTo(newx, newy) {
	let x = newx*width;
	let y = newy*width;
	fieldContainer.position.set(-x+Math.floor(window.innerWidth/width/2)*width,-y+Math.floor(window.innerHeight/width/2)*width);
	background.tilePosition.set(-x+Math.floor(window.innerWidth/width/2)*width,-y+Math.floor(window.innerHeight/width/2)*width);
}
// todo add jsdoc comment: returns point, param event
function getTileCoordsFromEvent(event) {
	let position = event.data.getLocalPosition(fieldContainer);
	
	const x = Math.floor(position.x / width);
	const y = Math.floor(position.y / width);
	return {x: x, y: y};
}

function updateScore(amount) {
	document.getElementById("score").innerHTML = defaultField.score;
}