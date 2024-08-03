import { Cursor, ScreenPos, WorldPos } from "./Cursor";
import * as PIXI from "pixi.js";
import { zoom } from "d3-zoom";
import { select } from "d3-selection";
import { z } from "zod";
import { Field } from "./Field";
import { FieldPersistence } from "./FieldPersistence";
import { assert } from "./assert";

// todo add setting for long press duration
const LONG_PRESS_DURATION = 200; // Duration in milliseconds to consider it a long press

export class Controls {
  private static cursor: Cursor;
  private static field: Field;
  private static fieldStorage: FieldPersistence;

  public constructor(
    rootObject: PIXI.Container,
    field: Field,
    fieldStorage: FieldPersistence,
  ) {
    Controls.field = field;
    Controls.fieldStorage = fieldStorage;

    Controls.cursor = new Cursor();
    const foreground = rootObject.getChildByName("fg");
    assert(foreground);
    foreground.addChild(Controls.cursor);

    Controls.setupZoom(rootObject);
    Controls.disableRightClickContextMenu();
  }

  private static disableRightClickContextMenu() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  private static setupZoom(rootObject: PIXI.Container) {
    const zoomHandler = zoom().on("zoom", (rawEvent) => {
      const event = eventSchema.parse(rawEvent);

      const foreground = rootObject.getChildByName("fg") as PIXI.Sprite;
      const background = rootObject.getChildByName("bg") as PIXI.TilingSprite;

      const x = event.transform.x;
      const y = event.transform.y;
      const scale = event.transform.k;

      foreground.position.set(x, y);
      foreground.scale.set(scale);
      background.tilePosition.set(x, y);
      background.tileScale.set(scale);

      // todo dedupe between touchend
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    let longPressTimer: NodeJS.Timeout | null = null;

    const selection = select<Element, unknown>("canvas")
      .on("touchstart", (event: TouchEvent) => {
        if (event.touches.length > 1) return;

        const touchPosition = event.touches[0];

        // todo dedup between mousemove.
        console.log(event, touchPosition);
        console.log("touchstart");
        assert(typeof touchPosition.clientX === "number");
        assert(typeof touchPosition.clientY === "number");
        const foreground = rootObject.getChildByName("fg");
        assert(foreground);
        const worldPos = foreground.toLocal({
          x: touchPosition.clientX,
          y: touchPosition.clientY,
        }) as WorldPos;

        longPressTimer = setTimeout(() => {
          Controls.cursor.moveTo(worldPos.x, worldPos.y);
          Controls.flag();
        }, LONG_PRESS_DURATION);
      })
      .on("touchend", () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      })
      .on("click", () => {
        console.log("click");
        // todo we can simplify position calculations massively by rendering all of the closed cells and adding interactivity to them, then add some metadata to each sprite which coordinate it represents.
        Controls.open();
      })
      .on("mousemove", (event: PointerEvent & ScreenPos) => {
        assert(typeof event.x === "number");
        assert(typeof event.y === "number");
        const foreground = rootObject.getChildByName("fg");
        assert(foreground);
        const worldPos = foreground.toLocal(event) as WorldPos;

        Controls.cursor.moveTo(worldPos.x, worldPos.y);
      })
      .call(zoomHandler)
      .on("dblclick.zoom", null);

    zoomHandler.translateTo(selection, 0, 0);
    zoomHandler.scaleBy(selection, window.devicePixelRatio * 2);
  }

  // todo create method on the parent which applies transform instead of mutating the object directly.
  // todo add different types (maybe with brands) for the different types of transforms, because we are starting to work in a lot of different coordinate systems.

  // todo i need a global camera state, and based on when the camera changes we should update foreground and background position.
  // todo cursor is always in upper left corner
  // todo pressing a square does nothing

  // todo after restarting, the opened cell is not in the middle
  // todo, when i load the page, then press somewhere, then it jumps to another place
  // - todo i need to pass initial transform to controls

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
