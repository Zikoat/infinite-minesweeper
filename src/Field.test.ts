// tests/demo.js
import { LocalStorage } from "node-localstorage";
import { suite, test } from "uvu";
import * as assert from "uvu/assert";
import Cell from "./Cell";
import Field, { ChunkedField } from "./Field";
import FieldStorage from "./FieldStorage";
import seedrandom from "seedrandom";
import { Chunk } from "./Chunk";

test("Math.sqrt()", () => {
  assert.is(Math.sqrt(4), 2);
  assert.is(Math.sqrt(144), 12);
  assert.is(Math.sqrt(2), Math.SQRT2);
});

test("JSON", () => {
  const input = {
    foo: "hello",
    bar: "world",
  };

  const output = JSON.stringify(input);

  assert.snapshot(output, `{"foo":"hello","bar":"world"}`);
  assert.equal(JSON.parse(output), input, "matches original");
});

test("Field should be able to be constructed", () => {
  const field = new Field(undefined, undefined, undefined, undefined);
  assert.is(field.gameOver, false);
});

test("Field should open a cell", () => {
  // todo remove. fieldstorage doesnt get cleaned up, and this test should be in the fieldstorage suite
  const fieldStorage = new FieldStorage(new LocalStorage("./localStorage"));
  const field = new Field(undefined, undefined, fieldStorage, "unitTest");
  const opened = field.open(0, 0);
  assert.is(opened, true);
});

test("Field should calculate score correctly", () => {
  const id = "unitTest";

  const fieldStorage = new FieldStorage(new LocalStorage("./localStorage"));
  const field = new Field(undefined, undefined, fieldStorage, id);
  assert.is(field.score, 0);
  const opened = field.open(0, 0);
  assert.is(opened, true);
  assert.is(field.score, 1);
});

test("Cell should be able to be instantiated", () => {
  const cell = new Cell(0, 0, undefined, false, false);
  assert.is(cell.isOpen, false);
});

const localStorage = new LocalStorage("./localstorage");
const localStorageSuite = suite("LocalStorage", localStorage);

localStorageSuite("should work like the example", (localStorage) => {
  localStorage.setItem("myFirstKey", "myFirstValue");

  assert.is(localStorage.getItem("myFirstKey"), "myFirstValue");

  const localStorage2 = new LocalStorage("./localstorage");
  assert.is(localStorage2.getItem("myFirstKey"), "myFirstValue");
});

localStorageSuite(
  "should return null for things that are not set",
  (localStorage) => {
    assert.is(localStorage.getItem("not defined"), null);
  }
);

localStorageSuite.after.each((localStorage) => {
  localStorage.clear();
  assert.is(localStorage.length, 0);
});

const fieldStorageSuite = suite(
  "FieldStorage",
  new FieldStorage(new LocalStorage("./localstorage"))
);
fieldStorageSuite(
  "should get an exact copy of the previous field",
  (fieldStorage) => {
    const field1 = new Field(0.6, 2, fieldStorage, "test1", "testSeed");

    assert.is(
      fieldStorage.localStorage.length,
      1,
      "localstorage length before open"
    );

    field1.open(0, 0);

    assert.is(
      fieldStorage.localStorage.length,
      1,
      "localstorage length after open"
    );
    assert.is(field1.fieldName, "test1");
    assert.is(field1.score, 9, "field score to static");
    assert.is(field1.getAll().length, 4096);
    assert.is(field1.gameOver, false);
    assert.is(field1.neighborPosition.length, 8);
    assert.is(field1.pristine, false);
    assert.is(field1.fieldStorage.localStorage.length, 1);

    field1.chunksToSave.slice(0).forEach((chunk: any) => {
      fieldStorage.saveChunk(chunk, field1.fieldName);
    });
    field1.chunksToSave = [];

    fieldStorage.save(field1, "test1");
    const field2 = fieldStorage.load("test1");

    // delete field1.fieldStorage;
    // delete field2.fieldStorage;
    // assert.equal(getAllKeys(field1.fieldStorage?.localStorage), ["test1"]);

    const cell1 = field1.getCell(0, 1);
    const cell2 = field2.getCell(0, 1);

    assert.is(cell1.isOpen, true, "cell1 open");
    assert.is(cell2.isOpen, true, "cell2 open");
    assert.is(cell1.value(), cell2.value());

    fieldsAreEqual(field1, field2);
  }
);

