import { Cursor } from "./Cursor";
import * as PIXI from "pixi.js";
import { zoom, ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import { z } from "zod";
import { Field } from "./Field";
import { FieldPersistence } from "./FieldPersistence";
import { assert } from "./assert";
import { WorldPos, ScreenPos } from "./CoordTypes";

// todo add setting for long press duration
const LONG_PRESS_DURATION = 200; // Duration in milliseconds to consider it a long press

export class Controls {
  private static cursor: Cursor;
  private static field: Field;
  private static fieldStorage: FieldPersistence | undefined;

  public constructor(
    rootObject: PIXI.Container,
    field: Field,
    fieldStorage: FieldPersistence,
  ) {
    Controls.field = field;
    Controls.fieldStorage = fieldStorage;

    Controls.cursor = new Cursor();
    const foreground = rootObject.getChildByLabel("container");
    assert(foreground);
    foreground.addChild(Controls.cursor);

    Controls.setupZoom(rootObject);
    Controls.disableRightClickContextMenu();
  }

  private static disableRightClickContextMenu() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  private static setupZoom(rootObject: PIXI.Container) {
    // We have to get this before setting up zoom so we don't show the zoomed out version for some frames after it has been created.
    const savedTransform = savedCameraTransform.get();

    const logEvent = (event: Event) => console.log(event.type);

    const zoomHandler = zoom().on("zoom", (rawEvent) => {
      logEvent(rawEvent);
      const event = eventSchema.parse(rawEvent);

      const container = rootObject.getChildByLabel("container") as PIXI.Sprite;
      const foreground = container.getChildByLabel("fg") as PIXI.Sprite;
      const background = rootObject.getChildByLabel("bg") as PIXI.TilingSprite;

      const x = event.transform.x;
      const y = event.transform.y;
      const scale = event.transform.k;

      container.position.set(x, y);
      container.scale.set(scale);
      background.tilePosition.set(x, y);
      background.tileScale.set(scale);
      function lerp(a: number, b: number, alpha: number): number {
        return a + alpha * (b - a);
      }
      const lerpedScale = lerp(-1, 0.5, scale);
      background.alpha = lerpedScale;
      foreground.alpha = lerpedScale;

      // todo dedupe between touchend
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      savedCameraTransform.set(event.transform);
    });
    // todo when pressing mousedown, then i want to update the cell sprite to be from closed to open. This is both when pressing down(before releasing) on a closed cell, and on an open cell with a closed unflagged neighbor
    // todo add option to pan using middle mouse button, which allows us to enable immediate mode on left and right click.
    // todo enable immediate mode on right click, because we are not using it to flag
    // todo allow switching what the mouse buttons does, we have the actions: pan, chord open, chord flag, open, flag. these actions can be assigned to mouse right, mouse left, middle mouse click, or optionally keyboard buttons.
    // todo try to create a new mode where we are locking the mouse to the center of the screen, and move the whole field in addition to the cursor when we move the cursor. Then we can open with mouse click. We need to be able to unlock the mouse using escape.

    let longPressTimer: NodeJS.Timeout | null = null;

    const selection = select<Element, unknown>("canvas")
      .on("touchstart", (event: TouchEvent) => {
        logEvent(event);

        if (event.touches.length > 1) return;

        const touchPosition = event.touches[0];

        // todo dedup between mousemove.
        assert(typeof touchPosition.clientX === "number");
        assert(typeof touchPosition.clientY === "number");
        const foreground = rootObject.getChildByLabel("container");
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
      .on("touchend", (e) => {
        logEvent(e);
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      })
      .on("click", (e) => {
        logEvent(e);
        // todo we can simplify position calculations massively by rendering all of the closed cells and adding interactivity to them, then add some metadata to each sprite which coordinate it represents.
        Controls.open();
      })

      .on("mouseup", (e: MouseEvent) => {
        logEvent(e);
        if (e.button === 2) Controls.flag();
      })
      .on("mousemove", (event: PointerEvent & ScreenPos) => {
        logEvent(event);
        assert(typeof event.x === "number");
        assert(typeof event.y === "number");
        const foreground = rootObject.getChildByLabel("container");
        assert(foreground);
        const worldPos = foreground.toLocal(event) as WorldPos;

        Controls.cursor.moveTo(worldPos.x, worldPos.y);
      })
      .call(zoomHandler)
      .on("dblclick.zoom", null);

    if (savedTransform) {
      zoomHandler.transform(
        selection,
        new ZoomTransform(savedTransform.k, savedTransform.x, savedTransform.y),
      );
    } else {
      zoomHandler.translateTo(selection, 0, 0);
      zoomHandler.scaleBy(selection, window.devicePixelRatio * 2);
    }
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

    if (Controls.fieldStorage === undefined)
      throw new Error("tried to save, but fieldstorage is undefined");

    this.field.open(x, y);
    Controls.fieldStorage.save(Controls.field, Controls.field.fieldName);
  }

  // todo this logic should be moved to the field. If we want custom behavior then we should save settings on the field to enable/disable multi-flagging.
  private static flag() {
    const x = Controls.cursor.getX();
    const y = Controls.cursor.getY();

    if (Controls.fieldStorage === undefined)
      throw new Error("tried to save, but fieldstorage is undefined");

    Controls.field.flag(x, y);

    Controls.fieldStorage.save(Controls.field, Controls.field.fieldName);
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

const savedCameraTransform = {
  key: "savedCamerTransform",
  get: (): CameraTransform | null => {
    return JSON.parse(
      (localStorage.getItem(savedCameraTransform.key) as string | null) ??
        "null",
    ) as CameraTransform;
  },
  set: (transform: CameraTransform): void => {
    localStorage.setItem(savedCameraTransform.key, JSON.stringify(transform));
  },
};

type CameraTransform = {
  x: number;
  y: number;
  k: number;
};
