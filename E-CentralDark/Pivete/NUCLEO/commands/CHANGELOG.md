# COMANDO - CHANGELOG.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\CHANGELOG.md
**SHA:** da74c0bde7623cf4
**Timestamp:** 2026-08-28T02:24:50.249113
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- - Added opt-in `agentContract: { version: 1 }` runs with explicit execution, acceptance, review, and effects projections, report-optional acceptance, observational file-mutation effects, generic `outp

### Ouro Bruto (primeiros 5000 chars)
```
# Changelog

## [Unreleased]

## [0.57.0] - 2026-08-26

### Highlights
- Run Codex, Claude Code, and Cursor Agent subagents with packaged read-only and writing profiles.
- Validate workflow scripts before launch, and reuse workflow code from files with `workflowScriptPath`.
- Resume, inspect, and recover workflow children more reliably after errors, compaction, or session reloads.
- See clearer Fleet and status output, including task labels and live context-window usage.
- Recover from more async, scheduling, discovery, model fallback, and Windows edge cases without losing useful run history.

### Added
- Add read-only and workspace-writing profiles for `codex-exec`, `claude-code`, and `cursor-agent`, with bounded result capture and opt-in smoke checks.
- Add external one-shot runner support for bounded parser hooks and logs, environment allowlists, cached launch preflight, parser progress, and process cleanup.
- Add compact external CLI capability and receipt metadata for adapter identity, artifacts, handoff mode, supervisor support, and resumability.
- Add configured pruned fork sessions with budgeted transcript-overflow summaries, stable recovery refs, and private recovery sidecars.
- Add offline `workflowScript` syntax and structural validation through the public subagent tool. Thanks to [@elecnix](https://github.com/elecnix) for #1462.
- Add `workflowScriptPath` so workflows can be loaded from files for execution, validation, and schedules. Thanks to [@elecnix](https://github.com/elecnix) for #1464.
- Add bounded workflow-child summaries to workflow results, status, receipts, and completion replay. Thanks to [@rochecompaan](https://github.com/rochecompaan) for #1453.
- Add live context-window usage to status and Fleet views, separate from cumulative token spend. Thanks to [@nazzeDe](https://github.com/nazzeDe) for #1444.
- Add active workflow task labels to compact status surfaces and Herdr pane metadata. Thanks to [@phoenixdam](https://github.com/phoenixdam) for #1459.
- Add `modelExclusions.defaultTtlMs` for controlling how long model exclusions stay active, with launch diagnostics for skipped candidates. Thanks to [@mithyer](https://github.com/mithyer) for #1439 and #1438.
- Add a package-internal one-use permit for one exact native child in a foreground `workflowScript`. Thanks to [@maroffo](https://github.com/maroffo) for #1494.

### Fixed
- Preserve agent frontmatter output defaults for prompt-template delegated leaves. Thanks to [@ashlineldridge](https://github.com/ashlineldridge) for #1521.
- Preserve structured-output and related bounded child contract fields when foreground workflow children resume. Thanks to [@Livan-pro](https://github.com/Livan-pro) for #1460.
- Preserve typed errors, partial output, transcript metadata, and artifact metadata when foreground workflow children resume. See #1513.
- Keep inline workflow children resumable from their foreground runs without mistaking a missing async directory for lost state. Thanks to [@lancegui](https://github.com/lancegui) for #1442.
- Make workflow validation and return serialization failures easier to recover from with no-child-launch diagnostics, portable rewrite guidance, workflow ids, and completed-child output references (#1432, #1434).
- Clarify terminal keyed workflow-resume failures when `workflow-receipt.json` is unavailable, including direct child-run recovery from status and event logs (#1512).
- Preserve bounded async child failure context after compaction, including missing file-only output, instead of leaving failed run summaries empty. See #1495.
- Ignore stale child-settled events from retrying compaction attempts, so resumed children are not aborted before their replacement attempt can finish. See #1504.
- Make async runs visible to exact status lookup as soon as launch succeeds, and deliver one completion when a runner dies before its normal status write. Thanks to [@rafafortes](https://github.com/rafafortes) for #1471 and [@VincentHanxiaoDu](https://github.com/VincentHanxiaoDu) for #1480.
- Record explicit completed, failed, timed-out, stopped, and interrupted outcomes in run history. Thanks to [@rafafortes](https://github.com/rafafortes) for #1474.
- Repair bounded dead async run candidates before retention classifies them, so stale run directories can be reclaimed without deleting ambiguous worktrees or branches. Thanks to [@rafafortes](https://github.com/rafafortes) for #1477.
- Exclude completed one-shot schedules from the pending schedule limit without deleting their durable history. Thanks to [@rafafortes](https://github.com/rafafortes) for #1478.
- Reclaim failed async capacity slots after a configurable abandoned timeout when the runner PID is gone, while keeping clear diagnostics for unknown process state. Thanks to [@rafafortes](https://github.com/rafafortes) for #1472.
- Preserve parent model inheritance for workflow children when workflow setup reads session data before launch, and avoid carrying a stale live-s
```