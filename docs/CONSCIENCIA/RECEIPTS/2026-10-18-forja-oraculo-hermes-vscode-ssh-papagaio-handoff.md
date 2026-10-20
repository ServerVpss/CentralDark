---
title: "Forja + Sol + Oráculo — HUD Papagaio / Hermes remoto via SSH"
date: 2026-10-18
state: "SOURCE_PATCHED; INSTALL_CONNECT_E2E_PENDING"
authority: "CHEFE / SEGREDO"
owner_task: ".vscode/tasks.json"
owner_oracle: ".agents/skills/software-development/centraldark-oracle-surface/SKILL.md"
owner_ui: "apps/instinto-superior"
owner_backend: "apps/modulos"
baseline_main_at_start: "791bafe6199540c2a3aa4f9d532ade8c57669b54"
preserve_dirty_vps: true
---

# 🪬 FORJA / ORÁCULO / SOL: roteiro de ciclo único

## 1. Intenção recebida (CHEFE)

Harness CentralDark é o **produto, cockpit e superfície canônica**.
Chrome/ZENDRIVE e o UI Electron/AionUi são cascas/projeções, não uma segunda
arquitetura. Operar com Work/ChatGPT, Hermes Desktop, VS Code SSH, MCP e
GitHub como rotas e capacidades, reutilizando os programas externos já
instalados e autorizados. Claude Desktop, ChatGPT Desktop/Work, Gemini,
Telegram/Gram e demais cascas não se tornam o mesmo processo físico
automaticamente: integração deve usar APIs, IPC, CLI, links ou webviews
autorizadas com prova específica por surface. **Não copiar, clonar ou reempacotar
binários proprietários para simular uma capacidade não concedida.**

O fluxo desejado é:
`CHEFE → ChatGPT/Work (oráculo/forja) → Envelope/GOAL → HERMES executa no owner
→ MCP/audit-logger/log-funnel → HUD Papagaio → readback humano e CHAT_GLOBAL`.

**Lei fixa:** `CONSTRUIR → INSTALAR → CONECTAR → TESTAR → CONTRAPROVAR → REGISTRAR`.
Trabalho reversível em paralelo, escrita por owner. Evitar nova arquitetura.
ChatGPT em browser não concede execução contínua entre mensagens: sessões
Work conectadas/agents autorizados e automações agendadas são serviços
distintos, com seus próprios vínculos de autorização.

## 2. Erro reproduzido visualmente pelo CHEFE

No VS Code com indicador inferior `SSH: Segredo-VPS` (pasta CentralDark raiz),
os terminais `CentralDark Hermes Vivo: 01 FILOSOFIA`,
`02 ENGENHARIA`, `03 CONTRAPROVA`, `04 SINTESE` tentaram chamar
`powershell.exe` e receberam `Path to shell executable ... does not exist`.
A causa está em **12 comandos Windows hardcoded** no mesmo
`.vscode/tasks.json` da main, e `ABRIR 4 TERMINAIS` tinha
`runOn=folderOpen`, causando tentativa automática no Linux.

### Delta mínimo em owner existente

- 4 tarefas Hermes Vivo ganham override `linux.command=bash` e
  `linux.args=-lc` com o **mesmo Hermes** `hermes chat --cli --source vscode-orq-...`.
- 8 tarefas Windows-only em Linux passam a erro explícito `exit 64`.
  Elas não viram falsos Linux CLI por alteração do rótulo.
- Windows continua usando `powershell.exe` e as receitas originais.
- Removido `runOn=folderOpen` do agregador, mantendo lançamento manual.
- Validador local sem dependencies: `node scripts/vscode/verify-hermes-task-shells.mjs`;
  não abre terminais, não envia mensagem ao Hermes e não usa tokens.
- Skill canônica `centraldark-oracle-surface` elevada à 0.5.5 com roteamento
  e limites reais de Work/ChatGPT, IPC, SSH, MCP e continuidade por envelope.

### Prova e instalação independentes

| Fase | Cursor/contraprova | Estado na criação do PR |
|---|---|---|
| Construir | JSON válido, 12 overrides, 4 comandos Bash, Windows intacto | **SOURCE_PATCHED** |
| Testar fonte | `node scripts/vscode/verify-hermes-task-shells.mjs` no checkout atualizado | **PENDING_ON_TARGET** |
| Instalar | Aplicar delta ao **workspace SSH correto**, respeitando VPS dirty e writers existentes | **PENDING** |
| Conectar | VS Code Remote SSH e `command -v hermes` no host Linux real | **PENDING** |
| Testar runtime | Executar UM terminal Hermes e observar PID/CLI/result/exit; somente depois 4 | **PENDING** |
| Contraprova | Revisar logs por mesmo GOAL/CID, autorização e ausência de regressão do Windows | **PENDING** |
| Registrar | Receipts correspondentes em HUD Papagaio / PR + NEXT_CURSOR | **ESTE RECIBO** |

