interface NumberStorage {
  set(x: number, y: number, value: number): void;
  get(x: number, y: number): number | null;
}
