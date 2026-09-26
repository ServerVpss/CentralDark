# HEAD truth queue + Writer gate (2026-08-06)

## Mission order (Pivete — less is more, zero false green)

```text
1. #664  Writer fixture + activation boundary (UNKNOWN_LEGACY ≠ PASS)
2. #662  rebase/update vs main, wire Writer gate + migration rule, re-run all gates
3. #663  only after new authority; autonomy + fail-closed again
4. #646  reconcile HEAD vs receipt, bundle checksum, retire temp promoter, then MetaLupa final
5. #648  reconcile receipt vs HEAD; local ponto-fixo → ROTATE_CHALLENGE; prove Hermes load + one real turn
6. MEGA PAINEL  live capsule card (HEAD, iteration, gain, regression, false-green, XP) — drop static overallProgress
```

Do not skip truth layer (Writer/HEAD/receipts/panel).

## PR #664 — proven fix (a61abaff4)

- Branch: `fix/writer-unico-gate-deterministico-20260806`
- Files: `scripts/lupa/validar-escritor-unico.mjs` + `.test.mjs`
- CI was `SECRET_SUSPECT_BLOCKED` from fixture literal `ghp_AA...AAAA` in patch text
- Fix: runtime-assembled credential shape; `pr_secret_scan` → secret_suspect=false
- Modes: enforce (missing trailer FAIL) | legacy (UNKNOWN_LEGACY, exit 1, not PASS)
- After push: Gates determinísticos PASS; SKIPPED CodeQL ≠ PASS; CodeRabbit pending ≠ fail
- Detail: pr-auditing `references/writer-gate-secret-fixture-664.md`

## Authority labels

- Protected gates: authenticated `permito-segredo` / PERMITO SEGREDO (SEGREDO/CHEFE)
- `permito-pivete` may remain historical; do not treat as SEGREDO authority on protected workflows
- Body `WRITER=` is not machine proof — need commit trailer `Writer: <slug>`

## Operational

- Worktree isolated for PR patches; no force-push; no VPS
- MAIN_HEAD reference used in calibration: `74670835f30b1e4006df452a13ae01cc0931dd37` (verify live with `git rev-parse origin/main`)
- Local clone may sit on other feature branch — always measure origin/main and PR head OIDs
