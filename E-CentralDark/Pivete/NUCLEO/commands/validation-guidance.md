# COMANDO - validation-guidance.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\skills\validation\references\validation-guidance.md
**SHA:** 42f7a9d85b78d0de
**Timestamp:** 2026-08-26T18:31:15.659476
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Use this checklist to keep validation close to the prompt contract:

### Ouro Bruto (primeiros 5000 chars)
```
# Validation Guidance

Use this guidance when validating candidate security findings.

## Instance-Preserving Validation

Validation does not choose whether the scan is diff-scoped or repository-wide. Use the scope and candidate set provided by the user, discovery report, or top-level security scan workflow. When validation is invoked directly for one named bug, validate that bug only unless the user explicitly provides multiple instances or asks for sibling expansion.

When validation is part of a top-level repository-wide security scan, treat discovery notes, coverage ledgers, and repeated source/sink/control patterns as validation input even if they are not yet numbered as final findings. The ledger is a coverage artifact: preserve rows that are not_applicable, suppressed, deferred, or reportable, and continue bounded high-impact sibling checks needed to complete that provided ledger. This is preserving repository-wide scan scope, not independently expanding a standalone validation request.

For large repository-wide scans, validation should preserve coverage as well as proof depth. Once a candidate has a complete source, closest control, sink, and impact tuple, prefer static trace plus existing tests and deploy/config evidence over lengthy environment bring-up when runtime reproduction needs unavailable internal services, secrets, service meshes, cloud accounts, or production data. Missing runtime setup is a proof-gap note, not counterevidence and not a suppression reason.

If discovery, user scope, or an advisory/tag seed names a specific package, class family, or root-control family, validation must close that exact row. A same-family finding in a neighboring route, parser, deserializer, or auth flow can be used as supporting evidence, but it is not counterevidence for the seeded row. If the seeded row survives, preserve its exact root-control file:line into attack-path analysis and final-report inputs.

Advisory-derived candidate files, functions, or hunks are not findings by themselves, but they are validation obligations for advisory-led repository-wide scans. Validate them against the checked-out local code, then close each exact seed row as `reportable`, `suppressed`, `not_applicable`, or `deferred` with local evidence. If the seed file was opened only during search, still give it an explicit closure row rather than leaving it only in logs.

When the checked-out code still contains a seeded construct, keep that seed row alive until validation decides its local proof tuple. Mark it `reportable` only when local repository evidence independently supports the same source, broken control, sink or security impact, and realistic preconditions; otherwise mark it `deferred` or `suppressed` with the exact missing proof or counterevidence. A stricter deployment assumption, missing downstream application configuration, or a neighboring stronger finding is a precondition or proof gap to state, not counterevidence by itself.

When a high-impact candidate is blocked only by a missing downstream consumer, workflow caller, policy exception, or artifact provenance fact, run one bounded adjacency pass over the most likely evidence sources before suppressing it: generated clients/specs, workflow callers, deploy/policy config, storage or ACL definitions, and package importers. If that pass still leaves the proof gap, keep the row `deferred` rather than treating the gap as counterevidence.

When the input contains multiple candidate instances, preserve that instance inventory:

- validate each candidate instance independently enough to decide whether that exact file/line should survive
- do not collapse multiple candidate instances into one validated finding solely because they share a vulnerability family
- for repeated instances provided by discovery or the security scan workflow, validate a representative exploit path once when feasible, then analytically validate each sibling instance by checking the same proof tuple: attacker-controlled source, missing or incomplete closest control, dangerous sink, and impact
- for repeated vulnerable templates, query builders, parser operations, auth/object endpoints, or shared-helper callers, preserve each independently vulnerable file and sink/control line as a surviving instance when the proof tuple applies. Grouping is acceptable for readability only after every affected instance has its own surviving finding entry or explicit suppressed/deferred row.
- if discovery hands validation a broad family candidate with multiple concrete sink, parser, helper, API-mode, or protected-action lines, expand it into child closure rows before deciding survival. One representative PoC may support the family, but each child still needs its own file/line, source or protected boundary, closest control, sink or action, disposition, and counterevidence.
- when one route or helper exposes multiple same-family operations such as `execute`/`executemany`/`executescript`, `pickle.load`/`pickle.loads`
```