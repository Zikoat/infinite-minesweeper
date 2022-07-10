import Cursor from "./Cursor";
import { TweenMax, Power4 } from "gsap";
import FieldRenderer from "./FieldRenderer";
import { CHUNK_SIZE } from "./Chunk";
import Field from "./Field";

export default class Controls {
  static field: Field;
  static addControls(rootObject, field: Field, cursorTexture) {
    Controls.field = field;

    Controls.addCursor(rootObject, cursorTexture);
    Controls.addMouseControls(rootObject);
    Controls.addTouchControls(rootObject);
    Controls.addKeyboardControls();
    Controls.removeUIEventBubbling();
    Controls.disableRightClick();
  }

  static addCursor(rootObject, texture) {
    Controls.cursor = new Cursor(0, 0, texture);
    rootObject.addChildAt(Controls.cursor, 2);
  }

  static addMouseControls(rootObject) {
    rootObject
      .on("mousedown", Controls._onDragStart)
      .on("mouseup", Controls._onDragEnd)
      .on("pointerupoutside", Controls._onDragEnd)
      .on("pointermove", Controls._onDragMove)
      .on("rightclick", Controls._onRightClick);
  }

  static addTouchControls(rootObject) {
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

        function move(deltaX, deltaY) {
          Controls.moveViewTo(
            Controls.cursor.getX() + deltaX,
            Controls.cursor.getY() + deltaY
          );
          Controls.cursor.move(deltaX, deltaY);
          // disable mouse cursor
          document.getElementsByTagName("BODY")[0].style.cursor = "none";
        }
      },
      false
    );
  }

  static removeUIEventBubbling() {
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

  static disableRightClick() {
    // disable right click context menu
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  static _onDragStart(event) {
    const foreground = this.getChildByName("fg");

    this.dragging = true;
    this.hasDragged = false;

    this.dragPoint = event.data.getLocalPosition(foreground);
    this.startPosition = { x: foreground.position.x, y: foreground.position.y };
  }

  static _onDragEnd() {
    if (this.hasDragged) {
      this.dragging = false;
    } else {
      // if the mousebutton didnt move, it means the user clicked
      this.dragging = false;
      Controls.open();
    }
  }
  static _onDragMove(event) {
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

      Controls.setLoadedChunksAround(
        -Math.floor(x / width / CHUNK_SIZE),
        -Math.floor(y / width / CHUNK_SIZE),
        width
      );
    }
    if (Controls.mouseInput) {
      let position = event.data.getLocalPosition(this.getChildByName("fg"));
      let x = Math.floor(position.x / width);
      let y = Math.floor(position.y / width);
      Controls.cursor.moveTo(x, y);
    }
    Controls.mouseInput = true;
    document.getElementsByTagName("BODY")[0].style.cursor = "default";
  }

  static setLoadedChunksAround(x, y, width) {
    let windowChunkWidth = Math.ceil(window.innerWidth / width / CHUNK_SIZE);
    let windowChunkHeight = Math.ceil(window.innerHeight / width / CHUNK_SIZE);
    for (let i = x - 1; i < x + windowChunkWidth; i++) {
      for (let j = y - 1; j < y + windowChunkHeight; j++) {
        Controls.field.setVisibleChunk(i, j);
      }
    }
    Controls.field.loadVisibleChunks();
  }

  static _onRightClick(event) {
    Controls.flag();
  }

  static open() {
    const x = Controls.cursor.getX();
    const y = Controls.cursor.getY();
    const cell = Controls.field.getCell(x, y);
    const neighbors = Controls.field.getNeighbors(x, y);
    const flaggedNeighbors = neighbors.filter(
      (cell) => cell.isFlagged || (cell.isOpen && cell.isMine)
    );
    const closedNotFlaggedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen && !cell.isFlagged
    );

    if ((!cell.isOpen && !cell.isFlagged) || (cell.isOpen && cell.isMine)) {
      cell.open();
      //console.log(`opened`, cell);
    } else if (flaggedNeighbors.length === cell.value()) {
      closedNotFlaggedNeighbors.forEach((neighbor) => {
        neighbor.open();
      });
      //console.log(`opened the neighbors of`, cell);
    }
    Controls.field.fieldStorage?.save(Controls.field, Controls.field.fieldName);
  }

  static flag() {
    const x = Controls.cursor.getX();
    const y = Controls.cursor.getY();
    const cell = Controls.field.getCell(x, y);
    const neighbors = Controls.field.getNeighbors(x, y);
    const closedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen || (cell.isOpen && cell.isMine)
    );
    const closedNotFlaggedNeighbors = neighbors.filter(
      (cell) => !cell.isOpen && !cell.isFlagged
    );

    if (!cell.isOpen) {
      cell.flag();
      //console.log(`flagged`, cell);
    } else if (closedNeighbors.length === cell.value()) {
      closedNotFlaggedNeighbors.forEach((neighbor) => {
        neighbor.flag();
      });
      //console.log(`flagged the neighbors of`, cell);
    }
    Controls.field.save();
  }

  static moveViewTo(newx, newy) {
    const width = Controls.cursor.parent.getChildByName("bg").texture.width;
    const x = newx * width;
    const y = newy * width;
    const newPixelPositionX =
      -x + Math.floor(window.innerWidth / width / 2) * width;
    const newPixelPositionY =
      -y + Math.floor(window.innerHeight / width / 2) * width;

    Controls.cursor.parent
      .getChildByName("fg")
      .position.set(newPixelPositionX, newPixelPositionY);
    Controls.cursor.parent
      .getChildByName("bg")
      .tilePosition.set(newPixelPositionX, newPixelPositionY);

    Controls.setLoadedChunksAround(
      Math.floor(newx / CHUNK_SIZE),
      Math.floor(newy / CHUNK_SIZE),
      width
    );

    // didnt work as expected
    // TweenMax.to(Controls.cursor.parent.getChildByName("fg").position, 0.2, {x:newPixelPositionX,y:newPixelPositionY})
    // TweenMax.to(Controls.cursor.parent.getChildByName("bg").tilePosition, 0.2, {x:newPixelPositionX,y:newPixelPositionY});
  }
}
