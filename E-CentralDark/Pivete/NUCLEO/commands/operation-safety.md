# COMANDO - operation-safety.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\so-run-operations\references\operation-safety.md
**SHA:** e3d5d00c4a3ebc16
**Timestamp:** 2026-08-26T18:40:07.367620
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ### Anti-pattern: rate-framing
- ### Anti-pattern: improvised option sets
- ### Anti-pattern: silent deferral of destructive ops

### Ouro Bruto (primeiros 5000 chars)
```
<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Operation Safety

Use this reference before running any Scene Optimizer chain that may delete,
collapse, regenerate, or otherwise irreversibly change authored content.
Scene Optimizer operation mechanics are owned by upstream
[usd-optimize](https://github.com/NVIDIA-omniverse/usd-optimize/) and the
prebuilt Scene Optimizer package. Resolve guidance from an extracted package
root via `$SCENE_OPTIMIZER_PACKAGE_ROOT`, then `$SO_HOME`. If no package
root exists, download/extract the published `scene_optimizer_core_...release.zip`
package (direct archive URLs are in `references/upstreams/usd-optimize.md`) or
use the package path, URL, or extracted root supplied by the user. Do not clone the
source repo just to read SO guidance. This file owns only the digitaltwin
approval gate and confirmation focus.

## Confirmation Prompt

Always prepend the full runtime context block from
`skills/omniverse-usd-performance-tuning/references/setup-usd-performance-tuning/references/runtime-context-header.md`
Format A. A destructive-op approval must name the Kit application, Scene
Optimizer version, and Asset Validator version that will mutate the stage.

## Parameter Prerequisites Gate

Before composing the confirmation prompt for any destructive or bounded-loss
operation, read its YAML frontmatter `parameter_prerequisites` block (in
`references/operations/<key>.md`).

For each entry:

- **`field:` entries with `required: true`** — verify the named field exists in
  the SA report (`asset_physical_context` section) or `setup-preflight.json`. If
  missing, **BLOCK** with reason: `"asset preflight incomplete: missing {field}"`.
  Do not proceed to the confirmation prompt.
- **`field:` entries with `required: false`** — if present, use the value to
  enrich suggested defaults or context derivation. If absent, proceed normally;
  do not block.
- **`elicit_from_user:` entries** — include the `canonical_question` with its
  `defaults` as options in the single upfront confirmation prompt. Use the
  `conversion` formula to map the user's answer to the SO parameter. If a
  `context_derivation` is present and the referenced field is available, use
  it to suggest a default.
- **`skip_option`** — always offer the skip option. If the user selects it,
  remove that operation from the chain.
- **`default_option`** — if present, this is the pre-selected answer when the
  user doesn't express a preference. It does NOT remove the operation (unlike
  `skip_option`).

All `elicit_from_user` questions for a given operation MUST be batched into a
single prompt (the "single upfront prompt" pattern). Do not ask them as
separate mid-run gates.

### Anti-pattern: rate-framing

**Do not frame tolerance questions as "reduce by X%" or "how much to keep?"**
unless the user has explicitly provided a target reduction rate (memory budget,
LOD level target, explicit percentage).

The canonical framing is fidelity-budget: "what detail to preserve?" This maps
to `maxMeanError` which preserves silhouette quality proportional to the
specified tolerance.

Rate-mode (`reductionFactor` as primary stop) bypasses the silhouette-preserving
default and produces decisions the user cannot evaluate without first seeing
rendered output. It is acceptable ONLY when:

1. The user explicitly says "reduce to N triangles" or "keep X%", or
2. The workflow is LOD generation with known level targets.

### Anti-pattern: improvised option sets

Do not present options that don't trace to a `parameter_prerequisites` block
or a user-supplied constraint. If the agent is about to ask "10% or 25%?", the
contract says: "no — tolerance questions go through the `elicit_from_user`
template; rate questions require explicit user-supplied targets."

See also: `references/so-run-operations/references/units-and-tolerances.md` for
the shared unit conversion formula and parameter glossary.

List the destructive operations in the proposed chain, explain what each one
does, then ask for confirmation before invoking the runner.

## Destructive Or Bounded-Loss Operations

| Op | Risk | Confirmation focus |
|---|---|---|
| `findOccludedMeshes` → `removePrims` | Deletes internal geometry. | Two-stage: (1) approve T3 analysis cost on SA containment pairs, (2) approve deletion of discovered occluded prims. Exclude transparent enclosures. Runs FIRST in op chain. |
| `deduplicateHierarchies` | Replaces subtrees with instanceable references to shared prototypes. | Confirm dedupe-candidate groups (from hierarchy-dedupe-candidates report). Lossless but structural — changes composition topology. |
| `decimateMeshes` | Drops vertices. | mm tolerance (maxMeanError); applied uniformly to all meshes. See upstream `.agents/operations/decimateMeshes.md`. |
| `fitPrimitives` | Replaces mesh geometry with analytic primitives. | Analysis first and data-preservation intent; se
```