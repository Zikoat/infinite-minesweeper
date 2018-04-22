/**
 * Created by sisc0606 on 19.08.2017.
 */
import Cell from "./Cell";
import * as Layouts from "./Layouts";
import EventEmitter from "eventemitter3"
/**
 * events:
 * changedCells, if any cells have been changed, returns an array of the cells that have been changed
 * wrongMove, if a wrong cell has been pressed (open mine or flag non-mine), returns the cell that was pressed
 */
export default class Field extends EventEmitter{
	// do not call any of the cell's functions in the field class, to prevent
	// infinite loops
	constructor(probability=0.5, safeRadius=1){
		super();

		this.field = {};
		// this is the probability that a mine is a cell
		this.probability = probability;
		// the field is pristine if no cells are opened, set this to true again with
		// Field.restart()
		this.pristine = true;
		// makes the first click not press a mine, radius is a float and checks in a circle
		this.safeRadius = safeRadius;
		this.gameOver = false;

		this.neighborPosition = Layouts.normal;
		this.score = 0;
		// todo someday: more options:
		// non-permadeath
		// opened mines/cells counter
		// wrongly flagged cells
		// overwrite mine state
		// freeze mode
	}
	getCell(x, y){
		// if the row or cell is not created, we will get an error: cant read property of undefined
		if(!(x in this.field)) return new Cell(x, y, this);
		if(!(y in this.field[x])) return new Cell(x, y, this);
		
		return this.field[x][y];
	}
	open(x, y){
		// returns an array of all the opened cells: [Cell, Cell, Cell, ...]
		
		if(this.pristine) this.setSafeCells(x, y);
		let cell = this.getCell(x,y);

		if(!this.isEligibleToOpen(x, y)){
			return false;
		}
		
		//todo better generation
		if(cell.isMine === undefined){
			cell = this.generateCell(x, y, cell.isFlagged);
		}
		
		cell.isOpen = true;

		let openedCells = [];
		openedCells.push(cell);

		if(cell.isMine){
			console.log("game over, you stepped on a mine: ("+x+", "+y+")");
			this.score-=100;
			this.emit("cellChanged", cell);
			return false; 
		}
		this.score++;
		// generating of neighbors. we generate the cells when a neighbor is opened
		let neighbors = cell.getNeighbors();
		for (var i = 0; i < neighbors.length; i++) {
			if(neighbors[i].isMine === undefined){
				// debugging
				// console.log("opened neighbor is undefined, generating", neighbors[i].x, neighbors[i].y);
				this.generateCell(neighbors[i].x, neighbors[i].y);
			}
		}
		
		
		// floodfill
		if(cell.value() === 0){
			cell.getNeighbors() // get all the neighbors
				.filter(neighbor=>!neighbor.isOpen) // filter the array, so only the closed neighbors are in it
				.forEach(closedNeighbor=>{
					closedNeighbor.open();
				});
		}

		this.emit("cellChanged", cell);
		return openedCells.length >= 1;
	}
	flag(x, y){
		let cell = this.getCell(x, y);
		if(!cell.isOpen){
			cell.isFlagged = !cell.isFlagged;
			this.emit("cellChanged", cell);
		}
	}
	getNeighbors(x, y){
		let neighbors = [];
		for (var i = 0; i <= this.neighborPosition.length - 1; i++) {
			let newX = x + this.neighborPosition[i][0];
			let newY = y + this.neighborPosition[i][1];
			neighbors.push(this.getCell(newX,newY));
		}
		return neighbors;
	}
	generateCell(x, y, isFlagged = false, isMine = undefined){
		// if the row is not created yet, create the row
		if(!(x in this.field)) this.field[x] = {};
		if(!(y in this.field[x])) {
			// here, ismine is being put to something else than undefined, which
			// means isMine is undefined when the cell is not generated. this
			// is why we can check isMine===undefined to determine if the cell is generated
			
			// determine if the cell is a mine
			if(isMine===undefined) isMine = Math.random() < this.probability;
			// and add it to the field
			let cell =  new Cell(x, y, this, isFlagged, isMine);
			this.field[x][y] = cell;
			return cell;
		} else {console.warn(x, y, "is already generated");}
	}
	restart(){// todo
		this.pristine = true;
		// todo: delete all of the rows, update all of the cells
	}
	getAll(){// returns all the cells, in a 1-dimensonal array, for easy iteration
		// includes all af the open cells, and their neighbors(the border)
		let cells = [];
		let rows = Object.keys(this.field);
		for (var i = 0; i < rows.length; i++) {
			let columns = Object.keys(this.field[rows[i]]);
			for (var j = 0; j < columns.length; j++) {
				cells.push(this.getCell(rows[i],columns[j]));
			}
		}
		return cells;
	}
	value(x, y){// returns the amount of surrounding mines
		let cell = this.getCell(x,y);
		// it does not make sense to request the value of a closed cell
		if(cell.isOpen === false) return null;
		else return this.getNeighbors(x, y)
			.filter(cell=>cell.isMine)
			.length;
	}
	checkForErrors(){
		// debugging
		let cells = this.getAll();
		let openedCells = cells.filter(cell=>cell.isOpen);
		
		if(openedCells.some(cell=>cell.isFlagged)) console.error("cell is flagged and open", openedCells.filter(cell=>cell.isFlagged));
		
		let undefinedCells = cells.filter(cell=>cell.isMine===undefined);
		if(undefinedCells.length > 1) console.error("undefined cells", undefinedCells);
		
		if(openedCells.some(cell=>cell.isMine) && !this.gameOver){
			console.warn("mine dug up, but gameOver wasnt set");
			this.gameOver = true;
		}
	}
	isEligibleToOpen(x, y){// returns a bool, whether this cell can be opened
		//if(this.gameOver) return false;
		let cell = this.getCell(x, y);
		if(cell.isFlagged) return false;
		if(cell.isOpen)	return false;
		return true;
	}
	setSafeCells(x0, y0){// initiate the field with a circle of cells that aren't mines
		this.pristine = false;
		let r = this.safeRadius;
		
		console.log("safeRadius", this.safeRadius);
		
		for (let dy = Math.floor(-r); dy < Math.ceil(r); dy++) {
			for (let dx = Math.floor(-r); dx < Math.ceil(r); dx++) {
				// if the cell is in a circle with radius r
				if(r**2>dx**2+dy**2){
					let x = x0+dx;
					let y = y0+dy;
					// we generate the cell, and overwrite the isMine state
					this.generateCell(x, y, false, false);
				}
				// one-lined version
				// if(r**2>dx**2+dy**2) this.open(x0+dx, y0+dx);
			}
		}
	}
	toJSON() {
		const fieldToStore = {};
		Object.assign(fieldToStore, this)
		delete fieldToStore._events;
		return fieldToStore;
	}
}