import { FieldPersistence } from "src/FieldPersistence";

declare global {
  interface Window {
    // field: any;
    // bot: any;
    // renderer: any;
    FieldStorage: FieldPersistence;
    toggleMenu: () => void;
    restart: () => void;
    toggleFullscreen: () => void;
    fieldName: string;
  }
}
