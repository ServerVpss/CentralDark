# CENTRALDARK — Pergaminhos do Tempo / Jornal Temporal

**Owner canônico:** `.agents/skills/centraldark-operational-method/SKILL.md`

**Papel:** reference derivada da reconciliação temporal existente. Não cria skill, cérebro, Writer, banco, workflow ou autoridade paralela.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
TIME_JOURNAL_IS_DERIVED_VIEW=true
TIME_JOURNAL_IS_AUTHORITY=false
TIME_JOURNAL_IS_NEW_BRAIN=false
TIME_JOURNAL_IS_NEW_WRITER=false
CURRENT > HISTORICAL
UNKNOWN != PASS
```

## 1. Intenção

Dar aos executores uma visão cronológica reconstruível da Casa sem transformar memória em realidade. O Jornal organiza `audit facts`, receipts, lineage Git, decisões materiais e aprendizados promovidos; o estado vivo continua sendo remedido.

A arquitetura permanece viva mesmo quando o local físico muda. O que deve sobreviver é a relação:

```text
INTENÇÃO
→ OWNER
→ ESTADO/HASH/HEAD
→ EVIDÊNCIA
→ CONTRAPROVA
→ DECISÃO
→ CONSEQUÊNCIA
→ NEXT_CURSOR
```

## 2. Pergaminhos / categorias

```text
👑 DECREE        = intenção autorizada do CHEFE
📰 BULLETIN      = observação do presente
🌪 ALERT         = regressão, drift, stale ou blocker
📜 CHRONICLE     = passado preservado como provenance
⚖ VERDICT       = Reality Judge / contraprova
💎 CRYSTAL       = aprendizado promovido
🧭 CURSOR        = próxima fase válida
🔒 SEALED_EDITION = LAST_GOOD_STATE promovido
```

`CHRONICLE != CURRENT`. `ALERT != NEW_INTENT`. `CRYSTAL` exige owner + prova + contraprova.

## 3. Evento temporal mínimo

```yaml
time_event:
  mission_id: <id>
  event_time: <quando o fato ocorreu|UNKNOWN>
  observed_at: <quando foi medido>
  event_type: DECREE|BULLETIN|ALERT|CHRONICLE|VERDICT|CRYSTAL|CURSOR|SEALED_EDITION
  scope: <escopo>
  owner: <owner|UNKNOWN>
  source: <fonte>
  source_role: AUTHORITY|RUNTIME|TRACE|MEMORY|DESIGN|SENSOR|PROVENANCE
  head_or_state: <sha/estado|UNKNOWN>
  claim: <afirmação material>
  status: PASS|FAIL|UNKNOWN|BLOCKED|STALE|CONTRADICTION
  evidence_refs: []
  counterproof_refs: []
  belief_delta: <mudança útil|NONE>
  future_guard: <vacina reutilizável|NONE>
  supersedes: <evento anterior|NONE>
  next_cursor: <cursor|UNKNOWN>
```

## 4. Dedupe e compressão semântica

A chave determinística é preferida à semelhança textual:

```text
TIME_EVENT_KEY = SHA256(
  mission_id | scope | owner | event_type | head_or_state | evidence_digest
)
```

```text
BYTE/TIME_EVENT_KEY IGUAL
→ PROCESS_ONCE
→ KEEP_ALL_PROVENANCE
```

Similaridade semântica, vetores, aliases e distância textual podem localizar candidatos, mas nunca promovem fatos:

```text
SEMANTIC_SIMILARITY = DISCOVERY_HINT
SEMANTIC_SIMILARITY != AUTHORITY
```

`SAME_VALUE(a,b)` só é admissível se owner, scope, classe de autoridade e invariantes materiais forem compatíveis e não existir contradição. Um limiar numérico isolado não é lei canônica.

## 5. Passado → presente → futuro

```text
PASSADO
→ assinatura causal
→ owner atual
→ remeasure
→ teste discriminante
→ menor delta
→ contraprova
→ aprendizado
→ future_guard
```

O passado ilumina a estrada; não governa o presente.

## 6. O Jornal não pode mover o relógio a cada notícia

Falha observada: alterações documentais repetidas podem mover o HEAD enquanto uma bateria de prova ainda está em andamento, tornando receipts anteriores `STALE`.

Portanto:

```text
COMMIT_PER_EVENT=false
COMMIT_PER_MESSAGE=false
COALESCE_SAME_SESSION_SAME_SCOPE=true
CHECKPOINT_FLUSH=true
FREEZE_CANDIDATE_HEAD_DURING_SAME_HEAD_GATES=true
HEAD_CHANGED_DURING_PROOF => STALE + REMEASURE
```

O audit trail pode receber fatos conforme o owner existente permitir; a projeção humana deve agrupar eventos e só gerar mutação versionada em checkpoint material.

## 7. Ligação com os cérebros existentes

O Jornal não é terceiro cérebro. Ele é uma projeção consultável do mesmo rastro:

```text
SOUL / regras
    ↓
