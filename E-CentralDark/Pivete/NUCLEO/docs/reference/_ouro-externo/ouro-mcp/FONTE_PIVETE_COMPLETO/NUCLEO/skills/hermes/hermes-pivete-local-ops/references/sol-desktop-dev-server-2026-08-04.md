# SOL Desktop POC — Dev Server Verification (04/08/2026)

## Contexto
- **Local:** `E:/CentralDark/Sol/sol-desktop-poc-source/apps/sol-desktop/`
- **Stack:** Tauri v2 + React 19 + TypeScript + Vite
- **Dev server:** `npm run dev` → **porta 1420** (não 5173), `http://localhost:1420`
- **App nativo:** `npm run tauri dev` (precisa Rust, Tauri CLI, WebView2, VS Build Tools)
- **Config nativo:** `tauri.conf.json` já tem `alwaysOnTop: true`, `decorations: false`

## Verificação Real (esta sessão)
```bash
cd "E:/CentralDark/Sol/sol-desktop-poc-source/apps/sol-desktop" && npm run dev
```
**Resultado:**
```
VITE v6.4.3  ready in 1497 ms
➜  Local:   http://localhost:1420/
```
**PID:** 56732 (background, notify_on_complete=true)

## Próximos Passos para App Nativo
1. Instalar Rust: `winget install Rustlang.Rust.GNU` ou rustup
2. Instalar WebView2: `winget install Microsoft.EdgeWebView2Runtime`
3. Instalar VS Build Tools: `winget install Microsoft.VisualStudio.2022.BuildTools`
4. `npm run tauri dev` — compila backend Rust + frontend Vite + abre janela nativa

## Integração Hermes (já mapeada em §23)
- MCP `hermes-studio-mcp.mjs` → Web UI 8648
- API Server Hermes (precisa `API_SERVER_KEY` + restart gateway, R2)
- JSON compartilhado `C:\Shared\bridge\inbox.json`/`outbox.json` (R1)
- Claude Code CLI — ambos spawnam `claude -p "..."` (testado 26/07)

## Pitfalls
- **Porta 1420 fixa no `tauri.conf.json`** (`devUrl`) — não usar 5173
- **`npm run tauri dev` trava se Rust/WebView2/Build Tools faltando** — erro não óbvio
- **CSP no `tauri.conf.json`** permite `connect-src http://127.0.0.1:*` — gateway local acessível
- **Dev server Vite precisa ficar rodando** enquanto `tauri dev` compila o binário Rust