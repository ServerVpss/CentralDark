# COMANDO - ORG_DATA_UNIFICATION_SPEC.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\docs\ORG_DATA_UNIFICATION_SPEC.md
**SHA:** 4959db936ca91798
**Timestamp:** 2026-08-23T14:17:01.777294
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - Risk: scope creep into "sync every local output to cloud". Keep sync **opt-in per pipe**,

### Ouro Bruto (primeiros 5000 chars)
```
# Org data unification spec

<!-- doc-covers: crates/screenpipe-team-memory -->
<!-- doc-verified: 8c0d11e2f -->
> **Current.** Last verified against 8c0d11e2f (2026-06-12).

Status: proposal. Spans two repos: `screenpipe` (desktop/engine, this repo) and
`website-screenpipe` (cloud control plane + runner).

## Why

Two storage stacks, tuned to two different jobs, that should stay separate:

- **Local, per device**: `db.sqlite` (frames/ocr/audio/ui + FTS/vec) + `compact_monitor_*.mp4`
  video, served by the engine at `localhost:3030`. Optimized for one person, rich query,
  retain video.
- **Cloud, per org**: flat JSONL telemetry lake partitioned `device/hour` + rollup/meta index
  + SAF artifacts, in R2/Azure. Optimized for many people, cheap append, derived rollups.

Do **not** merge the engines — sqlite does not federate (30 employees = 30 dbs, not one
queryable org brain). Unify the three layers *above* storage instead:

1. **Artifact shape** — one SAF envelope, local and cloud.
2. **Query interface** — one contract, so a pipe runs unchanged local or cloud.
3. **On-demand frame fetch** — ship only the ~30 frames a SOP cites, not the firehose.

Sequencing: **P3 → P1 → P2** (hot ask first, then the shared envelope, then the big rock).

---

## P1 — Unified artifact shape (SAF everywhere)

### Current state
- Cloud has a real envelope: `Artifact` in
  `website-screenpipe/lib/enterprise/artifacts/types.ts:128` (`saf_version`, `artifact_id`,
  `version`, `kind`, `body`, `evidence: EvidenceRef[]`, `provenance`, `changelog`). Per-kind
  bodies (`SopBody.steps: ArtifactStep[]`) at `:106-122`.
- Local has a *different* shape: `OutputRecord` in
  `screenpipe/crates/screenpipe-db/src/types.rs:305` (`source`, `source_type`, `title`,
  `kind`, `output_path`, `preview`, `metadata`) served by
  `crates/screenpipe-engine/src/routes/outputs.rs`. It is a file registry, not a typed
  artifact. The desktop artifacts view renders these as markdown/plain files.

They don't match, so a device-authored SOP and a cloud-authored SOP can never share a
renderer or a list.

### Proposed change
1. **Shared SAF contract.** Lift the SAF types into one source of truth both repos consume.
   Cheapest: a published `@screenpipe/saf` types package (or vendored `saf.ts` in each repo
   plus a contract test that round-trips a golden envelope). No runtime dep, just types +
   validators.
2. **Local can emit SAF.** Add SAF as an *optional richer layer* over the existing outputs
   registry — do not remove plain files. Migration on `outputs`:
   ```sql
   ALTER TABLE outputs ADD COLUMN saf_kind   TEXT;     -- 'sop' | 'skill' | ... | NULL for plain files
   ALTER TABLE outputs ADD COLUMN artifact_id TEXT;    -- stable id for versioned artifacts
   ALTER TABLE outputs ADD COLUMN version     INTEGER; -- bumps on re-emit
   ```
   When a pipe writes `out/<artifact_id>.saf.json`, `auto_register_pipe_outputs`
   (`outputs.rs:408`) detects `saf_version`, validates, and fills these columns. Plain files
   keep `saf_kind = NULL` and behave exactly as today.
3. **One renderer.** The desktop artifacts view learns to render a SAF body (it already
   renders markdown; port the dashboard's `SopData` renderer from
   `website-screenpipe/app/account/workspace/enterprise-workflows-dashboard.tsx`). One
   component, both sides.
4. **Sync up (no transform).** A registered SAF output can be pushed to the org artifact
   store as-is (same envelope) via the existing artifacts POST
   (`app/api/enterprise/cloud-runner/artifacts/route.ts`). The org dashboard then lists
   device-authored + runner-authored artifacts together. Gate behind centralized-data policy.

### Compat / risk
- Additive migration; old rows and the `/outputs` API are untouched.
- SAF validation must be lenient on unknown `kind` (forward-compat) — the envelope rails are
  already kind-agnostic by design (`types.ts:16`).
- Risk: scope creep into "sync every local output to cloud". Keep sync **opt-in per pipe**,
  not automatic.

### Effort
~2-3 days: migration + detect/validate in `outputs.rs` + port one renderer + a contract test.

---

## P2 — One query interface (portable pipes)

### Current state — three different access patterns
- **Local pipes**: hit `localhost:3030` — `/search?content_type=…`, `/frames/{id}` (JPEG,
  `routes/frames.rs:45` `get_frame_data`), `/memories`, `/pipes`.
- **Cloud runner pipes**: `cat` raw `/org-data/{device}/{yyyy-mm-dd}-{hh}.jsonl` files off the
  VM disk (see the seed prompts in `enterprise-worker/pipes/*/pipe.md`).
- **Cloud HTTP**: a *third* surface already exists at
  `website-screenpipe/app/api/enterprise/v1/*` — `records`, `search`, `rollups`, `devices`,
  `files`, `pipes`. `v1/records` already mirrors local `/search` params (`device_id`, `kind`,
  time window, `limit`; see `v1/records/route.ts:14-19`).

So a pipe author must know *where* it runs. Code is forked between local and cloud.

### Proposed change
1. **Define the screenpipe query contract** (one doc, 
```

---

# COMANDO - ORG_DATA_UNIFICATION_SPEC.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\docs\ORG_DATA_UNIFICATION_SPEC.md
**SHA:** 4959db936ca91798067c497c8be0b68fe2f40cef1c388f74a30c6c963458ddb7
**Timestamp:** 2026-08-24T01:39:59.475987
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - Risk: scope creep into "sync every local output to cloud". Keep sync **opt-in per pipe**,

### Ouro Bruto (primeiros 5000 chars)
```
# Org data unification spec

<!-- doc-covers: crates/screenpipe-team-memory -->
<!-- doc-verified: 8c0d11e2f -->
> **Current.** Last verified against 8c0d11e2f (2026-06-12).

Status: proposal. Spans two repos: `screenpipe` (desktop/engine, this repo) and
`website-screenpipe` (cloud control plane + runner).

## Why

Two storage stacks, tuned to two different jobs, that should stay separate:

- **Local, per device**: `db.sqlite` (frames/ocr/audio/ui + FTS/vec) + `compact_monitor_*.mp4`
  video, served by the engine at `localhost:3030`. Optimized for one person, rich query,
  retain video.
- **Cloud, per org**: flat JSONL telemetry lake partitioned `device/hour` + rollup/meta index
  + SAF artifacts, in R2/Azure. Optimized for many people, cheap append, derived rollups.

Do **not** merge the engines — sqlite does not federate (30 employees = 30 dbs, not one
queryable org brain). Unify the three layers *above* storage instead:

1. **Artifact shape** — one SAF envelope, local and cloud.
2. **Query interface** — one contract, so a pipe runs unchanged local or cloud.
3. **On-demand frame fetch** — ship only the ~30 frames a SOP cites, not the firehose.

Sequencing: **P3 → P1 → P2** (hot ask first, then the shared envelope, then the big rock).

---

## P1 — Unified artifact shape (SAF everywhere)

### Current state
- Cloud has a real envelope: `Artifact` in
  `website-screenpipe/lib/enterprise/artifacts/types.ts:128` (`saf_version`, `artifact_id`,
  `version`, `kind`, `body`, `evidence: EvidenceRef[]`, `provenance`, `changelog`). Per-kind
  bodies (`SopBody.steps: ArtifactStep[]`) at `:106-122`.
- Local has a *different* shape: `OutputRecord` in
  `screenpipe/crates/screenpipe-db/src/types.rs:305` (`source`, `source_type`, `title`,
  `kind`, `output_path`, `preview`, `metadata`) served by
  `crates/screenpipe-engine/src/routes/outputs.rs`. It is a file registry, not a typed
  artifact. The desktop artifacts view renders these as markdown/plain files.

They don't match, so a device-authored SOP and a cloud-authored SOP can never share a
renderer or a list.

### Proposed change
1. **Shared SAF contract.** Lift the SAF types into one source of truth both repos consume.
   Cheapest: a published `@screenpipe/saf` types package (or vendored `saf.ts` in each repo
   plus a contract test that round-trips a golden envelope). No runtime dep, just types +
   validators.
2. **Local can emit SAF.** Add SAF as an *optional richer layer* over the existing outputs
   registry — do not remove plain files. Migration on `outputs`:
   ```sql
   ALTER TABLE outputs ADD COLUMN saf_kind   TEXT;     -- 'sop' | 'skill' | ... | NULL for plain files
   ALTER TABLE outputs ADD COLUMN artifact_id TEXT;    -- stable id for versioned artifacts
   ALTER TABLE outputs ADD COLUMN version     INTEGER; -- bumps on re-emit
   ```
   When a pipe writes `out/<artifact_id>.saf.json`, `auto_register_pipe_outputs`
   (`outputs.rs:408`) detects `saf_version`, validates, and fills these columns. Plain files
   keep `saf_kind = NULL` and behave exactly as today.
3. **One renderer.** The desktop artifacts view learns to render a SAF body (it already
   renders markdown; port the dashboard's `SopData` renderer from
   `website-screenpipe/app/account/workspace/enterprise-workflows-dashboard.tsx`). One
   component, both sides.
4. **Sync up (no transform).** A registered SAF output can be pushed to the org artifact
   store as-is (same envelope) via the existing artifacts POST
   (`app/api/enterprise/cloud-runner/artifacts/route.ts`). The org dashboard then lists
   device-authored + runner-authored artifacts together. Gate behind centralized-data policy.

### Compat / risk
- Additive migration; old rows and the `/outputs` API are untouched.
- SAF validation must be lenient on unknown `kind` (forward-compat) — the envelope rails are
  already kind-agnostic by design (`types.ts:16`).
- Risk: scope creep into "sync every local output to cloud". Keep sync **opt-in per pipe**,
  not automatic.

### Effort
~2-3 days: migration + detect/validate in `outputs.rs` + port one renderer + a contract test.

---

## P2 — One query interface (portable pipes)

### Current state — three different access patterns
- **Local pipes**: hit `localhost:3030` — `/search?content_type=…`, `/frames/{id}` (JPEG,
  `routes/frames.rs:45` `get_frame_data`), `/memories`, `/pipes`.
- **Cloud runner pipes**: `cat` raw `/org-data/{device}/{yyyy-mm-dd}-{hh}.jsonl` files off the
  VM disk (see the seed prompts in `enterprise-worker/pipes/*/pipe.md`).
- **Cloud HTTP**: a *third* surface already exists at
  `website-screenpipe/app/api/enterprise/v1/*` — `records`, `search`, `rollups`, `devices`,
  `files`, `pipes`. `v1/records` already mirrors local `/search` params (`device_id`, `kind`,
  time window, `limit`; see `v1/records/route.ts:14-19`).

So a pipe author must know *where* it runs. Code is forked between local and cloud.

### Proposed change
1. **Define the screenpipe query contract** (one doc, 
```