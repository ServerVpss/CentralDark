---
title: "UNKNOWN rastreável — META-START-LINK + DELTA_UTIL"
status: "CRYSTALLIZED"
date: 2026-11-09
category: "RECEIPT"
sensitivity: INTERNAL
owner: "ServerVpss/CentralDark/.agents/skills/centraldark-operational-method"
writer: "HERMES"
source_rule: "UNKNOWN != PASS; DOCUMENTED != EXECUTED"
---

# Receipt — UNKNOWN rastreável

## Intenção

Evitar que uma pendência seja abandonada apenas porque foi classificada como
`UNKNOWN`. Quando houver rota legítima de leitura, a investigação deve seguir
até `FIXED_POINT` ou deixar um próximo teste executável e rastreável.

## Owner reutilizado

```text
CANONICAL_OWNER=.agents/skills/centraldark-operational-method/SKILL.md
TRACE_HOOK=.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/META-START-LINK/GANCHO.md
CATALOG=docs/CONSCIENCIA/APRENDIZADOS.md + docs/CONSCIENCIA/LEMBRANCAS/
```

## Delta cristalizado

```text
UNKNOWN_CLASSIFICADO
→ DEFINIR_FATO_AUSENTE_E_CRITÉRIO_DISCRIMINANTE
→ RECUPERAR_OWNER/CATALOGO/LEMBRANCA/RECEIPT_EXISTENTE
→ MEDIR_ROTA_READ_ONLY_E_RUNTIME_ATUAL
→ CONTRAPROVA_INDEPENDENTE
→ DELTA_UTIL_NO_OWNER_EXISTENTE
→ RECEIPT + NEXT_CURSOR
→ FIXED_POINT OU PENDÊNCIA EXPLÍCITA
```

A regra preserva `POSIÇÃO → DIREÇÃO → PROVENIÊNCIA → DELTA → CONFIANÇA →
CURSOR`. GPS, presença, logs, HUD, monitor e outros sensores são evidência ou
direção; nenhum deles é autoridade isoladamente.

## Guardrails

- Não criar watcher, scheduler, agente, router ou loop contínuo por inferência.
- Para monitoramento contínuo, exigir intenção, owner, processo/scheduler vivo,
  escopo, retenção e readback.
- Separar `SENSOR_PRESENT`, `ROUTE_REACHABLE`, `RUNTIME_PROVED` e `UNKNOWN`.
- Só promover `DELTA_UTIL` após contraprova.
- Preservar histórico, worktree sujo e um writer por escopo.

## Evidência de leitura

```text
CATALOGO.md: roteia intenção → workspace → executor → assignee → runs → efeito.
META-START-LINK/GANCHO.md: define conexão, proveniência, delta, confiança e cursor.
CENTRALDARK_AI_BOOT.yaml: exige re-medição, TLC23, delta útil, receipt e cursor.
AGENTS.md: define !DELTAUTIL como menor delta no owner existente.
```

## Resultado

```text
RULE_WRITTEN=PASS
OWNER_REUSED=PASS
PARALLEL_ARCHITECTURE=FORBIDDEN
READ_ONLY_DISCOVERY=REQUIRED
COUNTERPROOF=REQUIRED
RUNTIME_MONITORING=NOT_ACTIVATED
```

## NEXT_CURSOR

```text
APPLY_UNKNOWN_TRACE_TO_NEXT_PENDING_ITEM
CLASSIFY_OWNER_AND_DISCRIMINANT
RUN_READ_ONLY_PROBE
WRITE_ONLY_SURVIVING_DELTA_UTIL
READBACK_RECEIPT_AND_RUNTIME
```
