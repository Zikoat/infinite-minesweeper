/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import { getTextures } from "./Textures.js";
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
  private fieldContainer = new PIXI.Container({
    isRenderGroup: true,
    interactiveChildren: false,
  });

  private clickHandler = new PIXI.Container();

  public cellSprites: CellSprites = {};

  public constructor(
    private field: Field,
    updateScore: (input: Field) => void,
    private fieldPersistence: FieldPersistence,
  ) {
    super();

    field.on("cellChanged", (cell) => {
      this.updateCell(cell, true);
      updateScore(field);
    });

    this.setup();
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
      cellSprite = new CellSprite(
        cell,
        value,
        this.fieldContainer,
        playAnimation,
      );
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
  private setup(): void {
    // todo migrate away from tilingsprite
    const background = new PIXI.TilingSprite(
      getTextures().closed,
      this.renderer?.width ?? window.innerWidth,
      this.renderer?.height ?? window.innerHeight,
    );

    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.renderer.resize(width, height);

      background.width = width;
      background.height = height;
    });

    background.name = "bg";
    this.fieldContainer.name = "fg";

    this.clickHandler.addChildAt(background, 0);
    this.clickHandler.addChildAt(this.fieldContainer, 1);
    this.clickHandler.eventMode = "static";

    this.stage.addChild(this.clickHandler);

    this.updateAllCells();
  }

  public setupAfterCanvasReady() {
    new Controls(this.clickHandler, this.field, this.fieldPersistence);
  }
}
