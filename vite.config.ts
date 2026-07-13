import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Aliases em ordem: os mais específicos primeiro (Vite casa por prefixo).
// "@/shared/*" e "@/preview/cockpit-hero" são pontes de compatibilidade
// para os 175+ imports antigos, apontando para os novos caminhos em PT-BR.
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: [
      { find: /^@\/shared\/ui(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado/interface") + "$1" },
      { find: /^@\/shared\/hooks(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado/comportamentos") + "$1" },
      { find: /^@\/shared\/lib(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado/utilitarios") + "$1" },
      { find: /^@\/shared(\/.*)?$/, replacement: path.resolve(__dirname, "./src/compartilhado") + "$1" },
      { find: /^@\/preview\/cockpit-hero(\/.*)?$/, replacement: path.resolve(__dirname, "./src/admin/cockpit") + "$1" },
      { find: /^@\/apps\/web(\/.*)?$/, replacement: path.resolve(__dirname, "./src/paginas/portal-publico") + "$1" },
      { find: /^@\/apps\/modulos\/telepainel(\/.*)?$/, replacement: path.resolve(__dirname, "./src/funcionalidades/telepainel") + "$1" },
      { find: /^@\/apps\/modulos\/hermes-panel(\/.*)?$/, replacement: path.resolve(__dirname, "./src/funcionalidades/hermes") + "$1" },
      { find: /^@\/apps\/modulos\/bot-whatsapp(\/.*)?$/, replacement: path.resolve(__dirname, "./src/funcionalidades/bot-whatsapp") + "$1" },
      { find: /^@\/apps\/modulos\/crm(\/.*)?$/, replacement: path.resolve(__dirname, "./src/funcionalidades/crm") + "$1" },
      { find: /^@\/apps\/modulos\/financeiro(\/.*)?$/, replacement: path.resolve(__dirname, "./src/funcionalidades/financeiro") + "$1" },
      { find: /^@\/lib\/notifications-events$/, replacement: path.resolve(__dirname, "./src/compartilhado/servicos/notifications-events") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
}));
