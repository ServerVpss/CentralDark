import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Aliases em ordem: os mais específicos primeiro (Vite casa por prefixo).
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: [
      { find: /^@\/compartilhado\/ui(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado/interface") + "$1" },
      { find: /^@\/compartilhado\/hooks(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado/comportamentos") + "$1" },
      { find: /^@\/compartilhado\/lib(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado/utilitarios") + "$1" },
      { find: /^@\/preview\/cockpit-hero(\/.*)?$/, replacement: path.resolve(__dirname, "./src/admin/cockpit") + "$1" },
      { find: "@/funcionalidades/hermes-panel", replacement: path.resolve(__dirname, "./src/funcionalidades/hermes") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
}));

