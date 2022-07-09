// tests/demo.js
import { suite, test } from "uvu";
import * as assert from "uvu/assert";
import Cell from "./Cell";
import Field from "./Field";
import {LocalStorage} from "node-localstorage";

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
  const field = new Field();
  assert.is(field.gameOver, false);
});

field("toJson should return the field as an object", () => {
  const field = new Field();
  const json = field.toJSON();
  assert.equal(json, {
    probability: 0.5,
    score: 0,
  });
});

field("should open a cell", () => {
  const field = new Field();
  const opened = field.open(0, 0);
  assert.is(opened, true);
});

const cell = suite("Cell");

cell("should be able to be instantiated", () => {
  const cell = new Cell(0, 0, undefined, false, false);
  assert.is(cell.isOpen, false);
});

const localStorageSuite = suite("LocalStorage");
localStorageSuite("should work like the example", () => {
  // if (typeof localStorage === "undefined" || localStorage === null) {
  const localStorage3 = new LocalStorage("./scratch");
  // }

  localStorage3.setItem("myFirstKey", "myFirstValue");

  assert.is(localStorage3.getItem("myFirstKey"), "myFirstValue");
});

test.run();
field.run();
