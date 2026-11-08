import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        brand: resolve(import.meta.dirname, "works/marka-kimligi/index.html"),
        uiux: resolve(import.meta.dirname, "works/ui-ux/index.html"),
        editorial: resolve(import.meta.dirname, "works/dergi-kitap/index.html"),
        poster: resolve(import.meta.dirname, "works/afis/index.html"),
        character: resolve(import.meta.dirname, "works/karakter/index.html"),
        logo: resolve(import.meta.dirname, "works/logofolyo/index.html"),
        internship: resolve(import.meta.dirname, "works/stajlarim/index.html"),
        web: resolve(import.meta.dirname, "works/web-tasarim/index.html"),
      },
    },
  },
});
