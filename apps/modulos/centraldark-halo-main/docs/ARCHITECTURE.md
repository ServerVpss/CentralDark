# CentralDark Halo architecture

## Data flow

```text
Codex Desktop session JSONL
        │ task_started / task_complete record type only
        ▼
macOS FSEvents / Windows ReadDirectoryChangesW through notify
        ▼
Rust validation + state machine + timeout worker
        │ halo-state / halo-theme Tauri events
        ▼
React component + composited CSS edge animation
```

There is no process-to-process network channel. The app binds no port and has
no WebSocket, HTTP server, database, cloud component, updater, or telemetry.

## State machine

| Lifecycle record | State | Timeout |
|---|---|---:|
| `task_started` | `working` | 30 minutes |
| `task_complete` | `completed` | 2 seconds |
| timeout / disabled / quit | `idle` | hidden |

`StateFile::validate` rejects unknown states, unknown JSON fields, stale
timestamps, and timestamps too far in the future. The watcher ignores duplicate
or older revisions. A single timeout worker receives replacement deadlines, so
bursts of tool events do not create sleeping-thread buildup.

## Window model

Halo creates one `overlay-N` window per available monitor, sorted by display
position for stable labels. Each state transition synchronizes the window set,
refits every overlay to its monitor's physical position and dimensions, and
removes stale windows after a display is disconnected. Each overlay is:

- transparent and undecorated;
- always on top and visible on all workspaces;
- non-focusable and never explicitly focused;
- excluded from the taskbar/Dock;
- configured to ignore cursor events.

Idle hides every overlay. Non-idle rendering uses four narrow edge elements (or
one top bar for Minimal). Animations primarily change transforms and opacity.
Tauri's single-instance plugin is registered first, so a repeated app launch
cannot create duplicate status icons or watcher processes.

## Persistence

