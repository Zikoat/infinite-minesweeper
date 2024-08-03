import {
  Cursor,
  ScreenCoord,
  ScreenPos,
  // WorldCoord,
  // worldCoordToCellCoord,
  WorldPos,
} from "./Cursor";
// import { CHUNK_SIZE } from "./Chunk";
// import { Field } from "./Field";
import * as PIXI from "pixi.js";
// import { FieldPersistence } from "./FieldPersistence";
// import { scale } from "./CellSprite";
import { zoom } from "d3-zoom";
import {
  // BaseType,
  select,
} from "d3-selection";
import { z } from "zod";
// import { SCALE } from "./CellSprite";
import { Field } from "./Field";
import { FieldPersistence } from "./FieldPersistence";

// const DRAG_THRESHOLD = 30;
// const LONG_PRESS_DURATION = 200; // Duration in milliseconds to consider it a long press

// type PixiEvent = {
//   data: {
//     getLocalPosition: (arg0: PIXI.Container) => PIXI.Point;
//   };
// };

export class Controls {
  private static cursor: Cursor;
  private static field: Field;
  private static fieldStorage: FieldPersistence;
  // private static dragging: boolean = false;
  // private static hasDragged: boolean = false;
  // private static mouseInput: boolean = false;
  // private static screenDragStart: { x: number; y: number } = { x: 0, y: 0 };
  // private static foregroundDragStartPosition: { x: number; y: number } = {
  //   x: 0,
  //   y: 0,
  // };
  // private static longPressTimer: ReturnType<typeof setTimeout> | null = null;
  // private static hasLongPressed = false;

  public constructor(
    rootObject: PIXI.Container,
    field: Field,
    fieldStorage: FieldPersistence,
  ) {
    Controls.field = field;
    Controls.fieldStorage = fieldStorage;

    Controls.cursor = new Cursor();
    // todo why do we have to specify position here? can we just not add it normally?
    (rootObject.getChildByName("fg") as PIXI.Container).addChild(
      Controls.cursor,
    );

    // Controls.addMouseControls(rootObject);
    Controls.setupZoom(rootObject);
    // Controls.addTouchControls(rootObject);
    // Controls.addKeyboardControls();
    // Controls.removeUIEventBubbling();
    Controls.disableRightClickContextMenu();
  }

  // private static addMouseControls(rootObject: PIXI.Container) {
  //   rootObject;
  //   // .on("mousedown", Controls._onDragStart)
  //   // .on("mouseup", Controls._onDragEnd)
  //   // .on("pointerupoutside", Controls._onDragEnd)
  //   // .on("pointermove", Controls._onDragMove)
  //   // .on("rightclick", Controls._onRightClick);
  // }

  // private static addTouchControls(rootObject: PIXI.Container) {
  //   rootObject;
  //   // .on("touchstart", Controls._onDragStart)
  //   // .on("touchmove", Controls._onDragMove)
  //   // .on("touchend", Controls._onDragEnd)
  //   // .on("touchendoutside", Controls._onDragEnd);
  // }

  // private static addKeyboardControls() {
  //   window.addEventListener(
  //     "keydown",
  //     (event) => {
  //       Controls.mouseInput = false;

  //       const move = (deltaX: number, deltaY: number) => {
  //         Controls.moveViewTo(
  //           Controls.cursor.getX() + deltaX,
  //           Controls.cursor.getY() + deltaY,
  //         );
  //         Controls.cursor.move(deltaX, deltaY);
  //         // disable mouse cursor
  //         (
  //           document.getElementsByTagName("BODY")[0] as HTMLElement
  //         ).style.cursor = "none";
  //       };
  //       switch (event.keyCode) {
  //         case 88:
  //           Controls.open();
  //           break;
  //         case 90:
  //           Controls.flag();
  //           break;
  //         case 37:
  //           move(-1, 0);
  //           break;
  //         case 38:
  //           move(0, -1);
  //           break;
  //         case 40:
  //           move(0, 1);
  //           break;
  //         case 39:
  //           move(1, 0);
  //           break;
  //       }
  //     },
  //     false,
  //   );
  // }

  // todo is this still needed?
  // private static removeUIEventBubbling() {
  //   const uiElements = document.getElementsByClassName("ui");
  //   for (const element of uiElements) {
  //     element.addEventListener(
  //       "click",
  //       (event) => {
  //         event.stopPropagation();
  //       },
  //       false,
  //     );
  //   }
  // }

