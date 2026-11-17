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
        editorialStr8: resolve(import.meta.dirname, "works/dergi-kitap/str8/index.html"),
        editorialEspas: resolve(import.meta.dirname, "works/dergi-kitap/espas/index.html"),
        editorialMegalofobi: resolve(import.meta.dirname, "works/dergi-kitap/megalofobi/index.html"),
        editorialAltmısUc: resolve(import.meta.dirname, "works/dergi-kitap/altmis-uc/index.html"),
        poster: resolve(import.meta.dirname, "works/afis/index.html"),
        character: resolve(import.meta.dirname, "works/karakter/index.html"),
        logo: resolve(import.meta.dirname, "works/logofolyo/index.html"),
        internship: resolve(import.meta.dirname, "works/stajlarim/index.html"),
        internshipProcess: resolve(import.meta.dirname, "works/stajlarim/surec/index.html"),
        internshipBook: resolve(import.meta.dirname, "works/stajlarim/kitap-tasarimi/index.html"),
        web: resolve(import.meta.dirname, "works/web-tasarim/index.html"),
      },
    },
  },
});
