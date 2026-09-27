# Sentinel — REUSE, não criar paralelo

O nome `vps-cleanroom-sentinel.mjs` fica como candidato, não como decisão.

Já há sobreposição histórica com:
- `sentinela-divergencias`
- VPS health checks
- Guardião
- `deploy_status`
- git guardrails
- gh-pull / sync

Delta útil:

```text
CANONICAL_MAIN_DIRTY
→ VIOLATION EVENT
→ localizar mission_id/writer/source
→ classificar todos os paths
→ não auto-apagar
→ não auto-commitar misturado
→ receipt
```

E a comparação:

```text
GITHUB_MAIN ↔ VPS_HEAD
```

deve ser agendada/reutilizada no owner existente se ainda não houver scheduler vivo.

```text
NEW_SENTINEL=false
EXTEND_EXISTING_OWNER=true
SENTINEL_ROLE=ASSERTION_AND_INCIDENT
SENTINEL_ROLE!=JANITOR
```
