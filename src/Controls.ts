import Cursor from "./Cursor";
import { CHUNK_SIZE } from "./Chunk";
import { Field } from "./Field";
import * as PIXI from "pixi.js";
import { FieldPersistence } from "./FieldPersistence";
import { scale } from "./CellSprite";

const DRAG_THRESHOLD = 5;
const LONG_PRESS_DURATION = 200; // Duration in milliseconds to consider it a long press

type PixiEvent = {
  data: {
    getLocalPosition: (arg0: PIXI.Container<PIXI.DisplayObject>) => PIXI.Point;
  };
};

export class Controls {
  static cursor: Cursor;
  static field: Field;
  static fieldStorage: FieldPersistence;
  static dragging: boolean = false;
  static hasDragged: boolean = false;
  static mouseInput: boolean = false;
  static dragPoint: { x: number; y: number } = { x: 0, y: 0 };
  static startPosition = {
    x: 0,
    y: 0,
  };
  static longPressTimer: ReturnType<typeof setTimeout> | null = null;
  static hasLongPressed = false;

  constructor(
    rootObject: PIXI.Container,
    field: Field,
    cursorTexture: PIXI.Texture<PIXI.Resource>,
    fieldStorage: FieldPersistence,
  ) {
    Controls.field = field;
    Controls.fieldStorage = fieldStorage;

    Controls.cursor = new Cursor(0, 0, cursorTexture);
    rootObject.addChildAt(Controls.cursor, 2);

    Controls.addMouseControls(rootObject);
    Controls.addTouchControls(rootObject);
    Controls.addKeyboardControls();
    Controls.removeUIEventBubbling();
    Controls.disableRightClick();
  }

  static addMouseControls(rootObject: PIXI.Container) {
    rootObject
      .on("mousedown", Controls._onDragStart)
      .on("mouseup", Controls._onDragEnd)
      .on("pointerupoutside", Controls._onDragEnd)
      .on("pointermove", Controls._onDragMove)
      .on("rightclick", Controls._onRightClick);
  }

  static addTouchControls(rootObject: PIXI.Container) {
    rootObject
      .on("touchstart", Controls._onDragStart)
      .on("touchmove", Controls._onDragMove)
      .on("touchend", Controls._onDragEnd)
      .on("touchendoutside", Controls._onDragEnd);

    // not decided how flagging works on mobile
    // .on('rightclick', Controls._onRightClick);
  }

  static addKeyboardControls() {
    window.addEventListener(
      "keydown",
      (event) => {
        Controls.mouseInput = false;

        const move = (deltaX: number, deltaY: number) => {
          Controls.moveViewTo(
            Controls.cursor.getX() + deltaX,
            Controls.cursor.getY() + deltaY,
          );
          Controls.cursor.move(deltaX, deltaY);
          // disable mouse cursor
          (
            document.getElementsByTagName("BODY")[0] as HTMLElement
          ).style.cursor = "none";
        };
        switch (event.keyCode) {
          case 88:
            Controls.open();
            break;
          case 90:
            Controls.flag();
            break;
          case 37:
            move(-1, 0);
            break;
          case 38:
            move(0, -1);
            break;
          case 40:
            move(0, 1);
            break;
          case 39:
            move(1, 0);
            break;
        }
      },
      false,
    );
  }

