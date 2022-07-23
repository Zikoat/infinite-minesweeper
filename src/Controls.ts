import Cursor from "./Cursor";
import { CHUNK_SIZE } from "./Chunk";
import Field from "./Field";
import * as PIXI from "pixi.js";
import { FieldPersistence } from "./FieldPersistence";

export class Controls {
  cursor: Cursor;
  field: Field;
  fieldStorage: FieldPersistence;
  dragging: boolean = false;
  hasDragged: boolean = false;
  constructor(
    rootObject: PIXI.Container,
    field: Field,
    cursorTexture: PIXI.Texture<PIXI.Resource>,
    fieldStorage: FieldPersistence
  ) {
    this.field = field;
    this.fieldStorage = fieldStorage;

    this.cursor = new Cursor(0, 0, cursorTexture);
    rootObject.addChildAt(this.cursor, 2);

    this.addMouseControls(rootObject);
    this.addTouchControls(rootObject);
    this.addKeyboardControls();
    this.removeUIEventBubbling();
    this.disableRightClick();
  }

  addMouseControls(rootObject: PIXI.Container) {
    rootObject
      .on("mousedown", this._onDragStart)
      .on("mouseup", this._onDragEnd)
      .on("pointerupoutside", this._onDragEnd)
      .on("pointermove", this._onDragMove)
      .on("rightclick", this._onRightClick);
  }

  addTouchControls(rootObject: PIXI.Container) {
    rootObject
      .on("touchstart", this._onDragStart)

      .on("touchmove", this._onDragMove)

      .on("touchend", this._onDragEnd)
      .on("touchendoutside", this._onDragEnd);

    // not decided how flagging works on mobile
    // .on('rightclick', this._onRightClick);
  }

