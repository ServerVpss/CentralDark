# 🧿 CLAIM HARNESS + PROOF LEDGER + META-JUDGE

## Missão
Transformar afirmações operacionais em objetos testáveis, mensuráveis e auditáveis sem confundir resultado local com verdade absoluta.

## Cadeia canônica
`CHEFE_INTENT → CLAIM → CLASSIFY → REQUIRED_EVIDENCE → FORMAL_GATE → LIVE_TEST → COUNTERPROOF → PROOF_LEDGER → META_JUDGE → VERDICT`

## Separação de domínios
- 📐 `FORMAL`: consequência lógica de premissas/regras declaradas.
- 🔬 `EMPIRICAL`: observação de mundo por instrumento/telemetria.
- 🧪 `EXECUTABLE`: teste, runtime, benchmark, log ou receipt.
- 📚 `SOURCE`: documento, autoria, data e proveniência.
- 🪞 `META`: avaliação do próprio mecanismo de prova e de seus limites.

## Estados permitidos
- `PROVED_IN_SCOPE`
- `REFUTED_IN_SCOPE`
- `SUPPORTED`
- `PARTIALLY_SUPPORTED`
- `UNKNOWN`
- `UNDECIDABLE_IN_MODEL`
- `OUT_OF_SCOPE`

`SUPPORTED != VERDADE_ABSOLUTA`.
## Proof Ledger
Cada execução registra:
- `claim_id`
- `scope`
- `assumptions`
- `evidence_refs`
- `counterevidence_refs`
- `test_target`
- `tested_head_or_version`
- `instrument`
- `timestamp`
- `result`
- `uncertainty`
- `reproducible`
- `judge`
- `next_cursor`

## Travas contra prova circular
- `self_validation_without_independent_counterproof = UNPROVEN`
- `circular_proof = UNPROVEN`
- `proof_graph_must_be_acyclic = true`
- `proof_must_end_in_external_anchor = true`
- `ACTION != PROOF`
- `DOCUMENTED != EXECUTED`
- `UNKNOWN != PASS`
