// tests/demo.js
import { LocalStorage } from "node-localstorage";
import { suite, test } from "uvu";
import * as assert from "uvu/assert";
import Cell from "./Cell";
import Field from "./Field";
import FieldStorage from "./FieldStorage";

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

const field = suite("Field");

field("should be able to be constructed", () => {
  const field = new Field(undefined, undefined, undefined, undefined);
  assert.is(field.gameOver, false);
});

field("toJson should return the field as an object", () => {
  const field = new Field(undefined, undefined, undefined, undefined);
  const json = JSON.stringify(field);
  assert.equal(
    json,
    '{"_events":{},"_eventsCount":0,"field":{},"probability":0.5,"pristine":true,"safeRadius":1,"gameOver":false,"neighborPosition":[[-1,1],[0,1],[1,1],[-1,0],[1,0],[-1,-1],[0,-1],[1,-1]],"score":0,"chunksToSave":[],"visibleChunks":[]}'
  );
});

field("should open a cell", () => {
  const fieldStorage = new FieldStorage(new LocalStorage("./localStorage"));
  const field = new Field(undefined, undefined, fieldStorage, "unitTest");
  const opened = field.open(0, 0);
  assert.is(opened, true);
});

field("should calculate score correctly", () => {
  const id = "unitTest";

  const fieldStorage = new FieldStorage(new LocalStorage("./localStorage"));
  const field = new Field(undefined, undefined, fieldStorage, id);
  assert.is(field.score, 0);
  const opened = field.open(0, 0);
  assert.is(opened, true);
  assert.is(field.score, 1);
});
const cell = suite("Cell");

cell("should be able to be instantiated", () => {
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
    const field1 = new Field(0.6, 2, fieldStorage, "test1");
    fieldStorage.save(field1, "test1");
    const field2 = fieldStorage.load("test1");

    delete field1.fieldStorage;
    delete field2.fieldStorage;
;
assert.equal({},{})
    assert.is(
      JSON.stringify(field1),
      JSON.stringify(field2),
      "JSON stringified objects are not the same"
    );
    // assert.equal(field1, field2, "field objects are not equal");
    
  }
);

fieldStorageSuite(
  "should not get call stack size exceeded when a loaded field opens a cell",
  () => {
    const id = "unitTest";
    const fieldStorage = new FieldStorage(new LocalStorage("./localstorage"));
    const field1 = new Field(undefined, undefined, fieldStorage, id);
    assert.is(field1.open(0, 0), true);
    fieldStorage.save(field1, id);
    // field1.save()
    const field2 = fieldStorage.load(id);
    // console.log(field2)
    const opened = field2.open(0, 0);
    assert.is(opened, true); // bug
  }
);

fieldStorageSuite.after.each((fieldStorage) => {
  fieldStorage.localStorage.clear();
});

test.run();
field.run();
localStorageSuite.run();
fieldStorageSuite.run();
cell.run();
