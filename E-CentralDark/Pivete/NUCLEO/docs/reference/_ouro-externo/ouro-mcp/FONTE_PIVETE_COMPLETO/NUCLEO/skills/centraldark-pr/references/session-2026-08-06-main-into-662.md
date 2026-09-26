# Session 2026-08-06 — main into open PR #662

Companion to `pr-integrate-main-into-open-pr.md` and  
`deterministic-casa-ops/references/pr662-integracao-679-merge-preservador.md`.

## Outcome
- #679 already on main (self-hosted CI fallback).
- #662 integrated **locally** via history-preserving merge in temp WT.
- No force-push, no PR merge, no deploy.
- Real PR worktree left dirty/untouched.

## Resume gate
Only on explicit push authorization from Pivete.  
Do not “just verify” after PARE.
