// tests/demo.js
import { LocalStorage } from "node-localstorage";
import { test, expect, it, describe, afterEach } from "vitest";
import { Cell } from "./Cell";
import { Field } from "./Field";
import { FieldPersistence } from "./FieldPersistence";
import seedrandom from "seedrandom";
import { Chunk } from "./Chunk";
import { SimpleCellData } from "./CellData";
import { assertCellsAreSame } from "./assertCellsAreSame";
import { assert } from "./assert";

test("Math.sqrt()", () => {
  assert(Math.sqrt(4) === 2);
  assert(Math.sqrt(144) === 12);
  assert(Math.sqrt(2) === Math.SQRT2);
});

test("JSON", () => {
  const input = {
    foo: "hello",
    bar: "world",
  };

  const output = JSON.stringify(input);

  expect(output).toMatchSnapshot();
  expect(JSON.parse(output)).toStrictEqual(input);
});

test("Field should be able to be constructed", () => {
  const field = new Field(undefined, undefined, "test");
  assert(field.gameOver === false);
});

test("Field should open a cell", () => {
  // todo remove. fieldstorage doesnt get cleaned up, and this test should be in the fieldstorage suite
  new FieldPersistence(new LocalStorage("./localStorage"));
  const field = new Field(undefined, undefined, "unitTest");
  const opened = field.open(0, 0);
  assert(opened.length === 1);
  assert(opened[0].isOpen === true);
});

test("Field should calculate score correctly", () => {
  const id = "unitTest";

  new FieldPersistence(new LocalStorage("./localStorage"));

  const field = new Field(undefined, undefined, id);
  expect(field.score).toBe(0);
  const opened = field.open(0, 0);
  assert(opened.length === 1);
  assert(opened[0].isOpen === true);
  expect(field.score).toBe(1);
});

test("Cell should be able to be instantiated", () => {
  const cell = new Cell(0, 0, false, false);
  assert(cell.isOpen === false);
});

describe("LocalStorage", () => {
  const localStorage = new LocalStorage("./localstorage");

  it("should work like the example", () => {
    localStorage.setItem("myFirstKey", "myFirstValue");

    assert(localStorage.getItem("myFirstKey") === "myFirstValue");

    const localStorage2 = new LocalStorage("./localstorage");
    assert(localStorage2.getItem("myFirstKey") === "myFirstValue");
  });

  it("should return null for things that are not set", () => {
    assert(localStorage.getItem("not defined") === null);
  });

  afterEach(() => {
    localStorage.clear();
    assert(localStorage.length === 0);
  });
});

