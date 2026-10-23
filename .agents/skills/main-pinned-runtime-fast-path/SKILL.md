---
name: main-pinned-runtime-fast-path
description: Mecanismo determinístico de microdeploy runtime da CentralDark. Use no Live Editing Fabric quando o CHEFE quiser ver delta vivo no runtime com SHA rastreável, owner exato, scratch único, teste mínimo, prova e receipt. Também serve como fallback quando o deploy canônico FAIL/BLOCKED.
metadata:
  type: operational
  version: "1.2"
  owner: SEGREDO/CHEFE
---

# MAIN-PINNED RUNTIME FAST-PATH

## Precedência GLOBAL obrigatória — prioridade 0

**ANTES DE QUALQUER FEITO:** consultar o owner e a receita preexistentes, o último receipt, a identidade causal `SOURCE_SHA + OWNER + FILESET + FINGERPRINT + EFEITO`, e só então reutilizar ou estender o script existente. Vale para JARVIS, Hermes, agentes, Hub, CLI, cockpit e consumidores MCP conectados. Se a receita pertinente faltar, procurar o owner; não presumir que não existe, nem inventar nova skill, agent ou gateway.

No dispatcher MCP, `canonicalRecipeFirstPreflight` deve ser executada antes dos handlers, com prioridade 0. Falha de receita no deploy bloqueia somente esse escopo; leitura de diagnóstico permanece aberta. Prova com fingerprint igual só se reaproveita se o resultado e o SHA/efeito também forem verificáveis. Ações de segurança continuam exigindo seus gates e consentimentos da plataforma.

A melhoria relatada do Hermes em `scripts/vps/hermes-self-evolution-current-model.sh` é evolução **do mesmo script**, com donor fixado, `.venv` e receipt por VPS; o commit local `2d3972c` ainda exige readback GitHub/PR, teste no alvo e validação runtime antes de receber PASS global.

## Quando usar

Use quando:
- a intenção for Live Editing Fabric: editar/refinar/publicar/ver vivo/repetir;
- ou deploy canônico estiver FAIL/BLOCKED;
- SOURCE_SHA ou delta rastreável for explícito;
- owner/fileset causal forem identificáveis;
- promoção isolada e rollback local forem possíveis.

Não é só emergência. É o caminho normal de microdeploy causal da CentralDark quando há escopo runtime pequeno e testável. O deploy canônico profundo continua como guarda, auditoria, esteira maior ou prensa quando o CHEFE mandar.

## Receita

```text
INTENT_DELTA
→ confirmar SOURCE_SHA/delta rastreável
→ LOCK
→ ASSERT_SCRATCH_REALPATH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ owner exato
→ fileset causal
→ teste aplicável
→ copiar/promover somente fileset causal
→ restart/reload somente owner se necessário
→ readiness
→ health + efeito runtime
→ receipt #1562 ou filho equivalente
→ reset/clean scratch
→ unlock
```

## Cadeados

```text
UNKNOWN != PASS
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
FALLBACK_PASS != PRIMARY_PIPELINE_FIXED
NO_FORCE_PUSH
NO_BLIND_PULL
NO_BLIND_RESET
NO_SECRET_LEAK
NO_FULL_RUNTIME_COPY_BY_DEFAULT
NO_UNRELATED_RESTART
RUNTIME_IS_NOT_SCRATCH
CASA_IS_NOT_SCRATCH
```

## Replay

