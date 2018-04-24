import Field from "./Field";
import FieldRenderer from "./FieldRenderer";
import FieldStorage from "./FieldStorage";
import SimpleBot from "./bots/botSimple";
import menubutton from "./assets/default/menubutton.png";

import css from "./css/stylesheet.css";

if (localStorage.getItem('defaultSavedFieldChunk')) {
	self.field = FieldStorage.load('defaultSavedFieldChunk');
	console.log(`loading previous field with ${self.field.getAll().filter((cell)=>cell.isOpen).length} mines opened`);
} else {
	self.field = new Field(0.20, 3);
	field.open(1,1);
}

self.renderer = new FieldRenderer(field);
self.bot = new SimpleBot(field);
self.FieldStorage = FieldStorage;

field.on("cellChanged", ()=>{
	document.getElementById("score").innerHTML = field.score;
	FieldStorage.save(field, 'defaultSavedFieldChunk');
});

let button = document.getElementById('menubutton');
button.src = menubutton;

self.toggleMenu = function () {
	let menu = document.getElementById("menu");
	menu.style.display = menu.style.display == "none" ? "block" : "none";
}

self.restart = function () {
	localStorage.removeItem('defaultSavedFieldChunk');
	console.log("romoved defaultSavedFieldChunk");
	window.location.reload();
}