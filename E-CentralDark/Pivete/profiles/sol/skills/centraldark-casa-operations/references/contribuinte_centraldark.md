---
name: "contribuinte_centraldark"
description: "Modelos Hermes que contribuem com capabilidade — Codex, Claude, Copilot, apprentice."
version: "1.0.0"
author: "Pivete"
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, contribuinte, modelo, hermes, apprentice]
    related_skills: [centraldark-casa-operations, hermes-multi-profile-orchestration]
---

# Contribuintes Hermes — CentralDark

> Braços contribuintes são workers que executam sob orquestração de T0 (SOL_ORCHESTRATOR). Cada um tem identidade T-ID estável e contrato de receipt.

## Hermes Agent (T0 — SOL_ORCHESTRATOR)

- **Motor:** Hermes Agent (perfil pivete)
- **Função:** Orquestração, coordenação, consolidação, fixed point.
- **Identidade:** T0 = hash de (workspace + hermes)
- **Capabilidade:** Múltiplas sessões via `/api/sessions`, CLI, configuração.

## Codex (T1 — Worker)

- **Motor:** Codex CLI
- **Função:** Executar tarefas de escrita/codificação sob WRITER_SCOPE.
- **Identidade:** T1 = hash de (workspace + codex)
- **Capabilidade:** Editar código, criar commits, executar testes.
- **Contrato:** `WRITER_SCOPE + MINIMAL_DELTA + TEST_BEFORE_COMMIT`

## Claude (T2 — Worker)

- **Motor:** Claude Code CLI
- **Função:** Leitura crítica, revisão, debugging, contraprova.
- **Identidade:** T2 = hash de (workspace + claude)
- **Capabilidade:** Análise, revisão, contraprova, teste discriminante.
- **Contrato:** `CONTRAPROVA_BEFORE_CLOSE + TEST_CASE + VERDICT`

## GitHub Copilot (T3 — Worker)

- **Motor:** Copilot (extensão VS Code ou CLI)
- **Função:** Autocompletar, sugerir código, revisar.
- **Identidade:** T3 = hash de (workspace + copilot)
- **Capabilidade:** Sugestões de código, revisão inline.
- **Contrato:** `EVIDENCE_REF + VERIFY + MINIMAL_DELTA`

## Apprentice (T4..TN — Workers)

- **Motor:** Hermes Core `/api/sessions`
- **Função:** Tarefas específicas sob orquestração.
- **Identidade:** T4..TN = hash de (workspace + apprentice-type)
- **Capabilidade:** Executar tarefas delegadas por T0.
- **Contrato:** `DELEGATED_TASK + RECEIPT_STRUCTURED + NO_NEW_SYSTEM`

### Tipos de Apprentice

| T-ID | Tipo | Função |
|------|------|--------|
| T4 | apprentice-code | Escrever código |
| T5 | apprentice-test | Executar testes |
| T6 | apprentice-docs | Escrever documentação |
| T7 | apprentice-review | Revisar delta |
| T8 | apprentice-debug | Debugar problema |

---

## Contrato de Contribuição

```
T0 EMITE → MISSION_ID + INTENT + DESTINATION + PROOF_TARGET + MATERIAL_SCOPE
CONTRIBUITOR EXECUTA → FACTS + EVIDENCE + UNKNOWN + CONTRADICTIONS + COUNTERPROOF + RESIDUAL + VERDICT
T0 CONSOLIDA → receipts → fixed point
```

## Identidade Contribuinte

```
CONTRIBUITOR_ID = hash_sha256(workspace + engine_type)[:8]
PID = runtime observado
MISSION_ID = missão atual
```

## Proibições

- Não usar contribuinte sem HA BEFORE_CHANGE (rollback ready).
- Não criar contribuinte que substitui SOL_ORCHESTRATOR.
- Não executar escrita concorrente no mesmo escopo sem WRITER_HANDOFF.
- Não usar contribuinte sem REGISTRAR antes de alterar estado.
