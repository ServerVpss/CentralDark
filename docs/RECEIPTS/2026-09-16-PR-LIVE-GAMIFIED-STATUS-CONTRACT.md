# 🪬 CentralDark — PR Live Gamified Status Contract

Status: CANDIDATE_FOR_VALIDATION
Authority: SEGREDO/CHEFE
Scope: PRs, commits, workflows, CodeRabbit, Dependabot, CI gates, runtime proof, receipts

## Objetivo

Cristalizar no mesmo sistema da CentralDark o padrão visual gamificado dos PRs sem criar workflow, engine, owner ou dashboard paralelo.

O PR deve projetar a intenção viva do CHEFE, os critérios de aceitação, os gates materiais e a prova técnica no mesmo card, preservando `UNKNOWN != PASS` e `REALIDADE = JUIZ`.

## Invariantes

```text
INTENT_OWNER=CHEFE
CONTINUITY_OWNER=CENTRALDARK
EXECUTOR=CODEX|HERMES|AGENTE_AUTORIZADO
PROOF_OWNER=GATES
JUDGE=REALIDADE

AGENT_STOP != MISSION_STOP
SESSION_END != GOAL_END
MODEL_LIMIT != GOAL_END
CHECKPOINT != GOAL_END

GOAL_END somente quando:
- todos os acceptance criteria materiais estiverem PASS; OU
- CHEFE alterar/cancelar a intenção; OU
- blocker humano/material real estiver registrado com NEXT_CURSOR.
```

## Card visual oficial no PR

A pele humana do PR deve reutilizar o padrão oficial de `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`:

```text
╔══════════════════════════════════╗
║  CENTRALDARK / PR #{PR}          ║
║  MISSÃO OPERACIONAL VIVA         ║
╚══════════════════════════════════╝

STATUS:    {status}
PRIORID:   {prioridade}
RESPONS:   CENTRALDARK
EXECUTOR:  {executor}

🎯 MISSÃO
{chefe_intent}

📌 FASE
{fase_atual} → {proxima_fase}

📊 PROGRESSO
CRITÉRIOS: [{barra}] {pass}/{total}
PROG:      {percentual ou NAO_CALCULAVEL}

🧠 SKILLS UP
{capacidades relevantes}

🚨 BLOQUEIOS
{bloqueios reais ou nenhum}

🎯 PRÓXIMO PASSO
{next_cursor}

────────────────────────────────────
🔧 DETALHE TÉCNICO (PROVA)
HEAD:      {head_sha}
BASE:      {base_sha}
SOURCE:    {source_state}
RUNTIME:   {runtime_state}
UNKNOWN != PASS
REALIDADE = JUIZ
```

## Checklist vivo

As caixas do GitHub são projeção do estado da missão; não são prova por si mesmas.

```markdown
## 🎯 Critérios vivos da missão

- [ ] Intenção do CHEFE preservada
- [ ] Owner canônico localizado/reutilizado
- [ ] REUSE_BEFORE_CREATE satisfeito
- [ ] Implementação concluída
- [ ] Testes aplicáveis concluídos
- [ ] Contraprova concluída
- [ ] 🐰 CodeRabbit sem finding material pendente
- [ ] 🤖 Dependabot reconciliado quando aplicável
- [ ] 🛡️ CI do HEAD atual verde
- [ ] ⚖️ Runtime comprovado quando aplicável
- [ ] 🧾 Receipt final no mesmo HEAD
```

Semântica:

```text
CHECKBOX = VISUALIZACAO
EVENTO = EVIDENCIA
[x] != PROOF sem evidence_ref
[ ] material => GOAL_STATE=ACTIVE
```

## Progresso matemático

```text
NO_PERCENT_WITHOUT_CLOSED_DENOMINATOR=true

DENOMINATOR_CLOSED=true
→ percentage = PASS / TOTAL

DENOMINATOR_CLOSED=false
→ PORCENTAGEM=NAO_CALCULAVEL

FAIL não some da conta.
UNKNOWN não vira PASS.
```

Exemplo:

```text
PASS    7
FAIL    1
PENDING 2
UNKNOWN 1
TOTAL   11
PROGRESSO_COMPROVADO=7/11=64%
STATUS_GERAL=FAIL se houver gate material em FAIL
```

## Atualização dirigida por eventos

Não usar polling periódico burro para recalcular placar.

```text
WORKFLOW | CODERABBIT | DEPENDABOT | RUNTIME | RECEIPT
→ STATUS_EVENT
→ NORMALIZE
→ DEDUPE
→ AGGREGATE
→ CLOSED_DENOMINATOR_CHECK
→ UPDATE_PR_CARD_IF_STATE_CHANGED
→ UPDATE_HUD_IF_STATE_CHANGED
```

Fingerprint mínimo do evento:

```text
mission_id
+ pr_number
+ head_sha
+ gate_id
+ gate_state
```

Regra:

```text
OLD_EVENT_HASH == NEW_EVENT_HASH
→ DROP_DUPLICATE

OLD_STATE_HASH == NEW_STATE_HASH
→ KEEP_GOAL
→ KEEP_NEXT_CURSOR
→ DO_NOT_REWRITE_CARD

OLD_STATE_HASH != NEW_STATE_HASH
→ UPDATE_CHECKBOXES
→ RECALCULATE_PROGRESS
→ UPDATE_CARD
→ NARRATE_DELTA
```

## Same-HEAD

Todo PASS é preso ao SHA observado.

```text
PASS_SHA_ANTIGO != PASS_SHA_ATUAL
NEW_HEAD
→ INVALIDATE_STALE_PROJECTION
→ RECOMPUTE_APPLICABLE_GATES
```

## Papéis

```text
CHEFE       = intenção e critérios
CENTRALDARK = continuidade, agregação e projeção
CODEX       = executor/revisor, nunca dono da missão
HERMES      = executor/continuidade operacional
CODERABBIT  = finding CANDIDATE até reprodução/prova
DEPENDABOT  = mudança observada de dependência, não juiz semântico
CI/GATES    = medição determinística
RUNTIME     = prova física quando aplicável
REALIDADE   = juiz final
```

## Estado desta cristalização

```text
SOURCE_CONTRACT=CRYSTALLIZED_IN_PR
EVENT_DRIVEN_STATUS=CONTRACTED
CHECKBOX_LIVE_STATE=CONTRACTED
GAMIFIED_CARD=CONTRACTED
PERCENT_CLOSED_DENOMINATOR=CONTRACTED
SAME_HEAD_BINDING=CONTRACTED
LIVE_RUNTIME_BINDING=NOT_PROVEN
PR_COMMENT_AUTO_UPDATE=NOT_PROVEN
HUD_AUTO_UPDATE=NOT_PROVEN
FIXED_POINT=NOT_REACHED
```

## Próximo cursor

```text
NEXT_CURSOR=BIND_EXISTING_PR_REVIEW_AND_TRIGGER_FABRIC_EVENTS_TO_ONE_IDEMPOTENT_LIVE_CARD_THEN_VALIDATE_ON_SAME_HEAD
```
