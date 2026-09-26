# COMANDO - validate-usd-asset-validator.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\usd-validation-runner\references\validate-usd-asset-validator.md
**SHA:** c28b65af766f910e
**Timestamp:** 2026-08-26T18:40:10.142067
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- Minimal Kit pattern:

### Ouro Bruto (primeiros 5000 chars)
```
<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Validate USD Asset Validator

## Purpose

Use this validation reference when a stage or asset needs executable NVIDIA
Omniverse Asset Validator coverage. This is a validation-only reference: it
reports issues and recommended next steps, but does not apply fixes unless
explicitly requested.

## Prerequisites

- Run `setup-usd-performance-tuning` first to select a Kit or standalone validation runtime.
- Confirm the target is a USD asset path or asset directory. If basic USD
  viability is unknown, first perform the runner's minimum-openability check:
  stage opens, root/default prim is valid enough for the task, asset paths
  resolve, and scale/up-axis metadata is known or recorded as missing.
- Require either a Kit runtime with `omni.asset_validator.core` or a standalone `omniverse-asset-validator` environment. Install or select a runtime before reporting `blocked_missing_dependency`.
- For unknown, customer-scale, or structurally large assets, require explicit
  user approval before running the default full-stage Asset Validator rule set.
  The default path is minimum-openability plus targeted rules/categories.

## Runtime Selection

First resolve the runtime with `setup-usd-performance-tuning`. There are two
supported paths:

- **Kit path**: use the selected Kit/USD Composer/Kit venv runtime and run
  Asset Validator through `omni.asset_validator.core` inside that same Kit
  process. Do not require `uv` or `omni_asset_validate` on `PATH` for this path.
- **Standalone path**: use a project-managed `omniverse-asset-validator`
  environment. If that standalone environment is missing, invoke
  `install-asset-validator-standalone`.

Do not use the Scene Optimizer package's bundled
`validator-venv/bin/omni_asset_validate` as the preferred Asset Validator
runtime. That venv is package-local and has been observed without `numpy`,
which can make validation much slower on large USD stages. Prefer a
project-managed environment that can import both `omniverse-asset-validator`
and the selected Scene Optimizer package.

Report `blocked_missing_dependency` only when neither path is available and the
missing runtime cannot be installed or selected.

## Kit Path

Use this path when setup returned `ready-kit`, when SO validators are needed, or
when validating remote `omniverse://` assets from the same authenticated Kit
runtime.

> **Standalone is the preferred runtime.** The standalone path is lighter (no
> Kit overhead), deterministic, and achieves the same validator coverage: SO
> validators auto-register via `@register_rule` decorators when both
> `omniverse-asset-validator` and the SO package are importable in the same
> Python environment. Fall back to Kit when standalone is unavailable or when
> render-time profiling is needed (Kit-only capability).

1. Use the Python launcher selected by setup:
   - Classic Windows Kit: `<kit>\python.bat`
   - Classic Linux Kit: `<kit>/python.sh` or `<kit>/python`
   - Windows Kit venv: `<venv>\Scripts\python.exe`
   - Linux Kit venv: `<venv>/bin/python`
2. Set `OMNI_KIT_ACCEPT_EULA=yes`.
3. Start Kit with `--no-window` and `--enable omni.asset_validator.core`.
4. Validate through `omni.asset_validator.core.ValidationEngine`.

Minimal Kit pattern:

```python
import os

os.environ.setdefault("OMNI_KIT_ACCEPT_EULA", "yes")

try:
    from kit_app import KitApp
except ImportError:
    from omni.kit_app import KitApp

app = KitApp()
app.startup(["--no-window", "--enable", "omni.asset_validator.core"])

from omni.asset_validator.core import ValidationEngine

asset_abs = "/path/to/asset.usd"
engine = ValidationEngine()
engine.disable_all_rules()
engine.enable_rules("omni.asset_validator.DefaultPlugin.StageMetadataChecker")
results = engine.validate(asset_abs)
issues = results.issues() if callable(results.issues) else results.issues

print("ASSET_VALIDATOR_ISSUES", len(issues))
app.shutdown()
```

If Scene Optimizer performance validators are also required, use
`so-run-validators` after setup verifies `omni.scene.optimizer.core` in the same
Kit runtime.

## Standalone Path

Use this path when the user chooses standalone validation or no Kit runtime is
available. Use a project-managed `omniverse-asset-validator` install created or
verified by `install-asset-validator-standalone` in the same venv where the SO
package is on PYTHONPATH. SO validators auto-register via `@register_rule`
decorators: no manual `register_all()` call is needed for rule discovery. For
targeted or category-scoped runs, select registered rule classes with
`CategoryRuleRegistry` and enable them with `ValidationEngine(init_rules=False)`
plus `enable_rule()`.

Do not use the SO bundled `validator-venv` — it may lack `numpy` and is
slower on large stages.

## Workflow

1. Confirm the input is a USD asset path or an asset directory.
2. Confirm the minimum-openability check h
```