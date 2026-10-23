# Microdeploy Oficial de Fallback — MAIN-PINNED RUNTIME FAST-PATH

Status: CANONICAL_FALLBACK_RECIPE  
Owner: docs/CONSCIENCIA/MICRO-DEPLOY/  
Authority: SEGREDO/CHEFE  
Truth rule: REALIDADE_IS_JUDGE

## Objetivo

Quando o deploy canônico falhar ou ficar BLOCKED antes de promover um delta válido, usar o mesmo SHA já existente na main para promover somente o owner causal, sem carregar sujeira da VPS e sem criar source paralelo.

## Fórmula canônica

DEPLOY_CANÔNICO
→ PASS: encerra
→ FAIL/BLOCKED:
  → SOURCE_JÁ_NA_MAIN
  → SAME_SHA
  → OWNER_EXATO
  → WORKTREE_LIMPA
  → TESTE_APLICÁVEL
  → COPIA_FILESET_CAUSAL
  → RESTART_ISOLADO
  → HEALTH/PROVA_RUNTIME
  → RECEIPT_RUNTIME_LOCAL
  → RECONCILIAR_RECEIPT_VERSIONADO_NA_MAIN
  → READBACK ou PARTIAL se pendente
  → continuar corrigindo pipeline primário

## Pré-condições

- delta já está em main;
- SOURCE_SHA é explícito;
- owner e fileset causal são conhecidos;
- deploy isolado é tecnicamente seguro;
- teste/health aplicável existe;
- restart/reload isolado existe;
- rollback do mesmo owner é possível;
- UNKNOWN material não vira PASS.

## Receita executável

1. Medir MAIN_HEAD e PRIMARY_DEPLOY_STATE.
2. Só ativar fallback com PRIMARY_DEPLOY_STATE=FAIL|BLOCKED.
3. Confirmar SOURCE_SHA como ancestral/HEAD válido da main.
4. Identificar OWNER e FILESET_CAUSAL.
5. Medir árvore runtime; nunca pull/reset cego em checkout dirty.
6. Criar worktree limpa de origin/main e fixar SOURCE_SHA.
7. Rodar sintaxe/typecheck/build/testes aplicáveis.
8. Copiar somente FILESET_CAUSAL ao runtime.
9. Restart/reload somente do owner.
10. Aguardar readiness.
11. Medir processo, porta, health e efeito esperado.
12. Comparar esperado × observado.
13. PASS de runtime → receipt local já suportado pelo script; conciliar receipt versionado na main + NEXT_CURSOR; local-only fica PARTIAL para selo global.
14. FAIL → rollback do mesmo owner + causa localizada.

## Bindings

REPO=ServerVpss/CentralDark
BRANCH=main
SOURCE_SHA=<sha_exato_da_main>
OWNER=<owner_causal>
WORKTREE=<worktree_limpa>
RUNTIME_ROOT=<caminho-vps>
FILESET_CAUSAL=<lista_exata>
TEST_COMMAND=<teste_aplicavel>
BUILD_COMMAND=<build_ou_NA>
RESTART_COMMAND=<restart_owner>
HEALTH_COMMAND=<health_owner>
ROLLBACK_SOURCE=<runtime_anterior>
RECEIPTS_OWNER=repository
RUNTIME_RECEIPT=logs/receipts/main-pinned-<OWNER>-<STAMP>.json
REPOSITORY_RECEIPT_STATUS=PENDING_UNTIL_READBACK
LEGACY_PR_MOTHER=#1562,#1757

## Exemplo já provado — MCP Admin

SOURCE_SHA=cccf53ef74e45cd6759e650b4889c239378f5a77

FILESET_CAUSAL:
- apps/modulos/mcp/src/admin.js
- apps/modulos/mcp/src/admin-patterns-ui.js
- apps/modulos/mcp/dist/admin.js
- apps/modulos/mcp/dist/admin-patterns-ui.js

Sequência:
- node --check
- typecheck
- testes direcionados
- copiar 4 arquivos para <caminho-vps>
- restart CentralDark-MCP
- provar 127.0.0.1:9100/health = 200
- confirmar dist vivo com o delta esperado

