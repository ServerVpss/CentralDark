---
title: "CLAUDE.md"
date: 2026-08-24
updated: 2026-09-25T19:35:00-03:00
status: DERIVED_VIEW
tags: [boot, contrato, claude, ponte, intencao, live-editing]
category: "A-Agentes"
sensitivity: INTERNAL
source: AGENTS.md + LEIA-ME-IA.md + docs/CONSCIENCIA/MICRO-DEPLOY/* + MODULES/HUB/*
source_class: INTERNAL
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: AGENTS.md
consumer: Claude Code / engines Claude
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

Antes de agir:

1. Ler `LEIA-ME-IA.md`
2. Ler `AGENTS.md`
3. Medir branch/HEAD/PR/writer/tools
4. Emitir `CENTRALDARK_AI_BOOT` uma vez
5. Todo material entra no moinho canônico; não criar memória/governança paralela
6. Artefato derivado sem propriedades obrigatórias **não** é `FLASH_READY`
7. Carregar o sistema de intenção e gatilhos obrigatórios deste arquivo antes de mutar qualquer owner

```text
ENGINE=CLAUDE
ENGINE_IS_OWNER=false
COPY_BRAIN=false
SEGREDO/CHEFE > SOL > PIVETE/HERMES
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

## Boot Obrigatório (Todos os Agentes)

**Ordem imutável:**
1. `LEIA-ME-IA.md` — entrada única
2. `AGENTS.md` — contrato operacional
3. `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` — identidade
4. `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` — reúso obrigatório
5. `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md` — modo padrão de edição viva
6. `.agents/skills/centraldark-live-editing-fabric/SKILL.md` — skill operacional do método
7. `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md` — fast-path main-pinned
8. `.agents/skills/main-pinned-runtime-fast-path/SKILL.md` — skill do fast-path
9. `MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.md` — HUB/credenciais/providers
10. `.agents/skills/centraldark-hub-credential-control-plane/SKILL.md` — skill de HUB e segredo em trânsito

Emitir uma vez `CENTRALDARK_AI_BOOT` de `LEIA-ME-IA.md` (linhas 112–128).

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
→ receipt no #1562 ou PR-filho equivalente, sem segredo, com NEXT_CURSOR.

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
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK(remote_tip==local_sha)
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
LEDGER_1562_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```

Vale para qualquer motor (Claude, ChatGPT, Codex, Gemini, Grok, Hermes, CI). Disse que gravou → mostra ID, caminho, link e prova de leitura de volta. Sem isso, não aconteceu.
