/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import * as Textures from "./Textures.js";
import { Controls } from "./Controls";
import { CellSprite, scale } from "./CellSprite";
import { Cell } from "./Cell.js";
import { Field } from "./Field.js";
import { MinesTextures } from "./Textures.js";
import { FieldPersistence } from "./FieldPersistence.js";

export class FieldRenderer extends PIXI.Application {
  field: Field;
  constructor(
    field: Field,
    updateScore: (input: Field) => void,
    fieldPersistence: FieldPersistence
  ) {
    super();
    this.field = field;

    field.on("cellChanged", (cell) => {
      updateCell(field, cell);
      updateScore(field);
    });

    Textures.load().then((tex) => setup(tex, field, fieldPersistence));
  }
  updateCell(cell: Cell) {
    updateCell(this.field, cell);
  }
  updateAllCells() {
    updateAllCells(this.field);
  }
}

var app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x1099bb,
});

document.body.appendChild(app.view);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var fieldContainer = new PIXI.Container();
var clickHandler = new PIXI.Container();
clickHandler.interactive = true;
app.stage.addChild(clickHandler);

function updateCell(field: Field, cell: Cell & { sprite?: CellSprite }) {
  if (cell.sprite === undefined) {
    const value = field.value(cell.x, cell.y);
    cell.sprite = new CellSprite(cell, value);
    fieldContainer.addChild(cell.sprite);
  } else {
    cell.sprite.update(cell);
  }
}

function updateAllCells(field: Field): void {
  field
    .getAll()
    .filter((cell) => cell.isOpen || cell.isFlagged)
    .forEach((cell) => updateCell(field, cell));
}

function setup(
  tex: MinesTextures,
  field: Field,
  fieldPersistence: FieldPersistence
): void {
  const background = new PIXI.TilingSprite(
    tex.closed,
    app.renderer.width,
    app.renderer.height
  );
  background.tileScale = { x: scale, y: scale };

  window.addEventListener("resize", function (event) {
    function resize(width: number, height: number) {
      app.renderer.resize(width, height);
      background.width = app.renderer.width;
      background.height = app.renderer.height;
    }

    resize(window.innerWidth, window.innerHeight);
  });

  const width = tex.closed.width;

  background.tint = 0xffffff;

  background.name = "bg";
  fieldContainer.name = "fg";

  clickHandler.addChildAt(background, 0);
  clickHandler.addChildAt(fieldContainer, 1);

  new Controls(clickHandler, field, tex.cursor, fieldPersistence);

  // todo move to controls
  // disable right click context menu
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  updateAllCells(field);

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

  centerField(0, 0);
  Controls.setLoadedChunksAround(0, 0, background.texture.width);

  console.log("done setup");
}
