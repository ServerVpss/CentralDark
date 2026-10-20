# CentralDark Micro Deploy por PASS comprovado

Regra canônica operacional:

`QUALQUER_PASS_COMPROVADO → MICRO_DEPLOY_DO_ESCOPO_AFETADO → HEALTH/PROVA_RUNTIME → RECEIPT → NEXT_TIK_TAK`

## O que conta como PASS

- Health real retornando 200 no runtime medido.
- Socket/serviço vivo quando o escopo declarado é socket/serviço.
- Systemd/PM2 ativo com owner conhecido quando o escopo declarado é processo supervisionado.
- Receipt local ou GitHub com timestamp, rota, head e resultado.

## O que não conta como PASS

- Badge visual isolado.
- `action_required`.
- PR aberto sem promoção.
- Source alterado sem runtime medido.
- UNKNOWN.

## Cadeado

Micro-deploy é por escopo afetado. Falha em rota separada, como `:8099`, não bloqueia rotas independentes já provadas, mas também não vira verde.

## Padrão oficial — CENTRALDARK LIVE EDITING FABRIC

O modo normal da CentralDark é editar, colocar vivo, medir, refinar, comprimir e repetir até ponto fixo.

- humano: `CENTRALDARK-LIVE-EDITING-FABRIC.md`
- máquina: `CENTRALDARK-LIVE-EDITING-FABRIC.json`
- binding: `CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- skill: `.agents/skills/centraldark-live-editing-fabric/SKILL.md`
- hook: `scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh`

Regra: `MVP_FAST_LOOP` é padrão de trabalho. CI profundo é prensa/contraprova prolongada quando o CHEFE mandar, não freio padrão para colocar delta vivo.

## Fallback oficial — MAIN-PINNED RUNTIME FAST-PATH

Quando o deploy canônico estiver `FAIL` ou `BLOCKED` antes da promoção, usar a receita já provada:

- humano: `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md`
- máquina: `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json`
- binding: `MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml`
- skill: `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`
- hook: `scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh`

Regra: mesmo SHA da main, owner exato, fileset causal, teste aplicável, restart isolado, health/prova runtime e receipt #1562.

## Cockpit — leitura e gates do microdeploy

Owner de interface: `apps/instinto-superior/src/components/central/SistemaCentralDark.tsx`.
Fonte viva existente: `apps/instinto-superior/src/lib/cockpit.functions.ts`.
Executor canônico **inalterado**: `scripts/micro_deploy.sh`.

O painel expõe o ciclo `MEDIR → COMPARAR → APLICAR DELTA → TESTAR → CONTRAPROVA → SELAR`,
reutiliza o botão `Remedir` e mostra a origem e o tempo da evidência (STALE após 90s).
`mainSha === vpsSha` prova igualdade de código, **não** deploy; campo deploy fica
`UNKNOWN` enquanto não houver recibo do mesmo SHA, health e efeito no runtime.
`/api/microdeploy/receipts/index.json` acessível prova somente a leitura do índice,
não a integridade dos recibos.

Worktrees, runners, disco C: e autorização operacional permanecem `UNKNOWN/BLOCKED`
até haver sonda autenticada e evidência própria. `DEPLOY_ALLOWED=false` é fail-closed:
nenhum botão dispara comandos, não existe backend novo ou memória paralela.
Só conectar um adaptador de escrita mediante aprovação explícita, owner, testes do
mesmo SHA, rollback verificável e recibo de efeito.


## MCP PID ao vivo no HUD autenticado — 2026-10-18T15:23:05.506Z

- @code_ref: apps/instinto-superior/src/lib/cockpit.functions.ts#lerMcpRuntimeAoVivo;
  apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx#GavetaForja;
  apps/instinto-superior/scripts/verify-hud-zone.mjs.
- @last_updated: 2026-10-18T15:23:05.506Z
- Fonte exclusiva dos PIDs: MCP existente GET /heartbeat, campo
  operational.executionTopology de apps/modulos/mcp/src/operational-telemetry.js.
  Sem tabela, coletor ou rota paralelos.
- Supabase existente: autenticação por requireSupabaseAuth e role admin antes
  da leitura server-side. Nenhuma escrita ou PID persiste no Supabase.
  agent_events e module_health_status não são fontes de PID atual.
- Consulta do HUD a cada 10 segundos. PID exibido somente com assinatura
  mcp-centraldark, schema centraldark.execution-topology.v1, runtime.pid válido
  e amostra de até 30 segundos. Indisponibilidade ou expiração = UNKNOWN,
  com PID antigo oculto.
- PID presente não demonstra conexão TCP, ferramenta executada ou navegador
  na Casa. Atividade MCP provada separadamente por mcpActivity.
- Provas: npm run verify:hud + npm run build:vps validam fonte; para
  RUNTIME exigir implantação, serviço HTTP autenticado e readback do SHA.
  Git main != deployed.

## 🪬 2026-10-20 — Máquina de estados Casa: sensores independentes e pulso amarelo

@code_ref=apps/instinto-superior/src/components/central/StatusPanel.tsx
@code_ref=apps/instinto-superior/src/lib/cockpit.functions.ts
@last_updated=2026-10-20T05:53:31Z
@owner=Instinto Superior / CentralDark Live Editing Fabric
@estado=CASA_LOCAL_SOURCE_MODIFIED_MAIN_AND_VPS_NOT_SYNCHRONIZED

- Intenção: preservar os cards existentes, completar a máquina de estados e fazer **todas as luzes amarelas pulsarem**, com `motion-reduce:animate-none`. Estado amarelo continua UNKNOWN/RUNNING/AUTH_REQUIRED, sem falso PASS.
- Screenpipe Casa: `GET :3030/health` retornou HTTP 200 com `status=degraded`, `frame_status=ok`, `audio_status=stale` e `capture_status=audio_stalled`. Portanto **vídeo/OCR observado como OK**, **captura de áudio Screenpipe em alerta**. Esse resultado **não reprova** o microfone Jarvis via `getUserMedia` no navegador.
- Jarvis: somente o evento já existente `centraldark:jarvis:audio` pode atestar MediaStream ativo **nesta sessão do navegador**. Sem evento atual → UNKNOWN. Sem nova gravação de áudio.
- Tailscale: consulta local `tailscale status --json` sob CLI já instalado, sem gravar stdout, IPs, tokens ou chaves; `BackendState=Running`, `Self.Online=true` e peer `centraldark-os Online=true` na medição inicial. Prova apenas a malha; não implica deploy VPS.
- Os demais cards reutilizam `lerEstadoCentralDark`: Casa, GitHub main, VPS SHA, API, Heartbeat, Omni Router, Grafo Vivo, Receipts e Desktop Commander. O Desktop Commander segue UNKNOWN no **site** sem adapter autenticado, mesmo que um conector externo responda nesta conversa.
- `git diff --check`: PASS. Testes Tool Call Lens existentes: 3/3 PASS. `tsc` global aponta dezenas de erros fora dos owners desta costura; gate `verify-hud-zone.mjs` também tem falhas, portanto **BUILD/FIXED_POINT NÃO SELADOS**.
- `localhost:8080/cockpit`: HTTP 200 depois do delta; Edge headless leu o DOM real com Tailscale, Vídeo/OCR, Áudio, Jarvis e Desktop Commander, incluindo peer Tailscale online e áudio em alerta. Renderização DOM comprovada; clique/contraprova visual E2E ainda pendente. `K:\` e suas outras alterações locais permanecem preservados.
- NEXT_CURSOR: `CASA_STATUS_CARDS_E2E → GATES_DO_CONE → RECEIPT_COM_SHA → PR_MAIN_APROVADO → VPS_DEPOIS`. Não promover main ou VPS até revisão e contraprova. Sem reset, sem duplicar HUD/sensor ou reiniciar o Jarvis.
