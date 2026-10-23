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

## Política atual — CI leve e SSH sob demanda (23/10/2026)

Lei canônica: `docs/CONSCIENCIA/03-FLUXO-DEPLOY.md`, seção `CI proporcional e microdeploy leve via MCP/SSH`; contrato consumível: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`.

No modo normal, executar somente teste aplicável ao owner. CodeQL completo, Trigger Fabric Full Package e Run All estão configurados como acionamento manual; mudanças críticas de segurança continuam exigindo gates pertinentes. O controle é do MCP CentralDark. O destino é microdeploy via SSH autenticado, com build na VPS, SHA exato, backup, health, receipt e rollback. **O SSH deploy não está comprovado em runtime**: o workflow hosted SSH existente apenas acorda o runner; não o executar como deploy. O runner não é excluído apagando arquivo do GitHub.

## Contraprova do transporte SSH leve — 2026-10-23

- Fonte: commit `9dc4750d70f4c9a244e034bb1281383cebec71bf` na `main`; entrada manual existente reaproveitada em `.github/workflows/vps-ssh-exec.yml`.
- Configuração: YAML parse e `bash -n` do corpo `run` = PASS pela rota MCP CentralDark (sem publicar secrets).
- Run GitHub `39912949599`: `workflow_dispatch` aceito, `completed/failure`, `runner_id=0`, `steps=[]`. Anotação do GitHub: job não iniciou por pagamentos recentes falhos ou limite de gastos da conta. **Nenhum SSH remoto foi executado nesse run**.
- VPS: serviço `ssh` observado `active`; isso é prova do daemon, **não** do login via GitHub. Tentativa separada de `--dry-run` nativo via MCP foi bloqueada pela segurança da ferramenta; nenhum teste de promoção passou.
- Cadastro de runners do GitHub relido depois da remoção feita pelo CHEFE: apenas `centraldark-vps-1` e `centraldark-casa-1`. Não executar nova exclusão.
- `SSH_TRANSPORT_PASS=UNKNOWN`, `DEPLOY_PASS=UNKNOWN`, `PRODUCTION_MUTATION=NONE`.
- NEXT_CURSOR: recuperar habilitação de GitHub-hosted billing **ou** executar pela rota direta autorizada do MCP CentralDark, sem runner duplicado; realizar `probe` e `dry_run` reais antes de permitir `apply`.

## Controle administrativo do microdeploy SSH — 2026-10-23

- Capacidade versionada: `admin_ssh_microdeploy` integrada ao catálogo MCP CentralDark pela coleção já existente `githubTools`; modos `status`, `probe`, `dry_run`. A promoção real por `apply` não é liberada nessa entrada de baixa fricção; continua sujeita ao fluxo explícito do workflow SSH.
- Sessão: `admin` + OAuth/Hub verificado + ator/correlation ID permitem reutilização de autorização no dispatcher `mcp_admin_call`. Já existe lógica desse contrato em `src/lib/admin-guard.js`; atualizou-se `mcp-policy.js` para não anunciar confirmações desnecessárias. Chamada legada sem proveniência verificada continua exigindo confirmação. Auditoria e proibição de aprovações sintetizadas por agentes permanecem.
- Runners: a consulta GitHub de 23/10/2026 listou somente `centraldark-vps-1` online e `centraldark-casa-1` offline. `vps-2/vps-3/vps-4` não estavam mais cadastrados. Não inferir remoção de instalação local nem atribuir essa exclusão a commit.
- SSH: workflow `.github/workflows/vps-ssh-exec.yml` publicado no SHA `9dc4750d70f4c9a244e034bb1281383cebec71bf`. O disparo `probe` do run `39912949599` foi bloqueado **antes de entrar no runner** por cobrança/limite GitHub-hosted (`runner_id=0`, `steps=[]`); YAML e bash syntax PASS; daemon SSH VPS ativo; SSH fim a fim e deploy real seguem `UNKNOWN`.
- Estado: `ADMIN_TOOL_COMMITTED_NOT_DEPLOYED`; `SSH_LIVE_PROOF=UNKNOWN`; `PRODUCTION_MUTATION=NONE`.
- Contraprova de permissão (23/10/2026): chamada `mcp_admin_call(tool=execute_command)` com comando não mutante, sessão atual e **sem confirmAdmin** retornou `CONFIRMACAO_ADMIN_NECESSARIA` e `executionStatus=blocked`; nada foi executado. Assim, o runtime **ainda não** provou a reutilização de sessão administrativa. Catálogo vivo `mcp_admin_catalog(filter=admin_ssh_microdeploy)` retornou zero tools, `totalRuntimeTools=141`. Releitura da `main` e `node --check` de `github-tools.js`, `mcp-policy.js` e `admin-ssh-microdeploy.test.mjs` concluídas sem erro sintático. Os testes funcionais do novo módulo foram versionados, mas não executados contra runtime novo; `TEST_SUITE_RUN=UNKNOWN`.
- Divergência: fonte `main` com contrato de sessão OAuth/Hub já implementado versus instância carregada anterior. A causa precisa de readback autenticado do endpoint `/admin/mcp` e rollout causal; **não** se corrige removendo `adminAuthorized`, audit ou a exigência de proveniência verificada. Prompts de conexão/consentimento da plataforma externa ficam fora do código MCP.

- NEXT_CURSOR: testes de schema e permissão no commit exato; promover MCP com método canônico sem reset de checkout com drift; medir catálogo real pelo `mcp_admin_catalog(filter=admin_ssh_microdeploy)`; validar `status/probe` depois de resolver bloqueio financeiro ou medir transporte pela rota direta autorizada. Não declarar LIVE apenas por commit.

## Rota MCP sem runner hospedado (23/10/2026)

O workflow `.github/workflows/vps-ssh-exec.yml` está inerte por decisão do CHEFE, sem runner GitHub-hosted pago. O caminho de execução é o **MCP CentralDark nativo na VPS** pela tool `centraldark_deploy_micro_fallback` e pelo script existente `scripts/vps/main-pinned-microdeploy.sh`; `main` fornece apenas SHA e recibo versionado. `admin_ssh_microdeploy` fica como alias ADMIN de leitura/planejamento e não dispara Actions nem executa por conta própria uma ferramenta destrutiva. SSH privado da Casa é opcional. Teste real de deploy permanece pendente e as regras de autorização/auditoria da plataforma permanecem vigentes.

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
