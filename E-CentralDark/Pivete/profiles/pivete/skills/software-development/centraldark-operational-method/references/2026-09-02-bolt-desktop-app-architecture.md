# Bolt Desktop App & Site Builder — Owner Canônico Único

## Contexto
Sessão 2026-09-02: Usuário perguntou "onde cria meus sites", verificou se Bolt é o motor.

## Descoberta Medida

### Bolt = Único Owner de Criar Sites
| Item | Status |
|------|--------|
| **Localização** | `apps/modulos/Bolt/` |
| **Tipo** | Electron + Vite + Remix (fork `bolt.diy` stackblitz-labs) |
| **Desktop App** | `electron-builder.yml` → NSIS (Win), DMG (Mac), AppImage (Linux) |
| **Web** | Docker → `builder.centralldark.com` (porta 5174→5173) |
| **Integração Hermes** | ❌ **NÃO EXISTE** (README.md confirma) |
| **Workspace por projeto** | ❌ **NÃO EXISTE** — `WORK_DIR` global, todo chat divide `/home/project` |
| **Build .exe** | ❌ **NÃO GERADO** — sem `node_modules`, sem `dist/`, sem artifact no GitHub Releases |

### Outro Motor? — NENHUM
Busca no repo não encontrou outro motor de criar sites. Bolt é o owner canônico único.

### Overclock.exe — História
- Múltiplos relatórios (2026-07-19 a 2026-07-24): "Removido overclock.exe (binário Windows) da raiz da VPS"
- Referência: `MVP-MAPA-VIVO-CENTRALDARK.md` → `/overclock-skill → mecânica multiagente inspirada em panes`
- Binário antigo removido/substituído — **não existe mais no repo atual**

## Separação Clara: Desktop App vs Agent Runtime

| | Desktop App (Bolt/CentralDark) | Agent Runtime (Hermes/Pivete) |
|---|---|---|
| **Onde roda** | PC do usuário (processo Electron nativo) | Ambiente Hermes (container/venv) |
| **Comunicação** | localhost HTTP/WebSocket/MCP | — |
| **Portas** | 8080, 8787, 8099, 3030 | — |
| **Precisam estar "juntos"?** | **NÃO** — processos independentes |

## CLI Tools Status (2026-09-02)

| Tool | Status | Version/Path |
|------|--------|--------------|
| `claude` | ✅ INSTALADO | 2.1.251 — `/c/Users/danda/AppData/Roaming/npm/claude` |
| `codex` | ❌ NÃO INSTALADO | `npm i -g @openai/codex` + `codex auth login` |
| `gemini` | ❌ NÃO INSTALADO | — |
| `opencode` | ❌ NÃO INSTALADO | — |

## CentralDark Status HTML — NÃO É PAINEL REAL
Arquivo `😈CentralDark Status😈.html` = **save do ChatGPT** (url `chatgpt.com/c/6a6a5c8a...`).
Contém conversa sobre "GitHub conectado 🔴", "BOT_AICENTRALDARK ⚪", etc.
**NÃO USA COMO FONTE DE VERDADE.** É histórico de chat, não runtime.

## Ação Mínima Para Ter Sites Funcionando
1. **Patch `.gitignore`** (Windows patterns) → PR #1381
2. **Build Bolt `.exe`** (NSIS): `pnpm install && pnpm electron:build` → `dist/CentralDark Setup*.exe`
3. **Commit no PR #1381** via RANDOLF

## Princípios Aplicados
- **ONE_SYSTEM_ONLY**: Bolt é o único motor — não criar paralelo
- **REUSE_BEFORE_CREATE**: Estender Bolt, não criar V2
- **LOCAL_REALITY = JUDGE**: Medido `electron-builder.yml`, README, `casa_boot.py`, status HTML
- **DOCUMENTED ≠ EXECUTED**: HTML salvo ≠ painel real; README diz "não validado"