No ciclo que originou esta receita, o deploy canônico falhou antes da promoção por HOME ausente em deploy-guards-dispatcher.sh. O fallback promoveu o mesmo delta já commitado na main.

## Cadeados

NO_UNCOMMITTED_SOURCE_AS_DEPLOY_INPUT=true
NO_FORCE_PUSH=true
NO_BLIND_PULL=true
NO_BLIND_RESET=true
NO_FULL_RUNTIME_COPY_BY_DEFAULT=true
NO_UNRELATED_RESTART=true
NO_SECRET_IN_GIT_OR_LOG=true
PRIMARY_PIPELINE_FAILS_DO_NOT_BECOME_FIXED_BY_FALLBACK=true
MERGED_IS_NOT_DEPLOYED=true
UNKNOWN_IS_NOT_PASS=true

## SAME_SHA

SOURCE_SHA = origem do fileset.
FILES_PROMOTED = derivados do mesmo SOURCE_SHA.
Se o conteúdo mudar depois de extraído, SAME_SHA=false e isso vira DELTA_NOVO.

## Rollback

FALLBACK_RUNTIME_FAIL
→ restaurar FILESET_CAUSAL anterior
→ restart somente owner
→ health
→ registrar FAIL/ROLLED_BACK
→ não usar git reset --hard no checkout sujo da VPS.

## Receipt mínimo

MICRO_DEPLOY_MODE=MAIN_PINNED_FALLBACK
PRIMARY_DEPLOY_STATE=FAIL|BLOCKED
PRIMARY_FAILURE_CAUSE=
SOURCE_SHA=
MAIN_HEAD=
OWNER=
FILESET_CAUSAL=
TESTS=
BUILD=
PREVIOUS_RUNTIME=
DEPLOY_ACTION=
RESTART_ACTION=
RUNTIME_HEALTH=
RUNTIME_EFFECT=
SAME_SHA=
ROLLBACK_TARGET=
SECRET_EXPOSED=false
RESULT=PASS|FAIL|ROLLED_BACK
RECEIPT_OWNER=repository
RUNTIME_RECEIPT_PATH=
REPOSITORY_RECEIPT_STATUS=PENDING|VERSIONED_READBACK
LEGACY_PR_MOTHER_REF=#1562,#1757
NEXT_CURSOR=

## Fingerprint

recipe_version + owner + fileset + test + build + restart + health + runtime_target

SAME_FINGERPRINT
→ REPLAY_BEFORE_REDISCOVERY
→ adaptar somente bindings
→ mesma sequência
→ mesma prova

CHANGED_FINGERPRINT
→ REVALIDATE_AFFECTED_CONE_ONLY
→ DELTA_NOVO

## Evolução da receita sem novas estruturas — 2026-10-23

**Delta do CHEFE:** corrigir a receita e o script atuais antes de pensar em criar ferramenta, runner, processo ou arquivo paralelo. Canonical owners preservados: `scripts/vps/main-pinned-microdeploy.sh`, este JSON/YAML, `.agents/skills/main-pinned-runtime-fast-path/SKILL.md` e o transporte existente `.github/workflows/vps-ssh-exec.yml`.

**Aprendizados comprovados no código anterior:** havia `rm -rf "$SCRATCH"` antes de validar realpath/registro; em cópia parcial, `promoted=1` só era ativado após copiar todos os arquivos; fonte `src/tools/github/github-tools.js` avançou, mas `dist` ainda estava antigo. Estes são gaps materiais, não motivos para um novo executor.

**Correção no mesmo script:**
1. Validar realpaths e roots de produção **antes** do primeiro reset/clean; scratch existente não registrado → `KEEP_ACTIVE`, não apagar.
2. Para ferramentas MCP, exigir par `src + dist` no fileset e compilar `tsc` em worktree limpa, usando dependências **já presentes na VPS**, sem `npm install` no runtime. Testar em scratch antes de qualquer cópia.
3. Fazer backup integral de todos os arquivos antes de qualquer promoção e ligar rollback **antes** da primeira cópia. Restarts somente no owner causal.
4. Preservar count/catálogo: crescimento de uma ferramenta exige readback posterior por `mcp_admin_catalog`; **commit, teste e contagem não equivalem à prova runtime**. Rollback para redução/incompatibilidade.
5. SSH apenas como transporte autorizado: workflow existente aceita vários `--file` via string separada por vírgulas, sem comando shell arbitrário e com fingerprint de host verificado.

