import { Field } from "./Field";
import { FieldRenderer } from "./FieldRenderer";
import { FieldPersistence } from "./FieldPersistence";
import "./css/stylesheet.css";
import menubutton from "./assets/default/menubutton.png";
import { loadTextures } from "./Textures";
import * as PIXI from "pixi.js";

const fieldName = (window.fieldName = "defaultSavedFieldv3");
const localStorage = window.localStorage;
const fieldStorage = (window.FieldStorage = new FieldPersistence(localStorage));

function updateScore(localField: Field) {
  const scoreElement = document.getElementById("score");
  if (scoreElement === null)
    throw Error("Could not find score element when updating score");
  scoreElement.innerHTML = localField.score.toString();
}

const probability = 0.2;

let field: Field | undefined = fieldStorage.load(fieldName);

if (!field) {
  field = new Field(probability, 3, fieldName, "1");
  field.open(1, 1);
  fieldStorage.save(field, fieldName);
} else {
  console.log(
    `loading previous field with ${
      field.getAll().filter((cell) => cell.isOpen).length
    } fields opened`,
  );
}

const button: HTMLImageElement = document.getElementById(
  "menubutton",
) as HTMLImageElement;
button.src = menubutton;

self.toggleMenu = function () {
  const menu = document.getElementById("menu");
  if (menu === null)
    throw new Error("Tried to toggle menu, but element is null");
  menu.style.display = menu.style.display == "none" ? "block" : "none";
};

self.restart = function () {
  localStorage.clear();
  console.log("removed: ", fieldName);
  window.location.reload();
};

(async () => {
  PIXI.TextureSource.defaultOptions.scaleMode = "nearest";
  await loadTextures();
  const app = new FieldRenderer(field, updateScore, fieldStorage);
  await app.init({
    resizeTo: window,
    backgroundColor: 0x0f0f0f,
  });
  document.body.appendChild(app.canvas);
  app.setupAfterCanvasReady();
})();
