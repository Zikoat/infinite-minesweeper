import type { Tagged } from "type-fest";

type Pos<T> = { x: T; y: T };

export type CellWidth = Tagged<number, "CellWidth">;

// A cell position is the index which is to find a specific cell in the game board.
export type CellCoord = Tagged<number, "CellCoord">;

// A world position describes a place in the pixi scene graph where a sprite is located.
export type WorldPos = Pos<WorldCoord>;
export type WorldCoord = Tagged<number, "WorldCoord">;

// A screen position describes a position on the user's screen
export type ScreenPos = Pos<ScreenCoord>;
export type ScreenCoord = Tagged<number, "ScreenCoord">;
