import { Field } from "./Field";
import { Chunk } from "./Chunk";
import { plainToInstance } from "class-transformer";
import { SimpleCellData } from "./CellData";
import { SimpleNumberStorage } from "./SimpleNumberStorage";

export class FieldPersistence {
  constructor(public localStorage: Storage) {}

  save(field: Field, id: string) {
    const compressedField = this.compress(field);

    this.localStorage.setItem(id, compressedField);

    // this.getLocalStorageSize();
    return;
  }
  load(id: string): Field | undefined {
    const compressedField = this.localStorage.getItem(id);
    if (compressedField === null) return undefined;
    const recoveredField = JSON.parse(compressedField);
    if (
      recoveredField &&
      typeof recoveredField === "object" &&
      "cellData" in recoveredField &&
      recoveredField.cellData &&
      typeof recoveredField.cellData === "object" &&
      "numberStorage" in recoveredField.cellData
    ) {
      const field = this.decompress(
        recoveredField as { cellData: { numberStorage: unknown } },
      );
      return field;
    } else {
      return undefined;
    }
  }

  compress(field: Field) {
    const stringifiedField = JSON.stringify(field, (key, value) => {
      if (key === "_events" || key === "localStorage") return undefined;
      else return value;
    });
    // FieldStorage.logStats(field, stringifiedField);

    return stringifiedField;
  }

  saveChunk(chunk: Chunk, id: string) {
    this.localStorage.setItem(
      id + chunk.x + ";" + chunk.y,
      JSON.stringify(chunk),
    );
  }
  decompress(recoveredField: { cellData: { numberStorage: unknown } }): Field {
    const field = plainToInstance(Field, recoveredField as Field);
    field.cellData = plainToInstance(SimpleCellData, recoveredField.cellData);
    field.cellData.numberStorage = plainToInstance(
      SimpleNumberStorage,
      recoveredField.cellData.numberStorage,
    );
    return field;
  }
  logStats(field: Field, string: string) {
    const cellsCount = field.getAll().length;
    const compressedByteCount = unescape(encodeURI(string)).length;
    const ratio = compressedByteCount / cellsCount;
    console.log(
      `saved ${compressedByteCount} bytes with a compression ratio of ${ratio.toPrecision(
        5,
      )} bytes/cell`,
    );
    console.log(string);
  }

  getLocalStorageSize() {
    let _lsTotal = 0,
      _xLen,
      _x;

    // todo: loop through for i this.localStorage.key(i), until undefined, instead of using in which is internal.
    for (_x in this.localStorage) {
      if (!Object.prototype.hasOwnProperty.call(this.localStorage, _x)) {
        continue;
      }
      _xLen = (this.localStorage.getItem(_x)?.length ?? 0 + _x.length) * 2;
      _lsTotal += _xLen;
      // console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB");
    }
    console.log(
      "Local storage size used: " + (_lsTotal / 1024).toFixed(2) + " KB",
    );
  }
}
