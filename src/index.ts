import Field from "./Field";
import FieldRenderer from "./FieldRenderer";
import FieldStorage from "./FieldStorage";
import probability from "./Settings";
import SimpleBot from "./bots/botSimple";
import "./css/stylesheet.css";
const menubutton = require("./assets/default/menubutton.png");

var fieldName = window.fieldName = "defaultSavedFieldv3";
window.FieldStorage = FieldStorage;

var field: Field;

if (localStorage.getItem(fieldName)) {
	field = FieldStorage.load(fieldName);
	console.log(`loading previous field with ${field.getAll().filter((cell)=>cell.isOpen).length} mines opened`);
} else {
	field = new Field(0.20, 3);
	field.open(1,1);
	FieldStorage.save(field, fieldName);
}

window.field = field;

// make the variables available globally, so we can access them in index.html and the console
window.renderer = new FieldRenderer(field);
window.bot = new SimpleBot(field);
window.FieldStorage = FieldStorage;

FieldStorage.registerAutoSave(field, fieldName);

field.on("cellChanged", ()=>{
	document.getElementById("score").innerHTML = field.score.toString();
});

let button: HTMLImageElement = document.getElementById('menubutton') as HTMLImageElement;
button.src = menubutton;

self.toggleMenu = function () {
	let menu = document.getElementById("menu");
	menu.style.display = menu.style.display == "none" ? "block" : "none";
}

self.restart = function () {
	localStorage.clear();
	// todo save settings
	console.log("removed: ", fieldName);
	window.location.reload();
}