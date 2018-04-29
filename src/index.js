import Field from "./Field";
import FieldRenderer from "./FieldRenderer";
import FieldStorage from "./FieldStorage";
import SimpleBot from "./bots/botSimple";
import menubutton from "./assets/default/menubutton.png";

import css from "./css/stylesheet.css";

self.fieldName = "defaultSavedFieldv3";
self.FieldStorage = FieldStorage;

if (localStorage.getItem(fieldName)) {
	self.field = FieldStorage.load(fieldName);
} else {
	self.field = new Field(0.20, 3);
	field.open(1,1);
	FieldStorage.save(field, fieldName);
}
// make the variables available globally, like in index.html and the console
self.renderer = new FieldRenderer(field);
self.bot = new SimpleBot(field);

FieldStorage.registerAutoSave(field, fieldName);

field.on("cellChanged", ()=>{
	document.getElementById("score").innerHTML = field.score;
});

let button = document.getElementById('menubutton');
button.src = menubutton;

self.toggleMenu = function () {
	let menu = document.getElementById("menu");
	menu.style.display = menu.style.display == "none" ? "block" : "none";
}

self.restart = function () {
	localStorage.clear();
	console.log("removed: ", fieldName);
	window.location.reload();
}