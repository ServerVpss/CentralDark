# 2026-09-02 — Desktop App Architecture & Runtime Learnings

## Bolt Electron App (CentralDark Desktop)
- **Localização**: `apps/modulos/Bolt/source/`
- **electron-builder.yml**: `appId: com.centraldark.desktop`, `productName: CentralDark`
- **Targets**: Windows (NSIS), macOS (DMG), Linux (AppImage/deb)
- **Publish**: GitHub Releases (ServerVpss/CentralDark, private)
- **Entry point**: `build/electron/main/index.mjs`
- **Portas expostas**: 8080 (gateway), 8787 (desktop), 8099 (omni), 3030 (screenpipe)

## Overclock.exe History
- Múltiplos relatórios (2026-07-19 a 2026-07-24): "Removido overclock.exe (binário Windows) da raiz da VPS"
- Referência em `MVP-MAPA-VIVO-CENTRALDARK.md`: `/overclock-skill → mecânica multiagente inspirada em panes`
- Binário antigo removido/substituído — não existe mais no repo atual

## Arquitetura: Desktop App vs Agent Runtime
- **Desktop App (Bolt/CentralDark)**: roda **só no PC do usuário** como processo Electron nativo
- **Agente (Hermes/Pivete)**: roda **no ambiente Hermes** (container/venv separado)
- **Comunicação**: via rede local (localhost) — HTTP/WebSocket/MCP tools
- **Não precisam estar "no mesmo lugar"** — processos independentes que se comunicam

## CLI Tools Status (2026-09-02)
| Tool | Status | Version/Path |
|------|--------|--------------|
| `claude` | ✅ INSTALADO | 2.1.251 — `/c/Users/danda/AppData/Roaming/npm/claude` |
| `codex` | ❌ NÃO INSTALADO | — |
| `gemini` | ❌ NÃO INSTALADO | — |
| `opencode` | ❌ NÃO INSTALADO | — |

**Para usar Codex como motor**: precisa instalar (`npm i -g @openai/codex` ou installer oficial) + `codex auth login`

## Cron Jobs Structure (Root Level)
- **Localização**: `E:\CentralDark\Pivete\cron\jobs.json`
- **Perfil**: não é per-profile — é global do Hermes instance
- **Problemas comuns**:
  1. Scripts ausentes (`system-breathing.sh`, `CollectTelemetry.ps1`, `prs-open-commits-cycle.sh`, `cadeia-free-watchdog.py`, `webui-watchdog.py`)
  2. Config drift: provider/model alterados globalmente → `RuntimeError: Skipped to prevent unintended spend`
  3. Erros de conexão (health check scripts falhando)
- **Jobs ativos**: 12 jobs, maioria com `last_status: "error"`

## Verificação Prática
```bash
# Verificar build do Bolt
cd E:/CentralDark/Pivete/CentralDark/apps/modulos/Bolt/source
pnpm electron:build  # ou similar

# Verificar releases no GitHub
gh release list -R ServerVpss/CentralDark

# Verificar cron jobs
cat E:/CentralDark/Pivete/cron/jobs.json | jq '.jobs[] | {id, name, last_status, last_error}'
```