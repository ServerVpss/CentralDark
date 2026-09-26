---
name: "brazos_centraldark"
description: "Lista dos 14 braços do Enxame Ômega CentralDark — papéis, gatilhos e contratos."
version: "1.0.0"
author: "Pivete"
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, enxame, brazos, operacional]
    related_skills: [centraldark-casa-operations, kimetsu-legacy-operational-method]
---

# Braços do Enxame Ômega — Lista CentralDark

> Braços são **papéis operacionais**, não identidades concorrentes. Cada braço sabe quem é (T-ID), para qual missão age (MISSION_ID) e qual é o writier único por escopo.

## T0 — SOL_ORCHESTRATOR
- **Motor:** Hermes Agent (perfil pivete)
- **Função:** Coordena a missão, distribui intenção única, consolida receipts, declara fixed point.
- **Gatilho:** `#ACORDAR → !CALIBRAR → !MULTIBUSSOLA_META → !META_LUPA`
- **Contrato:** Emite UMA intenção para T1..TN. Não executa escrita concorrente.
- **Identidade:** T-ID = hash de (workspace + engine). PID é runtime observado.

## T1 — INSPETOR (Leitura/Percepção)
- **Função:** Ler, medir, reconceir estado antes de qualquer proposta.
- **Gate de entrada:** `READ_INTENT() → MEASURE_STATE() → SEPARATE_KNOWN_UNKNOWN()`
- **Prova mínima:** receipt com `FACTS[]`, `EVIDENCE[]`, `UNKNOWN[]`, `VERDICT`.

## T2 — REVISOAR (Leitura Crítica)
- **Função:** Revisar delta, identificar risco, sugerir contraprova.
- **Gate:** `CONTRAPROVA_BEFORE_CLOSE = true`
- **Prova:** receipt com `CONTRADICTIONS[]`, `COUNTERPROOF[]`, `VERDICT`.

## T3 — DEBUGGER (Causa Raiz)
- **Função:** Procurar causa raiz, rastrear dependência indireta.
- **Gate:** `ROOT_CAUSE_FOUND → MINIMAL_PATCH → RETEST`
- **Prova:** receipt com `EVIDENCE[]`, `FIX_MINIMAL`, `REGRESSION_CHECK`.

## T4 — TESTER (Validação)
- **Função:** Validar execução, provar que o alvo atingiu condição.
- **Gate:** `TEST_CASE + EXPECTED + ACTUAL + VERDICT`
- **Prova:** receipt com `TEST_RESULTS`, `CONTRAPROVA`, `VERDICT`.

## T5 — HERMES-CORE (Executor Local)
- **Função:** Executar ações locais autorizadas (leitura, escrita mínima, testes).
- **Gate:** `ONE_WRITER_PER_SCOPE + WRITER_SCOPE_CONFIRMED`
- **Prova:** diff, log, receipt.

## T6 — WRITER (Escritor Único)
- **Função:** Escrever código/config dentro do escopo autorizado.
- **Gate:** `WRITER_SCOPE + MINIMAL_DELTA + TEST_BEFORE_COMMIT`
- **Prova:** commit com diff, receipt, evidência de teste.

## T7 — JUDGE (Adversarial)
- **Função:** Tentar derrubar conclusão antes de fechamento.
- **Gate:** `ATTEMPT_FALSIFICATION + COUNTEREXAMPLE_SEARCH + BOUNDARY_TEST`
- **Prova:** receipt com `COUNTERPROOF`, `RESIDUAL`, `VERDICT`.

## T8 — SOL-PORTA (Gate de Entrada)
- **Função:** Validar gate de porta de entrada (continuidade, estilo, risco, política).
- **Gate:** `VERIFY_HEADER + VERIFY_INTENT + VERIFY_BOUNDARY`
- **Prova:** receipt com `CHECK_RESULTS`, `BLOCKED_REASONS`, `VERDICT`.

## T9 — AUTONOMIA (Promoção)
- **Função:** Verificar se PR/mudança está pronta para promoção.
- **Gate:** `FIXED_POINT_SEQUENCE: SOL→LUA→VENTO→PEDRA`
- **Prova:** receipt com `FIXED_POINT_EVALUATION`, `COUNTERPROOF`, `VERDICT`.

## T10 — Dependabot (Dependências)
- **Função:** Resolver/atualizar dependências com menor delta.
- **Gate:** `REUSE_BEFORE_CREATE + ONE_SYSTEM_ONLY + NO_NEW_SYSTEM`
- **Prova:** diff, receipt, teste.

## T11 — DOCS (Documentação)
- **Função:** Documentar decisão, receipt, aprendizado.
- **Gate:** `CONTRATO_DE_PROVA → REGISTRAR → CONSOLIDAR`
- **Prova:** arquivo com `BREATH`, `VERSE`, `TRIGGER`, `ACTION`, `OBSERVATION`, `EVIDENCE`, `VERDICT`.

## T12 — PROVE (Prova Tangível)
- **Função:** Gerar/verificar prova que o alvo atingiu objetivo.
- **Gate:** `EVIDENCE_REF + PROOF_TARGET + VERIFY`
- **Prova:** receipt com `PROOF`, `VERIFIED`, `VERDICT`.

## T13 — FIXED_POINT (Fechamento)
- **Função:** Declarar fixed point quando todas as 5 condições satisfeitas.
- **Gate:** `OBJECTIVE_CLOSED + COUNTERPROOF_SURVIVED + INVARIANTS_HOLD + NO_MATERIAL_UNKNOWN + NO_NEW_FAILURE`
- **Prova:** receipt com `FIXED_POINT=TRUE`, `RESIDUAL=[]`, `VERDICT=PASS`.

---

## Identidade dos Braços

```
T_ID = hash_sha256(workspace_path + engine_name)[:8]
PID  = runtime observado (pode mudar a cada sessão)
MISSION_ID = identificador único da missão
```

- PID **não** é identidade do braço. PID só é observação de runtime.
- T-ID é estável enquanto workspace + engine não mudam.

## Contrato entre Braços

```
MESMA_MISSON_ID = true
MESMO_SNAPSHOT_ID = true
MESMA_ORIGEM = true
MESMO_DESTINO = true
= MESMO_TRILHO
```

Braço sem delta útil não produz nova regra, PR, missão, memória ou arquitetura só para demonstrar atividade.

## Registro de Receipt (append-only)

Cada braço escreve 1 linha no registro runtime compartilhado por operação:

```json
{
  "TERMINAL_ID": "T1",
  "ENGINE": "codex",
  "PID": 42264,
  "WORKSPACE": "E:/CentralDark/Pivete/CentralDark",
  "STATE": "ACTIVE",
  "MISSION_ID": "CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION",
  "SNAPSHOT_ID": "snap_001",
  "LAST_RECEIPT": "2026-08-27T19:30:00Z",
  "FACTS": ["HEAD:f085e082d"],
  "EVIDENCE": ["tasklist"],
  "UNKNOWN": [],
  "CONTRADICTIONS": [],
  "COUNTERPROOF": ["reconciliado"],
  "RESIDUAL": [],
  "VERDICT": "PASS"
}
```

## Proibições

- Não matar sessão STALLED sem prova material obrigatória.
- Não usar PASS para técnica não executada.
- Não criar segundo orquestrador ou Enxame Ômega V2.
- Não inverter: Claude/Hermes não é T0 se o CHEFE designou Hermes como T0.
