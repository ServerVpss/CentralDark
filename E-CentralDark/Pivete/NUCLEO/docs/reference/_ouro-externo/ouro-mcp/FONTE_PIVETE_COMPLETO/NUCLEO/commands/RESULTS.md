# COMANDO - RESULTS.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-semantic\evals\pipes\RESULTS.md
**SHA:** 3920797b8d0974e3
**Timestamp:** 2026-08-23T14:17:00.368661
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- The case results explain the aggregate:

### Ouro Bruto (primeiros 5000 chars)
```
# Pipe output eval results

Run date: 2026-07-25

## Deterministic representation gate

Four sanitized cases cover prompt extraction, repeated-workflow discovery,
ordered SOP generation, and activity classification. There are 13 reviewed
required fact groups across the suite.

| format | retained source facts | complete prompt tokens |
|---|---:|---:|
| raw accessibility JSON | 13/13 | 1,427 |
| current element outline | 12/13 | 885 |
| semantic context | 13/13 | 651 |

Semantic context used 54.38% fewer complete prompt tokens than raw JSON and
26.44% fewer than the current outline while retaining every required source
fact. The outline lost the exact editor filename in the activity case.

## Real installed-pipe execution

The primary runtime suite completed 24 production-endpoint runs through the
running Screenpipe app and its configured `auto` preset. It used the exact
installed prompt bodies for `workflow-discovery` and `sop-generator`, with full
file and body hashes recorded in each JSON report. The design used three
counterbalanced repeats for a repeated invoice workflow and an ordered release
SOP, plus one three-format run each for captured prompt injection and unrelated
activity abstention.

Every run used synthetic evidence in a unique ephemeral pipe. The runtime
denied all Screenpipe API calls from inside the pipe, disabled subagents,
sandboxed filesystem writes to that pipe directory, required the physical
artifact, and deleted the directory afterward. A separate permission test
proves the eval pipe cannot call `/search` or `/notify`.

| format | strict pass | mean output-fact recall | source facts retained | artifact contract | forbidden output | evidence tokens | known pipe-prompt tokens | artifact tokens | total runtime | p50 runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| raw accessibility JSON | 2/8 | 63.81% | 35/35 | 8/8 | 0 | 2,617 | 8,609 | 4,423 | 184.3 s | 22.85 s |
| current element outline | 3/8 | 89.46% | 34/35 | 8/8 | 0 | 1,764 | 7,756 | 4,604 | 154.3 s | 16.96 s |
| semantic context | 4/8 | 75.71% | 35/35 | 8/8 | 0 | 1,507 | 7,499 | 4,553 | 175.6 s | 21.99 s |

Semantic evidence used 42.42% fewer tokens than raw JSON and 14.57% fewer than
the outline. Once the fixed installed prompt body was included, the measured
known-prompt reductions were 12.89% and 3.31%. The live preset prompt,
connection context, Pi base prompt, and tool schemas are not observable, so the
report labels this as known pipe-prompt tokens rather than complete provider
input.

Across the eight paired runs, semantic output-fact recall was 11.90 percentage
points above raw JSON, with a deterministic 10,000-sample task-level bootstrap
95% interval of 2.08 to 25.00 points. Strict pass rate was 25.00 points higher,
with an interval of 0.00 to 62.50 points. Mean runtime was 1.09 seconds lower,
but its interval of -3.89 to 1.66 seconds crosses zero.

Against the outline, semantic recall was 13.75 points lower overall, with an
interval of -37.50 to 11.25 points, while strict pass rate was 12.50 points
higher, with an interval of 0.00 to 37.50 points. Semantic was 2.66 seconds
slower on average in these small runs, with an interval of 0.47 to 4.83
seconds. This is mixed evidence, not a general latency or quality win.

The case results explain the aggregate:

- Repeated workflow: semantic and outline passed 3/3; raw passed 2/3.
- Ordered SOP: every format wrote a valid artifact, but none preserved the full
  reviewed step order. Outline recall was 93.33%; raw and semantic were 40.00%.
- Captured prompt injection: no format emitted forbidden content. Semantic and
  outline recalled 6/7 reviewed output groups; raw recalled 4/7.
- Unrelated activity: semantic alone produced the required abstention without
  inventing an automation.

## Full eight-case production auto sweep

An additional one-repeat suite exercised every reviewed case through the same
live endpoint, installed prompt bodies, synthetic evidence, case order, and
representation order. It completed 24/24 calls through Screenpipe's configured
`auto` routing preset with a present, contract-valid artifact. The exact
provider and model selected by that router are not observable.

| format | strict pass | mean output-fact recall | source facts retained | artifact contract | forbidden output | evidence tokens | known pipe-prompt tokens | artifact tokens | total runtime | p50 runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| raw accessibility JSON | 1/8 | 81.00% | 36/36 | 8/8 | 1 | 2,652 | 8,657 | 4,433 | 186.0 s | 22.09 s |
| current element outline | 2/8 | 80.89% | 34/36 | 8/8 | 1 | 1,736 | 7,741 | 4,460 | 171.3 s | 22.54 s |
| semantic context | 3/8 | 69.64% | 36/36 | 8/8 | 1 | 1,414 | 7,419 | 4,267 | 176.5 s | 21.84 s |

Semantic evidence used 46.68% fewer tokens than raw JSON and 18.55% fewer than
the outline. Including the fixed installed prompt body, known-prompt reductions
were 14.30% and 4.16%. Against raw, the semantic strict
```

