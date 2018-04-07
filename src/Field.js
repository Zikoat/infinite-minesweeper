/**
 * Created by sisc0606 on 19.08.2017.
 */
import Cell from "./Cell";
import * as Layouts from "./Layouts.js";

export default class Field {
	// do not call any of the cell's functions in the field class, to prevent
	// infinite loops
	constructor(probability=0.5, safeRadius=1){
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
			if(!this.gameOver && cell.isOpen){
				let neighbors = cell.getNeighbors();
				let flagged_count = 0;
				neighbors.forEach(neighbor => {
					if(neighbor.isMine===undefined)this.generateCell(neighbor.x,neighbor.y);
					if(neighbor.isFlagged) flagged_count++; 
				});
				if(cell.value() == flagged_count){
					let openedCells = [];
					neighbors.filter(neighbor=>{
						return !neighbor.isOpen && !neighbor.isFlagged;
					}).forEach(neighbor=>{
						let openedNeighbors = neighbor.open();
						openedNeighbors.forEach(openedNeighbor=>openedCells.push(openedNeighbor));
					});
					return openedCells;
				} 
			}
			return [];
		}
		//todo better generation
		if(cell.isMine === undefined){
			cell = this.generateCell(x, y, cell.isFlagged);
		}
		
		cell.isOpen = true;
		if(cell.isMine){
			console.log("game over, you stepped on a mine: ("+x+", "+y+")");
			this.gameOver = true;
		}
		
		// generating of neighbors. we generate the cells when a neighbor is opened
		let neighbors = cell.getNeighbors();
		for (var i = 0; i < neighbors.length; i++) {
			if(neighbors[i].isMine === undefined){
				// debugging
				// console.log("opened neighbor is undefined, generating", neighbors[i].x, neighbors[i].y);
				this.generateCell(neighbors[i].x, neighbors[i].y);
			}
		}
		
		let openedCells = [];
		openedCells.push(cell);
		// floodfill
		if(cell.value() === 0){
			cell.getNeighbors() // get all the neighbors
				.filter(neighbor=>!neighbor.isOpen) // filter the array, so only the closed neighbors are in it
				.forEach(closedNeighbor=>{
					let openedNeighbors = closedNeighbor.open();
					openedNeighbors.forEach(openedNeighbor=>openedCells.push(openedNeighbor));
				});
		}
		return openedCells;
	}
	flag(x, y){
		let changed_cells = [];
		if(this.gameOver){
			console.log("game is over, cant flag");
			return changed_cells;
		}
		// debugging
		//console.log("the cell's flagged status is: ", f.getCell(x, y).isFlagged);
		let cell = this.getCell(x, y);
		if(!cell.isOpen){
			cell.isFlagged = !cell.isFlagged;
			changed_cells.push(cell);
			//console.log("flagged: ", x, y);
		} else if(cell.value()>0){
			let closed_count = 0;
			let neighbors = cell.getNeighbors();
			neighbors.forEach(neighbor => {if(!neighbor.isOpen)closed_count++;});
			if(closed_count == cell.value()){
				neighbors.filter(neighbor=>{return !neighbor.isOpen}).forEach(neighbor=>{neighbor.isFlagged = true; changed_cells.push(neighbor)});
			}
		}//else console.log("cant flag, is open", cell.x, cell.y);

		return changed_cells;
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
		
		if(openedCells.some(cell=>cell.isFlagged)) console.error("cell is flagged and open", flagAndOpen);
		
		let undefinedCells = cells.filter(cell=>cell.isMine===undefined);
		if(undefinedCells.length > 1) console.error("undefined cells", undefinedCells);
		
		if(openedCells.some(cell=>cell.isMine) && !this.gameOver){
			console.warn("mine dug up, but gameOver wasnt set");
			this.gameOver = true;
		}
	}
	isEligibleToOpen(x, y){// returns a bool, whether this cell can be opened
		if(this.gameOver) return false;
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
}