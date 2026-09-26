# ENXAME ÔMEGA — Mapeamento de Braços T0..TN (Casa CentralDark)

> **Reconciliação, não criação.** O Enxame Ômega histórico (Overclock 10/07) era
> "leitores paralelos + consolidação". Isso JÁ existe na Casa como:
> - `kimetsu-legacy-operational-method` (leitores paralelos por design, ONE_WRITER, fixed point)
> - `hermes-core` (multi-session, Agent Host, BFF :8787 `/api/sessions`)
> - `SOUL.md` (orquestração de modelos, ONE_WRITER_PER_SCOPE)
>
> Este arquivo NÃO cria V2, router ou segundo orquestrador. Estende o owner.

## Identidade lógica estável (T-ID NÃO depende de PID)

| T-ID | Papel | Engine esperado | Workspace |
|------|-------|-----------------|-----------|
| T0 | SOL_ORCHESTRATOR | Hermes (perfil pivete) | E:\CentralDark\Pivete |
| T1..TN | WORKERS | Codex / Claude / Hermes CLI / VS Code terminal | varia |

PID é runtime observado. T-ID é estável (hash de workspace+engine).

## Registro runtime compartilhado

`ENXAME-OMEGA-REGISTRO.jsonl` — append-only. Cada braço escreve:

```json
{"TERMINAL_ID":"T1","ENGINE":"codex","PID":42264,"WORKSPACE":"E:/CentralDark/Pivete","STATE":"ACTIVE","MISSION_ID":"CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION","SNAPSHOT_ID":"snap_001","LAST_RECEIPT":"2026-08-27T18:00:00Z","FACTS":["x:y"],"EVIDENCE":["..."],"UNKNOWN":[],"CONTRADICTIONS":[],"COUNTERPROOF":["..."],"RESIDUAL":[],"VERDICT":"PASS"}
```

## CROSS_WINDOW_RENDEZVOUS

`scripts/enxame-omega-rendezvous.mjs` faz:
normalize → dedupe → detectar contradições → teste discriminante → reconciled snapshot → ONE_WRITER → mutação → remedição → fixed point.

Uso:
```bash
node scripts/enxame-omega-rendezvous.mjs --mission=CENTRALDARK_MULTIWINDOW_OMEGA_RECONCILIATION braço1.json braço2.json
# ou pipe:
cat braços.jsonl | node scripts/enxame-omega-rendezvous.mjs --stdin --mission=...
```

## Regras (do CONTRATO de Reconciliação)
- REUSE_BEFORE_CREATE / ONE_SYSTEM_ONLY / NO_PARALLEL_ORCHESTRATOR
- ONE_WRITER_PER_SCOPE / UNKNOWN_IS_NOT_PASS
- PRESERVE_CURRENT_WINDOWS / DO_NOT_KILL_STALLED_SESSION
- Sessão STALLED sem prova → marcar STALLED, excluir daquele rendezvous, não matar.

## FIXED_POINT_PASS
SAME_MISSION_ID + SAME_FINAL_SNAPSHOT_ID + UNKNOWN_MATERIAL=0 + NO_MATERIAL_CONTRADICTION + COUNTERPROOF_SURVIVES + ONE_WRITER_PER_SCOPE + T1_STABLE + REGRESSION_GATE=PASS
