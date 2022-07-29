import { Field } from "./Field";
import { FieldRenderer } from "./FieldRenderer";
import { FieldPersistence } from "./FieldPersistence";
import "./css/stylesheet.css";
import menubutton from "./assets/default/menubutton.png";
import { LocalStorage } from "node-localstorage";

var fieldName = (window.fieldName = "defaultSavedFieldv3");
const localStorage: LocalStorage = window.localStorage;
const fieldStorage = (window.FieldStorage = new FieldPersistence(localStorage));

var field: Field;

const probability = 0.20

field = new Field(probability, 3, fieldName);

if (localStorage.getItem(fieldName)) {
  field = fieldStorage.load(fieldName);
  console.log(
    `loading previous field with ${
      field.getAll().filter((cell) => cell.isOpen).length
    } fields opened`
  );
} else {
  field = new Field(probability, 3, fieldName);
  field.open(1, 1);
  fieldStorage.save(field, fieldName);
}

console.log(field);

function updateScore(localField: Field) {
  document.getElementById("score").innerHTML = localField.score.toString();
}

new FieldRenderer(field, updateScore, fieldStorage);

let button: HTMLImageElement = document.getElementById(
  "menubutton"
) as HTMLImageElement;
button.src = menubutton;

self.toggleMenu = function () {
  let menu = document.getElementById("menu");
  menu.style.display = menu.style.display == "none" ? "block" : "none";
};

self.restart = function () {
  localStorage.clear();
  console.log("removed: ", fieldName);
  window.location.reload();
};
