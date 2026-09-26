# Guard‑Lupa‑Compatibility Reference

**Location**: `scripts/lupa/detector_drift.py`

### Problem
The guard script blocks any directory named `tecnica‑da‑lupa`, `metalupa‑bayesiana‑canônica`, or `lupa‑premium`. However, a compatibility alias directory `tecnica‑da‑lupa` (declared with `TECNICA_DA_LUPA_IS_SECOND_SKILL=false` in its `SKILL.md`) should be ignored during the guard check.

### Fix
Add a check before treating `tecnica‑da‑lupa` as forbidden:

```python
if nome in PROIBIDOS_EXATOS:
    # Skip alias if marked as redirect
    alias_path = d / "SKILL.md"
    if alias_path.exists() and "TECNICA_DA_LUPA_IS_SECOND_SKILL=false" in alias_path.read_text():
        continue
    erros.append(f"SKILL_REMOVIDA_REAPARECEU: {d.relative_to(ROOT)}")
```

### Verification
1. Run the `lupa‑drift‑guard.yml` workflow against a PR that contains the alias. It should now pass.
2. Run against a folder `tecnica‑da‑lupa` without the flag; it should still be blocked.
