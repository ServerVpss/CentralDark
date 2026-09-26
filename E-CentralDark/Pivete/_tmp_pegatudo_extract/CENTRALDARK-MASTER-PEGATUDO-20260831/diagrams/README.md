# Mermaid - CENTRALDARK package flows

These `.mmd` files are the canonical diagram sources for the current package extension.
They document architecture; they are not runtime proof.

1. `00-universal-master-funnel.mmd` - every recognized trigger enters one `!CENTRALDARK` funnel.
2. `01-hub-capability-fabric.mmd` - one HUB, N capabilities, one authority model.
3. `02-centraldark-router-gemini-sweep.mmd` - safe read-only Gemini sweep through the existing router.
4. `03-context-distillation-and-persistence.mmd` - outside-in context becomes distilled durable receipts.
5. `04-cross-provider-continuity.mmd` - GitHub/Drive fallback and resynchronization.
6. `05-google-workspace-oauth-control-plane.mmd` - OAuth credential plane and per-capability ON/OFF.
7. `06-plug-play-github-drive.mmd` - same package/lineage, write missing delta only.
8. `07-adversarial-falsifier.mmd` - writer vs independent read-only falsifier.
9. `08-gemini-sweep-sequence.mmd` - sequence view of delegated sweep.

10. `09-documentation-gate.mmd` - material change cannot promote without documentation.
11. `10-google-library-multi-account.mmd` - multiple Google accounts federated by scoped namespaces.
12. `11-port-trigger-registry.mmd` - expected/observed/proof separation for ports and trigger documentation.
13. `12-pr-worktree-context.mmd` - why isolated PR worktrees exist and how they reconcile.
14. `13-documentation-panel-tab.mmd` - one searchable Documentation tab in the CentralDark panel.

Invariant: diagrams explain the contract. Live HEAD/revision/runtime remain the proof sources.

15. `14-one-command-inventory-site-readiness.mmd` - one-command inventory to 90% site readiness and deploy-on-intent.

16. `16-delta-utils-gemini-modal.mmd` - existing DELTAUTIL owner, semantic compression, Gemini read-only modal, plugin/workspace preview and safe embedding.

18. `18-cross-session-oauth-speed.mmd` - cross-session reconciliation, OAuth credential plane, Hermes speed routing.
