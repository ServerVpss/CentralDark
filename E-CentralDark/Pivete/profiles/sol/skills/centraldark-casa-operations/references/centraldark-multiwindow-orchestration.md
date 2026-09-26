---
name: centraldark-multiwindow-orchestration
description: >
  Multi-window orchestration pattern for CentralDark: T0=SOL_ORCHESTRATOR (Hermes),
  T1..TN=WORKERS (Claude/Codex/other), shared runtime registry, cross-window rendezvous,
  ONE_WRITER_PER_SCOPE, fixed-point closure. Use when the user wants VS Code windows/
  terminals to become identifiable arms of a single CentralDark mission, or says
  "Bota no HERMES, Claude pode ficar como braço".
version: "1.0.0"
author: Pivete
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, multiwindow, orchestration, enxame, omega, ownership]
    related_skills: [centraldark-casa-operations, kimetsu-legacy-operational-method, hermes-multi-profile-orchestration]
---

# CentralDark Multi-Window Orchestration — Pattern

## When to Use

- User wants VS Code windows/terminals to become **identifiable arms of one CentralDark mission**.
- User invokes or implies the `CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION` pattern.
- User says "Bota no HERMES, porque isso é execução/configuração local. Claude pode ficar como braço."

## Ownership Rule (non-negotiable)

```
HERMES = T0 / SOL_ORCHESTRATOR  (executa, coordena, gera configuração local)
CLAUDE / CODEX / OUTRO = T1..TN  (braços/workers subordinados, não orquestradores)
```

The user's explicit rule: Hermes does the work; Claude is an arm. Never invert this. If the host happens to be Claude/Cowork, that session still plays the Hermes-Casa role locally, but Hermes remains the one that produces local config/execution — the other model is a worker in the multi-window picture, not the owner of orchestration.

## Pattern Skeleton

```
T0 = SOL_ORCHESTRATOR  (Hermes Agent, perfil pivete, sessão local)
T1..TN = WORKERS       (Claude, Codex, OpenAI, outro Hermes, etc.)

MISSION_ID  = identificador único da missão
SNAPSHOT_ID = versão do estado reconciliado
T-ID        = hash(workspace + engine)[:8]   // identidade ESTÁVEL
PID         = runtime observado               // pode mudar por sessão
```

- **PID não é identidade.** T-ID é o que identifica o braço; PID é só observação.
- Cada braço recebe a **mesma intenção única** de T0: `MISSION_ID, INTENT, DESTINATION, PROOF_TARGET, MATERIAL_SCOPE, SNAPSHOT_ID`.
- Cada braço devolve **receipt estruturado**: `FACTS, EVIDENCE, UNKNOWN, CONTRADICTIONS, COUNTERPROOF, RESIDUAL, VERDICT`.

## Shared Runtime Registry

Do not rely on chat memory to tie windows together. Use a file both sides podem ler:

Local recommended path: `E:\CentralDark\Pivete\runtime\enxame-registry.json` (ou jsonl append-only).

Minimum registry content:

```json
{
  "mission": {
    "MISSION_ID": "CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION",
    "INTENT": "...",
    "DESTINATION": "E:/CentralDark/Pivete",
    "PROOF_TARGET": "...",
    "MATERIAL_SCOPE": "E:/CentralDark/Pivete",
    "SNAPSHOT_ID": "snap_001",
    "CREATED_AT": "2026-08-27T19:32:00Z"
  },
  "arms": [
    {
      "T_ID": "T0",
      "ROLE": "SOL_ORCHESTRATOR",
      "ENGINE": "hermes",
      "PID": 19040,
      "WORKSPACE": "E:/CentralDark/Pivete/CentralDark",
      "STATE": "ACTIVE",
      "MISSION_ID": "CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION",
      "SNAPSHOT_ID": "snap_001",
      "LAST_RECEIPT": "2026-08-27T19:32:00Z",
      "PORT": 8787,
      "PROFILE": "pivete"
    }
  ],
  "workers": [],
  "version": "1.0.0",
  "updated_at": "2026-08-27T19:32:00Z"
}
```

## Cross-Window Rendezvous

Periodically, when multiple arms have recebido/respondido:

1. **normalize** — mesmo formato de receipt.
2. **dedupe** — `TERMINAL_ID@SNAPSHOT_ID`.
3. **detect contradictions** — mesma `FACT`, valor diferente entre braços.
4. **run discriminating test** when contradiction is material.
5. **reconciled snapshot**.
6. **ONE_WRITER** — serializa mutação no escopo.
7. **remediation** when needed.
8. **fixed-point eval** at the end.

## Integration with the 17-Breathing Method

- **CONCENTRAÇÃO TOTAL** — kernel before/after any breathing.
- **SOL** — orquestração quando visão global necessária.
- **LUA** — contraprova antes do fechamento.
- **FIXED_POINT** — quando as 5 condições estiverem TRUE.

The breathing method is the preferred mode of operation here; the multi-window orchestration is the scenario, not a separate method.

## Local Setup Moves (what "botar no HERMES" tends to require)

1. Verificar extensão Hermes no VS Code: `code --list-extensions | grep -i hermes`.
2. Se ausente, usar CLI Hermes + launcher script em vez de extensão VS Code.
3. Se `.vscode/{settings,tasks,launch}.json` ou `.code-workspace` não existirem, criá-los via script/Hermes, não manualmente.
4. Usar `hermes project` ou `code -n` para abrir/workspace multi-pasta quando útil.
5. Usar `hermes-multi-profile-orchestration` skill como owner quando a questão for múltiplos perfis Hermes isolados.

## Pitfalls

- **Achar arquivo ausente no workspace root e parar.** Se o arquivo não está na raiz do workspace, medir a árvore alvo antes de concluir que não existe — `search_files` com path filter ou `ls` do diretório correto. O erro é "path errado", não "arquivo inexistente".
- **Usar PID como T-ID.** PID muda por sessão; T-ID deve ser estável.
- **Inverter dono.** Tratar Claude como T0 quando o usuário disse "no HERMES". Hermes é o orquestrador.
- **Segundo orquestrador.** Não criar "Enxame Ômega V2", router novo ou sistema paralelo; estender owner existente (`kimetsu-legacy-operational-method` + Hermes + `hermes-multi-profile-orchestration`).
- **STALLED sem prova material.** Não matar sessão stalled sem prova; marcar STALLED e excluir do rendezvous.

## Fixed-Point Pass Conditions

```
SAME_MISSION_ID=true
SAME_FINAL_SNAPSHOT_ID=true
REQUIRED_BEARINGS_COVERED=true
UNKNOWN_MATERIAL=0
NO_MATERIAL_CONTRADICTION=true
COUNTERPROOF_SURVIVES=true
ONE_WRITER_PER_SCOPE=true
T1_STABLE=true
REGRESSION_GATE=PASS
```

## Related

- `centraldark-casa-operations` — skill umbrella
- `kimetsu-legacy-operational-method` — 17-breathing method (padrão de operação)
- `hermes-multi-profile-orchestration` — múltiplos perfis Hermes isolados
