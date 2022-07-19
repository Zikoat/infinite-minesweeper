class SimpleNumberStorage implements NumberStorage{
    set(x: number, y: number, value: unknown): void {
        if (this.data[x] !== undefined) this.data[x]![y] = value;
        else {
          this.data[x] = {};
          this.data[x]![y] = value;
        }
      }
      get(x: number, y: number):number|null {
        const number = 
        return this.data[x]?.[y] ?? null;
      }
      private data: DOKFormat = {};
      

}
type DOKFormat= Record<number, Record<number, unknown>>