  private static disableRightClickContextMenu() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  private static setupZoom(rootObject: PIXI.Container) {
    const zoomHandler = zoom();
    function logZoomEvent(e: { type: string }) {
      console.log(e.type);
    }
    zoomHandler.on("start", (rawEvent) => {
      const event = eventSchema.parse(rawEvent);
      logZoomEvent(event);
    });
    zoomHandler.on("end", (rawEvent) => {
      const event = eventSchema.parse(rawEvent);
      logZoomEvent(event);
    });

    zoomHandler.on("zoom", (rawEvent) => {
      const event = eventSchema.parse(rawEvent);
      logZoomEvent(event);

      const foreground = rootObject.getChildByName("fg") as PIXI.Sprite;
      const background = rootObject.getChildByName("bg") as PIXI.TilingSprite;

      const x = event.transform.x;
      const y = event.transform.y;
      const scale = event.transform.k;

      foreground.position.set(x, y);
      foreground.scale.set(scale);
      background.tilePosition.set(x, y);
      background.tileScale.set(scale);
    });

    select<Element, unknown>("canvas")
      .call(zoomHandler)
      .on("click", (event: MouseEvent) => {
        console.log(event.type);
        // todo we can simplify position calculations massively by rendering all of the closed cells and adding interactivity to them, then add some metadata to each sprite which coordinate it represents.
        Controls.open();
      })
      .on("pointermove", (event: PointerEvent) => {
        const eventPoint: ScreenPos = {
          x: event.clientX as ScreenCoord,
          y: event.clientY as ScreenCoord,
        };

        function screenPosToWorldPos(screenPos: ScreenPos): WorldPos {
          const foreground = (
            rootObject.getChildByName("fg") as PIXI.Sprite
          ).toLocal(screenPos) as unknown as WorldPos;

          // shit it doesn't make sense to multiply by 3 here
          // sht is screen cord really same as wordl coord?
          const worldCoordX = foreground.x;
          const worldCoordY = foreground.y;
          return { x: worldCoordX, y: worldCoordY };
        }

        // todo inline
        const worldPos = screenPosToWorldPos(eventPoint);

        Controls.cursor.moveTo(worldPos.x, worldPos.y);
      })
      .on("contextmenu", (_event: MouseEvent) => {
        Controls.flag();
      });
  }
  // todo create method on the parent which applies transform instead of mutating the object directly.
  // todo add different types (maybe with brands) for the different types of transforms, because we are starting to work in a lot of different coordinate systems.

  // todo i need a global camera state, and based on when the camera changes we should update foreground and background position.
  // todo cursor is always in upper left corner
  // todo pressing a square does nothing

  // todo after restarting, the opened cell is not in the middle
  // todo, when i load the page, then press somewhere, then it jumps to another place
  // - todo i need to pass initial transform to controls

  // private static _onDragStart(this: PIXI.Container, event: PixiEvent) {
  //   const foreground = this.getChildByName("fg") as PIXI.Sprite;
  //   const background = this.getChildByName("bg") as PIXI.TilingSprite;

  //   Controls.dragging = true;
  //   Controls.hasDragged = false;

  //   Controls.screenDragStart = event.data.getLocalPosition(this);

  //   Controls.foregroundDragStartPosition = {
  //     x: foreground.position.x,
  //     y: foreground.position.y,
  //   };

  //   Controls.updateCursorPosition(event, foreground, background);

  //   Controls.hasLongPressed = false;

  //   Controls.longPressTimer = setTimeout(() => {
  //     Controls.dragging = false;
  //     Controls.hasLongPressed = true;

  //     const x = Controls.cursor.getX();
  //     const y = Controls.cursor.getY();
  //     const cell = Controls.field.getCell(x, y);
  //     if (!cell.isOpen) Controls.flag();
  //   }, LONG_PRESS_DURATION);
  // }

  // private static _onDragEnd(_event: PIXI.FederatedPointerEvent) {
  //   Controls.dragging = false;
  //   if (!Controls.hasDragged && !Controls.hasLongPressed) {
  //     Controls.open();
  //   }
  //   Controls.hasLongPressed = false;
  //   Controls.hasDragged = false;

  //   if (Controls.longPressTimer) {
  //     clearTimeout(Controls.longPressTimer);
  //     Controls.longPressTimer = null;
  //   }
  // }

  // private static _onDragMove(
  //   this: PIXI.Container,
  //   event: PIXI.FederatedPointerEvent,
  // ) {
  //   const width = (this.getChildByName("bg") as PIXI.TilingSprite).texture
  //     .width;