export function getAllKeys(localStorage: LocalStorage): string[] {
  const keys: string[] = [];
  let i = 1;
  let key: boolean | string = true;
  while (key) {
    key = localStorage.key(i);

    if (key) keys.push(key);
    console.log(key);
    i++;
    if (i > 100) throw new Error("i is more than 100");
  }

  return keys;
}

function fieldsAreEqual(field1: Field, field2: Field): void {
  assert.equal(
    fieldViewToString(field2, -3, -3, 3, 3),
    `.......
.xxx...
..422x.
.x202..
.x324x.
...xxx.
.......
`
  );
  assert.equal(
    fieldViewToString(field1, -3, -3, 3, 3),
    fieldViewToString(field2, -3, -3, 3, 3)
  );

  assert.equal(
    getChunksInField(field2.field),
    [
      [0, 0],
      [0, -1],
      [-1, 0],
      [-1, -1],
    ],
    "getchunksfield 1"
  );
  // assert.is(field1.field, field2.field)
  assert.is(field1.fieldName, field2.fieldName);
  assert.is(field1.score, field2.score, "field scores");
  assert.is(
    field1.getAll().length,
    field2.getAll().length,
    "fieldsareequal getall.length"
  );
  assert.is(field1.gameOver, field2.gameOver, "field gameover");
  assert.is(field1.neighborPosition, field2.neighborPosition, "field neighborpositions");
  assert.is(field1.pristine, field2.pristine,"field pristine");
  assert.is(
    field1.fieldStorage.localStorage.length,
    field2.fieldStorage.localStorage.length
  );
}

function getChunksInField(chunkedField: ChunkedField): number[][] {
  const chunkCoords = [];
  for (const xChunks of Object.keys(chunkedField)) {
    for (const yChunks of Object.keys(chunkedField[parseInt(xChunks)])) {
      chunkCoords.push([parseInt(xChunks), parseInt(yChunks)]);
    }
  }
  return chunkCoords;
}

fieldStorageSuite.skip(
  "should not get call stack size exceeded when a loaded field opens a cell",
  (fieldStorage) => {
    const id = "unitTest";
    const field1 = new Field(undefined, 1, fieldStorage, id, "test");
    assert.is(field1.open(0, 0), true);
    field1.fieldStorage.__test__ = "";
    field1.fieldStorage.localStorage._eventUrl = "1";
    const expectedValue = {
      _events: {},
      _eventsCount: 0,
      probability: 0.5,
      pristine: false,
      safeRadius: 1,
      gameOver: false,
      neighborPosition: [
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
      ],
      score: 1,
      chunksToSave: [
        "100000020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020010010020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020",
        "020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020010010020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020",
        "020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020000",
        "020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020010020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020000020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020020",
      ],
      visibleChunks: [],
      fieldStorage: {
        localStorage: {
          _location: "/home/zikoat/infinite-minesweeper/localstorage",
          quota: 5242880,
          _events: {},
          _eventsCount: 0,
          _maxListeners: null,
          length: 2,
          _bytesInUse: 12,
          _keys: ["__test__", "__suite__"],
          _metaKeyMap: {
            __test__: { key: "__test__", index: 0, size: 0 },
            __suite__: { key: "__suite__", index: 1, size: 12 },
          },
          _eventUrl: "1",
        },
        __test__: "",
        __suite__: "FieldStorage",
      },
      fieldName: "unitTest",
    };
    assert.snapshot(
      JSON.stringify(expectedValue, undefined, 2),
      JSON.stringify(field1, undefined, 2)
    );
    const scoreBefore = field1.score;
    fieldStorage.save(field1, id);
    // field1.save()
    const field2 = fieldStorage.load(id);

    fieldStorage.registerAutoSave(field1, id);
    const scoreAfter = field2.score;
    assert.is(scoreBefore, scoreAfter);
    // console.log(field2)
    const opened = field2.open(0, 0);
    assert.is(opened, true); // bug
  }
);

