import { defineConfig } from "vite";

export default defineConfig({
  base: "/infinite-minesweeper/",
  resolve: {
    alias: {
      crypto: "src/empty.ts",
    },
  },
});
