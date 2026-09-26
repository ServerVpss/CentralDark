# COMANDO - final-report.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\references\final-report.md
**SHA:** 9fefdf4b3e8cf6dc
**Timestamp:** 2026-08-26T18:31:15.184302
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `::code-comment{title="[P1] Example title" body="One-paragraph review explanation." file="/absolute/path/to/file" start=10 end=12 priority=1 confidence=0.55}`

### Ouro Bruto (primeiros 5000 chars)
```
# Final Report and Codex Review Directives

Use this guidance when authoring canonical report semantics and returning the generated Codex Security report and review directives.

## Final Outputs

The final readable output is a deterministic projection of `scan-manifest.json`, `findings.json`, and `coverage.json`:

- primary readable markdown report at the final scan report path from `scan-artifacts.md`
- optional detailed vulnerability write-ups under `findings/<slug>/`, linked from the primary report through `finding.writeup.reportPath`
- optional structural hardening guidance under `hardening/`, linked from the primary report through `scan.hardening.portfolioPath`

When writing `findings.json` alongside this readable output, populate the optional structured details in `finding-detail-fields.md` from the same validated evidence. Do not parse the rendered report back into finding data.

Use `report.md` as the primary readable entry point. Explain report-relevant artifact paths in the report itself, especially in `Scope`, `Reviewed Surfaces`, and `Open Questions And Follow Up`.

In the final response, link the generated markdown report path as the primary readable artifact.

Every scan mode uses the same final report pipeline. The model authors canonical JSON only; it must not author, repair, or treat an existing `report.md` as input. `complete-scan` invokes finalization, which validates and enriches the canonical JSON, seals the canonical JSON and evidence artifacts, then deterministically generates and validates `report.md` as an unsealed downstream projection. Missing report prose must be added to the structured canonical fields rather than recovered from a separately authored report.

When `complete_codex_security_scan` is available, use it to complete the scan. In Codex CLI or another terminal/chat host without that tool, run `python <plugin_dir>/scripts/finalize_scan_contract.py --scan-dir <scan_dir> --source-root <repo_root>` after writing the completed canonical JSON. Do not mark the scan goal complete until this command succeeds and the generated markdown report exists.

Canonical report semantics live in these fields:

- `scan-manifest.json`: `scan.scope` and `scan.threatModel`
- `findings.json`: each finding's `summary`, `codeEvidence`, `rootCause`, `validation`, `attackPath.dataflow`, `attackPath.reachability`, `severity.rationale`, `severity.changeConditions`, `remediation`, `remediationTests`, and `preventiveControls`
- `findings.json`: optional `writeup.reportPath` for a derived, unsealed detailed vulnerability report written under `findings/<slug>/<slug>.md`
- `scan-manifest.json`: optional `scan.hardening.portfolioPath` for the derived, unsealed design portfolio at `hardening/hardening.md`
- `coverage.json`: `surfaces` including `riskArea` and `notes`, plus `openQuestions`

Older v1 producers may omit the new optional fields. Finalization uses explicit JSON-derived fallback text in that case; it never reads a pre-existing report to fill gaps.

When `scan.hardening.portfolioPath` is present, include a short `## Structural Hardening` section linking the portfolio. Keep individual proposal links and the full option analysis in `hardening/hardening.md` rather than copying them into the primary scan report. The portfolio is design guidance, not evidence that any finding has been remediated.

When there are no reportable findings, include a short `No findings` section that explains why nothing survived discovery or the later reportability gates. For repository-wide and scoped-path scans with a coverage ledger, still include `Reviewed Surfaces` so checked, rejected, not-applicable, and follow-up-needed surfaces remain auditable.

When there are reportable findings, render them as readable markdown findings rather than raw JSON or a dumped schema object.
Order findings from highest severity to lowest severity: `critical`, then `high`, then `medium`, then `low`.

Use a separate finding entry for each independently attackable source/control/sink instance. Do not combine sibling routes, templates, query builders, parser operations, auth/object-access endpoints, or shared-helper callers into one representative finding solely for readability; if grouping helps, add a short grouped summary after the individual finding entries.

If validation or attack-path analysis provides a broad family row with multiple independently triggerable sink, parser, helper, API-mode, or protected-action lines, split it into child final findings before writing the report. Multiple affected lines inside one finding are appropriate for one inseparable proof tuple, such as a wrapper plus its shared sink, but not as a substitute for separate findings when sibling operations can be triggered independently.

Set the finding category and CWE from the primary broken control. Do not add secondary support-impact CWEs, such as data exposure or missing authentication, to an injection/RCE/path/file/parser finding merely because they make e
```