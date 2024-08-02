export class SimpleNumberStorage implements NumberStorage {
  private data: DOKFormat = {};

  public set(x: number, y: number, value: number): void {
    if (this.data[x] !== undefined) this.data[x]![y] = value;
    else {
      this.data[x] = {};
      this.data[x]![y] = value;
    }
  }

  public get(x: number, y: number): number | null {
    return this.data[x]?.[y] ?? null;
  }

  public compress(): string {
    return JSON.stringify(this.data);
  }

  public decompress(input: string): SimpleNumberStorage {
    const instance = new SimpleNumberStorage();
    // todo use zod to parse
    instance.data = JSON.parse(input) as DOKFormat;
    return instance;
  }

  public getAll(): { x: number; y: number; value: number }[] {
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

type DOKFormat = Record<number, Record<number, number>>;
