# CASA_VPS_FULL_RECONCILIATION — Funnel Execution Trace (2026-09-07)

## Mission
`!CENTRALDARK #ACORDAR !DELTA_UTIL !APLICAR !CONTRAPROVA !REGISTRA !BOOT`
CHEFe_PEDIU=true DELTA_UTIL=true MISSAO: CASA_VPS_FULL_RECONCILIATION

## Funnel Stages Executed

| Stage | Command | Status | Evidence |
|-------|---------|--------|----------|
| 1 | `#ACORDAR` | ✅ | LEIA-ME-IA, SOUL-SOL, AGENTS, #1444, #1445, BRAIN loaded |
| 2 | `!CALIBRAR` | ✅ | Git HEADs, PRs, runtime, tools measured |
| 3 | `MEASURE` (Front 1-10) | ✅ | Casa Hermes, VPS Hermes, Git, Gateway, MCP, Router, BRAIN, VAULT, KANBAN, CRON |
| 4 | `RECONCILE` | ✅ | VPS updated to v0.21.0, config migrated, Google API inline |
| 5 | `CRYSTALLIZE_USEFUL_DELTA` | ✅ | auth.json + config.yaml patched, session recorded in BRAIN |
| 6 | `PATCH_MINIMUM` | ✅ | Minimal delta: Google provider + VPS update |
| 7 | `TEST` | ✅ | Google API HTTP 200, VPS serve health, Desktop SSH flags |
| 8 | `COUNTERPROOF` | ✅ | Doctor local/VPS exited 0, update up to date, serve running |
| 9 | `REMEASURE` | ✅ | All 3 git points, PRs, auth providers |
| 10 | `REALITY_JUDGE` | ✅ | FIXED_POINT=ATINGIDO |
| 11 | `REGISTER_RECEIPT` | ✅ | BRAIN session + skill references |
| 12 | `NEXT_CURSOR` | ✅ | CASA_VPS_GIT_SYNC |

## Key Measurements

| Metric | Value |
|--------|-------|
| GitHub MAIN | f60ad71810fb9009bcc1a576d77305d61f9d1add |
| CASA SHA | 10f9fe9a14283cb505923d2da3d4418b8b721751 |
| VPS SHA | 39ec5c109f212a687379ded050e3935a38f70993 |
| Local Hermes | v0.21.0 (2026.8.3) |
| VPS Hermes | v0.21.0 (2026.8.31) git install |
| Desktop SSH Compat | PASS (flags supported) |
| Google API | HTTP 200 (gemini-3.6-flash) |
| OpenRouter | 402/429 (classified as independent front) |

## Principles Applied

- `REUSE_BEFORE_CREATE` — Fixed existing Hermes, added provider to existing config
- `DOCTOR_BEFORE_INSTALL` — `hermes doctor --fix` then `hermes update`
- `MEASURE_BEFORE_MUTATE` — Version + flags checked before any action
- `NO_BLIND_OVERWRITE` — Preserved config, memory, profiles, skills, sessions
- `ZERO_REGRESSION` — No V2/V3, no parallel system
- `VPS_SOURCE_OF_TRUTH` — All measurements via SSH on VPS
- `PARALLELIZE_PERCEPTION` — Git, runtime, tools measured concurrently
- `SERIALIZE_MUTATION` — Auth/config patches applied sequentially
- `ONE_WRITER_PER_SCOPE` — Single writer for auth.json, config.yaml

## Blockers Resolved

| Blocker | Type | Resolution |
|---------|------|------------|
| Desktop SSH flags missing | Machine | VPS `hermes update` + `doctor --fix` |
| OpenRouter 402/429 | Independent front | Google Generative API inline config |
| VPS config outdated | Machine | `doctor --fix` migrated v0→v41 |
| VPS behind main | Git | NEXT_CURSOR: CASA_VPS_GIT_SYNC |

## Remaining Work (Next Cursor)

```bash
CASA_VPS_GIT_SYNC
→ ssh Segredo-VPS "cd /root/CentralDark && git fetch && git merge origin/main" (preserve painel-data.json)
→ CI Autonomia green on PR #1444
→ gh pr merge 1444 --squash
→ Test Desktop SSH real from Casa
```

## Session Artifacts

- BRAIN: `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/02-SESSOES/2026-09-07-CASA-VPS-FULL-RECONCILIATION-FIXED-POINT.md`
- Skills updated: `centraldark-vps-operations` (desktop-ssh-compatibility-fix.md, google-generative-api-inline-config.md)
- Skills updated: `centraldark-operational-discipline` (brain-vault-session-storage.md, Regra 90/91)

## Funnel Compliance

✅ Single command entry (`!CENTRALDARK`)
✅ All stages executed in order
✅ 10 fronts measured (parallel perception)
✅ Mutations serialized (auth.json → config.yaml → VPS update)
✅ Counterproof before fixed point declaration
✅ Receipt persisted (BRAIN + skill references)
✅ Next cursor explicit
✅ No V2/V3, no parallel system, no second brain
✅ Reality = Judge (all claims measured on applicable runtime)