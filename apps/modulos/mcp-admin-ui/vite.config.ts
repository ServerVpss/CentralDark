import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/admin/api": { target: "https://mcp.centralldark.com", changeOrigin: true, secure: true },
      "/admin/login": { target: "https://mcp.centralldark.com", changeOrigin: true, secure: true },
      "/admin/logout": { target: "https://mcp.centralldark.com", changeOrigin: true, secure: true },
      "/tools.json": { target: "https://mcp.centralldark.com", changeOrigin: true, secure: true },
      "/health": { target: "https://mcp.centralldark.com", changeOrigin: true, secure: true },
    },
  },
  build: {
    outDir: "dist",
  },
});
