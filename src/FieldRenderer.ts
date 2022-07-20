/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import * as Textures from "./Textures.js";
import FieldPersistence from "./FieldStorage";
import Controls from "./Controls";
import CellSprite from "./CellSprite";
import { TweenMax, Power2, TimelineLite } from "gsap";
import Cell from "./Cell.js";
import Field from "./Field.js";

export default class FieldRenderer extends PIXI.Application {
  constructor(field) {
    super();
    defaultField = field;

    defaultField.on("cellChanged", (cell) => {
      updateCell(defaultField, cell);
    });

    Textures.load().then(setup);
  }
  updateCell(cell) {
    updateCell(defaultField, cell);
  }
  updateAllCells() {
    updateAllCells(defaultField);
  }
}

var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
var background;
window.addEventListener("resize", function (event) {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  background.width = app.renderer.width;
  background.height = app.renderer.height;
});

var fieldContainer = new PIXI.Container();
var clickHandler = new PIXI.Container();
clickHandler.interactive = true;
app.stage.addChild(clickHandler);
var defaultField;

var width;
function updateCell(field: Field, cell: Cell) {
  if (cell.sprite === undefined) {
    const value = field.value(cell.x, cell.y);
    cell.sprite = new CellSprite(cell, value);
    fieldContainer.addChild(cell.sprite);
  } else {
    cell.sprite.update(cell);
  }
}

function updateAllCells(field) {
  field
    .getAll()
    .filter((cell) => cell.isOpen || cell.isFlagged)
    .forEach((cell) => updateCell(field, cell));
}

function setup(Tex) {
  width = Tex.closed.width;

  background = new PIXI.TilingSprite(
    Tex.closed,
    app.renderer.width,
    app.renderer.height
  );
  background.tint = 0xffffff;

  background.name = "bg";
  fieldContainer.name = "fg";

  clickHandler.addChildAt(background, 0);
  clickHandler.addChildAt(fieldContainer, 1);

  Controls.addControls(clickHandler, defaultField, Tex.cursor);

  // todo move to controls
  // disable right click context menu
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  updateAllCells(defaultField);
  centerField(0, 0);
  Controls.setLoadedChunksAround(0, 0, background.texture.width);
  document.getElementById("score").innerHTML = field.score;

  console.log("done setup");
}

/** center the field around a coordinate */
function centerField(x = 0, y = 0) {
  // x and y are tile coordinates
  let centerX = app.renderer.width / 2;
  let centerY = app.renderer.height / 2;
  let newX = Math.floor(-x * width + centerX);
  let newY = Math.floor(-y * width + centerY);
  // newX and newY are pixel-coordinates
  fieldContainer.position.set(newX, newY);
  background.tilePosition.set(newX, newY);
}
