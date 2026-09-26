---
name: lupa-compatibility-guard
title: Lupa Compatibility Guard
description: Manages alias dirs in Lupa Drift Guard
skill-type: guard
version: 1.0
---

**Description**

The guard script `scripts/lupa/detector_drift.py` blocks any folder named `tecnica‑da‑lupa`, `metalupa‑bayesiana‑canônica`, or `lupa‑premium`. However, a compatibility alias directory `tecnica‑da‑lupa` (declared with `TECNICA_DA_LUPA_IS_SECOND_SKILL=false` in its `SKILL.md`) should be ignored during the guard check.

This skill records the patch and provides a reference document that explains how the guard has been updated.

**Usage**

* The skill is automatically used when the `detector_drift.py` guard is executed.
* See `references/guard-lupa-compatibility.md` for the actual patch content and verification steps.
