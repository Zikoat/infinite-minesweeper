import Field from "./Field";
import Cell from "./Cell";
import { Chunk, CHUNK_SIZE } from "./Chunk";
import { LocalStorage } from "node-localstorage";

export default class FieldStorage {
  public localStorage: LocalStorage;

  constructor(localStorage: LocalStorage) {
    this.localStorage = localStorage;
  }

  save(field: Field, id: string) {
    // saves a Field
    const compressedField = this.compress(field);
    this.localStorage.setItem(id, compressedField);
    const chunks = field.chunksToSave.slice(0);
    chunks.forEach((chunk: any) => {
      this.saveChunk(chunk, field.fieldName);
    });
    field.chunksToSave = [];
  }
  load(id: string) {
    // returns a Field
    const compressedField = this.localStorage.getItem(id);
    if (compressedField === null)
      throw new Error(`Could not find field with id '${id}' in localStorage`);
    const field = this.decompress(compressedField, id);
    return field;
  }

  compress(field: Field) {
    // returns JSON string;
    const stringifiedField = JSON.stringify(field);
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
  decompress(compressedField: string, fieldName: string) {
    // when stringifying, we have changed the class into an object, and we
    // need to recreate the class from the data
    let recoveredField = JSON.parse(compressedField);
    let field = new Field(
      recoveredField.probability,
      recoveredField.safeRadius,
      this,
      fieldName
    );
    // Object.assign(field, recoveredField);
    field.score = recoveredField.score;
    if (recoveredField.pristine)
      throw new Error("trying to load pristine field. create a new instead");
    field.pristine = false;
    // field.probability = recoveredField.prhobability;
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
}
