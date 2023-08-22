import * as fc from "fast-check";
import { SimpleNumberStorage } from "./SimpleNumberStorage";
import { describe, expect, it } from "vitest";
import { assert } from "./assert";

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

describe.each([{ storage: SimpleNumberStorage }, { storage: COO }])(
  "$storage",
  ({
    storage: storageConstructor,
  }: {
    storage: { new (): CompressibleNumberStorage };
  }) => {
    it("should get a setted value", () => {
      const storage = new storageConstructor();
      storage.set(0, 0, 1);
      const returnedValue = storage.get(0, 0);

      expect(returnedValue).toBe(storage.get(0, 0));
    });

    it("should return null if we get something that hasn't been set", () => {
      const storage = new storageConstructor();

      expect(storage.get(0, 0)).toBe(null);
    });

    it("should work with negative numbers", () => {
      const storage = new storageConstructor();
      storage.set(-1, -1, 1);

      expect(storage.get(-1, -1)).toBe(1);
    });

    it("should return the same after stringification", () => {
      const storage = new storageConstructor();
      storage.set(0, 0, 1);
      storage.set(0, 1, 0);
      storage.set(1, 1, 1);
      // storage.set(1, 1, null);

      const stringifiedStorage = storage.compress();
      assert(typeof stringifiedStorage === "string");
      const newStorage = storage.decompress(stringifiedStorage);

      assert(newStorage.get(0, 0) === 1);
      assert(newStorage.get(0, 1) === 0);
      assert(newStorage.get(0, 2) === null);
      // assert.equal(newStorage.get(1, 1), null);
    });

    // storageSuite.skip(
    //   "should return the same after stringification, quickcheck",
    //   () => {
    //     fc.assert(
    //       fc.property(fc.integer(), (a) => {
    //         let storage = new storageConstructor();
    //         storage.set(0, 0, a);

    //         const stringifiedStorage = storage.compress();
    //         assert.type(stringifiedStorage, "string");
    //         const newStorage = storage.decompress(stringifiedStorage);

    //         assert.equal(newStorage.get(0, 0), a);
    //         assert.not.instance(storage, newStorage);
    //       })
    //     );
    //   }
    // );

    it("should pass quickceck", () => {
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
        }),
      );
    });
  },
);

type Model = object;

class SetCommand<T extends NumberStorage> implements fc.Command<Model, T> {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly insertValue: number,
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
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  check = () => true;

  run(m: SimpleNumberStorage, r: T): void {
    const outputValue = r.get(this.x, this.y);
    if (outputValue !== null) {
      assert(typeof outputValue === "number");
    }
    const modelOutputValue = m.get(this.x, this.y);
    assert(outputValue === modelOutputValue);
  }

  toString = () => `get(${this.x},${this.y})`;
}
class StringifyCommand implements fc.Command<Model, CompressibleNumberStorage> {
  constructor() {}

  check = () => true;

  run(_m: SimpleNumberStorage, r: CompressibleNumberStorage): void {
    const afterCompression = r.decompress(r.compress());

    assert(typeof r === typeof afterCompression, "typeof check");
    assert(
      r.constructor.name === afterCompression.constructor.name,
      "constructor name check",
    );

    r = afterCompression;
  }
  toString = () => `compress`;
}
