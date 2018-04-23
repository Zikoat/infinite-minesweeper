import Field from "./Field";
import FieldRenderer from "./FieldRenderer";
import FieldStorage from "./FieldStorage";
import SimpleBot from "./bots/botSimple";
import menubutton from "./assets/default/menubutton.png";

import css from "./css/stylesheet.css";

if (localStorage.getItem('defaultSavedField')) {
	self.field = FieldStorage.load('defaultSavedField');
	console.log(`loading previous field with ${open} mines opened`, self.field.getAll().filter((cell)=>cell.isOpen).length);
} else {
	self.field = new Field(0.20, 3);
	field.open(1,1);
}

self.renderer = new FieldRenderer(field);
self.bot = new SimpleBot(field);
self.FieldStorage = FieldStorage;

field.on("cellChanged", ()=>{
	document.getElementById("score").innerHTML = field.score;
	FieldStorage.save(field, 'defaultSavedField');
});

let button = document.getElementById('menubutton');
button.src = menubutton;
button.onclick = function () {
	console.log("cliced menubutton");
	let menu = document.getElementById("menu");
	menu.style.display = menu.style.display == "none" ? "block" : "none";
}