fieldStorageSuite.after.each((fieldStorage) => {
  fieldStorage.localStorage.clear();
});

test("SeddedRandom should get the same random number every time", () => {
  const wow = seedrandom("shit");
  const randomNumber = wow();
  assert.is(randomNumber, 0.4459846419098659);
});

test("Chunk should be instantiated", () => {
  const chunk = new Chunk(0, 0, undefined);
  const chunkJsonFunction = chunk.toJSON();
  const chunkJsonStringified = JSON.stringify(chunk);
  assert.type(chunkJsonFunction, "string");
  assert.type(chunkJsonStringified, "string");
  assert.equal(
    chunkJsonFunction,
    chunkJsonStringified.substring(1, chunkJsonStringified.length - 1)
  );
  assert.instance(chunk, Chunk);
});

test("Chunk should get cell", () => {
  const chunk = new Chunk(0, 0, undefined);

  const cell: Cell = chunk.getCell(0, 0);
  assert.equal(cell.toJSON(), "020", "tojson cell");
  assert.instance(cell, Cell, "is instance");
  assert.equal(
    cellToObject(cell),
    {
      isFlagged: undefined,
      isOpen: false,
      parent: undefined,
      x: 0,
      y: 0,
      isMine: undefined,
    },
    "celltoobject"
  );
});

function cellToObject(cell: Cell): {
  isFlagged: boolean;
  isOpen: boolean;
  parent: Field | undefined;
  x: number;
  y: number;
  isMine: boolean | undefined;
} {
  const { isFlagged, isOpen, parent, x, y, isMine } = cell;
  return { isFlagged, isOpen, parent, x, y, isMine };
}

fieldStorageSuite("should be able to save and load a chunk", (fieldStorage) => {
  const chunk = new Chunk(0, 0, undefined);
  fieldStorage.saveChunk(chunk, "test");
  const loadedChunk = fieldStorage.loadChunk("test", 0, 0);
  assert.is(loadedChunk.getAll().length, 1024);

  for (const cell of loadedChunk.getAll()) {
    assert.is(cell.isFlagged, false);
    assert.is(cell.isMine, undefined);
    assert.is(cell.isOpen, false);
    assert.is(cell.parent, undefined);
    assert.ok(
      cell.x >= 0,
      JSON.stringify(cellToObject(cell)) + " does not have x>=0"
    );
    assert.ok(cell.x < 32, cellToObject(cell) + " does not have x<32");
    assert.ok(cell.y >= 0, cellToObject(cell) + " does not have y>=0");
    assert.ok(cell.y < 32, cellToObject(cell) + " does not have y<32");
  }
});

fieldStorageSuite("Field should draw a view", (fieldStorage) => {
  const field1 = new Field(0.6, 2, fieldStorage, "test1", "testSeed");
  field1.open(0, 0);

  const map = fieldViewToString(field1, -3, -3, 3, 3);

  assert.equal(
    map,
    `.......
.xxx...
..422x.
.x202..
.x324x.
...xxx.
.......
`
  );
});

function fieldViewToString(
  field: Field,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): string {
  let map = "";

  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      const cell = field.getCell(x, y);
      let character = "";
      if (cell.isMine && cell.isOpen && !cell.isFlagged) character = "X";
      else if (cell.isMine && !cell.isOpen && cell.isFlagged) character = "F";
      else if (!cell.isMine && cell.isOpen && !cell.isFlagged) {
        const value = cell.value();
        if (value === null) throw Error("the cell's value is null");
        character = value.toString();
      } else if (cell.isMine && !cell.isOpen && !cell.isFlagged)
        character = "x";
      else if (!cell.isMine && !cell.isOpen && !cell.isFlagged) character = ".";
      else
        throw new Error(
          `don't know what cell ${cell} on coordinate ${x},${y} is supposed to be`
        );

      map += character;
    }
    map += "\n";
  }
  return map;
}

test.run();
localStorageSuite.run();
fieldStorageSuite.run();
