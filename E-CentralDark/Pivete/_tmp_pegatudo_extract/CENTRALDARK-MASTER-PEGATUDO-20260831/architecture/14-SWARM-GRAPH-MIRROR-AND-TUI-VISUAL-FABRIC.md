# CentralDark — Swarm Graph Mirror + TUI Visual Fabric

Status: EXTENSION_OF_EXISTING_ARCHITECTURE

## Purpose

Extend the existing CentralDark master without creating a second orchestrator. Material work may fan out to multiple read-only specialist fronts, rendezvous on a graph, and return only evidence candidates to the canonical reconciliation path.

The visual layer is separate from semantics: CLI/TUI icons, emoji, RGB, spinners, progress animations and display aliases never change canonical IDs, owners, gates or execution meaning.

## Swarm graph contract

```text
!CENTRALDARK
  -> #ACORDAR
  -> #CRISTALIZAR · MEASURE
  -> PEGATUDO
  -> TRUE_NORTH_LOCK
  -> TRIAXIAL_GRAPH_SWEEP
       TOP_DOWN        owner -> consumers/dependencies
       BOTTOM_UP       observations -> owner/lineage
       CROSS_GRAPH     siblings/edges/cross-provider evidence
  -> ADAPTIVE_FANOUT[1..10]
  -> MIRROR_READERS[0..5 per material front]
  -> RENDEZVOUS
  -> RECONCILE
  -> ONE_WRITER
  -> FALSIFIER
  -> REALITY_JUDGE
```

### Constraints

- `FANOUT_MAX=10` is a ceiling, not a quota.
- `MIRROR_FACTOR_MAX=5` creates verification readers, not five writers.
- `MIRROR_DEPTH_MAX=1` by default prevents combinatorial agent explosion.
- A front may request one nested delegation only when it can name the unresolved material question and the expected discriminating evidence.
- Writer count remains one per conflicting mutable scope.
- Mirror readers may compare code, docs, tests, graph edges and providers, but may not mutate or self-approve.
- Provider/model names are replaceable runtime choices. `MODEL_ID != ARCHITECTURAL_IDENTITY`.

## Graph strategy

CentralDark may reuse existing graph capabilities or adapters before introducing a new graph engine. Useful external patterns include hierarchical/global/local graph retrieval, specialist handoffs, trace/span trees and parallel agent evaluation. These are implementation references, not new authorities.

`GRAPH_IS_DERIVED_NOT_AUTHORITY=true`

## TUI/CLI visual contract

Visuals are presentation only:

```text
CANONICAL_ID -> semantic event
DISPLAY_ALIAS -> user-facing label
ICON -> optional glyph
RGB_THEME -> optional rendering
ANIMATION -> optional non-blocking presentation
```

Invariants:

- `DISPLAY_NAME != CANONICAL_ID`
- `EMOJI != EXECUTION_SEMANTICS`
- `RGB != HEALTH_STATE`
- `ANIMATION != PROGRESS_PROOF`
- `NO_COLOR` and non-TTY output must remain readable.
- Critical logs and receipts must have plain-text equivalents.
- Professional mode is default; visual density is bounded.

## Emoji registry

The package contains a normalized emoji registry plus an optional importer adapter. External emoji sites are reference providers only; the package stores Unicode symbols and its own semantic mappings, not copied prose or external authority.

## Outcome

Many agents may inspect the same graph from different directions; only reconciled evidence reaches mutation. Many visual styles may render the same event; canonical execution meaning stays stable.
