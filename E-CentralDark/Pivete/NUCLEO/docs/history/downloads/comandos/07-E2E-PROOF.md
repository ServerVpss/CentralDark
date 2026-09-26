# Prova E2E — único critério para declarar WIRED

## Cadeia

```text
T0 Browser real observado
T1 Provider captura
T2 Browser Bridge normaliza
T3 Hermes recebe pelo handler
T4 Hermes produz comando/resposta
T5 Browser Bridge executa/retorna
T6 Evidence Envelope registra
```

## Receipt obrigatório

```yaml
BROWSER_E2E_RECEIPT:
  protocol: CENTRALDARK_BROWSER_E2E_V1
  mission_id: ""
  transport: foreground|background
  trace_id: ""

  t0_browser:
    status: PASS
    evidence_ref: ""

  t1_provider:
    status: PASS
    evidence_ref: ""

  t2_bridge:
    status: PASS
    event_id: ""

  t3_hermes_receive:
    status: PASS
    execution_ref: ""

  t4_hermes_return:
    status: PASS
    command_id: ""

  t5_browser_result:
    status: PASS
    result_event_id: ""

  t6_evidence_envelope:
    status: PASS
    causal_fingerprint: ""

  verdict: WIRED
```

Qualquer etapa:

```text
UNKNOWN|SKIPPED|TIMEOUT|FAIL
→ verdict != WIRED
```

## Dois testes separados

### Foreground

```text
CURRENT VISIBLE CHROME
→ MCP
→ Bridge
→ Hermes
→ Bridge
→ CURRENT VISIBLE CHROME
```

### Background

```text
Zendriver Chrome
→ Bridge
→ Hermes
→ Bridge
→ Zendriver Chrome
```

Não usar um PASS para provar a outra lane.
