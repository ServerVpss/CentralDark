// #OBSERVACOES#
// @owner scripts/remote-bridge/ui/vite.config.mjs
// @doc_ref scripts/remote-bridge/CORPO-UNICO-CAPACIDADES.md
// @last_updated 2026-11-09T02:07:32Z
// @implementado raiz fisica para build Vite via junction F:\CentralDark Remote Bridge
// @estado SOURCE_READY_BUILD_PENDING
// @next_cursor validar npm run build no caminho externo e no caminho canonico
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: realpathSync(fileURLToPath(new URL(".", import.meta.url))),
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
