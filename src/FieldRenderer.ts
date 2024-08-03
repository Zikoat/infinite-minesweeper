/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import { loadTextures } from "./Textures.js";
import { Controls } from "./Controls";
import { CellSprite } from "./CellSprite";
import { Cell } from "./Cell.js";
import { Field } from "./Field.js";
import { MinesTextures } from "./Textures.js";
import { FieldPersistence } from "./FieldPersistence.js";

export class FieldRenderer extends PIXI.Application {
  private field: Field;

  public constructor(
    field: Field,
    updateScore: (input: Field) => void,
    fieldPersistence: FieldPersistence,
  ) {
    super();
    this.field = field;

    field.on("cellChanged", (cell) => {
      updateCell(field, cell, true);
      updateScore(field);
    });

    // todo use async
    loadTextures().then((minesTextures) =>
      setup(minesTextures, field, fieldPersistence),
    );
  }

  public updateCell(cell: Cell) {
    updateCell(this.field, cell, true);
  }

  public updateAllCells() {
    updateAllCells(this.field);
  }
}

// todo inline
// todo: bug when i reset the game to reset the camera to 0,0, then the cell at 0,0 flashes with the "zoom out to spawn" animation every time the camera moves a pixel.
function updateCell(
  field: Field,
  cell: Cell & { sprite?: CellSprite },
  playAnimation: boolean,
) {
  if (cell.sprite === undefined) {
    const value = field.value(cell.x, cell.y);
    cell.sprite = new CellSprite(cell, value, fieldContainer, playAnimation);
  } else {
    cell.sprite.update(cell);
  }
}

// todo inline
function updateAllCells(field: Field): void {
  field
    .getAll()
    .filter((cell) => cell.isOpen || cell.isFlagged)
    .forEach((cell) => updateCell(field, cell, false));
}

function setup(
  // todo rename
  minesTextures: MinesTextures,
  field: Field,
  fieldPersistence: FieldPersistence,
): void {
  // todo migrate away from tilingsprite
  const background = new PIXI.TilingSprite(
    minesTextures.closed,
    app.renderer.width,
    app.renderer.height,
  );

  window.addEventListener("resize", function (_event) {
    function resize(width: number, height: number) {
      app.renderer.resize(width, height);
      background.width = app.renderer.width;
      background.height = app.renderer.height;
    }

    resize(window.innerWidth, window.innerHeight);
  });

  // const width = minesTextures.closed?.width;

  // todo this is deprecated?
  background.name = "bg";
  fieldContainer.name = "fg";

  clickHandler.addChildAt(background, 0);
  clickHandler.addChildAt(fieldContainer, 1);

  new Controls(clickHandler, field, fieldPersistence);

  updateAllCells(field);
}

const app = new PIXI.Application();
const fieldContainer = new PIXI.Container({
  isRenderGroup: true,
  interactiveChildren: false,
});
const clickHandler = new PIXI.Container();

(async () => {
  await app.init({
    resizeTo: window,
    backgroundColor: 0x0f0f0f,
  });

  document.body.appendChild(app.canvas);

  PIXI.TextureSource.defaultOptions.scaleMode = "nearest";

  clickHandler.eventMode = "static";
  app.stage.addChild(clickHandler);
})();
