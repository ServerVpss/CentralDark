# CentralDark — DELTAUTIL + Gemini Modal + Workspace/Plugin Fabric

Status: EXTENSION_OF_EXISTING_HUB_AND_DELTAUTIL

## Core

`!DELTAUTIL` is not a second master. External `!DELTAUTIL` enters `!CENTRALDARK`; inside master it becomes `DELTAUTIL_RECONCILE`.

Dense rule:

`INGEST -> SCRUB -> DEDUPE -> SCOPE -> DIGEST -> OWNER -> SCORE -> GEMINI(read-only) -> FALSIFIER -> PREVIEW -> ONE_WRITER -> TEST -> DOC_GATE -> RECEIPT`.

Grammar may shrink. Semantics/proof/authority/failure boundaries may not.
Verbose history remains available; compact semantic index accelerates recovery and does not replace lineage.

## Gemini Modal

Gemini is analyst, never writer/judge/installer. The modal is an admin surface for inspecting candidates without leaving CentralDark when the provider can be represented internally.

Shows: source/provenance, owner match, compatibility, evidence coverage, readiness, security-gate coverage, regression risk, projected gain (or UNKNOWN), conflicts, missing proof, before/after graph, tests and receipt preview.

Percentages are deterministic decision aids from measured fields. `PERCENT != PROOF`. `UNKNOWN != 0` and `UNKNOWN != 100`.

## Status/protection tokens

- 🟢 active/pass
- 🟡 pending/unknown
- 🔴 blocked/conflict
- 🔵 available/info
- ⚫ disabled

Color never carries meaning alone; text state is mandatory.
Protection percentage means coverage of known applicable gates, not absolute security.

## Workspaces / Plugins in HUB

Prefer internal native adapters. Safe iframe is allowed only when the provider's CSP `frame-ancestors` and `X-Frame-Options` permit embedding. Never bypass those controls.
If framing is unavailable, use a server-side API adapter and render a native CentralDark panel. If the provider requires interactive consent/login, perform the minimal one-time external authorization and return to the HUB.

Candidate sources: GitHub URL, Drive file, Markdown, ZIP, manifest, authorized webhook, local package.
Every install/import is dry-run first, mapped to an existing owner, attacked by falsifier, tested, documented and receipted. No parallel engine or second owner.

## UI principle

One admin surface, many workspaces/plugins/connections. Display aliases may change without changing canonical IDs or execution contracts.
