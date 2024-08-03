/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import { getTextures, loadTextures } from "./Textures.js";
import { Controls } from "./Controls";
import { CellSprite } from "./CellSprite";
import { Cell } from "./Cell.js";
import { Field } from "./Field.js";
import { FieldPersistence } from "./FieldPersistence.js";

type CellSprites = Record<
  number,
  Record<number, CellSprite | undefined> | undefined
>;

export class FieldRenderer extends PIXI.Application {
  private field: Field;

  public cellSprites: CellSprites = {};

  public constructor(
    field: Field,
    updateScore: (input: Field) => void,
    fieldPersistence: FieldPersistence,
  ) {
    super();
    this.field = field;

    field.on("cellChanged", (cell) => {
      this.updateCell(cell, true);
      updateScore(field);
    });

    // todo use async, move to before fieldRenderer initialisation.
    loadTextures().then(() => this.setup(field, fieldPersistence));
  }

  public updateCell(cell: Cell, playAnimation: boolean) {
    if (!this.cellSprites[cell.y]) {
      this.cellSprites[cell.y] = {};
    }
    let cellSprite = this.cellSprites[cell.y]![cell.x];
    if (cellSprite) {
      cellSprite.update(cell);
    } else {
      const value = this.field.value(cell.x, cell.y);
      cellSprite = new CellSprite(cell, value, fieldContainer, playAnimation);
      this.cellSprites[cell.y]![cell.x] = cellSprite;
    }
  }

  public updateAllCells(): void {
    this.field
      .getAll()
      .filter((cell) => cell.isOpen || cell.isFlagged)
      .forEach((cell) => this.updateCell(cell, false));
  }

  // todo: bug when i reset the game to reset the camera to 0,0, then the cell at 0,0 flashes with the "zoom out to spawn" animation every time the camera moves a pixel.

  // todo inline
  private setup(
    // todo get from textures directly

    field: Field,
    fieldPersistence: FieldPersistence,
  ): void {
    const closedTexture = getTextures().closed;

    // todo migrate away from tilingsprite
    const background = new PIXI.TilingSprite(
      closedTexture,
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

    this.updateAllCells();
  }
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
