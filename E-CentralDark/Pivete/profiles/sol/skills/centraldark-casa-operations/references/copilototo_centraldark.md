---
name: "copiloto_centraldark"
description: "Assistentes Copilot/GitHub Copilot como braços do Enxame Ômega CentralDark."
version: "1.0.0"
author: "Pivete"
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, copiloto, github, assistant, worker]
    related_skills: [centraldark-casa-operations, github-pr-workflow]
---

# Copilotos — Braços do Enxame Ômega

> GitHub Copilot e assistentes similares são **braços workers**, não orquestradores. Operam sob T0 (SOL_ORCHESTRATOR) com identidade T-ID estável e contrato de receipt.

## GitHub Copilot (T3 — Worker)

- **Motor:** GitHub Copilot (extensão VS Code)
- **Função:** Autocompletar, sugerir código, revisar.
- **Identidade:** T3 = hash de (workspace + copilot)
- **Capabilidade:** Sugestões de código, revisão inline, comentários.

### Configuração Mínima

```json
// .vscode/settings.json
{
  "copilot": {
    "enabled": true,
    "mode": "suggestion",
    "workspace": "E:/CentralDark/Pivete/CentralDark",
    "mission_id": "CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION"
  }
}
```

### Contrato

```
T0 EMITE → MISSION_ID + INTENT + DESTINATION + PROOF_TARGET + MATERIAL_SCOPE
COPILOT SUGERE → FACTS + EVIDENCE + VERDICT
T0 AVALIA → ACCEPT / REJECT / REQUEST_MORE
```

### Receipt

```json
{
  "TERMINAL_ID": "T3",
  "ENGINE": "copilot",
  "PID": 0,
  "WORKSPACE": "E:/CentralDark/Pivete/CentralDark",
  "STATE": "ACTIVE",
  "MISSION_ID": "CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION",
  "SNAPSHOT_ID": "snap_001",
  "LAST_RECEIPT": "2026-08-27T19:30:00Z",
  "FACTS": ["sugestão de código"],
  "EVIDENCE": ["copilot suggestion"],
  "UNKNOWN": [],
  "CONTRADICTIONS": [],
  "COUNTERPROOF": [],
  "RESIDUAL": [],
  "VERDICT": "PASS"
}
```

## Copilot como Braço de Teste

- **Função:** Executar testes, validar código sugerido.
- **Gate:** `TEST_CASE + EXPECTED + ACTUAL + VERDICT`
- **Prova:** receipt com `TEST_RESULTS`, `CONTRAPROVA`, `VERDICT`.

## Copilot como Braço de Revisão

- **Função:** Revisar delta, identificar risco, sugerir contraprova.
- **Gate:** `CONTRAPROVA_BEFORE_CLOSE = true`
- **Prova:** receipt com `CONTRADICTIONS[]`, `COUNTERPROOF[]`, `VERDICT`.

---

## Regra de Copilot

**REUSE_BEFORE_CREATE = true**
- Se Copilot já suporta tarefa, usar o owner existente.
- Não criar "segundo copilot" ou "Enxame Copilot V2".

**ONE_WRITER_PER_SCOPE = true**
- Copilot sugere, mas T0/Writer decide o que entra no escopo.
- Mutação concorrente bloqueada até handoff explícito.

**UNKNOWN_IS_NOT_PASS = true**
- Sugestão de Copilot sem evidência tangível não é PASS.
- Precisa de TEST_CASE + ACTUAL + VERDICT.

---

## Identidade do Copilot

```
COPILOT_ID = hash_sha256(workspace + "copilot")[:8]
PID = runtime observado (se applicable)
MISSION_ID = missão atual
```

## Contrato entre Copilot e T0

```
MESMA_MISSON_ID = true
MESMO_SNAPSHOT_ID = true
T0_EMITE_INTENÇÃO = true
COPILOT_EXECUTA = true
COPILOT_DEVOLVE_RECEIPT = true
```

## Proibições

- Não tratar Copilot como T0/SOL_ORCHESTRATOR.
- Não usar Copilot sem REGISTRAR receipt antes de alterar estado.
- Não executar escrita concorrente sem WRITER_HANDOFF.
- Não criar "segundo orquestrador" ou "Enxame Copilot V2".