Leia primeiro:
- `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json`
- `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml`
- `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- `.agents/skills/centraldark-live-editing-fabric/SKILL.md`

SAME_FINGERPRINT → REPLAY_BEFORE_REDISCOVERY.
CHANGED_FINGERPRINT → REVALIDATE_AFFECTED_CONE_ONLY.

## Reusar esta receita — CI leve, SSH, compilação e rollback (2026-10-23)

Não criar script, skill, MCP, writer ou recipe paralelos. O caminho normal é:
`MCP CentralDark → centraldark_deploy_micro_fallback → scripts/vps/main-pinned-microdeploy.sh na VPS → scratch única → build/teste → fileset owner → health + receipt + readback`. GitHub Actions nao participa. SSH Casa/Tailscale e transporte privado opcional.

Aplique a **mesma receita** antes de redescobrir: use os campos adicionados ao JSON/YAML existente (`build_on_vps` e `replay_improvements`) e ajuste apenas os bindings de SOURCE_SHA/OWNER/FILESET. O alias administrativo existente aceita CSV de ate 8 arquivos apenas como plano. A tool nativa `centraldark_deploy_micro_fallback` e unica entrada executora autorizada; o workflow hospedado foi desativado.

Melhorias materiais: `KEEP_ACTIVE` para scratch existente não registrado; realpath pré-reset; par `src/dist` para ferramentas MCP; tsc e teste da tool na scratch usando dependências já presentes, backup total antes da cópia, rollback armado antes da primeira mutação. `DRY_RUN` pode preparar/limpar **somente** scratch previamente verificada, nunca mudar produção.

**Prova:** build e commit não declaram ferramenta viva. Nova `admin_ssh_microdeploy` = `COMMITTED_NOT_DEPLOYED` até readback `mcp_admin_catalog`; probe SSH 39912949599 = `BLOCKED_BY_HOSTED_BILLING`, não login falho. Autorização OAuth/Hub admin comprovada reaproveita sessão no MCP, mas operação crítica continua auditada, autoMission não fabrica aprovação e controles externos não são alterados.

**NEXT_CURSOR:** testes da versão exata → deploy causal MCP permitido → catálogo runtime da ferramenta → health + receipt → memória no mesmo owner. Não clonar framework.

## 🧹 Forja Viva — limpeza com receipt e reutilização do scratch

**CHEFE_INTENT 2026-10-15:** vincular **🧹** à faxina de worktrees na máquina viva, usando **esta skill**, o `WORKTREE TEARDOWN` já existente na skill operacional e o checklist CURRENT do HUD. Não instalar outra faxina, monitor, runner ou segunda receita.

**Condição de invocação:** o emoji seleciona o owner e apresenta o status; **não dispara** `git reset`, `git clean`, `git worktree remove/prune` ou exclusão ao aparecer no chat/cockpit. A ação real exige identidade do executor, escopo, lock e classificação do alvo. Um scratch reutilizável por setor/escritor quando adequado; **não** impor `ONE_WORKTREE_ONLY` global, porque writers em escopos independentes devem permanecer isolados.

### Receita reproduzível de bancada

```text
#ACORDAR → !CALIBRAR → !CENTRALDARK
OWNER + CURRENT_SHA + WORKTREE_LIST + NEXT_CURSOR
→ WORKTREE_CLASSIFY {OWNER_ACTIVE|SCRATCH_SAFE|UNKNOWN}
→ INSPECT_REALPATH_AND_GIT_TOP + CHECK_LOCK_AND_PROCESS_OWNER
→ INVENTORY {TRACKED,UNTRACKED,STAGED,UNPUSHED_COMMITS,UNIQUE_DELTA}
→ EDIT_ONE_OWNER_AND_SCOPE → TEST_CI → COUNTERPROOF
→ SOURCE_RECEIPT_WITH_SHA_AND_FILESET
→ PUBLISH_TO_MAIN_ONLY_WITH_REQUIRED_GATES → MAIN_SHA_READBACK
→ BUILD/DEPLOY_OWNER_IF_APPLICABLE → RUNTIME_EFFECT_READBACK
→ CASA_VISUAL_READBACK_WHEN_CHEFE_REQUESTS_BUILD_VIEW
→ PROJECT_IN_EXISTING_DAILY_HUD_CHECKLIST (PASS/UNKNOWN/BLOCKED)
→ PROVE_DELTA_PRESERVED_AND_ALL_RECEIPTS_LINKED
→ CLEAN_ONLY_PROVED_DISPOSABLE_SCRATCH (same realpath+lock)
→ VERIFY_CLEAN_SCRATCH + RELEASE_LOCK → FIXED_POINT + NEXT_CURSOR
```

**Barreiras de faxina:** worktree com processo ativo, owner diverso, arquivo untracked não classificado, commit local não promovido, stash/delta único, SHA divergente, mudanças staged/unstaged, arquivo protegido, receipt não gravado, teste falhando ou estado `UNKNOWN` ⇒ `KEEP_ACTIVE`; **NÃO** limpar. Scratch vazio por si só não autoriza `git worktree remove`. `git worktree prune` é operação de metadados posterior à remoção comprovada, não procedimento genérico de higiene.

**Limites de sincronização:** `SOURCE_COMMITTED != MAIN_PROMOTED != DEPLOYED != UI_PROVEN`. Um CI verde e receipt não autorizam substituir trabalho local alheio; se a publicação na `main` conflitar, registrar e aguardar reconciliação no mesmo owner. Caso o CHEFE peça para **ver o build**, usar a Casa/VS Code já abertos, sem declarar imagem visual se não houve screenshot/readback real; quando não pedir, não inventar requisito de UI para descarte de scratch puramente documental. Teste visual só se aplica à capacidade com interface e ao runtime escolhido.

**Leitura medida nesta atualização (instantânea, não configuração):** Casa `K:\` = 33 alterações tracked e pelo menos 95 entradas untracked; VPS `<caminho-vps>` = 6 arquivos tracked modificados; VPS scratch `<caminho-vps>` = 0 entradas `git status --porcelain`. Portanto **CASA_MAIN=KEEP_ACTIVE**, **VPS_MAIN=KEEP_ACTIVE**, **VPS_SCRATCH=READONLY_SAFE_CANDIDATE**, não houve reset, prune, deploy nem exclusão.

**Checklist diário:** `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md` é histórico/proveniência; o **CURRENT** é a projeção existente do HUD, sem PR ou arquivo diário novo. Marcar concluído somente com source SHA, teste/contraprova, receipt e efeito aplicável; limpezas propostas mas não executadas ficam `PENDING`/ `UNKNOWN`. Se necessário, o receipt vive no owner já existente da missão.

## Finalização

Registrar SOURCE_SHA/delta, OWNER, FILESET_CAUSAL, testes, restart/reload se houve, health, efeito, rollback target, RESULT e NEXT_CURSOR no #1562 ou filho equivalente. Nunca registrar valor secreto.

## Scratch único obrigatório

Use sempre:

```text
<caminho-vps>
```

Lei:

```text
SINGLE_REUSABLE_WORKTREE=true
LOCK_REQUIRED=true
RESET_BEFORE_EACH_RUN=true
RECEIPT_BEFORE_CLEANUP=true
RESET_AFTER_EACH_RUN=true
DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true
```

Antes de qualquer reset/clean destrutivo, compare o realpath com o path canônico. Se divergir, STOP_AND_RECONCILE.

Nunca execute `git reset --hard` ou `git clean -fdx` em `<caminho-vps>`, runtime vivo, Casa `E:\CentralDark` ou checkout principal.

Sequência final:

```text
AGENTE → LOCK → ASSERT_PATH → FETCH → RESET/CLEAN SCRATCH → DELTA → TESTE → DEPLOY OWNER → PROVA → RECEIPT → RESET/CLEAN SCRATCH → UNLOCK
```
