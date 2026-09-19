# 🧿🎼 HANDOFF · PR #1577 · COMPASSO MULTIAGENTE · NULL ENVELOPE

```text
ID=PR1577_MULTIAGENT_COMPASSO_NULL_HANDOFF_20260919
DATE=2026-09-19
PR_MOTHER=#1562
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
PR_CHILD=#1577
PR_CHILD_BRANCH=cristal/session-provada-20260918-pr-mae-1562
HEAD_BEFORE_THIS_HANDOFF=4f0eba99cc117a1e1a17b4f8b3d2923c68bbbdfd
AUTHORING_SURFACE=SOL_CHATGPT
INTENT_AUTHORIZED_BY=SEGREDO/CHEFE
```

## GOAL_PAI

```text
andar junto com outros agentes no mesmo livro
→ writers em setores disjuntos
→ 1 juiz/finalizer
→ PR-mãe #1562 como rendezvous/ledger
→ PDF_GATE/TLC23 obrigatório
→ inventariar TOOL_CALL onde aparecem NULL
→ corrigir só NULL que representa lacuna real
→ NULL legítimo continua NULL
→ commit + CI + contraprova
```

## Regras de compasso

```text
CURRENT > HISTORY
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
COMMENT_HEAD != CURRENT_HEAD
NULL != ERROR
NULL_LEGITIMO != LACUNA_REAL
PR_MOTHER_DIRECT_WRITE=false
ONE_WRITER_PER_CONFLICT_SCOPE=true
ONE_FINALIZER_ONLY=true
```

## Setor deste agente

```text
ROLE=CONTRAPROVA_HANDOFF_NULL_ADJUDICATOR
MUTATION_SCOPE=docs/handoff/receipt only
CODE_SCOPE=NO_DIRECT_CODE_CHANGE
FINALIZER_ROLE=NO
MERGE_AUTHORITY=NO
```

Este agente não assume o papel de finalizer e não altera código/runtime. A função é deixar rastreável, dentro do PR, o compasso comum para outros agentes: medir HEAD vivo, separar comentário histórico de HEAD atual, classificar NULLs e impedir promoção sem SAME_HEAD verde.

## Política de NULL

```text
NULL_LEGITIMO:
  - comentário geral de PR sem path/line/review
  - campo opcional ausente por contrato da API
  - ausência esperada que não quebra rastreabilidade
  - não converte UNKNOWN em PASS

NULL_LACUNA_REAL:
  - campo obrigatório para owner/prova/path/commit está ausente
  - lacuna impede rastrear tool_call ou envelope
  - ausência mascara falha de gate
  - ausência quebra comparação HEAD/SAME_HEAD
  - ausência permite julgamento sem evidência
```

## Matriz obrigatória para outros agentes

```text
NULL_INVENTORY_MATRIX:
  field:
  location:
  current_head:
  event_type:
  expected_by_api_contract:
  breaks_traceability:
  owner_affected:
  gate_affected:
  verdict: NULL_LEGITIMO | NULL_LACUNA_REAL | UNKNOWN
  action: NONE | PATCH_OWNER | BLOCK_PROMOTION | REQUERY
```

## Roteamento entre agentes

```text
AGENT_WRITER_CODE:
  pode corrigir apenas owner de código que ele mediu e declarou
  não toca docs/handoff sem atualizar receipt

AGENT_WRITER_DOCS:
  pode atualizar contexto/proveniência/receipt
  não altera runtime/código

AGENT_GATE:
  executa PDF_GATE/TLC23/SAME_HEAD
  não promove sozinho

AGENT_FINALIZER:
  único autorizado a declarar PROMOTION_READY
  só após CI/GATES no mesmo HEAD
```

## Próximo cursor

```text
1. re-medir PR #1577 HEAD depois deste commit
2. publicar handshake idempotente no PR #1577
3. publicar ponte curta no PR-mãe #1562
4. aguardar/medir CI do HEAD novo
5. inventariar NULLs do envelope de tool-call
6. corrigir apenas NULL_LACUNA_REAL no owner correspondente
7. preservar NULL_LEGITIMO
```

## Veredito deste receipt

```text
HANDOFF_IN_PR=true
TRACE_IN_PR_MOTHER_REQUIRED=true
CODE_RUNTIME_CHANGED=false
FINALIZER_DECISION=NOT_MADE
PROMOTION_READY=false
```
