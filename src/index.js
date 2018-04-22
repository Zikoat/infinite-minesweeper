import Field from "./Field";
import FieldRenderer from "./FieldRenderer";
import FieldStorage from "./FieldStorage";

import css from "./css/stylesheet.css";

if (localStorage.getItem('defaultSavedField')) {
	self.field = FieldStorage.load('defaultSavedField');
	//console.log(`loading previous field with ${open} mines opened`, self.field.getAll().filter((cell)=>cell.isOpen).length);
} else {
	self.field = new Field(0.20, 3);
	field.open(1,1);
}

self.renderer = new FieldRenderer(field);
self.FieldStorage = FieldStorage;

field.on("cellChanged", ()=>{
	document.getElementById("score").innerHTML = field.score;
	FieldStorage.save(field, 'defaultSavedField');
});