describe("FieldStorage", () => {
  const fieldStorage = new FieldPersistence(new LocalStorage("./localstorage"));

  afterEach(() => {
    fieldStorage.localStorage.clear();
  });

  it("should get an exact copy of the previous field", () => {
    const field1 = new Field(0.6, 2, "test1", "testSeed");

    // assert(      fieldStorage.localStorage.length,      1,      "localstorage length before open"    );

    const openedCells = field1.open(0, 0);
    const flaggedCells1 = field1.flag(3, 3);

    assert(field1.getCell(0, 0).isOpen === true, "opened cell should be open");
    expect(flaggedCells1).toHaveLength(1);
    const flaggedCell1 = flaggedCells1[0];
    expect(flaggedCell1).toBeInstanceOf(Cell);

    assert(openedCells.length === 9);
    assert(flaggedCell1.isFlagged === true);
    assertCellsAreSame(flaggedCell1, field1.getCell(3, 3));

    // expect(fieldStorage.localStorage.length).toBe(1);
    assert(field1.fieldName === "test1");
    assert(field1.score === 9, "field score to static");
    assert(field1.getAll().length === 26);
    assert(field1.gameOver === false);
    assert(field1.neighborPosition.length === 8);
    assert(field1.pristine === false);
    // assert(field1.fieldStorage.localStorage.length, 1);
    // assert.instance(
    //   field1.fieldStorage,
    //   FieldPersistence,
    //   "field1 instance of fieldpersistenc"
    // );
    assert(
      field1.cellData instanceof SimpleCellData,
      "field1 instance of simpleCellData",
    );

    fieldStorage.save(field1, "test1");
    const field2 = fieldStorage.load("test1");

    // delete field1.fieldStorage;
    // delete field2.fieldStorage;
    // assert.equal(getAllKeys(field1.fieldStorage?.localStorage), ["test1"]);
    // assert.instance(
    //   field2.fieldStorage,
    //   FieldPersistence,
    //   "field2 instance of fieldpersistenc"
    // );

    const cell1 = field1.getCell(0, 1);
    if (!field2) throw Error("field2 is undefined");
    const cell2 = field2.getCell(0, 1);

    assert(cell1.isOpen === true, "cell1 open");
    assert(cell2.isOpen === true, "cell2 open");
    assert(field1.value(cell1.x, cell1.y) === field2.value(cell2.x, cell2.y));

    fieldsAreEqual(field1, field2);
  });

  // it.skip("should not get call stack size exceeded when a loaded field opens a cell", (fieldStorage) => {
  //   const id = "unitTest";
  //   const field1 = new Field(undefined, 1, id, "test");
  //   assert(field1.open(0, 0).length === -1);
  //   field1.fieldStorage.__test__ = "";
  //   field1.fieldStorage.localStorage._eventUrl = "1";
  //   const expectedValue = {
  //     _events: {},
  //     _eventsCount: 0,
  //     probability: 0.5,
  //     pristine: false,
  //     safeRadius: 1,
  //     gameOver: false,
  //     neighborPosition: [
  //       [-1, 1],
  //       [0, 1],
  //       [1, 1],
  //       [-1, 0],
  //       [1, 0],
  //       [-1, -1],
  //       [0, -1],
  //       [1, -1],
  //     ],
  //     score: 1,
  //     chunksToSave: [
  //       "100000020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020010010020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020",
  //       "020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020010010020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020",
  //       "020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020000",
  //       "020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020010020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020000020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020",
  //     ],
  //     visibleChunks: [],
  //     fieldStorage: {
  //       localStorage: {
  //         _location: "/home/zikoat/infinite-minesweeper/localstorage",
  //         quota: 5242880,
  //         _events: {},
  //         _eventsCount: 0,
  //         _maxListeners: null,
  //         length: 2,
  //         _bytesInUse: 12,
  //         _keys: ["__test__", "__suite__"],
  //         _metaKeyMap: {
  //           __test__: { key: "__test__", index: 0, size: 0 },
  //           __suite__: { key: "__suite__", index: 1, size: 12 },
  //         },
  //         _eventUrl: "1",
  //       },
  //       __test__: "",
  //       __suite__: "FieldStorage",
  //     },
  //     fieldName: "unitTest",
  //   };
  //   expect(JSON.stringify(expectedValue, undefined, 2)).toMatchInlineSnapshot();

  //   const scoreBefore = field1.score;
  //   fieldStorage.save(field1, id);
  //   const field2 = fieldStorage.load(id);

  //   fieldStorage.registerAutoSave(field1, id);
  //   const scoreAfter = field2.score;
  //   assert(scoreBefore, scoreAfter);
  //   const opened = field2.open(0, 0);
  //   assert(opened, true);
  // });

  it("Field should draw a view", () => {
    const field1 = new Field(0.6, 2, "test1", "testSeed");
    field1.open(0, 0);

    const map = fieldViewToString(field1, -3, -3, 3, 3);
    assertFieldViewEquals(
      map,
      `.......
.x.xx..
.x423..
.x202x.
..224x.
..x.xx.
.......`,
    );
  });
});

export function getAllKeys(localStorage: LocalStorage): string[] {
  const keys: string[] = [];
  let i = 1;
  let key: boolean | string = true;
  while (key) {
    key = localStorage.key(i);

    if (key) keys.push(key);
    i++;
    if (i > 100) throw new Error("i is more than 100");
  }

  return keys;
}

function fieldsAreEqual(field1: Field, field2: Field): void {
  assertFieldViewEquals(
    fieldViewToString(field2, -3, -3, 3, 3),
    `.......
.x.xx..
.x423..
.x202x.
..224x.
..x.xx.
......F`,
  );

  assertFieldViewEquals(
    fieldViewToString(field1, -3, -3, 3, 3),
    fieldViewToString(field2, -3, -3, 3, 3),
  );

  assert(field1.fieldName === field2.fieldName);
  assert(field1.score === field2.score, "field scores");
  assert(
    field1.getAll().length === field2.getAll().length,
    "fieldsareequal getall.length",
  );
  assert(field1.gameOver === field2.gameOver, "field gameover");

  expect(field1.neighborPosition).toStrictEqual(field2.neighborPosition);

  assert(field1.pristine === field2.pristine, "field pristine");
  // assert(
  //   field1.fieldStorage.localStorage.length===
  //   field2.fieldStorage.localStorage.length
  // );
}

// function getChunksInField(chunkedField: ChunkedField): number[][] {
//   const chunkCoords = [];
//   for (const xChunks of Object.keys(chunkedField)) {
//     for (const yChunks of Object.keys(chunkedField[parseInt(xChunks)])) {
//       chunkCoords.push([parseInt(xChunks), parseInt(yChunks)]);
//     }
//   }
//   return chunkCoords;
// }