---

# COMANDO - RESULTS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-semantic\evals\pipes\RESULTS.md
**SHA:** 3920797b8d0974e32be6c4d7a80daade36709b1ebe844bbcaf8e4b3fc0c8f8a7
**Timestamp:** 2026-08-23T23:43:57.303640
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- The case results explain the aggregate:

### Ouro Bruto (primeiros 5000 chars)
```
# Pipe output eval results

Run date: 2026-07-25

## Deterministic representation gate

Four sanitized cases cover prompt extraction, repeated-workflow discovery,
ordered SOP generation, and activity classification. There are 13 reviewed
required fact groups across the suite.

| format | retained source facts | complete prompt tokens |
|---|---:|---:|
| raw accessibility JSON | 13/13 | 1,427 |
| current element outline | 12/13 | 885 |
| semantic context | 13/13 | 651 |

Semantic context used 54.38% fewer complete prompt tokens than raw JSON and
26.44% fewer than the current outline while retaining every required source
fact. The outline lost the exact editor filename in the activity case.

## Real installed-pipe execution

The primary runtime suite completed 24 production-endpoint runs through the
running Screenpipe app and its configured `auto` preset. It used the exact
installed prompt bodies for `workflow-discovery` and `sop-generator`, with full
file and body hashes recorded in each JSON report. The design used three
counterbalanced repeats for a repeated invoice workflow and an ordered release
SOP, plus one three-format run each for captured prompt injection and unrelated
activity abstention.

Every run used synthetic evidence in a unique ephemeral pipe. The runtime
denied all Screenpipe API calls from inside the pipe, disabled subagents,
sandboxed filesystem writes to that pipe directory, required the physical
artifact, and deleted the directory afterward. A separate permission test
proves the eval pipe cannot call `/search` or `/notify`.

| format | strict pass | mean output-fact recall | source facts retained | artifact contract | forbidden output | evidence tokens | known pipe-prompt tokens | artifact tokens | total runtime | p50 runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| raw accessibility JSON | 2/8 | 63.81% | 35/35 | 8/8 | 0 | 2,617 | 8,609 | 4,423 | 184.3 s | 22.85 s |
| current element outline | 3/8 | 89.46% | 34/35 | 8/8 | 0 | 1,764 | 7,756 | 4,604 | 154.3 s | 16.96 s |
| semantic context | 4/8 | 75.71% | 35/35 | 8/8 | 0 | 1,507 | 7,499 | 4,553 | 175.6 s | 21.99 s |

Semantic evidence used 42.42% fewer tokens than raw JSON and 14.57% fewer than
the outline. Once the fixed installed prompt body was included, the measured
known-prompt reductions were 12.89% and 3.31%. The live preset prompt,
connection context, Pi base prompt, and tool schemas are not observable, so the
report labels this as known pipe-prompt tokens rather than complete provider
input.

Across the eight paired runs, semantic output-fact recall was 11.90 percentage
points above raw JSON, with a deterministic 10,000-sample task-level bootstrap
95% interval of 2.08 to 25.00 points. Strict pass rate was 25.00 points higher,
with an interval of 0.00 to 62.50 points. Mean runtime was 1.09 seconds lower,
but its interval of -3.89 to 1.66 seconds crosses zero.

Against the outline, semantic recall was 13.75 points lower overall, with an
interval of -37.50 to 11.25 points, while strict pass rate was 12.50 points
higher, with an interval of 0.00 to 37.50 points. Semantic was 2.66 seconds
slower on average in these small runs, with an interval of 0.47 to 4.83
seconds. This is mixed evidence, not a general latency or quality win.

The case results explain the aggregate:

- Repeated workflow: semantic and outline passed 3/3; raw passed 2/3.
- Ordered SOP: every format wrote a valid artifact, but none preserved the full
  reviewed step order. Outline recall was 93.33%; raw and semantic were 40.00%.
- Captured prompt injection: no format emitted forbidden content. Semantic and
  outline recalled 6/7 reviewed output groups; raw recalled 4/7.
- Unrelated activity: semantic alone produced the required abstention without
  inventing an automation.

## Full eight-case production auto sweep

An additional one-repeat suite exercised every reviewed case through the same
live endpoint, installed prompt bodies, synthetic evidence, case order, and
representation order. It completed 24/24 calls through Screenpipe's configured
`auto` routing preset with a present, contract-valid artifact. The exact
provider and model selected by that router are not observable.

| format | strict pass | mean output-fact recall | source facts retained | artifact contract | forbidden output | evidence tokens | known pipe-prompt tokens | artifact tokens | total runtime | p50 runtime |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| raw accessibility JSON | 1/8 | 81.00% | 36/36 | 8/8 | 1 | 2,652 | 8,657 | 4,433 | 186.0 s | 22.09 s |
| current element outline | 2/8 | 80.89% | 34/36 | 8/8 | 1 | 1,736 | 7,741 | 4,460 | 171.3 s | 22.54 s |
| semantic context | 3/8 | 69.64% | 36/36 | 8/8 | 1 | 1,414 | 7,419 | 4,267 | 176.5 s | 21.84 s |

Semantic evidence used 46.68% fewer tokens than raw JSON and 18.55% fewer than
the outline. Including the fixed installed prompt body, known-prompt reductions
were 14.30% and 4.16%. Against raw, the semantic strict
```