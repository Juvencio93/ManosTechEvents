import { defineConfig } from "vite";

// base: '/ManosTechEvents/' is used for production builds (GitHub Pages sub-path).
// During local development the base stays at '/' so the dev server is reachable at
// http://localhost:5173/ without any extra path prefix.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ManosTechEvents/" : "/",
  build: {
    rollupOptions: {
      input: {
        app: "index.html",
        painel: "pages/index.html",
        portal: "portal.html",
      },
    },
  },
}));
