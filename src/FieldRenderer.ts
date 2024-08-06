/**
 * Created by sisc0606 on 19.08.2017.
 */

import * as PIXI from "pixi.js";
import { getTextures } from "./Textures.js";
import { Controls } from "./Controls";
import { CellSprite, numberToNeighborCount } from "./CellSprite";
import { Cell } from "./Cell.js";
import { Field } from "./Field.js";
import { FieldPersistence } from "./FieldPersistence.js";

// todo bug: when i open a mine, and the mine has only a single neighbor which is a closed mine, then right pressing the mine flags the
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
    const neighborCount = numberToNeighborCount(
      this.field.value(cell.x, cell.y),
    );

    if (cellSprite) {
      cellSprite.neighborCount = neighborCount;
      cellSprite.update(cell);
    } else {
      cellSprite = new CellSprite(
        cell,
        neighborCount,
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
    const background = new PIXI.TilingSprite({
      texture: getTextures().closed,
      width: this.renderer?.width ?? window.innerWidth,
      height: this.renderer?.height ?? window.innerHeight,
    });

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
