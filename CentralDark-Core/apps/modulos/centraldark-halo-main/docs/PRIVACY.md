# Privacy

CentralDark Halo is local-only by architecture.

## What lifecycle data is consumed

Halo watches Codex Desktop's append-only local session files and recognizes only
the `task_started` and `task_complete` record types. It does not parse, retain,
transmit, or log prompt text, tool names/input, source code, responses,
commands, file paths, session content, API keys, tokens, or environment
variables.

## What Halo reads

The running app watches the local Codex session directory and its optional
manual-state bridge:

```text
~/.codex/sessions/  and  ~/.codex-halo/state.json
```

The session watcher consumes complete JSONL records only and checks their
top-level lifecycle type without parsing payload objects. The optional state
bridge remains for Demo Mode and diagnostics.

## What Halo writes

The app writes settings and bounded operational logs to its platform application
data directory. Settings contain only `enabled`, `theme`, and `startAtLogin`.
Logs include version/platform, state transitions, watcher errors, and lifecycle
messages. They do not include session payloads or user content. A 1 MiB startup
rotation keeps at most the current and previous log.

The installer stores its safe legacy-cleanup manager under `~/.codex-halo`. It
does not add a current hook; it removes only marked Halo entries left by older
releases.

## Network

The application has no networking dependency, port listener, server, remote
API, account, analytics, crash reporter, or update downloader. Its CSP permits
only packaged application resources and Tauri IPC.

## Audit pointers

- `src-tauri/src/watcher.rs` — local lifecycle and state reads
- `src-tauri/src/logging.rs` — bounded log output
- `src-tauri/Cargo.toml` and `package.json` — complete runtime dependencies
- `scripts/*/Manage-*Hooks*` — scoped legacy cleanup behavior

<!-- CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->
## Escopo novo versus Halo histórico (14/11/2026)

As declarações de operação sem rede acima referem-se ao Halo visual histórico. O fonte em desenvolvimento do Agente Remoto acrescentou autenticação Supabase e pareamento MCP; portanto não é correto qualificá-lo como exclusivamente local.

- O login React utiliza o Supabase configurado em public/centraldark-auth-public.json; apenas a publishable key fica no frontend. Nunca persistir senha nem service-role key.
- A sessão protegida é de responsabilidade do cofre Windows DPAPI em src-tauri/src/session_vault.rs, restrito à janela agent-control. O navegador DEV e overlays não recebem acesso ao cofre.
- O pareamento é separado do login. A autorização do dispositivo e de cada sessão/ferramenta remota deve ser explícita e verificável. O instalador e o UAC não autorizam controle remoto por si.
- Nenhuma credencial, código de aprovação ou token deve aparecer em logs, URLs de documentação, screenshots ou pacote publicado.
- Segurança de armazenamento, políticas, tráfego real e rollback do binário nativo ainda dependem de testes. Não declarar auditoria completa até evidência.

**NEXT_CURSOR:** verificar DPAPI após reiniciar, saída, revogação, sanitização de logs e comunicações autorizadas no app compilado.
<!-- /CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->


<!-- CENTRALDARK_NATIVE_WINDOW_20261114 -->
### Isolamento da janela customizada — 14/11/2026

A moldura React não concede permissões de suporte remoto. Controles de janela ficam restritos a agent-control via capability separada; overlays não recebem APIs de movimentação ou ocultação. X só oculta a UI na bandeja, sem autenticar ou iniciar operação.

Status de Tailscale expõe somente estado e hostname local; MCP /health expõe disponibilidade e número anunciado de ferramentas. Nenhum JWT, código de aprovação ou resposta bruta é exibido no painel. O botão Cockpit abre apenas o destino fixo.

Login, cofre Windows DPAPI, pareamento autorizado, ação remota e elevação por UAC continuam gates separados. Motor remoto false não é PASS. Revogação, renovação de sessão e aprovação real após reiniciar ainda exigem prova.

NEXT_CURSOR: contraprova de sessão, revogação e consentimento antes de distribuir a clientes.
<!-- /CENTRALDARK_NATIVE_WINDOW_20261114 -->


<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Arvore proposta e privacidade v0.1.9
LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_CANONICAL=docs/INSTALLATION.md
O TARGET separa config, session, pairing, logs, receipts, cache
e state sob LocalAppData por perfil Windows. DPAPI atual usa
arquivos na raiz de AgenteRemoto e nao foi migrado. Nunca copiar
blobs DPAPI entre usuarios nem armazenar segredos em Roaming,
cache, recibos, logs ou Program Files. ACL, revogacao, backup,
retencao, rollback e purge seguem sem contraprova de release.
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
