import Field from "./Field";
import FieldRenderer from "./FieldRenderer";
import FieldStorage from "./FieldStorage";

import css from "./css/stylesheet.css";

if (localStorage.getItem('defaultSavedField')) {
	self.f = FieldStorage.load('defaultSavedField');
	//console.log(`loading previous field with ${open} mines opened`, self.f.getAll().filter((cell)=>cell.isOpen).length);
} else {
	self.f = new Field(0.20, 3);
	f.open(1,1);
}

self.renderer = new FieldRenderer(f);
self.FieldStorage = FieldStorage;

// todo
// f.on("changedCells", ()=>FieldStorage.save(f, 'defaultSavedField'));