**Reuso/receipts:** commit `43baf2b03c1ea9fd8fc01b25652a175f48b2f22a` registra `admin_ssh_microdeploy` na fonte; commit `715be9c7826612580a902f041d1b15264701c6c7` cobre regressões; run `39912949599` foi bloqueado por faturamento **antes** de executar SSH. O runtime ainda expôs 141 tools e não a nova, logo `DEPLOY_STATE=PENDING`. Os três runners offline removidos continuam apenas como inventário histórico. Não reconstruir CI pesado.

**Consumo coerente da receita:** a entrada `admin_ssh_microdeploy` agora valida lista CSV de até 8 arquivos, owner exato, ausência de duplicatas e par MCP `src/dist`, repassando a mesma entrada ao workflow existente. Casos negativos e dry-run positivo foram incorporados ao arquivo de testes já existente, sem arquivos novos. O status continua `COMMITTED_NOT_DEPLOYED` até contraprova.

**NEXT_CURSOR:** testar sintaxe, validar testes do código no SHA exato, dry-run do executor na worktree segura, promover somente owner `mcp` quando a rota permitir, verificar `mcp_admin_catalog(filter=admin_ssh_microdeploy)`, `mcp_policy_summary`, health, efeito e receipt. Se não houver prova de runtime, classificar `PARTIAL`; não apagar worktrees de terceiros nem reexecutar descobertas para mesmo fingerprint.

### Contraprova da evolução in-place — 23/10/2026

- Commit `04febfa3b0de5e4479efd9b1abe3a2a732105f69`: **seis owners existentes** ajustados (script de microdeploy, workflow SSH, JSON/YAML, esta receita humana e skill); nenhum script/skill/runner paralelo criado. Guard de scratch e rollback de cópia parcial incorporados.
- Commit `3a70583233ce8e6d07ebe3a0d25ad734ab2a8ce8`: tool admin e **o arquivo de testes existente** ampliados para CSV com escopo e par source/dist; fonte e teste apenas versionados, não implantados.
- Contraprovas automáticas via **MCP CentralDark**: `bash -n` no script de microdeploy = PASS; `yaml.safe_load` + `bash -n` no workflow = PASS; `json.load` na receita JSON = PASS; `yaml.safe_load` no binding = PASS; `node --check` na ferramenta e no arquivo de testes = PASS. Readback da `main`: sete arquivos têm os deltas esperados.
- Limite de prova: teste `node --test` na scratch de deploy = **PENDING**; build `tsc` na scratch = **PENDING**; SSH fim a fim = **BLOCKED_GITHUB_HOSTED_BILLING**; tool `admin_ssh_microdeploy` no runtime MCP = **UNKNOWN/NOT_SEEN**; produção não foi reiniciada. Sintaxe verde **não** é runtime verde.
- Reaproveitamento obrigatório: `REPLAY_BEFORE_REDISCOVERY`, revalidar só cone causal se fingerprint mudar, registrar falha pontual no mesmo owner; não repetir a migração inteira quando houver apenas um teste pendente.

**NEXT_CURSOR material:** executar `--dry-run` no SHA exato com scratch protegida; provar tsc e `node --test` na VPS; só promover MCP quando for seguro e permitido; conferir `mcp_admin_catalog(filter=admin_ssh_microdeploy)`, `mcp_policy_summary`, health, restart isolado e receipt. Falha financeira no hosted não se resolve disparando CI pesado repetidamente.

## Sem runner pago — rota MCP direta (2026-10-23)

Diretriz expressa: não depender de GitHub-hosted runner pago. Workflow `.github/workflows/vps-ssh-exec.yml` transformado em legado inerte (`if: false`), com zero jobs de deploy e sem runner hospedado. O run #39912949599 é histórico; não é requisito de pagamento nem bloqueio arquitetural do deploy nativo.

