import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: "index.html",
        painel: "pages/index.html",
        portal: "portal.html",
      },
    },
  },
});