  //   if (Controls.dragging) {
  //     const screenDragCurrent = event.data.getLocalPosition(this);

  //     const dx = screenDragCurrent.x - Controls.screenDragStart.x;
  //     const dy = screenDragCurrent.y - Controls.screenDragStart.y;

  //     if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
  //       Controls.hasDragged = true;
  //       if (Controls.longPressTimer) {
  //         clearTimeout(Controls.longPressTimer);
  //         Controls.longPressTimer = null;
  //       }
  //     }

  //     if (Controls.hasDragged) {
  //       const x = Math.floor(dx) + Controls.foregroundDragStartPosition.x;
  //       const y = Math.floor(dy) + Controls.foregroundDragStartPosition.y;

  //       const foreground = this.getChildByName("fg") as PIXI.Sprite;
  //       const background = this.getChildByName("bg") as PIXI.TilingSprite;

  //       foreground.position.set(x, y);
  //       background.tilePosition.set(x, y);

  //       Controls.setLoadedChunksAround(
  //         -Math.floor(x / width / CHUNK_SIZE),
  //         -Math.floor(y / width / CHUNK_SIZE),
  //         width,
  //       );
  //     }
  //   }

  //   if (Controls.mouseInput) {
  //     Controls.updateCursorPosition(
  //       event,
  //       this.getChildByName("fg") as PIXI.Sprite,
  //       this.getChildByName("bg") as PIXI.TilingSprite,
  //     );
  //   }
  //   Controls.mouseInput = true;
  //   (document.getElementsByTagName("BODY")[0] as HTMLElement).style.cursor =
  //     "default";
  // }

  // private static updateCursorPosition(
  //   event: PixiEvent,
  //   foreground: PIXI.Sprite,
  //   background: PIXI.TilingSprite,
  // ) {
  //   const width = background.texture.width;
  //   const position = event.data.getLocalPosition(foreground);
  //   const x = Math.floor(position.x / width / scale);
  //   const y = Math.floor(position.y / width / scale);
  //   Controls.cursor.moveTo(x, y);
  // }

  // private static setLoadedChunksAround(x: number, y: number, width: number) {
  //   const windowChunkWidth = Math.ceil(window.innerWidth / width / CHUNK_SIZE);
  //   const windowChunkHeight = Math.ceil(
  //     window.innerHeight / width / CHUNK_SIZE,
  //   );
  //   for (let i = x - 1; i < x + windowChunkWidth; i++) {
  //     for (let j = y - 1; j < y + windowChunkHeight; j++) {
  //       Controls.field.setVisibleChunk(i, j);
  //     }
  //   }
  //   Controls.field.loadVisibleChunks();
  // }

  // private static _onRightClick(_event: unknown) {
  //   Controls.flag();
  // }

  // todo this logic should be moved to the field. If we want custom behavior then we should save settings on the field to enable/disable multi-flagging.
  private static open() {
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

  private static flag() {
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

  // private static moveViewTo(newx: number, newy: number) {
  //   const width = (Controls.cursor.parent.getChildByName("bg") as PIXI.Sprite)
  //     .texture.width;
  //   const x = newx * width * scale;
  //   const y = newy * width * scale;
  //   const newPixelPositionX =
  //     -x + Math.floor(window.innerWidth / width / 2) * width;
  //   const newPixelPositionY =
  //     -y + Math.floor(window.innerHeight / width / 2) * width;

  //   (Controls.cursor.parent.getChildByName("fg") as PIXI.Sprite).position.set(
  //     newPixelPositionX,
  //     newPixelPositionY,
  //   );
  //   (
  //     Controls.cursor.parent.getChildByName("bg") as PIXI.TilingSprite
  //   ).tilePosition.set(newPixelPositionX, newPixelPositionY);

  //   Controls.setLoadedChunksAround(
  //     Math.floor(newx / CHUNK_SIZE),
  //     Math.floor(newy / CHUNK_SIZE),
  //     width,
  //   );

  //   // didnt work as expected
  //   // TweenMax.to(Controls.cursor.parent.getChildByName("fg").position, 0.2, {x:newPixelPositionX,y:newPixelPositionY})
  //   // TweenMax.to(Controls.cursor.parent.getChildByName("bg").tilePosition, 0.2, {x:newPixelPositionX,y:newPixelPositionY});
  // }
}

const eventSchema = z
  .object({
    type: z.enum(["start", "end", "zoom"]),
    transform: z.object({
      k: z.number(),
      x: z.number(),
      y: z.number(),
    }),
  })
  .passthrough();