**Fluxo normal:** `JARVIS → MCP_CENTRALDARK → centraldark_deploy_micro_fallback → scripts/vps/main-pinned-microdeploy.sh → scratch segura → build/teste na VPS → promoção causal → health → receipt/rollback`. GitHub serve somente para fonte `main/SHA` e versionamento, sem CI obrigatorio. SSH privado Casa/Tailscale continua transporte opcional.

O alias admin legado `admin_ssh_microdeploy` deixa de disparar Actions e somente orienta status/plano da rota nativa. A execução real permanece sob o `mcp_admin_call` e a tool `centraldark_deploy_micro_fallback`, com autorização/auditoria independentes. Nao executar uma ferramenta destrutiva por chamada interna de alias.

**Prova atual:** as leituras MCP/VPS e GitHub são operacionais; dry-run via ferramenta nativa foi bloqueado pela segurança da plataforma, logo `DEPLOY=UNKNOWN`. Não contornar isso por outro caminho. NEXT_CURSOR: validar alterações do commit, instalar pela rotina permitida e medir health/catálogo/receipt sem sobrescrever checkout da VPS.

## Prioridade global de receita — prova de fonte 2026-10-23

**Lei P0 GLOBAL RECIPE FIRST.** Não é opção do agente e não depende de mensagem na conversa. **Antes de qualquer feito operacional:** recuperar intenção vigente, owner, receita e checkpoint; comparar a validade da prova pelo mesmo SHA, fileset, fingerprint, escopo, efeito e frescor; reutilizar se realmente equivalente; se divergente, alterar **a própria receita/script/skill** existente; executar delta mínimo permitido; medir efeito, rollback se necessário, escrever receipt e NEXT_CURSOR. Se não houver receita pertinente, consultar o catálogo existente primeiro, não criar estrutura paralela.

**Pontos reais de execução versionados na main:**
- `apps/modulos/mcp/src/tools/core/mcp-admin.js`: `mcp_admin_call` chama `canonicalRecipeFirstPreflight` antes do handler. Portanto cobre as missões Hermes/Hub que usam o dispatcher e bridge OAuth/Hub. A autorização/auditoria posterior permanece, sem synthesize/ignorar consentimentos.
- `apps/modulos/mcp/src/mcp-server.js`: entrada direta HTTP/stdio consulta a mesma preflight, antes do handler. Prova de código não representa servidor já recarregado.
- `apps/modulos/mcp/src/tools/deploy/centraldark-capabilities.js`: função reaproveitável faz seleção da receita e bloqueio de escopo; diagnósticos read-only continuam possíveis para reparar fontes ausentes. Em migração, o executor MCP nativo admite receita legada **apenas** no caminho nativo e com SHA explícito em promoção.
- `apps/modulos/mcp/src/tools/github/github.js`, `github-tools.js` e `github-write.js`: `vps-ssh-exec.yml` e ID `301288932` são rejeitados em `ServerVpss/CentralDark`; outros workflows fora do alvo continuam com seus controles.
- `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml` e `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`: portadores da mesma prioridade 0 para consumidores/agentes; sem segundo dispatcher, cron, agent ou recipe.

**Hermes — delta recebido:** o CHEFE relatou commit local `2d3972c827ce2786de6da24cbd9e75de589d834c` no mesmo `scripts/vps/hermes-self-evolution-current-model.sh`, com donor pinado `0a929e3aa20e15cf04dc7c28492a7d41a5139125`, provisionamento de `.venv`, import do executor e opção `--self-provision-only`. Testes reportados: `12 passed, 2 subtests passed`, `bash -n`, `py_compile`, `git diff --check`. **Limite de prova:** não foi possível buscar esse commit remoto; a main consultada ainda continha versão anterior. Não atribuir `DEPLOYED`, `PR_CREATED` ou `LIVE` à informação local sem readback de branch e runtime.