**Não fazer** `git reset --hard`, `clean`, rebase/fast-forward automático da
VPS suja, reiniciar o AionUi em rebuild, copiar segredo nem enviar feedback
falso ao browser. O autor/rebuild atual deve concluir e reconciliar o
`tasks.json` sem sobrescrever mudanças alheias.

## 3. Routes reais medidas por conectores (2026-10-18 07:55 UTC)

| Rota | Evidência atual | Síntese HUD |
|---|---|---|
| MCP CentralDark | `ok=true`, `runtimeTools=141`, `routeCount=13`, auditStartupReady | **MCP_DISPATCHER_OK** |
| Repo VPS | branch `main`, HEAD `fb7a00a60`; modificações em AionUi, status/hud, scripts log + arquivos não rastreados | **VPS_WORKTREE_DIRTY** |
| GitHub main | HEAD `791bafe` no momento; deploy status relatou VPS 66 commits atrás | **HEAD_DIVERGED** |
| Deploy / PM2 | deploy status `ERRO`, parser PM2 JSON falhando | **DEPLOY_STATUS_ERROR** |
| Funil logs | `status=OK`, 3 fontes rastreadas, ingest periódico | **LOG_FUNNEL_OK** |
| Desktop Commander | dois perfis/processos locais encontrados na VPS; dispositivos SEGREDO e CENTRALDARK-OS reportados offline pelo cliente | **PROCESS_FOUND_NOT_REMOTE_ACCESS_PROVEN** |
| Tailscale OAuth Broker | `fetch failed` | **ROUTE_BROKEN** |
| Screenpipe VPS | HTTP 404 em raiz da porta 3030; owner não atribuído | **UNKNOWN_SENSOR** |
| Elite HTTP | PM2 indisponível e HTTP falhando | **BLOCKED_RUNTIME_PROBE** |
| Browser tool do ChatGPT | `Browser access requires the originating browser context` | **SURFACE_ORIGIN_REQUIRED** |

Estas são medições de escopo limitado, não o estado universal de todas as
interfaces do Cockpit. Precisamos preservar os três fatos distintos:
`MCP_DISPATCHER_OK != DEVICE_ONLINE != FULL_E2E`.

## 4. Owners existentes (nenhum duplicado)

- `apps/instinto-superior/src/components/central/CockpitShell.tsx` —
  casco do produto e abas; `ObservabilidadeCentralDark.tsx` — placa.
- `docs/HUD/HUD.html` — fonte legada/espelho de HUD, sem segundo app.
- `apps/modulos/mcp/src/audit-logger.js`, `log-funnel.js`,
  `admin.js` — auditoria, SSE, Lens.
- `apps/modulos/HERMES-CORE/core/perception-orchestra.mjs` —
  percepção paralela, Hermes como executor.
- `.agents/skills/software-development/centraldark-oracle-surface/SKILL.md` —
  regra Hermes↔ChatGPT Oracle, preserva `LOOP_ID, TURN_ID, NEXT_CURSOR, RECEIPT_ID`.
- `scripts/trigger-fabric/oracle_evidence_hook.py` —
  evidência/correlação com oráculo.
- `experiments/aionui-centraldark-instinto-superior/apply-overlay.py` —
  overlay de branding, sem alterar upstream ou reiniciar antes do build.
- `.vscode/tasks.json` — localização das tasks Windows/Linux no SSH.

## 5. Delegação/Caixas que o Cockpit deve mostrar

`FORJA_READONLY`: GitHub, VPS status, HTTP e logs independentes em paralelo;
`HERMES_VIVO`: processo real com PID/exit, owner/correlation;
`ORACULO_WORK`: sessão cliente só se vinculada/ativa;
`TOOL_CALL_LENS`: eventos sanitizados do MCP sem copiar stdout/credenciais;
`DREAM_REVIEWER`: replay local dos recibos existentes, sem reexecutar tarefas;
`HUD_PAPAGAIO`: fonte, timestamp, modo ao vivo/pausado, estado e next cursor.

**CHECKPOINT:** uma rodada completa precisa provar `GOAL → Hermes shell Linux
→ event do audit/log funnel → UI Cockpit/HUD → devolutiva`. Um screenshot
de processo ou um commit isolado não comprova automaticamente as outras fases.

**RELEASE_LOCK:** PR Draft para review. Não fazer merge/deploy automático;
não confundir alteração no GitHub com instalação na VPS/VS Code.

**NEXT_CURSOR:** Work/autor local reconcilia branch vs VPS dirty e seu rebuild;
executa o verificador Node no workspace real; testa um único Hermes Vivo SSH;
correlaciona tool call no MCP e HUD; registra o mesmo GOAL em PR #1838 (HUD)
sem alterar o owner do outro writer; só então escalona as 4 funções.
