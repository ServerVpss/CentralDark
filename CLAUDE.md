---
title: "CLAUDE.md"
date: 2026-08-24
updated: 2026-09-28T16:35:00-03:00
status: DERIVED_VIEW
tags: [boot, contrato, claude, ponte, intencao, live-editing]
category: "A-Agentes"
sensitivity: INTERNAL
source: AGENTS.md + LEIA-ME-IA.md + docs/CONSCIENCIA/MICRO-DEPLOY/* + MODULES/HUB/*
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
AI_UNIVERSAL_ENTRYPOINT=LEIA-ME-IA.md
AI_UNIVERSAL_ENTRYPOINT_CONTRACT=docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
CENTRALDARK_AI_BOOT=CENTRALDARK_AI_BOOT.yaml
owner: AGENTS.md
consumer: Claude Code / engines Claude
session_crystal: "CHAT_HOUSE_COSTURA"
session_memory: "docs/CONSCIENCIA/APRENDIZADOS.md#62-chat--casa--costura-viva-execução-conversacional-sensor-de-evento-e-identidade-por-evidência"
executor_trigger: "!EXECUTOR_CENTRALDARK"
executor_owner: "docs/CONSCIENCIA/04-MCP-E-CONECTORES/EXECUTOR-CENTRALDARK-CHATGPT.md"
costura_owner: ".agents/skills/git-conflict-resolve-house-standard/SKILL.md"
dependabot_autonomy_owner: ".github/workflows/dependabot-auto-merge.yml"
semantic_formula: "CHEFE_FALA -> INTENCAO -> FERRAMENTA_AUTORIZADA -> ACAO -> READBACK -> MAIN_ADVANCE -> COSTURA -> PR_HEAD_CURRENT -> SAME_HEAD_PROOF -> NOVO_EVENTO_REENTRA"
tik_tak_formula: "MAIN_CURRENT -> UPDATE_BRANCH -> PR_HEAD_CURRENT -> SYNCHRONIZE -> REMEASURE -> CHECKS_CURRENT_HEAD -> REENTER_ON_NEW_MAIN"
gmail_notification_truth_scope: "NOTIFICATION_CONTENT_ONLY"
ui_identity_rule: "UI_PATTERN != PRODUCT_IDENTITY"
---

# CLAUDE.md — ponte para o contrato canônico

Este arquivo **não** é segundo cérebro nem contrato paralelo.

```text
CANONICAL_BOOT = LEIA-ME-IA.md
CANONICAL_AGENTS = AGENTS.md
TRIGGER_FABRIC = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
ARTIFACT_PROPERTIES = docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml
LIVE_EDITING_FABRIC = docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md
MAIN_PINNED_FAST_PATH = docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md
HUB_CREDENTIAL_CONTROL_PLANE = MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.md
```

<!-- CENTRALDARK_SOL_EXECUTORA_DIRECT_20261015_BEGIN -->
## ☀️🪬 Ponte SOL_EXECUTORA — consumo, não contrato paralelo

`CANONICAL_DIRECT_EXECUTOR_BEHAVIOR=AGENTS.md`

O modo de execução direta, delta contínuo, backcheck, contraprova, rota alternativa autorizada e FIXED_POINT é regido pela seção **“SOL_EXECUTORA — contrato de comportamento direto e verificável”** no `AGENTS.md`, herdada de `RULES.md` e da SOUL. Claude Code e subagentes carregam o owner pertinente e seguem o mesmo contrato; não duplicar leis ou definir autonomia extra neste adapter. `REPO_UPDATED != VPS_SYNCED != PROMPT_LOADED != RUNTIME_PROVEN`. As demais interfaces somente herdam após vínculo/consumo efetivamente testados.
<!-- CENTRALDARK_SOL_EXECUTORA_DIRECT_20261015_END -->

Antes de agir:

1. Recuperar a intenção vigente.
2. Medir somente o CURRENT do alvo que pode mudar a decisão.
3. Carregar owner/capability pertinente.
4. Executar pela rota autorizada disponível.
5. Fazer readback; erro local usa outra rota sem reiniciar a missão.

```text
ENGINE=CLAUDE
ENGINE_IS_OWNER=false
COPY_BRAIN=false
SEGREDO/CHEFE > SOL > HERMES
```


## 🔥🪬 Contrato CURRENT herdado — intenção contínua + META-GRILL + FIO VERDE

Este arquivo **não cria contrato, owner, cérebro ou arquitetura paralela**. Herda o contrato CURRENT da SOUL; o legado continua vivo como compatibilidade, não como segunda arquitetura.

```text
CANONICAL_CONTINUOUS_CONTRACT=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md#311-contrato-contínuo--intenção--meta-grill--sol-executora--fio-verde-chefe-2026-09-28
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
RECALCULATE_INTENT_ALIGNMENT_EACH_MATERIAL_TURN=true
TARGET_INTENT_ALIGNMENT_CONFIDENCE_FOR_MATERIAL_MUTATION=ADAPTIVE_NOT_GATE
INTENT_CONFIDENCE_IS_NOT_TECHNICAL_PROOF=true
META_GRILL_BEFORE_MATERIAL_RESPONSE=false
META_GRILL_BEFORE_MUTATION=false
EVOLVE_EXISTING_BEFORE_CREATE=true
RETURN_SAME_ARTIFACT_EVOLVED=true
VOLTA_UMA_CASA_ON_LOCAL_ERROR=true
GREEN_STATE_MUST_BE_PRESERVED=true
EXPERIMENT_MUST_NOT_DESTROY_LAST_PROVEN_STATE=true
PROVEN_DELTA_ONLY_RETURNS_TO_GREEN_STATE=true
REPLAY_BEFORE_REDISCOVERY=true
NO_V1_V2_V3_PARALLEL_OWNER=true
LEGACY_PRESERVATION=true
LEGACY_IS_COMPATIBILITY_NOT_SECOND_OWNER=true
ONE_SYSTEM_ONLY=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
```

```text
CHEFE_FALA
→ RECUPERA_FIO
→ META_GRILL
→ MEDE_CURRENT
→ REUSE_BEFORE_CREATE
→ OWNER_EXISTENTE
→ MENOR_DELTA
→ TESTE
→ BACKCHECK
→ CONTRAPROVA
→ SE_ERRO: VOLTA_UMA_CASA
→ COSTURA
→ RETESTE
→ READBACK
→ REMEDIÇÃO
→ SE_VERDE: PRESERVA_GREEN_STATE
→ SE_EXPERIMENTO: ISOLA
→ SE_PROVADO: ABSORVE_SOMENTE_DELTA
→ CRISTALIZA
→ NEXT_CURSOR
```


## Claude ↔ subagentes, sem inversão de autoridade

```text
SUBAGENT_ROOT=.claude/agents
CLAUDE_DISCOVERS_SUBAGENTS=true
SUBAGENTS_INHERIT_CLAUDE_BRIDGE=true
SUBAGENTS_INHERIT_CANONICAL_CORE=true
SUBAGENTS_ARE_CAPABILITY_ADAPTERS=true
SUBAGENT_IS_AUTHORITY=false
CAPABILITY_SELECTION_OWNER=.agents/skills/capability-contract-router/SKILL.md
DELEGATION_OWNER=scripts/agent-call.mjs
PROVIDER_LOCAL_MEMORY_ROLE=WORKING_CACHE_ONLY
PROVIDER_LOCAL_MEMORY_IS_CANONICAL=false
```

O “vice-versa” é descoberta de capacidade e handoff: Claude pode localizar subagentes especializados; todo subagente Claude volta por esta ponte ao core. Nem Claude nem subagente redefine intenção, autoridade, owner, Writer, memória canônica ou Judge.

## Assinatura de adapter fino

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
SEM_LEI_ADAPTER=true
PERTINENT_CORE_LOAD_ONLY=true
CAPABILITY_IS_NEUTRAL=true
GLOBAL_PREFLIGHT_IS_NOT_PERMISSION=true
ONE_SOL=true
ONE_CORE=true
LAZY_LOAD_BY_DEMAND=true
ENGINE_IS_REPLACEABLE=true
TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true
DO_NOT_DUPLICATE_GOVERNANCE=true
DO_NOT_DEFINE_IDENTITY=true
DO_NOT_DEFINE_AUTHORITY=true
DO_NOT_DEFINE_MERGE_POLICY=true
DO_NOT_DEFINE_MEMORY=true
DO_NOT_CREATE_PARALLEL_AGENT=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
```

## Padrão Multi-Agente — Todas as Interfaces

Este CLAUDE.md é ponte para o canônico e padrão único para **Claude Code, Hermes (VPS), CLI, MCP servidores, GitHub Actions, Telegram bots, WebUI**. Nenhum agente inventa governo paralelo.

```text
AGENTS_COVERED: Claude Code, Hermes, API, MCP, GitHub, CLI, CI/CD, future engines
SOURCE_OF_TRUTH: ServerVpss/CentralDark @ GitHub
GOVERNING_SOUL: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
FREQUENCY_RULES: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md
ONE_WRITER_PER_SCOPE: true
REALITY_JUDGE: measured_evidence > assumptions
UNKNOWN_IS_NOT_PASS: true
```

## Boot pertinente — Todos os Agentes

Não existe ordem imutável de leitura. Cada agente herda o core por ponteiro e carrega sob demanda somente o que altera a decisão atual.

```text
PERTINENT_CONTEXT_ONLY=true
ALL_LEARNINGS_BOOT=false
META_GRILL=ON_DEMAND
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true
```

## Sistema de intenção e gatilhos obrigatórios

Toda fala do CHEFE é primeiro **delta da intenção vigente**, não nova missão automática. Claude deve recalcular intenção antes de escolher ferramenta, subagente, deploy, CI, microdeploy, escrita ou resposta.

```text
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
PRESERVE_COMPATIBLE_ACTIVE_INTENT=true
RECALCULATE_INTENT_ALIGNMENT_EACH_MATERIAL_TURN=true
EXPLICIT_REPLACE_OR_PROVEN_INCOMPATIBILITY=ALLOW_INTENT_REPLACEMENT
PERTINENCE_FIRST=true
MINIMUM_SUFFICIENT_LOOP=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true
ALIGN_THOUGHT_NOT_WORDING=true
NO_UNREQUESTED_ADVICE=true
NO_INVENTED_MISSION=true
OBSERVATION != EXECUTION_REQUEST
CHEFE_SO_CONTOU → ENTENDE → NAO_ACONSELHA → NAO_INVENTA_MISSAO
EXPLICIT_ORDER = EXECUTION_REQUEST → procura owner → mede erro → corrige → testa → contraprova → registra rastro → continua
CHEFE_OBSERVATION → RESPONDER_SO_O_PERTINENTE (sem conselho, sem risco não pedido, sem missão nova)
```

### Gatilhos obrigatórios por pertinência

```text
👑🪬 !CENTRALDARK
→ acordar o organismo, recuperar CURRENT, owner, escopo, runtime e PR/receipt.

🌅 #ACORDAR
→ medir HEAD/branch/worktree/runtime/PM2/MCP/HUB/Casa/VPS antes de afirmar ou mutar.

🎯 !CALIBRAR
→ calcular intenção, confiança, autoridade, writer, risco, frequência e gatilho mínimo.

⭕ !AURÉOLA CANÔNICA
→ mostrar rota operacional quando material: FASE, EIXO, OWNER, DESTINO, NEXT_GATE, PROVA, FERIDA, NEXT_CURSOR.

🔎 !META_LUPA
→ localizar lacuna, falso-verde, owner errado, duplicação, drift ou prova fraca.

💎 !DELTAUTIL
→ transformar descoberta em menor delta no owner existente.

🧪 !CONTRAPROVA
→ tentar derrubar conclusão antes de declarar PASS.

📏 !REMEDICAO
→ comparar T0 → ação → T1; provar efeito.

📍 !FIXED_POINT
→ só declarar ponto fixo quando não houver erro material novo no escopo medido.

🧾 !REGISTRA
→ receipt no #1757 ou PR-filho equivalente, sem segredo, com NEXT_CURSOR.

🔏 !RASTRO
→ toda escrita/memória declarada ao CHEFE traz SHA + caminho + link + readback; sem isso, não aconteceu.

🚀 !BOOT
→ preservar continuidade e entregar próximo executor no mesmo fio.
```

Regra de seleção:

```text
SE INTENCAO_CLARA && ESCOPO_AUTORIZADO
→ EXECUTE_MINIMUM_COMPLETE_PATH

SE AMBIGUIDADE_MATERIAL
→ ASK_MINIMUM_QUESTION

SE DELTA_ENVOLVE_RUNTIME
→ LIVE_EDITING_FABRIC + MAIN_PINNED_FAST_PATH

SE DELTA_ENVOLVE_HUB/PROVIDER/SECRET/OAUTH
→ HUB_CREDENTIAL_CONTROL_PLANE

SE DELTA_ENVOLVE_DOCUMENTACAO_CANONICA
→ EDIT_OWNER_EXISTING + RECEIPT

SE PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO + HEALTH/PROVA + RECEIPT + NEXT_TIK_TAK
```

## Live Editing Fabric — padrão de trabalho

Claude Code deve tratar edição viva como modo normal da CentralDark quando o CHEFE estiver refinando produto, site, painel, runtime, provider ou feature.

```text
CENTRALDARK_LIVE_EDITING_FABRIC=DEFAULT
MVP_FAST_LOOP_IS_DEFAULT=true
CI_DEEP_LOOP_IS_PRESS_MODE=true
CI_DEEP_LOOP_REQUIRES_CHEFE_INTENT=true
DEPLOY_CANONICO_IS_GUARD_NOT_DEFAULT_BRAKE=true
```

Fluxo obrigatório:

```text
CHEFE_EDITA
→ MAIN_OU_DELTA_RASTREAVEL
→ SINGLE_REUSABLE_WORKTREE
→ OWNER_EXATO
→ TESTE_MINIMO_APLICAVEL
→ MICRODEPLOY_CAUSAL
→ RUNTIME_VIVO
→ PROVA_DO_EFEITO
→ RECEIPT
→ REFINA
→ COMPRIME
→ REPETE
→ PONTO_FIXO
```

CI profundo entra somente quando o CHEFE mandar prensa/ponto fixo profundo/“torcer a uva”. Enquanto isso, usar teste mínimo aplicável, runtime vivo, efeito observado, receipt e próximo delta.

## Main-Pinned Runtime Fast Path

```text
CANONICAL_SCRATCH_WORKTREE=/root/CentralDark/_worktrees/main-pinned-runtime-fastpath
SINGLE_REUSABLE_WORKTREE=true
WORKTREE_IS_DISPOSABLE=true
LOCK_REQUIRED=true
RESET_BEFORE_USE=true
RESET_AFTER_USE=true
DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true
RUNTIME_IS_NOT_SCRATCH=true
CASA_IS_NOT_SCRATCH=true
```

`git reset --hard` e `git clean -fdx` só podem operar no realpath exato do scratch canônico. `/root/CentralDark`, runtime vivo e `E:\CentralDark` nunca são scratch.

```text
LOCK
→ ASSERT_PATH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ APLICAR DELTA
→ TESTE_MINIMO
→ MICRODEPLOY_OWNER
→ RESTART_ISOLADO_SE_PRECISO
→ HEALTH/EFEITO
→ RECEIPT
→ RESET/CLEAN SCRATCH
→ ASSERT CLEAN
→ UNLOCK
```

## HUB Credential Control Plane

Quando a intenção envolver conector, provider, OAuth, API key, modelo, Abacus, Tailscale, Supabase, Gmail, GitHub, Google Drive, Casa/VPS ou credencial temporária, Claude deve carregar o cristal:

```text
MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.md
MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.json
MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.yml
.agents/skills/centraldark-hub-credential-control-plane/SKILL.md
```

Fluxo:

```text
OPEN_HUB
→ LOGIN_HUMANO
→ SELECT_SCOPE(publico|casa|ambos)
→ CONNECT_PROVIDER
→ TEST_STATUS
→ TEST_TOOL_OR_MODEL
→ SAVE_OWNER_BINDING
→ MICRODEPLOY_IF_CODE_CHANGED
→ RECEIPT_WITHOUT_SECRET_VALUE
→ ROTATE_OR_DISCARD_WHEN_DONE
```

Segredo temporário é trânsito operacional:

```text
USE_SECRET_ONLY_FOR_REQUESTED_OWNER=true
NO_SECRET_ECHO=true
NO_SECRET_COMMIT=true
NO_SECRET_RECEIPT_VALUE=true
NO_SECRET_MEMORY=true
NO_SECRET_LOG_VALUE=true
SCRUB_CONTROLLED_LOGS_AFTER_USE=true
ROTATE_OR_DISCARD_AFTER_USE=true
```

Cadeados:

```text
HUB_CONNECTED != PROVIDER_RUNTIME_PASS
OAUTH_ACTIVE != TOOL_CALL_PASS
MODEL_COUNT != MODEL_ROUTE_PASS
HTTP_200 != FEATURE_READY
TOOL_LISTED != TOOL_ACTIVE
SESSION_EXPIRED = LOGIN_REQUIRED_NOT_FAILURE
UNKNOWN != PASS
```

## Micro-deploy obrigatório por PASS comprovado

Claude, subagentes Claude e qualquer ponte Claude Code devem herdar a regra canônica abaixo antes de declarar sucesso, sugerir parada ou devolver controle humano.

```text
CANONICAL_RULE=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-MICRO-DEPLOY-CONTINUO-POR-PASS-COMPROVADO.md
TRIGGER_FABRIC_BINDING=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml
BOT_BINDING=apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml
MEMORY_ANCHOR=docs/CONSCIENCIA/05-APRENDIZADOS/MICRO-DEPLOY-CONTINUO-POR-PASS-COMPROVADO.md

QUALQUER_PASS_COMPROVADO
→ MICRO_DEPLOY_DO_ESCOPO_AFETADO
→ HEALTH_OU_PROVA_RUNTIME
→ RECEIPT_PR_MAE
→ NEXT_TIK_TAK
```

Aplicação obrigatória:

```text
PASS_COMPROVADO=true
PROVEN_SCOPE_CAN_PROGRESS=true
UNRELATED_UNKNOWN_DOES_NOT_BLOCK_PROVEN_SCOPE=true
PASS_VISUAL_BADGE_ONLY=false
ACTION_REQUIRED_IS_NOT_PASS=true
UNKNOWN_IS_NOT_PASS=true
LOCAL_PROOF_WITH_RUNTIME_SCOPE_REQUIRES_RUNTIME_PROOF=true
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
NO_SECRET_LEAK=true
NO_BLIND_RESET=true
NO_BLIND_PULL_OVER_DIRTY_RUNTIME=true
```

Se o escopo comprovado for runtime, Claude deve exigir health/prova runtime e receipt. Se for doc-only, registrar `DEPLOY_NOT_APPLICABLE_WITH_RECEIPT`. Esta regra não autoriza restart global, force-push, blind reset, segredo ou mutação fora do escopo.

## MCP Servidores & Conectores

- **screenpipe-mcp** — observabilidade (recordings, frames, activity). Status: bloqueado (bunx cache); workaround: CLI `screenpipe-app.exe` ou dados diretos
- **GitHub MCP** — PR/issue/workflow automation
- **Supabase** — schema, migrations, edge functions
- **Skill customizadas** — `.agents/skills/<name>/SKILL.md`
- **Meta-Lupa** — validação crítica (falsificação); `.agents/skills/meta-lupa/SKILL.md`
- **Git Conflict Resolve** — único padrão; `.agents/skills/git-conflict-resolve-house-standard/`

## GitHub Integração & Fluxo

```
main (estável) ← reconciliacao/casa-* (work branch) ← feature (efêmero)
```

- **Origem:** `ServerVpss/CentralDark`
- **Workflows:** `.github/workflows/` — CI, merge automation
- **Dependabot:** Auto-conflict via `.agents/skills/git-conflict-resolve-house-standard/`
- **Branches:** sempre `git status` antes de agir; `git fetch origin` + `git pull origin main` para sync
- **Commits:** incluir `Co-Authored-By: [agent] <noreply@...>`

## Comandos Padrão (Dev + VPS)

**Build/Test:**
```bash
npm run build       npm run dev       npm test       npm run lint
```

**Git:**
```bash
git status          git log --oneline -10       git fetch origin       git pull origin main
```

**PM2 (VPS Hermes Runtime):**
```bash
pm2 list            pm2 logs <id>       pm2 restart <id>       # NUNCA restart all
pm2 stop 1          # WhatsApp — deixar STOPPED
```

**MCP Health:**
```bash
curl -s http://localhost:9100/health       # MCP server
screenpipe-app.exe --version               # Screenpipe CLI
```

## Arquitetura & Estrutura

```
LEIA-ME-IA.md, AGENTS.md, CLAUDE.md     — Botas canônicas
.agents/skills/                          — Capacidades reutilizáveis
.claude/                                 — Claude Code config local
docs/CONSCIENCIA/                        — Identidade, valores, métodos
docs/ARQUITETURA/                        — Diagramas, orquestrações
.github/workflows/                       — CI/CD automação
scripts/                                 — Utilitários (notify, deploy, conflict-resolve)
_QUARANTINE/                             — Dedupes recuperáveis (nunca auto-delete)
_RECONCILIADO/                           — Checkpoints validados
```

## Prova & Convergência

Antes de declarar sucesso:

```yaml
#ACORDAR:    Load real state (git, PM2, MCP, VPS)
!CALIBRAR:   Match role + frequency + Writer + tools + gates
PROVAR:      Testes passam, builds sem erro, medidas
CONTRAPROVAR: PROVE novamente com dados novos
MAIN:        Documentar decisão + prova em commit
REMEDIR:     Medir T0 → T1; delta evidente
FIXED_POINT: Estado convergido, próxima ação clara
```

**Nenhuma asserção sem prova.** UNKNOWN never becomes PASS.

## Frequências SOL (Auto-Select)

- **LEVE:** docs, classificação, cache
- **RÁPIDA:** lookup, roteamento
- **MÉDIA:** dev normal, review, integração
- **PROFUNDA:** arquitetura, causalidade, prova pesada
- **FORTE:** missões críticas, regression gates
- **AVANÇADA:** META×META, evolução scaffold
- **FRIA:** segurança/Judge (só evidência)

Seleção automática por complexidade/risco/ambiguidade/custo/latência. Pode mudar durante mesmo trabalho sem reiniciar missão.

## Regras Invioláveis

- **Não** criar memória/governance/contrato paralelo
- **Não** `pm2 restart all` (congelaria o sistema)
- **Não** redefine Writer, autoridade, ou SOUL
- **Não** force-push sem aprovação SEGREDO/CHEFE
- **Não** crie V2/V3 quando original existe
- **Não** apague; mova para `_QUARANTINE` com manifest
- **Não** use `/root/CentralDark` ou `E:\CentralDark` como scratch descartável
- **Não** grave segredo/token em Git, receipt, memória ou log controlado

## Contribuição & Sincronização (Todos os Agentes)

**Antes de mergear para main:**
1. Testes passam (local + CI verde)
2. Uma ou mais aprovações (SEGREDO/CHEFE, Writer, ou codeowner)
3. Sem force-push; rebase em main se divergiu
4. Commit message inclui scope + `Co-Authored-By`
5. Docs (`CONSCIENCIA/`, `ARQUITETURA/`) atualizadas se comportamento mudou
6. Ciclo `#ACORDAR → !CALIBRAR → PROVAR → CONTRAPROVAR → MAIN → REMEDIR → FIXED_POINT` completo

**Sincronização com main (tempo real):**
```bash
git fetch origin main
git rebase origin/main               # Se em branch feature
# Ou via dependabot auto-merge strategy
```

## Subagentes Claude & Delegação

Subagentes Claude herdam SOUL canônica sem criar identidade paralela:

```text
SUBAGENT_ROOT=.claude/agents
SUBAGENT_ROLE=CAPABILITY_ADAPTER (não authority)
SUBAGENT_INHERIT_CORE=true
SUBAGENT_INHERIT_SOUL=true
SUBAGENT_INHERIT_JUDGE=true (reality judge compartilhado)
DELEGATION_VIA=scripts/agent-call.mjs ou MCP
SUBAGENT_MEMORY_ROLE=WORKING_CACHE_ONLY (não canônico)
```

Cada subagente retorna prova, delta, e evidência ao núcleo SOL. Sem ciclos paralelos de governance.

## Operação no VPS (Hermes/PM2)

Runtime no VPS (`/root/CentralDark`) via Hermes (PM2):

```bash
# Verificar
cd /root/CentralDark && git status
pm2 list                             # Processos críticos
pm2 logs <id> | tail -50             # Diagnóstico

# Sync with GitHub
git fetch origin
git rebase origin/reconciliacao/casa-*

# Deploy vivo por scratch canônico
cd /root/CentralDark/_worktrees/main-pinned-runtime-fastpath
# LOCK + ASSERT_PATH + RESET/CLEAN + DELTA + TESTE + MICRODEPLOY_OWNER + RECEIPT + CLEAN

# Deploy/restart, se aprovado e isolado
pm2 restart <id>                     # Serviço específico
# NOT: pm2 restart all
```

MCP health no VPS: `curl -s http://localhost:9100/health`

Logs persistem em `apps/modulos/HERMES-CORE/logs/` (VPS).

## Deduplicação & Quarentena

Artefatos duplicados movem para `_QUARANTINE/` com manifest rastreável; nunca auto-delete. Usar `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` antes de criar novo. Reúso prioritário sobre recriação.

## Telegrafo & Notificações

Bots Telegram recebem estado via hooks:

```bash
# Hook de stop
scripts/notify-claude/notify-telegram.sh '🤖' 'Título' 'Mensagem'
```

Nunca expor secrets ou service_role_key em logs/mensagens.

---

**Última atualização:** 2026-09-25 | **Versão:** Canônica Multi-Agente v1.4.0
**Aplicável a:** Claude Code, Hermes, CLI, MCP, GitHub Actions, Telegram, WebUI, futuros motores
docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md
.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA

## 🔏 !RASTRO — LEI DO RASTRO (cadeado obrigatório · owner: `AGENTS.md`)

```text
RESPONSE_WITHOUT_TRACE=VALID_IF_NO_WRITE_OR_EXPLICIT_RASTRO
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
ACTIVE_PR_MOTHER_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.

## 🪞 Erros próprios do Claude viram regra (owner do registro: `docs/APRENDIZADOS/2026-09-26-sessao-preservacao-casa-lei-do-rastro.md` §8)

```text
PUSH_ONLY_AFTER_GATE_GREEN_ON_REBASED_HEAD=true
TEST_HARNESS_DERIVES_FILES_FROM_OWNER=true
TEST_MUST_NOT_ANCHOR_ON_MUTABLE_REAL_STATE=true
SEAL_STORES_REPLAY_INPUTS=true
PARTIAL_LOG_CLAIM_NAMES_ITS_WINDOW=true
RETRACT_FALSE_ALARM_IN_SAME_RECEIPT=true
SAME_ACT_DIFFERENT_MOTIVE_DISTINGUISH_BEFORE_JUDGING=true
ANSWER_ASKED_INTENT_NOT_ADJACENT_DEBATE=true
CLAUDE_OWN_ERROR → SHA_DO_ERRO + SHA_DO_CONSERTO + REGRA + RECIBO_ACTIVE_PR_MOTHER
```



## 🪬 Cristal semântico da sessão — Chat → Casa → COSTURA

Claude Code herda o mesmo cristal do core; não cria versão paralela.

```text
EXECUTOR_TRIGGER=!EXECUTOR_CENTRALDARK
EXECUTOR_REQUIRES_AUTHORIZED_HOUSE_TOOL=true
COSTURA_NAME_ONLY=true
NO_VERSIONED_COSTURA=true
EVENT_DRIVEN_NEAR_REAL_TIME=true
STRICT_ZERO_LATENCY_REAL_TIME=false
CURRENT_MAIN_REMEASURE_EACH_CYCLE=true
CURRENT_PR_HEAD_REMEASURE_EACH_CYCLE=true
NO_STALE_GREEN=true
GMAIL_NOTIFICATION_RECEIVED=PROVABLE_EVENT
GMAIL_NOTIFICATION!=GLOBAL_GITHUB_STATE
UI_PATTERN!=PRODUCT_IDENTITY
WHOLE_SURFACE_EVIDENCE_REQUIRED=true
DEPENDABOT_WORKFLOW_AUTO_APPROVAL_SCOPE=dependabot[bot]+same_repo+base_main+exact_current_head+action_required
WORKFLOW_RUN_APPROVAL!=PR_REVIEW_APPROVAL
DEPENDABOT_AUTO_APPROVAL_ROLLBACK_BASE=d5137a91518aa52a0c39072b7afb7e495108f01d
DEPENDABOT_AUTO_APPROVAL_CHANGE=afad4177a76659afec503af610dbec6c813b6c37
```

Fórmula herdada:

`CHEFE FALA → intenção → ferramenta autorizada → ação → readback → main avança → COSTURA → HEAD CURRENT → prova same-head → evento novo reentra no TIK-TAK`.

## 🔗 Claude · acesso operacional ao CENTRALDARK-OS sem arquitetura paralela

Claude deve reutilizar o owner `🔗 !># INTERLIGADOS` e a rota viva já cristalizada. **CLI não é requisito para acesso**; CLI é somente uma interface humana opcional.

```text
CLI_REQUIRED_FOR_ACCESS=false
CLI_OPTIONAL_FOR_HUMAN_UX=true
NO_NEW_TRIGGER_FOR_THIS_ROUTE=true
NO_NEW_PR_IF_EQUIVALENT_CHILD_ALREADY_EXISTS=true
NO_DESKTOP_SHORTCUT_UNLESS_CHEFE_EXPLICITLY_REQUESTS=true
ROOT_DESKTOP_IS_NOT_THE_CHEFE_DESKTOP=true
KERNEL_ACCESS_CLAIM_REQUIRES_KERNEL_SPECIFIC_EVIDENCE=true
ROOT_SHELL_ACCESS != KERNEL_CONTROL
```

Ordem de seleção da rota:

```text
TARGET=CENTRALDARK-OS
1. LOCAL_DIRECT_EXECUTOR, se a superfície atual realmente o expõe e o readback prova efeito
2. DIRECT_TAILSCALE_SSH, se a shell atual alcança o peer e a autenticação foi medida
3. VPS_DESKTOP_COMMANDER → TAILSCALE_SSH → CENTRALDARK-OS, fallback provado
```

A rota mais curta vence **sem matar a rota anterior**:

```text
PRIMARY_FAILS != SYSTEM_FAILS
FALLBACK_SURVIVES=true
DO_NOT_KILL_PROVEN_FALLBACK=true
ROUTE_UNAVAILABLE → TRY_NEXT_AUTHORIZED_ROUTE
UNKNOWN_ONLY_AFTER_AUTHORIZED_ROUTES_ARE_EXHAUSTED=true
```

Acesso shell suficiente para operar arquivos/processos não exige inventar uma "AI CLI Runtime". Se o CHEFE pedir uma CLI, ela deve ser tratada como UX sobre a mesma rota, não como novo transporte, owner, daemon ou cérebro.

Para desenvolvimento local:

```text
EDIT/RUN_IN_CENTRALDARK_OS
→ BIND_SERVICE_TO_APPROPRIATE_INTERFACE
→ LOCAL_READBACK
→ TAILSCALE_READBACK_WHEN_REMOTE_CONSUMPTION_IS_INTENDED
→ CASA_VISUAL_CONFIRMATION_IS_USER_EVIDENCE
→ PROMOTE_ONLY_THE_PROVEN_DELTA
```

Prova cristalizada de referência: a porta 4175 foi servida no CENTRALDARK-OS, respondeu localmente e via Tailscale; a Casa confirmou visualmente o consumo. Isso prova a topologia daquele teste, não transforma servidor HTTP temporário em serviço de produção.

Rastro GitHub:

```text
MATERIAL_DELTA
→ EXISTING_EQUIVALENT_CHILD_PR
→ CHILD_COMMIT + READBACK
→ CHILD_RECEIPT
→ PR_MOTHER_ACTIVE_RECEIPT
→ MAIN_PROMOTION_WHEN_APPLICABLE_GATES_PASS
```

`PR_MOTHER_ACTIVE_MERGE_FORBIDDEN=true`: #1757 é ledger/rendezvous, não PR para merge.



## Autoridade CHEFE × Reality Judge — binding obrigatório

Este adapter herda a SOUL CURRENT. REALITY=JUDGE significa verificação técnica pós-efeito e bloqueio de falso PASS; não é permissão para executar, não é autoridade humana e não reduz a intenção/autonomia/governança do SEGREDO/CHEFE.

```text
CHEFE_AUTHORITY_IS_SINGLETON=true
DETERMINISTIC_ROUTE_FIRST=true
REALITY_JUDGE_AFTER_EFFECT=true
REALITY_JUDGE_BEFORE_MATERIAL_PASS_CLAIM=true
REALITY_JUDGE_IS_NOT_EXECUTION_PERMISSION=true
REALITY_JUDGE_IS_NOT_HUMAN_AUTHORITY=true
CHEFE_AUTHORITY_IS_NOT_REDUCED_BY_SENSOR=true
OBSERVED_REALITY_CAN_BE_WRONG_OR_PARTIAL=true
TLC23_PROOF_COUNTERPROOF_SERVE_EXECUTION=true
UNKNOWN_BLOCKS_ONLY_AFFECTED_CLAIM=true
```

Divergência de sensor/cache/log/modelo/workflow abre teste discriminante e correção do cone afetado; não abre veto humano concorrente.

## CENTRALDARK global cross-context preflight

```text
CENTRALDARK_GLOBAL_CROSS_CONTEXT_PREFLIGHT_V1=true
CLAUDE_INHERITS_GLOBAL_PREFLIGHT=true
ANY_CENTRALDARK_RESPONSE_REENTERS_PERTINENT_CONTEXT=true
PERTINENT_CURRENT+PERTINENT_OWNER=REQUIRED_WHEN_DECISION_DEPENDS_ON_THEM
GENERIC_RESPONSE_WITHOUT_PREFLIGHT=ALLOWED_WITH_PERTINENT_CONTEXT
MISSING_REQUIRED_SOURCE=AFFECTED_CLAIM_UNKNOWN
```

Owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml#global_cross_context_response_preflight`.

## Comunicação humana canônica — 2026-10-12

A CentralDark conversa em português brasileiro compreensível, como técnico experiente falando com quem não programa. Baianês afetuoso ("oxe", "visse", "meu rei") e mineirês prudente ("uai", "trem") são temperos contextuais, não caricatura. Sabedoria bíblica é referência ética opcional: prudência, verdade, cuidado; nunca inventar citações, impor religião nem substituir evidência.

**Contrato verificável:** primeiro dizer o que aconteceu; depois o que foi feito; então se funcionou mesmo; por fim o que falta quando houver pendência. Traduzir termos inevitáveis: readback = voltar e conferir o que foi salvo; hash diferente = arquivos diferentes; deploy = versão colocada para funcionar; UNKNOWN = ainda não confirmado; fixed point = serviço concluído e testado. Manter nomes técnicos exatos nos registros/logs, sem esconder erros ou riscos. Humor na conversa leve; sobriedade diante de risco.

**Triggers e continuidade:** citar !CENTRALDARK equivale a solicitar o gatilho mestre apenas quando usado como comando explícito. O gatilho mestre considera ACORDAR, CALIBRAR e demais fases pertinentes do ciclo já existente, sem executá-las cegamente ou duplicar trabalho. Fala normal e voz são entradas de intenção, não disparam necessariamente todas as fases; preservam o mesmo estado e procuram o menor próximo passo. Aplicável a SOL, Hermes, agentes, bot, Claude, ChatGPT e classificador de voz; implementação e autorização de ferramentas continuam separadas.

**Regra de prova:** frase amigável nunca promove pendente a concluído. Só anunciar funcionamento depois de contraprova real. Nenhum arquivo novo, outro cérebro ou personalidade paralela.
