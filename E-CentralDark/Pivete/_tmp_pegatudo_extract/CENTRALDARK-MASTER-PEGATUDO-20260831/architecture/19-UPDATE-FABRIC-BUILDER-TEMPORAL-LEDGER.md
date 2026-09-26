# CentralDark — Update Fabric + Builder + Temporal Display

Status: EXTENSION_OF_EXISTING_DELTAUTIL. No V2/V3. No second package authority.

## Dense rule

`UPDATE_SOURCE -> !CENTRALDARK -> DELTAUTIL -> UPDATE_FABRIC -> RECONCILE -> OWNER -> TEST -> COUNTERPROOF -> DOCUMENTATION_GATE -> SAME_PACKAGE_REGISTER`.

Update sources: Drive, GitHub, CLI, terminal, SSH, authorized webhook, HUB upload. A source is transport/sensor, not authority. If one source fails, another authorized sensor may continue; conflicts stop writes until reconciliation.

## One logical package

`CENTRALDARK-MASTER-PEGATUDO` remains one lineage. Updates replace/extend the same package. Dated visibility lives *inside* the package under `releases/YYYY-MM-DD/`; `releases/CURRENT.yml` points to the current revision. Date folders are ledger/navigation, not new package authority.

## Time / user presentation

Machine keys: `YYYY-MM-DD`. Stored timestamps: RFC3339 with offset. Human UI/CLI: pt-BR `DD/MM/YYYY HH:mm:ss`, always with timezone/offset when material. Show author as display alias + source role + revision/head. Display names may change; canonical IDs do not.

## Builder

Existing Builder is a factory, not an authority. It may generate site/module/UI/infra/distribution candidates. Promotion requires manifest, dependency map, docs, tests, counterproof, recovery/rollback, receipt. Deploy only when intent explicitly requests deploy.

## Review blocks

Each material delta gets a small note block: date key, human time, author alias, source, revision/head, semantic digest, proof, review status, next cursor. Multiple reviewers may append review blocks; only one writer may mutate a conflict scope.
