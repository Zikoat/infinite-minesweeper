interface NumberStorage {
  set(x: number, y: number, value: number): void;
  /** returns previously set value  */
  get(x: number, y: number): number | null;
}
