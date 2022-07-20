import * as fc from "fast-check";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { SimpleNumberStorage } from "./SimpleNumberStorage";

abstract class CompressibleNumberStorage implements NumberStorage {
  abstract get(x: number, y: number): number | null;
  abstract set(x: number, y: number, value: number | null): void;
  abstract getAll(): { x: number; y: number; value: number }[];
  abstract compress(): string;
  abstract decompress(compressed: string): this;
}

type COOFormat = Record<number, Record<number, number>>;

class COO implements CompressibleNumberStorage {
  protected data: COOFormat = {};

  compress(): string {
    return JSON.stringify(this.data);
  }
  decompress(compressed: string) {
    const parsedJson = JSON.parse(compressed) as COOFormat;
    this.data = parsedJson;

    return this;
  }

  set(x: number, y: number, value: number): void {
    if (this.data[x] !== undefined) this.data[x]![y] = value;
    else {
      this.data[x] = {};
      this.data[x]![y] = value;
    }
  }

  get(x: number, y: number): number | null {
    return this.data[x]?.[y] ?? null;
  }

  getAll(): { x: number; y: number; value: number }[] {
    const output: { x: number; y: number; value: number }[] = [];
    for (const x in this.data) {
      for (const y in this.data[x]) {
        const value = this.data[x][y];
        output.push({ x: parseInt(x), y: parseInt(y), value });
      }
    }
    return output;
  }
}

testStorage(SimpleNumberStorage);
testStorage(COO);

function testStorage<T extends CompressibleNumberStorage>(
  storageConstructor: new () => T
): void {
  const storageSuite = suite(storageConstructor.name);

  storageSuite("should get a setted value", () => {
    const storage = new storageConstructor();
    storage.set(0, 0, 1);
    const returnedValue = storage.get(0, 0);

    assert.is(returnedValue, storage.get(0, 0));
  });

  storageSuite(
    "should return null if we get something that hasn't been set",
    () => {
      const storage = new storageConstructor();

      assert.is(storage.get(0, 0), null);
    }
  );

  storageSuite("should work with negative numbers", () => {
    const storage = new storageConstructor();
    storage.set(-1, -1, 1);

    assert.is(storage.get(-1, -1), 1);
  });

  storageSuite("should return the same after stringification", () => {
    let storage = new storageConstructor();
    storage.set(0, 0, 1);
    storage.set(0, 1, 0);
    storage.set(1, 1, 1);
    storage.set(1, 1, null);

    const stringifiedStorage = storage.compress();
    assert.type(stringifiedStorage, "string");
    const newStorage = storage.decompress(stringifiedStorage);

    assert.equal(newStorage.get(0, 0), 1);
    assert.equal(newStorage.get(0, 1), 0);
    assert.equal(newStorage.get(0, 2), null);
    assert.equal(newStorage.get(1, 1), null);
  });

  storageSuite.skip(
    "should return the same after stringification, quickcheck",
    () => {
      fc.assert(
        fc.property(fc.anything(), (a) => {
          let storage = new storageConstructor();
          storage.set(0, 0, a);

          const stringifiedStorage = storage.compress();
          assert.type(stringifiedStorage, "string");
          const newStorage = storage.decompress(stringifiedStorage);

          assert.equal(newStorage.get(0, 0), a);
          assert.not.instance(storage, newStorage);
        })
      );
    }
  );

  storageSuite("should pass quickceck", () => {
    const allCommands = [
      fc
        .tuple(fc.integer(), fc.integer())
        .map((tuple) => new GetCommand(tuple[0], tuple[1])),
      fc
        .tuple(fc.integer(), fc.integer(), fc.integer())
        .map((tuple) => new SetCommand(tuple[0], tuple[1], tuple[2])),
      fc.anything().map(() => new StringifyCommand()),
    ];

    fc.assert(
      fc.property(fc.commands(allCommands), (cmds) => {
        const s = () => ({
          model: new SimpleNumberStorage(),
          real: new storageConstructor(),
        });
        fc.modelRun(s, cmds);
      })
    );
  });

  storageSuite.run();
}

type Model = {};

class SetCommand<T extends NumberStorage> implements fc.Command<Model, T> {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly insertValue: number
  ) {}

  check = () => true;

  run(m: SimpleNumberStorage, r: T): void {
    r.set(this.x, this.y, this.insertValue);
    m.set(this.x, this.y, this.insertValue);
  }

  toString = () =>
    `set(${this.x},${this.y},${JSON.stringify(this.insertValue)})`;
}

class GetCommand<T extends NumberStorage> implements fc.Command<Model, T> {
  constructor(readonly x: number, readonly y: number) {}

  check = () => true;

  run(m: SimpleNumberStorage, r: T): void {
    const outputValue = r.get(this.x, this.y);
    if (outputValue !== null) {
      assert.type(outputValue, "number");
    }
    const modelOutputValue = m.get(this.x, this.y);
    assert.equal(outputValue, modelOutputValue);
  }

  toString = () => `get(${this.x},${this.y})`;
}
class StringifyCommand implements fc.Command<Model, CompressibleNumberStorage> {
  constructor() {}

  check = () => true;

  run(m: SimpleNumberStorage, r: CompressibleNumberStorage): void {
    const afterCompression = r.decompress(r.compress());

    assert.equal(typeof r, typeof afterCompression, "typeof check");
    assert.equal(
      r.constructor.name,
      afterCompression.constructor.name,
      "constructor name check"
    );

    r = afterCompression;
  }
  toString = () => `compress`;
}
