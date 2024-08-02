import { defineConfig } from "vite";

export default defineConfig({
  base: "/infinite-minesweeper/",
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      crypto: "src/empty.ts",
    },
  },
});
