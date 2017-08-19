/**
 * Created by sisc0606 on 19.08.2017.
 */
import Cell from "./Cell";
import {updateCell} from "./FieldRenderer";

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
		// todo: implement safeRadius
		// makes the first click not press a mine, is a float and checks in a circle
		this.safeRadius = safeRadius;
		this.gameOver = false;
		this.neighborPosition = [
			[-1,-1],
			[0,-1],
			[1,-1],
			[-1,0],
			// counting with the centerpiece makes bombs not have a value of 0, and open its neigbhors
			//[0,0],
			[1,0],
			[-1,1],
			[0,1],
			[1,1]
		];
		
		// todo: more options:
		// generate on get or open neighbor
		// count with itself
		// permadeath
		// opened mines counter
		// opened cells
		// wrongly flagged cells
		// dig up mines
		// freeze
	}
	getCell(x, y){
		// if the row or cell is not created, we will get an error: cant read property of undefined
		if(!(x in this.field)) return new Cell(x, y, this);
		if(!(y in this.field[x])) return new Cell(x, y, this);
		
		return this.field[x][y];
	}
	open(x, y){
		
		if(this.gameOver){
			console.log("game is over, cant open");
			return;
		}
		if(this.pristine) this.setSafeCells(x, y);
		
		// we check if the cell is generated if we want to change the cell
		let cell = this.getCell(x,y);
		if(cell.isMine === undefined){
			
			cell = this.generateCell(x, y, cell.isFlagged);
			// we call the function with cell.isFlagged so that the flagged state
			// gets carried over (not implemented)
		}
		
		if(cell.isOpen){
			// debugging
			//console.log(x, y, "is already open, cant open");
			return;
		}
		if(cell.isOpen) console.log(x, y, "is open, and updating");
		
		if(cell.isFlagged){
			console.log(x, y, "is flagged, cant open");
			return;
		}
		
		cell.isOpen = true;
		if(cell.isMine){
			console.log("game over, you stepped on a mine: ("+x+", "+y+")");
			this.gameOver = true;
		}
		// debugging
		//console.log("opening "+x+","+y);
		
		// generating of neighbors. we generate the cells when a neighbor is opened
		let neighbors = cell.getNeighbors();
		for (var i = 0; i < neighbors.length; i++) {
			if(neighbors[i].isMine === undefined){
				// debugging
				// console.log("opened neighbor is undefined, generating", neighbors[i].x, neighbors[i].y);
				this.generateCell(neighbors[i].x, neighbors[i].y);
			}
		}
		// debugging
		// console.log(x, y, "value:", cell.value());
		
		// floodfill
		if(cell.value() === 0){
			// debugging
			//console.log("should open", x, y, "'s neighbors");
			cell.getNeighbors() // get all the neighbors
				.filter(cell=>!cell.isOpen) // filter the array, so only the closed neighbors are in it
				.forEach(cell=>cell.open()); // open all the cells in the array
		}
		
		// call the update method which pixi uses to draw things.
		// the function is in another file.
		// todo: make this not dependent of the funcion in the game script.
		updateCell(x, y);
		
		// debugging
		//this.checkForErrors();
	}
	flag(x, y){
		if(this.gameOver){
			console.log("game is over, cant flag");
			return;
		}
		// debugging
		//console.log("the cell's flagged status is: ", f.getCell(x, y).isFlagged);
		let cell = this.getCell(x, y);
		if(!cell.isOpen){
			cell.isFlagged = !cell.isFlagged;
			//console.log("flagged: ", x, y);
			updateCell(x, y);
		} //else console.log("cant flag, is open", cell.x, cell.y);
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
		// if we didnt check this, we would get "cannot read property [column] of undefined"
		if(!(x in this.field)) this.field[x] = {};
		// if the cell is not created
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
	setSafeCells(x0, y0){ // opens a circle of tiles around a point
		this.pristine = false;
		var r = this.safeRadius;
		console.log("safeRadius", this.safeRadius);
		for (var dy = Math.floor(-r); dy < Math.ceil(r); dy++) {
			for (var dx = Math.floor(-r); dx < Math.ceil(r); dx++) {
				if(r**2>dx**2+dy**2){
					let x = x0+dx;
					let y = y0+dy;
					// we generate the cell, and overwrite the isMine state
					this.generateCell(x, y, false, false);
					// debugging
					//console.log(x, y, "is safe");
				}
				// one-lined version
				// if(r**2>dx**2+dy**2) this.open(x0+dx, y0+dx);
			}
		}
	}
}