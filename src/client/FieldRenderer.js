/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import * as Textures from "./Textures.js";
import FieldStorage from "../server/FieldStorage";
import Controls from "./Controls"
import CellSprite from "./CellSprite";
import {TweenMax, Power2, TimelineLite} from "gsap";
import {CHUNK_SIZE} from "../server/Chunk";

export default class FieldRenderer /*extends PIXI.Application*/ {
	constructor(field){
		defaultField = field;
		
		defaultField.on("cellChanged", (cell)=>{
			updateCell(defaultField, cell.x, cell.y);
		});

		Textures.load().then(setup);
	}
	updateCell(x,y){
		updateCell(defaultField, x, y);
	}
	updateAllCells(){
		updateAllCells(defaultField);
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

function updateCell(field, x, y){
	let cell = field.getCell(x, y);
	
	if(cell.sprite===undefined){
		cell.sprite = new CellSprite(cell);
		fieldContainer.addChild(cell.sprite);
	}
	else {
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
	
	// todo listen to field moved event, and subscribe to visible chunks, if they havent been subscribed to yet. also unsubscribe
	
	// todo move to controls
	// disable right click context menu
	document.addEventListener('contextmenu', event => event.preventDefault());
	updateAllCells(defaultField);
	centerField(0,0);
	document.getElementById("score").innerHTML = field.score;
	console.log("done setup");
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

function getVisibleChunks() {
	// the naming of positions follows a pattern:
	// the first word tells us where the entity is located. this can be in screen or world space, and may be omitted
	// the second word is what unit the coordinates use. this can be pixel, tile or chunk.
	// the third word is the name of the entity. e.g. "world" or "windowStart"
	// the fourth word tells us what type the coordinates represent. this can be an offset, a coordinate or a size
	
	// in the case of globalChunkWindowEndCoordinates, it contains the coordinates of the chunk which is in
	// the bottom-right corner of the window, in the global coordinate space.
	
	const pixelWorldOffset = fieldContainer.getGlobalPosition();
	const globalPixelWindowStartCoordinates = {
		x: -pixelWorldOffset.x,
		y: -pixelWorldOffset.y
	} ;
	
	const pixelTileSize = background.texture.width;
	const tileChunkSize = CHUNK_SIZE;
	const globalChunkWindowStartCoordinates = {
		x: Math.floor(globalPixelWindowStartCoordinates.x / pixelTileSize / tileChunkSize),
		y: Math.floor(globalPixelWindowStartCoordinates.y / pixelTileSize / tileChunkSize)
	};
	
	const pixelWindowSize = {
		width: window.innerWidth,
		height: window.innerHeight
	};
	const globalChunkWindowEndCoordinates = {
		x: Math.floor((globalPixelWindowStartCoordinates.x + pixelWindowSize.width) / pixelTileSize / tileChunkSize),
		y: Math.floor((globalPixelWindowStartCoordinates.y + pixelWindowSize.height) / pixelTileSize / tileChunkSize)
	};
	
	let visibleChunkCoordinates = [];
	for (let x = globalChunkWindowStartCoordinates.x; x < globalChunkWindowEndCoordinates.x; x++) {
		for (let y = globalChunkWindowStartCoordinates.y; y < globalChunkWindowEndCoordinates.y; y++) {
			visibleChunkCoordinates.push({x: x, y: y});
		}
	}
	console.log("visible chunks:", visibleChunkCoordinates);
	return visibleChunkCoordinates;
}