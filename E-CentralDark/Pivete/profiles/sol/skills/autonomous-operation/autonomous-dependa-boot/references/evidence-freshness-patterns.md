# Padrões de Evidência e Coordenação para Operação Autônoma Multi-Agente

## TIK_TAK — Evidência Temporalidade

**Regra central:** Evidência tem validade temporal. Medir muda estado. Perguntar sem necessidade envelhece evidência.

```text
MEDIU
→ AGE começa a contar

PERGUNTOU SEM NECESSIDADE
→ AGE aumenta

ESTADO MUDOU
→ PROVA ANTIGA = HISTORY

ANTES DE SENTENCIAR
→ REMEASURE
```

**Regras:**
- Não perguntar ao CHEFE aquilo que pode ser medido, descoberto, falsificado, ou já possui owner conhecido
- Após qualquer mutação: remeasure imediatamente, invalidate old proof, run counterproof
- Measurement stale = history, not valid for current pass
- "TIK TAK" = relógio também é músico da banda; perder tempo = perder compasso = prova vira história

**Stop conditions:**
- FIXED_POINT_PROVEN
- REAL_BLOCK_PROVEN

**Prohibited:**
- ASK_BEFORE_SEARCH
- ASK_BEFORE_MEASURE
- REUSE_STALE_PROOF
- DECLARE_PASS_FROM_ACTION_ONLY

---

## Multi-Agent Rendezvous Pattern (!CENTRALDARK)

### Trigger Universal
```yaml
UNIVERSAL_TRIGGER:
  syntax: "!CENTRALDARK::<INTENÇÃO>"
  bootstrap: [ACORDAR, CALIBRAR, CURRENT_REALITY, DELTAUTIL, OWNER_DISCOVERY]
  behavior:
    search_before_ask: true
    reuse_before_create: true
    continue_after_recoverable_failure: true
    switch_tool_or_route_when_proven_necessary: true
    preserve_lineage: true
    no_duplicate_engine: true
    no_restart_from_zero: true
```

### Role Negotiation
When dispatching same mission to multiple agents:

```text
MESMA INTENÇÃO
     ↓
AGENTE A → ROLE: READER (measure, search, classify, compare)
AGENTE B → ROLE: WRITER (apply_minimum_patch, requires owner_proven)
AGENTE C → ROLE: COUNTERPROOF (independently_test, falsify_result)
AGENTE D → ROLE: TESTER (validate, smoke_test, health_check)
     ↓
RENDEZVOUS
     ↓
REALITY_JUDGE
```

**Regras:**
- Cada agente descobre seu papel baseado no que melhor consegue provar
- Não competir por mesmo write scope
- ONE_WRITER_PER_SCOPE: max 1 escritor por escopo mutável
- Se outro writer estiver ativo no mesmo escopo: operar READ_ONLY, entregar delta ao writer vigente
- EXECUTOR_CANNOT_SELF_APPROVE
- JUDGE_DOES_NOT_MUTATE

### Rendezvous Output (cada agente publica)
- AGENT_ID
- ROLE
- MISSION_ID
- SCOPE
- HEAD_OBSERVED
- STATE_CURSOR
- MEASUREMENTS
- MATERIAL_DELTA
- BLOCKERS
- FILES_TOUCHED
- TEST_RESULT
- NEXT_CURSOR

### Conflict Resolution
```yaml
same_scope_multiple_writers:
  action:
    - STOP_EXTRA_WRITERS
    - COMPARE_DELTAS
    - SELECT_ONE_WRITER
    - ABSORB_USEFUL_DELTA
    - CONTINUE
```

---

## Writer Collision — Lição Prática

### O que aconteceu
Arquivo `scripts/health_check.sh` foi corrigido, testes passaram (17/17), e o arquivo **voltou ao estado quebrado** antes do commit. causa: writer collision real e recorrente.

### Raiz descoberta
Múltiplos writers simultâneos no mesmo arquivo:
- OneDrive sync service (OneDrive.exe, OneDrive.Sync.Service.exe) — sincronização de arquivo
- Múltiplos processos Hermes.exe (4392, 1692, 18272, 11760, 19676, 29200, 30956, 1696, 32956)
- Processos node.exe relacionados
- VS Code (PID 11040) com extensões relanciando terminal

### Lição
**Não basta saber que o arquivo mudou. Tem que saber qual escritor, processo e execução causaram a mudança.**

Conexão com traceability: cada escrita deve ser ligada a:
- writer_id
- process_id
- session_id
- trace_id
- commit/head

### Fluxo correto quando arquivo "volta ao estado quebrado"
1. **NÃO recorrigir cegamente** — isso é symptom treatment, não root cause
2. **Identificar quem está escrevendo** — processo, session, trace
3. **Coordenar com o writer real** — não competir, coordinar
4. **Se não há coordination possível** — READ_ONLY, entregar delta ao writer vigente
5. **Se writer é externo não controlável** (ex: OneDrive sync) — documentar como conhecido, não como erro do sistema

