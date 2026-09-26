---
name: centraldark-lupa-drift-guard
description: Blocks false Lupa drift; permits compatibility alias.
last_updated: 2026-08-27
---
# CentralDark Lupa Drift Guard

This skill updates the guard script (`scripts/lupa/detector_drift.py`) to treat directories named `tecnica-da-lupa` as a compatibility alias when the directory's `SKILL.md` declares `TECNICA_DA_LUPA_IS_SECOND_SKILL=false`. It prevents false drift detection and allows the CI to pass.

## References

- `scripts/lupa/detector_drift.py`
- `.agents/skills/tecnica-da-lupa/SKILL.md`