test("SeddedRandom should get the same random number every time", () => {
  const wow = seedrandom("test");
  const randomNumber = wow();
  assert(
    randomNumber === 0.8722025543160253,
    "Randomnumber was " + randomNumber,
  );
});

test("Chunk should be instantiated", () => {
  const chunk = new Chunk(0, 0);
  const chunkJsonFunction = chunk.toJSON();
  const chunkJsonStringified = JSON.stringify(chunk);
  assert(typeof chunkJsonFunction === "string");
  assert(typeof chunkJsonStringified === "string");
  assert(
    chunkJsonFunction ===
      chunkJsonStringified.substring(1, chunkJsonStringified.length - 1),
  );
  assert(chunk instanceof Chunk);
});

test("Chunk should get cell", () => {
  const chunk = new Chunk(0, 0);

  const cell: Cell = chunk.getCell(0, 0);
  assert(cell.toJSON() === "020", "tojson cell");
  assert(cell instanceof Cell, "is instance");
  expect(cellToObject(cell)).toStrictEqual({
    isFlagged: false,
    isOpen: false,
    x: 0,
    y: 0,
    isMine: undefined,
  });
});

test("should be able to chord flag, chord open and chord open should also chord flag", () => {
  const field = new Field(0.08, 1, "test1", "testSeed");

  field._setCell(4, 1, { isMine: true });
  field._setCell(7, 2, { isMine: true });
  field._setCell(1, 3, { isMine: true });
  field._setCell(8, 4, { isMine: true });
  field._setCell(5, 5, { isMine: true });
  field._setCell(6, 5, { isMine: true });
  field._setCell(2, 6, { isMine: true });

  field.open(3, 3);

  const view = () => fieldViewToString(field, 1, 1, 8, 6);
  assertFieldViewEquals(
    view(),
    `...x....
.11111x.
x10001..
.10122.x
.111xx..
.x......`,
  );

  // Flag chord the one on the corner to flag it
  field.flag(4, 4);

  assertFieldViewEquals(
    view(),
    `...x....
.11111x.
x10001..
.10122.x
.111Fx..
.x......`,
  );

  // Flag chord the 2, which will only flag the ones that are not already flagged
  field.flag(5, 4);

  assertFieldViewEquals(
    view(),
    `...x....
.11111x.
x10001..
.10122.x
.111FF..
.x......`,
  );

  // Chord open the next 2 which is full, so we can open the 3 cells
  field.open(6, 4);

  assertFieldViewEquals(
    view(),
    `...x....
.11111xx
x100013.
.101222x
.111FF3.
.x.....x`,
  );

  // chord open the 1 on the top corner, but this flags the neighbor because the count is the same as the flags
  field.open(3, 0);

  assertFieldViewEquals(
    view(),
    `...x....
.11111xx
x100013.
.101222x
.111FF3.
.x.....x`,
  );
});

test("An opened mine should be handled like a flag when chord opening", () => {
  // shit todo, we should be able to pass a visual field, and it should set the field like that.

  const field = new Field(0, 2, "test1", "testSeed");
  field._setCell(2, 1, { isMine: true });
  field._setCell(5, 2, { isMine: true });
  field._setCell(6, 2, { isMine: true });
  field._setCell(1, 4, { isMine: true });
  field._setCell(7, 5, { isMine: true });
  field._setCell(4, 6, { isMine: true });
  const view = () => fieldViewToString(field, 1, 1, 8, 6);

  // Open 0 to reveal
  field.open(3, 3);
  // Open mine on corner
  field.open(5, 2);

  assertFieldViewEquals(
    view(),
    `.x......
.111Xx..
.10122..
x10001..
.11111x.
...x....`,
  );

  // Chord open 2 below mine, which should flag the other mine
  field.open(5, 3);

  assertFieldViewEquals(
    view(),
    `.x......
.111XF..
.10122..
x10001..
.11111x.
...x....`,
  );

  // Chord open the next 2, which should open the 3 tiles to the right
  field.open(6, 3);

  assertFieldViewEquals(
    view(),
    `.x......
.111XF1.
.101221.
x100011.
.11111x.
...x....`,
  );
});
test("An opened mine should be handled like a flag when chord flagging", () => {
  // shit todo, we should be able to pass a visual field, and it should set the field like that.

  const field = new Field(0, 2, "test1", "testSeed");
  field._setCell(2, 1, { isMine: true });
  field._setCell(5, 2, { isMine: true });
  field._setCell(6, 2, { isMine: true });
  field._setCell(1, 4, { isMine: true });
  field._setCell(7, 5, { isMine: true });
  field._setCell(4, 6, { isMine: true });
  const view = () => fieldViewToString(field, 1, 1, 8, 6);

  // Open 0 to reveal
  field.open(3, 3);
  // Open mine on corner
  field.open(5, 2);

  assertFieldViewEquals(
    view(),
    `.x......
.111Xx..
.10122..
x10001..
.11111x.
...x....`,
  );

  // Chord flag 2 below mine, which should flag the other mine
  field.flag(5, 3);

  assertFieldViewEquals(
    view(),
    `.x......
.111XF..
.10122..
x10001..
.11111x.
...x....`,
  );
});