**Commits da prioridade e cadeado:** `6153b75555101d8f31189ce1daf973a1d7ffc16c` (dispatcher + entrada MCP + contratos), `d0289679973c88f059bfac1321779f523e31aebf` (duplo dispatch guard), `06ee5679dcccd07dbbd60d2648f8157201e35b0c` (bootstrap resiliente), `a4634a0cc44edfb314539a57c77c1226ca37066e` (read-only sem deadlock). Testes de sintaxe de `mcp-admin.js`, `centraldark-capabilities.js`, `github.js`, `github-tools.js`, `github-write.js` e `admin-ssh-microdeploy.test.mjs` observados PASS; `mcp-server.js` e parsers adicionais não tiveram PASS de shell por restrição de ferramenta. Teste funcional de node e deploy real permanecem pendentes.

**Contraprova runtime:** o MCP ativo ainda retornou `runtimeTools=141`, `admin_ssh_microdeploy=0` e receita `primaryPath=github_actions_canonical_deploy`. Isso confirma **SOURCE_COMMITTED != RUNTIME_DEPLOYED**. Nenhum deploy/restart foi realizado nesta atualização.

**NEXT_CURSOR:** ao retomar, buscar esta receita P0 antes de investigação; confirmar commit/PR Hermes publicado; implantar deltas MCP pela rota nativa autorizada com snapshot de scratch segura, SHA exato, build/teste e health; ler `mcp_admin_catalog` e `centraldark_deploy_recipe_status` no runtime; só então selar `GLOBAL_RECIPE_FIRST_LIVE=PASS`. Nunca repetir CI hospedado nem passar por ferramenta bloqueada por plataforma.

## Nome canônico

MAIN-PINNED RUNTIME FAST-PATH

Alias: MICRODEPLOY OFICIAL DE FALLBACK

## Single Reusable WorkTree — scratch canônico

O fast-path usa **um único WorkTree descartável/reutilizável** para todos os agentes. Não criar worktrees de agente de longa duração.

    SINGLE_REUSABLE_WORKTREE=true
    AGENT_USES_CLEAN_WORKTREE=true
    RESET_AFTER_EACH_AGENT_RUN=true
    NO_LONG_LIVED_AGENT_WORKTREES=true
    DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true

Binding canônico:

    CANONICAL_SCRATCH_WORKTREE=<caminho-vps>
    WORKTREE_IS_DISPOSABLE=true
    WORKTREE_RESET_BEFORE_USE=true
    WORKTREE_RESET_AFTER_USE=true
    RUNTIME_IS_NOT_SCRATCH=true
    RECEIPT_BEFORE_CLEANUP=true
    LOCK_REQUIRED=true

Fluxo:

    AGENTE_ENTRA
    → adquirir LOCK
    → validar caminho exato do scratch
    → fetch origin main
    → reset do scratch para origin/main
    → clean total somente do scratch
    → aplicar delta exato
    → testar
    → copiar somente owner aprovado para runtime
    → restart isolado
    → provar
    → receipt
    → reset/clean do scratch
    → verificar scratch limpo
    → soltar LOCK

Cadeado crítico:

    git reset --hard
    git clean -fdx

só podem rodar quando:

    REALPATH == <caminho-vps>
    AND RUNTIME_ROOT != REALPATH
    AND PRIMARY_REPO_ROOT != REALPATH

É proibido executar reset/clean destrutivo em:
- <caminho-vps>
- runtime vivo
- checkout principal
- worktree não reconhecido pelo binding canônico

Receipt ocorre **antes** do cleanup final. Handoff só ocorre com scratch limpo.

## Conciliação CURRENT — PR-mãe aposentada (11/10/2026)

Owner: `docs/CONSCIENCIA/LEDGER-SURFACE-ANCHOR.md` (`PR_MOTHER_ROLE=RETIRED`). #1562/#1757 permanecem somente como proveniência. O script `scripts/vps/main-pinned-microdeploy.sh` já escreve receipt **local** em `logs/receipts/`, mas **não o comita automaticamente**. Para selo global, publicar receipt versionado no repositório com readback de SHA; se pendente, classificar PARTIAL. Nenhum passo mutante, lock, permissão ou comando de reset é alterado por este delta documental.