Master Cycle / execução
    ↓
Audit Facts + receipts + Git lineage
    ├─ Metacognição
    ├─ Dream Review / Memory-Linker
    ├─ BRAIN_VAULT / GraphRAG
    └─ TEMPORAL_JOURNAL_PROJECTION
                ↓
         próximo executor
```

Primeiro e segundo cérebro podem indexar a projeção, mas `MEMORY != REALITY`.

## 8. Estradas dos gatilhos

```text
#ACORDAR
→ !CENTRALDARK
→ REMEASURE
→ !CALIBRAR
→ !MULTIBUSSOLA
→ RENDEZVOUS
→ OWNER EXISTENTE
→ DELTA ÚTIL
→ ONE WRITER
→ TESTE
→ META LUPA
→ CONTRAPROVA
→ REALITY JUDGE
→ CI SAME HEAD
→ FIXED POINT
→ LAST_GOOD_STATE
→ 🔒
```

Em desvio:

```text
🔴
→ ↩️ EXATAMENTE 1 CASA
→ revalidar predecessor
→ mesmo owner corrige
→ teste
→ contraprova
→ retoma a mesma intenção
```

## 9. Sobrevivência / receiver dos verdes

Arquitetura compatível:

```text
PROMOTED MAIN
+ SAME-HEAD PROOF
+ RUNTIME PROOF APLICÁVEL
+ FIXED_POINT
+ LAST_GOOD_STATE
→ RECEIVER-ONLY BACKUP
```

Mas o receiver concreto só pode ser nomeado quando `remote/repository` for medido. Enquanto isso:

```text
SURVIVAL_REPO_DESIGN=VALID_CANDIDATE
SURVIVAL_REPO_IDENTITY=UNKNOWN_UNTIL_MEASURED
```

Backup não é source of truth e não recebe candidate, vermelho, cache ou secrets.

## 10. Regra do executor que atravessa o tempo

Ao chegar depois, qualquer executor deve conseguir descobrir sem adivinhar:

```text
ONDE A MISSÃO COMEÇOU?
QUAL INTENÇÃO NÃO MUDOU?
QUAL ÚLTIMO ESTADO PROVADO?
QUAL EVENTO O SUPERSEDEU?
QUAL ERRO JÁ FOI VACINADO?
QUAL HEAD/STATE FOI REALMENTE PROVADO?
QUAL É O NEXT_CURSOR?
```

Se não conseguir, `COGNITIVE_DEBT=OPEN`.

## 11. Estado desta cristalização

Este reference é `DOC/CONTRACT_CANDIDATE`. Sua presença em branch não prova runtime nem Fixed Point.

```text
PR_MAE=#1381
PRE_WRITE_HEAD=0a3b673a12482c367af38bf7c052e5eb13c751e7
CI_PRE_WRITE_HEAD=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

Após esta mutação, o HEAD deve ser remedido e toda prova same-head anterior deve ser tratada conforme validade do novo HEAD.