test("chord opening an open mine should not open cells", () => {
  const field = new Field(0, 2, "test1", "testSeed");

  field._setCell(5, 1, { isMine: true });
  field._setCell(2, 2, { isMine: true });
  field._setCell(8, 3, { isMine: true });
  field._setCell(5, 4, { isMine: true });
  field._setCell(1, 5, { isMine: true });
  field._setCell(8, 6, { isMine: true });
  field._setCell(3, 8, { isMine: true });
  field._setCell(6, 8, { isMine: true });

  const view = () => fieldViewToString(field, 1, 1, 8, 8);

  // Open 0 to reveal
  field.open(3, 4);
  // Open the mine to create an opened mine
  field.open(5, 4);

  assertFieldViewEquals(
    view(),
    `....x...
.x......
.111...x
.101X...
x101111.
.100001x
.111112.
..x..x..`,
  );

  // Try to open the opened mine again. Nothing should change from previous field.
  field.open(5, 4);

  assertFieldViewEquals(
    view(),
    `....x...
.x......
.111...x
.101X...
x101111.
.100001x
.111112.
..x..x..`,
  );
});

test("chord opening or flagging an open mine should not flag cells", () => {
  const field = new Field(0, 2, "test1", "testSeed");

  field._setCell(4, 1, { isMine: true });
  field._setCell(7, 1, { isMine: true });
  field._setCell(1, 3, { isMine: true });
  field._setCell(5, 5, { isMine: true });
  field._setCell(6, 5, { isMine: true });
  field._setCell(8, 4, { isMine: true });
  field._setCell(3, 9, { isMine: true });
  field._setCell(6, 9, { isMine: true });
  field._setCell(8, 7, { isMine: true });
  field._setCell(1, 6, { isMine: true });

  const view = () => fieldViewToString(field, 1, 1, 8, 9);

  // Open 0 to reveal
  field.open(3, 4);
  // Open the mine to create an opened mine
  field.open(5, 5);
  const fieldViewOpenedMine = `...x..x.
.111111.
x100001.
.101222x
.101Xx..
x101222.
.100001x
.111112.
..x..x..`;
  assertFieldViewEquals(view(), fieldViewOpenedMine);

  // Try to open the opened mine again. Nothing should change from previous field.
  field.open(5, 5);
  assertFieldViewEquals(view(), fieldViewOpenedMine);

  // Try to flag the opened mine. Nothing should change from previous field.
  field.flag(5, 5);
  assertFieldViewEquals(view(), fieldViewOpenedMine);
});

function cellToObject(cell: Cell): {
  isFlagged: boolean;
  isOpen: boolean;
  x: number;
  y: number;
  isMine: boolean | undefined;
} {
  const { isFlagged, isOpen, x, y, isMine } = cell;
  return { isFlagged, isOpen, x, y, isMine };
}

function fieldViewToString(
  field: Field,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): string {
  let map = "";

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const cell = field.getCell(x, y);
      let character = "";
      if (cell.isMine && cell.isOpen && !cell.isFlagged) character = "X";
      else if (!cell.isOpen && cell.isFlagged) character = "F";
      else if (!cell.isMine && cell.isOpen && !cell.isFlagged) {
        const value = field.value(cell.x, cell.y);
        if (value === null) throw Error("the cell's value is null");
        character = value.toString();
      } else if (cell.isMine && !cell.isOpen && !cell.isFlagged)
        character = "x";
      else if (!cell.isMine && !cell.isOpen && !cell.isFlagged) character = ".";
      else
        throw new Error(
          `don't know what cell ${cell} on coordinate ${x},${y} is supposed to be`,
        );

      map += character;
    }
    map += "\n";
  }
  return map.trim();
}

function assertFieldViewEquals(
  got: string,
  want: string,
): asserts got is typeof want {
  if (got !== want) {
    expect(got, `Field is not the same.\nGot:\n${got}\n\nWant:\n${want}`).toBe(
      want,
    );
  }
}
