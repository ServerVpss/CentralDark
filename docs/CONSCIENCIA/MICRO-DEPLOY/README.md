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
