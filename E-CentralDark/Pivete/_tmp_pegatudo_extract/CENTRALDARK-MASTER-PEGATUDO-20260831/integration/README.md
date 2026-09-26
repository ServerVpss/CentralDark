# Integration adapter - router / Gemini / HUB

This directory is a portable contract for extending the existing CentralDark owners.
It is deliberately not a second runtime router.

The integration uses the existing `centraldark-router` as a route/provider selector, delegates safe read-only sweep work to Gemini when that provider is measured as available, feeds findings into the normal Reality Scope/Reconcile path, and persists distilled context/receipts to authorized durable providers.

Operational state such as `Gemini authenticated`, `router route healthy`, `GitHub PR current`, or `Drive writable` must be remeasured by the target environment.

## Swarm graph mirror + visual fabric

`swarm-graph-mirror.yml` adds bounded parallel perception (adaptive 1..10 fronts, read-only mirror factor up to 5) and a top-down / bottom-up / cross-graph rendezvous. It does not create another writer or orchestrator.

`tui-visual-fabric.yml` and `ui/emoji-tui/` provide presentation-only semantic icons, emoji registry, RGB variables and optional non-blocking animations. Display aliases never change canonical IDs.

## DELTAUTIL + Gemini Modal

`delta-utils-gemini-modal.yml` reuses the existing `!DELTAUTIL` lineage as a semantic reconciliation layer inside `!CENTRALDARK`. It adds dense semantic compaction, deterministic decision-aid scores, a read-only Gemini review modal, and HUB surfaces for Workspaces/Plugins/Connections/Delta Inbox. Safe iframe embedding is optional and fails closed when CSP/X-Frame-Options do not permit framing; native/API adapters are preferred.