### Invariável
`ONE_WRITER_PER_SCOPE` não é só teoria — é sobre descobrir o writer real antes de agir.

---

## REUSE_BEFORE_CREATE — Enforcement Prático

### O que quase aconteceu
Agente estava prestes a criar `apps/observability/` do zero para rastreamento causal, quando existia already:
- `C:\CDSF\apps\modulos\fixed-point-fabric\`
- `apps/modulos/fixed-point-fabric/docs/STATE-LIBRARY.md`
- `apps/modulos/fixed-point-fabric/contracts/FIXED-POINT-FABRIC.yml`

### Fluxo correto (obrigatório antes de qualquer criação)
```text
1. RESOLVER REPOSITORIO LOCAL
2. MEDIR branch, HEAD, dirty state, Writer vigente
3. LER mecanismo existente de observabilidade/rastreamento
4. INSPECIONAR owner existente (STATE-LIBRARY.md, FIXED-POINT-FABRIC.yml, contracts/)
5. COMPARAR intenção nova contra sistema existente
6. SE capacidade já existe: NO_NEW_INFORMATION → NO_CHANGE
7. SE gap material: MINIMUM_DELTA no owner existente
8. Preserve ONE_WRITER_PER_SCOPE
9. Só criar novo componente se provar que nenhum owner existente comporta
```

### Invariáveis
- `REUSE_BEFORE_CREATE` → `MEASURE_EXISTING` → `FIND_OWNER` → `IDENTIFY_REAL_GAP` → `PATCH_IN_PLACE` → `TEST` → `COUNTERPROVE` → `REMEASURE`
- `DOCUMENTED != EXECUTED`
- `UNKNOWN != PASS`
- `NEW_FOLDER != SOLUTION`
- `PARALLEL_OBSERVABILITY = FAIL`

---

## Fixed Point — Definição Operacional

### O que é (e não é) fixed point
```text
FIXED_POINT = MAIN_GREEN_PROVEN + LOCAL_RUNTIME_PROVEN

NÃO É:
- Local tests green only
- PR green only
- Branch green only
- Merge executed only
- Old HEAD green
- Action without remeasure
```

### Condições obrigatórias (TODAS)
```yaml
require_all:
  MAIN_HEAD_MEASURED: true
  LOCAL_REMOTE_RECONCILED: true
  CI_GREEN_ON_EXACT_MAIN_HEAD: true
  REQUIRED_CHECKS_GREEN: true
  COUNTERPROOF_PASS: true
  MATERIAL_UNKNOWN: false
  GARIMPO_PENDING_MATERIAL: false
  RECEIPTS_WRITTEN: true
  LOCAL_SITE_DEPLOYED_HEALTHY: true  # se applicable
  LOCAL_SITE_UI_SMOKE_PASS: true      # se applicable
```

### Hard stop
Se fixed point não provado até hard_stop (ex: 07:00 local):
- DO NOT FAKE PASS
- Write overnight receipt
- Save all material deltas
- Save pending scopes, blockers, head observed, next cursor
- Status: BLOCKED_OR_IN_PROGRESS
- Stop safely

---

## Aplicação: Round-Trip de Traceabilidade

Quando implementando rastreamento causal, o critério final é round-trip:

```text
INTENÇÃO → MISSION → TRACE → REQUEST → SPAN → AGENTE → TOOL/API/RETRIEVAL → FONTE → EVIDÊNCIA → RESULTADO → RESPOSTA
```

E inverso:
```text
RESPOSTA ↑ EVIDÊNCIA ↑ AÇÃO ↑ REQUEST ↑ TRACE ↑ INTENÇÃO
```

Deve funcionar sem adivinhação. Se só pode ser respondido lendo texto humano manualmente, existe lacuna de observabilidade.

---

## Veredito da Sessão

**O que foi aprendido:**
1. TIK_TAK: evidência tem validade temporal; stale measurement = history
2. Multi-agent rendezvous consolida deltas, não compete
3. Writer collision real: identificar writer antes de recorrigir
4. REUSE_BEFORE_CREATE: medir existente antes de criar
5. Fixed point = MAIN_GREEN_PROVEN + local runtime proven

**O que foi evitado:**
- Criar `apps/observability/` do zero (existente em C:\CDSF)
- Competir com writer ativo no mesmo scope
- Declare PASS from stale measurement

**Próximo passo para sessões futuras:**
- Usar !CENTRALDARK YAML dispatch para multi-agente
- Aplicar TIK_TAK após qualquer mutação
- Identificar writer real antes de corrigir arquivo "volvendo ao estado quebrado"
- Medir existing observability antes de criar novo