  addKeyboardControls() {
    window.addEventListener(
      "keydown",
      (event) => {
        this.mouseInput = false;

        switch (event.keyCode) {
          case 88:
            this.open();
            break;
          case 90:
            this.flag();
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

        function move(deltaX: number, deltaY: number) {
          this.moveViewTo(
            this.cursor.getX() + deltaX,
            this.cursor.getY() + deltaY
          );
          this.cursor.move(deltaX, deltaY);
          // disable mouse cursor
          document.getElementsByTagName("BODY")[0].style.cursor = "none";
        }
      },
      false
    );
  }

  removeUIEventBubbling() {
    let uiElements = document.getElementsByClassName("ui");
    for (let element of uiElements) {
      element.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();
        },
        false
      );
    }
  }

  disableRightClick() {
    // disable right click context menu
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  _onDragStart(event) {
    const foreground = this.getChildByName("fg");

    this.dragging = true;
    this.hasDragged = false;

    this.dragPoint = event.data.getLocalPosition(foreground);
    this.startPosition = { x: foreground.position.x, y: foreground.position.y };
  }

  _onDragEnd() {
    if (this.hasDragged) {
      this.dragging = false;
    } else {
      // if the mousebutton didnt move, it means the user clicked
      this.dragging = false;
      this.open();
    }
  }
  _onDragMove(event) {
    const width = this.getChildByName("bg").texture.width;

    if (this.dragging) {
      var newPosition = event.data.getLocalPosition(this.parent);
      let x = Math.floor(newPosition.x - this.dragPoint.x);
      let y = Math.floor(newPosition.y - this.dragPoint.y);

      const foreground = this.getChildByName("fg");
      const background = this.getChildByName("bg");

      foreground.position.set(x, y);
      background.tilePosition.set(x, y);
      if (
        Math.pow(this.startPosition.x - x, 2) +
          Math.pow(this.startPosition.y - y, 2) >
        Math.pow(width, 2) / 9
      ) {
        this.hasDragged = true;
      }

      this.setLoadedChunksAround(
        -Math.floor(x / width / CHUNK_SIZE),
        -Math.floor(y / width / CHUNK_SIZE),
        width
      );
    }
    if (this.mouseInput) {
      let position = event.data.getLocalPosition(this.getChildByName("fg"));
      let x = Math.floor(position.x / width);
      let y = Math.floor(position.y / width);
      this.cursor.moveTo(x, y);
    }
    this.mouseInput = true;
    document.getElementsByTagName("BODY")[0].style.cursor = "default";
  }

  setLoadedChunksAround(x, y, width) {
    let windowChunkWidth = Math.ceil(window.innerWidth / width / CHUNK_SIZE);
    let windowChunkHeight = Math.ceil(window.innerHeight / width / CHUNK_SIZE);
    for (let i = x - 1; i < x + windowChunkWidth; i++) {
      for (let j = y - 1; j < y + windowChunkHeight; j++) {
        this.field.setVisibleChunk(i, j);
      }
    }
    this.field.loadVisibleChunks();
  }

  _onRightClick(event) {
    this.flag();
  }

  open() {
    const x = this.cursor.getX();
    const y = this.cursor.getY();
    const cell = this.field.getCell(x, y);
    const neighbors = this.field.getNeighbors(x, y);
    const flaggedNeighbors = neighbors.filter(
      (cell) => cell.isFlagged || (cell.isOpen && cell.isMine)
    );
    const closedNotFlaggedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen && !cell.isFlagged
    );

    if (this.fieldStorage === undefined)
      throw new Error("tried to save, but fieldstorage is undefined");

    if ((!cell.isOpen && !cell.isFlagged) || (cell.isOpen && cell.isMine)) {
      this.field.open(cell.x, cell.y);
      this.fieldStorage.save(this.field, this.field.fieldName);
    } else if (
      flaggedNeighbors.length === this.field.value(cell.x, cell.y) &&
      closedNotFlaggedNeighbors.length > 0
    ) {
      closedNotFlaggedNeighbors.forEach((neighbor) => {
        this.field.open(neighbor.x, neighbor.y);
      });
      this.fieldStorage.save(this.field, this.field.fieldName);
    }
  }

  flag() {
    const x = this.cursor.getX();
    const y = this.cursor.getY();
    const cell = this.field.getCell(x, y);
    const neighbors = this.field.getNeighbors(x, y);
    const closedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen || (cell.isOpen && cell.isMine)
    );
    const closedNotFlaggedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen && !cell.isFlagged
    );

    if (this.fieldStorage === undefined)
      throw new Error("tried to save, but fieldstorage is undefined");

    if (!cell.isOpen) {
      this.field.flag(cell.x, cell.y);
      this.fieldStorage.save(this.field, this.field.fieldName);
    } else if (
      closedNeighbors.length === this.field.value(cell.x, cell.y) &&
      closedNotFlaggedNeighbors.length > 0
    ) {
      closedNotFlaggedNeighbors.forEach((neighbor) => {
        this.field.flag(neighbor.x, neighbor.y);
      });
      this.fieldStorage.save(this.field, this.field.fieldName);
    }
  }

  moveViewTo(newx: number, newy: number) {
    const width = this.cursor.parent.getChildByName("bg").texture.width;
    const x = newx * width;
    const y = newy * width;
    const newPixelPositionX =
      -x + Math.floor(window.innerWidth / width / 2) * width;
    const newPixelPositionY =
      -y + Math.floor(window.innerHeight / width / 2) * width;

    this.cursor.parent
      .getChildByName("fg")
      .position.set(newPixelPositionX, newPixelPositionY);
    this.cursor.parent
      .getChildByName("bg")
      .tilePosition.set(newPixelPositionX, newPixelPositionY);

    this.setLoadedChunksAround(
      Math.floor(newx / CHUNK_SIZE),
      Math.floor(newy / CHUNK_SIZE),
      width
    );

    // didnt work as expected
    // TweenMax.to(this.cursor.parent.getChildByName("fg").position, 0.2, {x:newPixelPositionX,y:newPixelPositionY})
    // TweenMax.to(this.cursor.parent.getChildByName("bg").tilePosition, 0.2, {x:newPixelPositionX,y:newPixelPositionY});
  }
}
