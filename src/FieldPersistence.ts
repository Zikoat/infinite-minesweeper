import { Field } from "./Field";
import { Cell } from "./Cell";
import { Chunk, CHUNK_SIZE } from "./Chunk";
// import { LocalStorage } from "node-localstorage";
import { plainToInstance } from "class-transformer";
import { SimpleCellData } from "./CellData";
import { SimpleNumberStorage } from "./SimpleNumberStorage";
import { LocalStorage } from "node-localstorage";

export class FieldPersistence {
  constructor(public localStorage: LocalStorage) {}

  save(field: Field, id: string) {
    const compressedField = this.compress(field);

    this.localStorage.setItem(id, compressedField);

    // this.getLocalStorageSize();
    return;
  }
  load(id: string): Field {
    // returns a Field
    const compressedField = this.localStorage.getItem(id);
    if (compressedField === null)
      throw new Error(`Could not find field with id '${id}' in localStorage`);
    const field = this.decompress(compressedField);
    return field;
  }

  compress(field: Field) {
    const stringifiedField = JSON.stringify(field, (key, value) => {
      if (key === "_events" || key === "localStorage") return undefined;
      else return value;
    });
    // FieldStorage.logStats(field, stringifiedField);

    return stringifiedField;
  }

  saveChunk(chunk: Chunk, id: any) {
    this.localStorage.setItem(
      id + chunk.x + ";" + chunk.y,
      JSON.stringify(chunk)
    );
  }
  loadChunk(id: string, x: number, y: number): Chunk | undefined {
    var chunk = new Chunk(x, y);
    const chunkFromLocalStorage = this.localStorage.getItem(
      id + chunk.x + ";" + chunk.y
    );
    if (chunkFromLocalStorage) {
      var data = JSON.parse(chunkFromLocalStorage);

      for (let i = 0; i < CHUNK_SIZE; i++) {
        for (let j = 0; j < CHUNK_SIZE; j++) {
          let cell = new Cell(x * CHUNK_SIZE + i, y * CHUNK_SIZE + j);

          let cellPointer = (i * CHUNK_SIZE + j) * 3;
          cell.isOpen = data.charAt(cellPointer) == true;
          const isMine = data.charAt(cellPointer + 1);
          cell.isMine =
            isMine == "2" ? undefined : isMine == "1" ? true : false;
          cell.isFlagged = data.charAt(cellPointer + 2) == true;
          chunk.cells[i][j] = cell;
        }
      }
      return chunk;
    }
    return undefined;
  }
  decompress(compressedField: string) {
    let recoveredField = JSON.parse(compressedField);
    let field = plainToInstance(Field, recoveredField as Field);
    field.cellData = plainToInstance(SimpleCellData, recoveredField.cellData);
    field.cellData.numberStorage = plainToInstance(
      SimpleNumberStorage,
      recoveredField.cellData.numberStorage
    );
    // field.fieldStorage = new FieldPersistence(this.localStorage);
    return field;
  }
  logStats(
    field: { getAll: () => { (): any; new (): any; length: any } },
    string: string
  ) {
    const cellsCount = field.getAll().length;
    const compressedByteCount = unescape(encodeURI(string)).length;
    const ratio = compressedByteCount / cellsCount;
    console.log(
      `saved ${compressedByteCount} bytes with a compression ratio of ${ratio.toPrecision(
        5
      )} bytes/cell`
    );
    console.log(string);
  }

  getLocalStorageSize() {
    var _lsTotal = 0,
      _xLen,
      _x;
    for (_x in this.localStorage) {
      if (!this.localStorage.hasOwnProperty(_x)) {
        continue;
      }
      _xLen = (this.localStorage[_x].length + _x.length) * 2;
      _lsTotal += _xLen;
      // console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB");
    }
    console.log(
      "Local storage size used: " + (_lsTotal / 1024).toFixed(2) + " KB"
    );
  }
}