- State bridge: `~/.codex-halo/state.json`
- Optional manual-state bridge and legacy cleanup manager: `~/.codex-halo/`
- macOS settings/logs: `~/Library/Application Support/CentralDark Halo/`
- Windows settings/logs: `%LOCALAPPDATA%\CentralDark Halo\`

Settings use temporary-file, flush, and rename semantics. Corrupt settings
recover to defaults. Logs rotate at 1 MiB and retain one previous file.

## Installer safety

Halo does not add a section to Codex's active `~/.codex/config.toml`. Install:

1. detects old Halo begin/end markers and otherwise leaves the current
   configuration byte-for-byte intact;
2. creates a timestamped backup;
3. removes only that marked legacy section;
4. writes atomically only when legacy cleanup is needed.

Legacy cleanup never restores an old backup, so hooks added after an old Halo
install are preserved. An incomplete or duplicated marker stops modification
safely.

## Source layout

```text
src/                 React overlay, effects, themes, Tauri event hook
src-tauri/src/       window, tray, watcher, settings, logs, state machine
hooks/               legacy lifecycle adapters
scripts/macos/       install, verify, uninstall, state test, legacy manager
scripts/windows/     equivalent PowerShell tools
scripts/release/     self-contained macOS/Windows ZIP builders
demo/                README hero source
tests/fixtures/      hook merge preservation fixture
```

## Quality gates

`pnpm check` runs ESLint, TypeScript, and the Vite production build. Rust gates
are `cargo fmt --check`, Clippy with warnings denied, and unit tests. CI repeats
these gates and builds macOS Universal plus Windows x64 packages.


## CentralDark Halo visual parity (07/11/2026)
The existing React CentralOverlay keeps the transparent, non-focusable,
click-through overlay and adds the decorative window, central logo, and status
caption of demo/hero.html. The Cyber Blue edge flow and state timings match the
original Hero. Minimal remains a top bar. The native executable requires rebuild
and visual counterproof. Legacy Codex provider data paths remain compatible.

<!-- CENTRALDARK_HALO_PTBR_CUA_20261114 -->
## Integra??o com CentralDark: PT-BR e cursor virtual

O projeto mant?m Tauri 2/Rust + React. Menus, notifica??es e mensagens de interface s?o traduzidos para PT-BR; os IDs/estados internos permanecem originais para preservar compatibilidade e a configura??o da vers?o 0.1.8. O Halo visualiza bordas e observa eventos via `src-tauri/src/watcher.rs`, sem reinstalar hooks legados.

O submenu `Mouse virtual (Cua)` no `src-tauri/src/tray.rs` delega reconhecimento da tela 3 e de todas as telas ao `.agents/skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use/scripts/blink_cursor.py` existente, com `--mode blink --blink-speed fast`. Reutiliza o atuador `cua-driver` e o overlay Hermes Visual, n?o gera outro mouse. Bloqueia concorr?ncia e exige estado Halo `idle` antes do reconhecimento. Descobre o reposit?rio por `CENTRALDARK_ROOT`, ancestrais do execut?vel e fallback Casa `F:\CentralDark`; `CENTRALDARK_PYTHON_EXE` seleciona o Python do Hermes quando necess?rio.

Prova anterior: 3 ciclos do hook pr?prio, transi??es `working/completed/idle` e compara??o de tela de 501/5400 pixels alterados. N?o confundir isso com build novo: s? instalar ap?s cargo fmt/check/test, build Tauri Windows, SHA, readback e valida??o visual do usu?rio.
<!-- /CENTRALDARK_HALO_PTBR_CUA_20261114 -->

<!-- CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->
## CentralDark Agente Remoto — migração em andamento (14/11/2026)

**Arquitetura-alvo:** um aplicativo de suporte remoto consentido, com interface React e runtime Tauri 2/Rust. Reaproveitar a interface Bridge existente e os efeitos Halo. Uma entrada index.html; não criar Bridge.html, segundo aplicativo, segundo executor ou iframe. O produto Halo 0.1.8 anterior permanece como referência/rollback, não como build novo.

- Frontend único: src/App.tsx -> RemoteAgentLogin.tsx -> BridgePanel.jsx (interface reaproveitada). Vite entrega o mesmo index.html em / e /Bridge.html; após login, a transição ocorre no React e deve normalizar para /.
- Halo existente: CentralOverlay, janela agent-control, janelas overlay-* transparentes, watcher e estados visuais continuam no mesmo Tauri.
- Backend: src-tauri/src/session_vault.rs implementa cofre DPAPI no usuário Windows e comandos de pareamento na janela agent-control. Compilação e abertura nativa em DEV comprovadas em 14/11/2026; recuperação do cofre após reinício e E2E de controle remoto permanecem pendentes.
- Serviço externo já existente: scripts/remote-bridge/canonical/CentralDark-Casa-Agent.mjs em F:/CentralDark; status em 127.0.0.1:9101/health. Não duplicar o executor no Halo. Nenhuma ferramenta remota é liberada por simples login ou instalação.
- Segurança: escolha do escopo de instalação e UAC, autenticação Supabase, pareamento autorizado e permissão efetiva para operação remota são quatro gates distintos. Não elevar privilégios silenciosamente.

**DEV visual:** npm run dev serve React com HMR em 127.0.0.1:1420. O comando npm run tauri -- dev integra Vite com o WebView nativo, recompilando Rust quando muda a fonte. Não iniciar duas instâncias Vite na mesma porta. O navegador em modo DEV não tem acesso ao cofre DPAPI Tauri.

**Instalador-alvo:** bundle.windows.nsis.installMode=both oferece escolha usuário atual/todos. A documentação do Tauri confirma que esse modo exige UAC mesmo quando o usuário escolhe instalação individual. Configuração não equivale a instalador criado.

**CURRENT (DEV provado):** React/TypeScript/Vite compilados; Rust/Tauri compilado e executado na Casa (centraldark-halo-lite.exe, PID observado 28904). Janela agent-control exibiu BridgePanel, bandeja e 4 overlays Halo registrados no log; terminal de compilação oculto, Vite :1420 preservado. Acesso remoto E2E, instalador NSIS novo e persistência da sessão após reiniciar = PENDENTES.

**NEXT_CURSOR:** validar recuperação/renovação DPAPI após reiniciar, consentimento, heartbeat e operação de leitura autorizada; depois testar NSIS com rollback. Não confundir DEV compilado com release instalada.
<!-- /CENTRALDARK_REMOTE_AGENT_DEV_20261114 -->


<!-- CENTRALDARK_NATIVE_WINDOW_20261114 -->
### Delta 14/11/2026 — moldura nativa do Bridge no mesmo Halo

- Owner: src-tauri/src/lib.rs, show_agent_control(). A mesma janela agent-control usa decorations(false) e resizable(true). CloseRequested existente continua ocultando a janela na bandeja sem encerrar o processo.
- React: src/App.tsx e src/App.css adicionam barra escura, arraste, minimizar, maximizar/restaurar, ocultar e redimensionar. BridgePanel.jsx existente continua como painel depois do login e index.html segue único.
- Permissões: src-tauri/capabilities/agent-control-window.json restringe APIs de janela ao label agent-control. Os quatro overlays Halo mantêm código e escopo próprios.
- Conexões: session_vault.rs preserva login Supabase, DPAPI, pair/start, autorização e heartbeat; adiciona status filtrado do Tailscale e da rota pública /health do MCP Cloudflare. open_cockpit_in_browser chama apenas URL fixa por clique e abre o navegador padrão.
- Separar as provas: Tailscale Running, MCP HTTP disponível e Casa Agent saudável NÃO provam engine_connected, pareamento concluído nem acesso remoto autorizado. Iniciar Bridge continua bloqueado até existir motor nativo com prova; não lançar Electron ou outro executor automaticamente.

PROVA: Tauri DEV compilado, maximizar/restaurar/minimizar/ocultar na bandeja PASS por UIAutomation; processo manteve-se ativo, quatro overlays e bandeja registrados nos logs. npm run lint e npm run build PASS. Antigo Bridge Electron intacto.

NEXT_CURSOR: teste DPAPI após reinício, aprovação do dispositivo, heartbeat e tools/list autenticado; implementar start remoto nativo sem duplicação e testar antes de release.
<!-- /CENTRALDARK_NATIVE_WINDOW_20261114 -->


<!-- CENTRALDARK_CLIENT_UI_RESPONSIVE_20261114 -->
### UI para cliente final — 14/11/2026 (Bahia)

**Identidade unificada:** CENTRALDARK / Agente Remoto na moldura e no cabeçalho do painel React existente. Rótulos internos Bridge, Rust, Tauri, MCP e DPAPI não devem aparecer como nomes de produto ou detalhes desnecessários para o cliente; nomes técnicos de arquivos, owners e logs permanecem inalterados.

Delta mínimo nos mesmos owners:
- src/App.tsx e src/App.css: retirado selo RUST / TAURI da moldura, preservando botões nativos e bandeja.
- src/components/BridgePanel.jsx: Remote Bridge -> Agente Remoto; Iniciar Bridge -> Iniciar atendimento; Abrir Cockpit -> Abrir painel; textos simplificados. Comandos e permissões subjacentes preservados. Confirmação de pareamento não se repete em segundo banner depois de PAIRED_VERIFIED; pendências/erros continuam visíveis.
- src/components/BridgePanel.css: layout responsivo pela largura real do WebView (container remote-window), com 3/2/1 colunas, cartões sem encolhimento, títulos legíveis, cabeçalho acessível e rolagem interna. src/components/RemoteAgentLogin.css adapta formulário à altura útil.
- src/components/RemoteAgentLogin.tsx: fallback e descrição da sessão com linguagem compreensível sem alterar cofre DPAPI.

**Contraprova:** janela real em largura estreita; primeira leitura revelou cartão principal comprimido e o CSS foi corrigido com flex-shrink: 0. Nova captura confirmou título, controles e cartões legíveis com rolagem. UIAutomation encontrou nomes novos e não encontrou nomes antigos na janela. O Tauri, Vite, conexões, overlays e Electron original foram preservados.

**Kaizen:** em painéis dentro de janela Tauri, não basta mudar grid: filhos flex precisam impedir encolhimento e a rolagem deve permanecer dentro da área de conteúdo. Evitar mensagens técnicas ou status duplicados na UI pública.

**NEXT_CURSOR:** validar o painel após reinício com sessão protegida real, concluir ações remotas autorizadas, gerar Release e testar instalador com rollback. Nenhuma promoção de DEV para produção por este delta.
<!-- /CENTRALDARK_CLIENT_UI_RESPONSIVE_20261114 -->

<!-- CENTRALDARK_DESKTOP_COMMANDER_FORK_NATIVE_PORT_20261115 -->
### Agente Remoto — origem do motor Desktop Commander e plano de port nativo

LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
OWNER=centraldark-halo-main / src-tauri/src/lib.rs + src-tauri/src/session_vault.rs
SOURCE_FORK=https://github.com/ServerVpss/DesktopCommanderMCP
SOURCE_UPSTREAM=https://github.com/wonderwhy-er/DesktopCommanderMCP
SOURCE_SHA=bce370e9395f5bc74eda34913e5ae1dee48df8f8
SOURCE_VERSION=0.3.3
SOURCE_LICENSE=MIT (manter avisos e atribuicao em qualquer codigo derivado)
CURRENT_CASA_ADAPTER=source_remote_bridge/src/agent/CentralDark-Casa-Agent.mjs
CURRENT_CASA_ENGINE_PIN=@wonderwhy-er/desktop-commander@0.2.48
FORK_CREATED=PASS
FORK_PARENT_AND_SHA_READBACK=PASS
RUST_NATIVE_MCP_PORT=NOT_IMPLEMENTED
NATIVE_EXE_PACKAGING=NOT_PROVEN

INTENCAO: distribuir um unico aplicativo de suporte remoto consentido,
com a UI React no Tauri e o unico motor de ferramentas embutido no
processo Rust, sem Electron, console adicional ou segundo executor.

CONTRAPROVA REAL: o fork ServerVpss/DesktopCommanderMCP foi criado
na main e tem parent wonderwhy-er/DesktopCommanderMCP; o HEAD de
ambos na consulta e igual. O agente Casa existente respondeu
127.0.0.1:9101/health com HTTP 200, mas engine_connected=false.
Isto nao confirma tools/list nem operacao do fork; a versao da Casa e
0.2.48 e NAO deve ser alterada para 0.3.3 sem compatibilidade.

REUSE_BEFORE_CREATE: usar o fork como fonte legal e tecnica para o
port, mas o runtime Tauri ja existente (lib.rs, session_vault.rs e
tray.rs) permanece o unico owner do novo aplicativo. O codigo
TypeScript/Node nao vira Rust por copiar o repositorio: identificar
a API realmente consumida e portar incrementalmente os contratos
de tools/list, tools/call, filesystem, process, edit e permissoes.
Nao criar modulo executor paralelo nem anunciar motor nativo enquanto
o despacho Rust e o E2E nao existirem. O Casa Agent antigo fica
preservado como referencia funcional; migracao para o runtime nativo
deve substituir, nunca duplicar, o atendimento por sessao.

TRAVAS: somente janela agent-control, sessao Supabase renovada,
pareamento de dispositivo verificado, consentimento explicito para
a sessao de suporte e autorizacao separada de cada operacao sensivel.
Sem acesso remoto automatico por login, sem UAC silencioso, sem
segredos em logs, sem porta publica adicional e sem mudar a
politica de writes antes da contraprova. O fork nao foi executado.

PROVA FUTURA: equivalencia dos schemas MCP do fork contra o
adaptador Casa, testes Rust deterministas de cada tool, teste
negativo para usuario nao autorizado, tools/list/initialization,
tools/call somente autorizado, cancelamento/revogacao, parada da
sessao e readback de logs sem secrets. Depois validar cargo fmt,
clippy/test, release Windows, instalacao NSIS, um processo
executavel com motor incorporado, overlays e bandeja no mesmo app.
O executor CUA de cursor visual e distinto do MCP Desktop Commander;
exit=2 do helper CUA segue incidente separado, sem falso PASS.

NEXT_CURSOR: selecionar o primeiro contrato MCP read-only
a portar dentro do owner Rust existente, validar testes e fluxo
autorizado; so entao habilitar o botao Iniciar atendimento.
Sem commit/push da CentralDark ou tag v0.1.9 nesta etapa.
<!-- /CENTRALDARK_DESKTOP_COMMANDER_FORK_NATIVE_PORT_20261115 -->

<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Ownership da arvore Windows alvo v0.1.9
TREE_LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_CANONICAL=docs/INSTALLATION.md
Contrato unico: as pastas e migração detalhadas pertencem a
INSTALLATION.md, sem manter uma segunda arvore. CURRENT: lib.rs
mantem tray e overlays; session_vault.rs grava DPAPI na raiz
AgenteRemoto; settings.rs, logging.rs e platform/mod.rs continuam
usando pastas legadas Halo. TARGET: mesmo exe com motor MCP Rust,
LocalAppData organizado por usuario e NSIS em dois modos.
MOTOR_NATIVE=NOT_IMPLEMENTED PATH_MIGRATION=NOT_IMPLEMENTED.
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
