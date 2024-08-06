import { Field } from "./Field";
import { FieldRenderer } from "./FieldRenderer";
import { FieldPersistence } from "./FieldPersistence";
import "./css/stylesheet.css";
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

self.toggleFullscreen = function () {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
      );
    });
  } else {
    document.exitFullscreen().catch((err) => {
      console.error(
        `Error attempting to exit fullscreen mode: ${err.message} (${err.name})`,
      );
    });
  }
};

(async () => {
  PIXI.TextureSource.defaultOptions.scaleMode = "nearest";
  PIXI.TextureSource.defaultOptions.autoGenerateMipmaps = true;
  await loadTextures();
  const app = new FieldRenderer(field, updateScore, fieldStorage);
  await app.init({
    resizeTo: window,
    backgroundColor: 0x0f0f0f,
  });
  document.body.appendChild(app.canvas);
  // We have to setup after canvas has been added to the dom because we add interactivity on the canvas element instead of using pixi interaction manager.
  app.setupAfterCanvasReady();
})();
