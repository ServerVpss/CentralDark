# COMANDO - restructure-mode.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\usd-structure-assessment\references\apply-restructure\references\restructure-mode.md
**SHA:** e376867a211245ed
**Timestamp:** 2026-08-26T18:40:08.720717
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - `dry_run=true` emits a report and writes no USD files.

### Ouro Bruto (primeiros 5000 chars)
```
<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Restructure Mode

Use this reference for `apply-restructure` mode=`restructure` after
`restructure-decision` returns `proceed`.

## Internal-Reference Scan

Before finalizing boundaries, scan for internal `Sdf.Reference` objects with an
empty `assetPath` whose `primPath` escapes the candidate boundary. CAD/BIM
exports often place instance prims under a level or discipline and canonical
meshes/materials under sibling scopes such as `/A/Prototypes` or `/A/Looks`.

If an internal reference escapes the boundary, choose one branch and record it
in the dry-run plan:

- Promote the shared dependency to its own layer and sublayer it where needed.
- Inline the dependency into every boundary that needs it.
- Abort and recommend `optimize-as-is` when the dependency graph is too tangled
  to split cleanly.

## Input Validation

Confirm:

- `input_stage` exists and opens.
- `output_dir` exists and is not the input stage directory.
- Every boundary prim path exists.
- `dry_run=true` emits a report and writes no USD files.

## Dedupe Plan

When the plan includes `dedupe`, follow
`hierarchy-dedupe-rewrite-tool-spec.md` while materializing boundaries:

- Use the candidate report from `usd-hierarchy-dedupe-candidates`.
- Keep only user-approved, non-overlapping candidate groups.
- Prefer `external_prototype` unless the user explicitly chooses
  `internal_reference`.
- Inline local material bindings and UsdShade networks that cross the boundary
  unless the user asks to preserve shared material-library dependencies.
- Set `instanceable=true` only for sites that passed instanceability checks.
- Record skipped groups and reasons in the manifest.

## Instanced Asset Extraction

When the boundary plan records `goal: extract_as_assets`, apply
the dedupe rules above (shared prototype, `instanceable=true` for passing
sites) AND structure each site using the
[reference-payload pattern](https://docs.omniverse.nvidia.com/usd/latest/learn-openusd/independent/asset-structure-principles.html#structuring-an-asset-interface):
the site's interface prim is referenced into the assembly, and heavy content is
behind a payload arc internal to that asset.

**Required structure per duplicate site:**

Each site becomes a self-contained asset with interface/payload separation:

```
site_N.inter.usd       (interface layer — kind, assetInfo, extent hints)
  └─ payloads = [@./site_N.pay.usd@]   (payload arc to heavy content)

site_N.pay.usd         (payload layer — reference to shared prototype)
  └─ references = [@./shared_prototype.usd@]
      instanceable = true   (when instancing-readiness gate passes for this group)
```

On the assembly root, reference each site's interface layer. The assembly
consumer can then selectively load/unload each site via standard payload
controls without affecting other sites or the shared prototype.

See the [VFI guide: Factory-Level Structuring](https://docs.omniverse.nvidia.com/vfi/latest/guide/factory-level-structuring.html)
for the broader factory/facility assembly pattern this follows.

Execution order:
1. Write shared prototypes first (one per dedupe group).
2. For each duplicate site on the assembly root:
   a. Create the interface + payload layers following the reference-payload
      pattern above.
   b. Set `instanceable=true` on the payload root prim only when
      `instancing-readiness` (see `restructure-decision/README.md`
      §"instancing-readiness gate") passes for that site's dedupe group.
   c. Reference the site's interface layer from the assembly root.
3. For unique (non-duplicate) boundary candidates, extract as independent
   payloads (standard decompose behavior — same interface/payload pattern,
   without instancing).
4. Validate all outputs per §"Authoring Requirements" below.

## Boundary Materialization

For each boundary, copy the subtree into a new prototype layer and replace the
original subtree on the assembly root with a reference to that prototype. When
dedupe selected duplicate hierarchy groups, write one prototype per approved
group and rewrite every duplicate site to reference it.

### Cross-Boundary Material Bindings

Before extracting a sub-hierarchy as a standalone payload, scan prims inside
the extraction boundary for material bindings that reference prims OUTSIDE the
boundary (e.g. `/Root/Materials/Metal_01` while the payload only contains
`/Root/Floor_1/Cabinet_01/...`).

When the payload is opened standalone (for validation per "Post-Restructure
Validation Strategy" or for SO per-payload ops), cross-boundary bindings become
unresolvable dangling references. This silently breaks `optimizeMaterials`,
material-binding validators, and `deduplicateGeometry` material-index grouping.

Apply the boundary plan's `material_policy` (top-level field, not just inside
`dedupe`):

- `inline_local_external` (default): copy the bound materia
```