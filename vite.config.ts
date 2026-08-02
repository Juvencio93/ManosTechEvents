import { defineConfig } from "vite";
import { resolve } from "path";

const root = import.meta.dirname;

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        app: resolve(root, "index.html"),
        portal: resolve(root, "portal.html"),
        painel: resolve(root, "pages/index.html"),
        dashboard: resolve(root, "pages/dashboard.html"),
        eventos: resolve(root, "pages/eventos.html"),
        financeiro: resolve(root, "pages/financeiro.html"),
        funcionarios: resolve(root, "pages/funcionarios.html"),
        inicio: resolve(root, "pages/inicio.html"),
        relatorios: resolve(root, "pages/relatorios.html"),
        configuracao: resolve(root, "pages/configuracao.html"),
      },
    },
  },
});
