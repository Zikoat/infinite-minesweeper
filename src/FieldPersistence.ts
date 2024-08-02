import { Field } from "./Field";
import { plainToInstance } from "class-transformer";
import { SimpleCellData } from "./CellData";
import { SimpleNumberStorage } from "./SimpleNumberStorage";

export class FieldPersistence {
  public constructor(public localStorage: Storage) {}

  public save(field: Field, id: string) {
    const compressedField = this.compress(field);

    this.localStorage.setItem(id, compressedField);

    return;
  }

  public load(id: string): Field | undefined {
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

  private compress(field: Field) {
    const stringifiedField = JSON.stringify(field, (key, value) => {
      if (key === "_events" || key === "localStorage") return undefined;
      else return value;
    });

    return stringifiedField;
  }

  private decompress(recoveredField: {
    cellData: { numberStorage: unknown };
  }): Field {
    const field = plainToInstance(Field, recoveredField as Field);
    field.cellData = plainToInstance(SimpleCellData, recoveredField.cellData);
    field.cellData.numberStorage = plainToInstance(
      SimpleNumberStorage,
      recoveredField.cellData.numberStorage,
    );
    return field;
  }
}