  static removeUIEventBubbling() {
    const uiElements = document.getElementsByClassName("ui");
    for (const element of uiElements) {
      element.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();
        },
        false,
      );
    }
  }

  static disableRightClick() {
    // disable right click context menu
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  static _onDragStart(this: PIXI.Container, event: PixiEvent) {
    const foreground = this.getChildByName("fg") as PIXI.Sprite;
    const background = this.getChildByName("bg") as PIXI.TilingSprite;

    Controls.dragging = true;
    Controls.hasDragged = false;

    Controls.dragPoint = event.data.getLocalPosition(foreground);
    Controls.startPosition = {
      x: foreground.position.x,
      y: foreground.position.y,
    };

    Controls.updateCursorPosition(event, foreground, background);

    Controls.hasLongPressed = false;

    Controls.longPressTimer = setTimeout(() => {
      Controls.dragging = false;
      Controls.hasLongPressed = true;

      const x = Controls.cursor.getX();
      const y = Controls.cursor.getY();
      const cell = Controls.field.getCell(x, y);
      if (!cell.isOpen) Controls.flag();
    }, LONG_PRESS_DURATION);
  }

  static _onDragEnd() {
    this.dragging = false;
    if (!this.hasDragged && !this.hasLongPressed) {
      Controls.open();
    }
    this.hasLongPressed = false;

    if (Controls.longPressTimer) {
      clearTimeout(Controls.longPressTimer);
      this.longPressTimer = null;
    }
  }
  static _onDragMove(this: PIXI.Container, event: PixiEvent) {
    const width = (this.getChildByName("bg") as PIXI.TilingSprite).texture
      .width;

    if (Controls.dragging) {
      const newPosition = event.data.getLocalPosition(this.parent);
      const dx = newPosition.x - Controls.dragPoint.x;
      const dy = newPosition.y - Controls.dragPoint.y;

      if (
        Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD &&
        Controls.longPressTimer
      ) {
        Controls.hasDragged = true;
        clearTimeout(Controls.longPressTimer);
        Controls.longPressTimer = null;
      }

      const x = Math.floor(newPosition.x - Controls.dragPoint.x);
      const y = Math.floor(newPosition.y - Controls.dragPoint.y);

      const foreground = this.getChildByName("fg") as PIXI.Sprite;
      const background = this.getChildByName("bg") as PIXI.TilingSprite;

      foreground.position.set(x, y);
      background.tilePosition.set(x, y);

      Controls.setLoadedChunksAround(
        -Math.floor(x / width / CHUNK_SIZE),
        -Math.floor(y / width / CHUNK_SIZE),
        width,
      );
    }
    if (Controls.mouseInput) {
      Controls.updateCursorPosition(
        event,
        this.getChildByName("fg") as PIXI.Sprite,
        this.getChildByName("bg") as PIXI.TilingSprite,
      );
    }
    Controls.mouseInput = true;
    (document.getElementsByTagName("BODY")[0] as HTMLElement).style.cursor =
      "default";
  }

  static updateCursorPosition(
    event: PixiEvent,
    foreground: PIXI.Sprite,
    background: PIXI.TilingSprite,
  ) {
    const width = background.texture.width;
    const position = event.data.getLocalPosition(foreground);
    const x = Math.floor(position.x / width / scale);
    const y = Math.floor(position.y / width / scale);
    Controls.cursor.moveTo(x, y);
  }

  static setLoadedChunksAround(x: number, y: number, width: number) {
    const windowChunkWidth = Math.ceil(window.innerWidth / width / CHUNK_SIZE);
    const windowChunkHeight = Math.ceil(
      window.innerHeight / width / CHUNK_SIZE,
    );
    for (let i = x - 1; i < x + windowChunkWidth; i++) {
      for (let j = y - 1; j < y + windowChunkHeight; j++) {
        Controls.field.setVisibleChunk(i, j);
      }
    }
    Controls.field.loadVisibleChunks();
  }

  static _onRightClick(_event: unknown) {
    Controls.flag();
  }

  static open() {
    const x = Controls.cursor.getX();
    const y = Controls.cursor.getY();
    const cell = Controls.field.getCell(x, y);
    const neighbors = Controls.field.getNeighbors(x, y);
    const flaggedNeighbors = neighbors.filter(
      (cell) => cell.isFlagged || (cell.isOpen && cell.isMine),
    );
    const closedNotFlaggedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen && !cell.isFlagged,
    );

    if (Controls.fieldStorage === undefined)
      throw new Error("tried to save, but fieldstorage is undefined");

    if ((!cell.isOpen && !cell.isFlagged) || (cell.isOpen && cell.isMine)) {
      Controls.field.open(cell.x, cell.y);
      Controls.fieldStorage.save(Controls.field, Controls.field.fieldName);
    } else if (
      flaggedNeighbors.length === Controls.field.value(cell.x, cell.y) &&
      closedNotFlaggedNeighbors.length > 0
    ) {
      closedNotFlaggedNeighbors.forEach((neighbor) => {
        Controls.field.open(neighbor.x, neighbor.y);
      });
      Controls.fieldStorage.save(Controls.field, Controls.field.fieldName);
    } else if (cell.isOpen) {
      Controls.flag();
    }
  }

  static flag() {
    const x = Controls.cursor.getX();
    const y = Controls.cursor.getY();
    const cell = Controls.field.getCell(x, y);
    const neighbors = Controls.field.getNeighbors(x, y);
    const closedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen || (cell.isOpen && cell.isMine),
    );
    const closedNotFlaggedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen && !cell.isFlagged,
    );

    if (Controls.fieldStorage === undefined)
      throw new Error("tried to save, but fieldstorage is undefined");

    if (!cell.isOpen) {
      Controls.field.flag(cell.x, cell.y);
      Controls.fieldStorage.save(Controls.field, Controls.field.fieldName);
    } else if (
      closedNeighbors.length === Controls.field.value(cell.x, cell.y) &&
      closedNotFlaggedNeighbors.length > 0
    ) {
      closedNotFlaggedNeighbors.forEach((neighbor) => {
        Controls.field.flag(neighbor.x, neighbor.y);
      });
      Controls.fieldStorage.save(Controls.field, Controls.field.fieldName);
    }
  }

  static moveViewTo(newx: number, newy: number) {
    const width = (Controls.cursor.parent.getChildByName("bg") as PIXI.Sprite)
      .texture.width;
    const x = newx * width;
    const y = newy * width;
    const newPixelPositionX =
      -x + Math.floor(window.innerWidth / width / 2) * width;
    const newPixelPositionY =
      -y + Math.floor(window.innerHeight / width / 2) * width;

    (Controls.cursor.parent.getChildByName("fg") as PIXI.Sprite).position.set(
      newPixelPositionX,
      newPixelPositionY,
    );
    (
      Controls.cursor.parent.getChildByName("bg") as PIXI.TilingSprite
    ).tilePosition.set(newPixelPositionX, newPixelPositionY);

    Controls.setLoadedChunksAround(
      Math.floor(newx / CHUNK_SIZE),
      Math.floor(newy / CHUNK_SIZE),
      width,
    );

    // didnt work as expected
    // TweenMax.to(Controls.cursor.parent.getChildByName("fg").position, 0.2, {x:newPixelPositionX,y:newPixelPositionY})
    // TweenMax.to(Controls.cursor.parent.getChildByName("bg").tilePosition, 0.2, {x:newPixelPositionX,y:newPixelPositionY});
  }
}
