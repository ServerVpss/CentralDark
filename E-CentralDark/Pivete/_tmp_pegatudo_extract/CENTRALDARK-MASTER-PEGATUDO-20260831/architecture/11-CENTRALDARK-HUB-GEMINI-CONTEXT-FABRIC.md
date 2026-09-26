# CENTRALDARK HUB - GEMINI CONTEXT FABRIC

## Purpose

Extend the existing CentralDark architecture without creating a second router, second HUB, second judge, or parallel owner.
The existing `centraldark-router` is treated as the provider/model route. It is not authority and it may not bypass the master funnel.

## Canonical topology

`authorized sources -> sanitize/quarantine -> centraldark-router -> Gemini read-only sweep -> evidence candidates -> REALITY_SCOPE_GATE -> RENDEZVOUS/RECONCILE -> existing owner -> ONE_WRITER -> tests -> falsifier -> Reality Judge -> receipt -> durable context`.

## Gemini role

- `GEMINI_IS_SPECIALIZED_READER=true`
- `GEMINI_MAY_WRITE=false`
- `GEMINI_MAY_JUDGE=false`
- `GEMINI_MAY_SELF_APPROVE=false`
- `GEMINI_MAY_RECEIVE_RAW_SECRETS=false`
- `GEMINI_OUTPUT_IS_EVIDENCE_CANDIDATE=true`

Gemini may perform large-context sweeps over safe source representations when an authorized adapter can provide them. A model response is never promoted directly to current reality.

## Router role

- `REUSE_EXISTING_CENTRALDARK_ROUTER=true`
- `SECOND_ROUTER_FORBIDDEN=true`
- `ROUTER_IS_TRANSPORT_AND_PROVIDER_SELECTOR=true`
- `ROUTER_IS_AUTHORITY=false`
- `ROUTER_REQUIRES_MASTER_CONTEXT=true`

A package-level contract does not prove that the live router currently exposes Gemini. Runtime/authenticated provider status must be measured before an operational READY claim.

## Context fabric

The context store preserves distilled material knowledge rather than copying entire raw external sources.
Persist facts, source references, revisions/HEADs, hashes, proof targets, counterproof, receipts, and NEXT_CURSOR.
Credential-like or sensitive material is quarantined and never copied into model prompts or receipts.

Drive/Workspace is a durable context provider, not a second source of truth. GitHub remains code/versioned-state authority where applicable. When either transport fails, persist a pending-sync receipt on the other authorized durable provider and reconcile after recovery.

## HUB integration

The existing HUB remains one container for N apps/providers/connectors/models/capabilities. Google Workspace and Gemini are capability families, not separate architectures.
Each capability has a policy-backed ON/OFF state. OFF blocks calls; hard credential revocation is a separate explicit provider-dependent action.

## Plug-and-play handoff

A successor agent loads the package, discovers current owners, reads receipts, remeasures current state, applies only missing deltas, reruns tests/falsifiers, and writes a new receipt. It never treats this package itself as proof that remote GitHub, Drive, OAuth, or Gemini runtime is currently healthy.


## Documentation surface

The same HUB exposes a `DOCUMENTACAO` index for triggers, ports/services, APIs, providers/accounts, library media, PR/worktree context, Mermaid diagrams, receipts, glossary and global search. This is a documentation/index surface, not a second authority. Material changes must pass the Documentation Gate before promotion.
