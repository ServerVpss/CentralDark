# EVIDÊNCIA DE EXECUÇÃO

## Testes locais

```text
test_no_tests_no_green (test_false_green.T.test_no_tests_no_green) ... ok
test_negative_required (test_gates.T.test_negative_required) ... ok
test_pass (test_gates.T.test_pass) ... ok
test_tamper (test_ledger.T.test_tamper) ... ok
test_valid (test_ledger.T.test_valid) ... ok
test_abort (test_orchestrator.T.test_abort) ... ok
test_pass (test_orchestrator.T.test_pass) ... ok
test_required (test_package_integrity.T.test_required) ... ok

----------------------------------------------------------------------
Ran 8 tests in 21.214s

OK
```

```text
TEST_EXIT_CODE=0
```

## Demonstração isolada do protocolo

```json
{
  "status": "SEALED_PASS",
  "manifest": "<DEMO_OUT>/release-manifest.json",
  "ledger": "<DEMO_OUT>/ledger.jsonl",
  "ledger_state": {
    "valid": true,
    "total": 26,
    "begin": 1,
    "final": 1,
    "bad_hash": 0,
    "orphan_begin": 0,
    "orphan_final": 0
  },
  "gates": [
    {
      "gate": "G_INPUT_IMMUTABLE",
      "passed": true,
      "reason": "hash da entrada preservado",
      "evidence_refs": []
    },
    {
      "gate": "G_TESTS",
      "passed": true,
      "reason": "testes positivos verdes",
      "evidence_refs": [
        "0b76ecfe-c259-44bf-ba04-726fcce92fa3"
      ]
    },
    {
      "gate": "G_NEGATIVE_TESTS",
      "passed": true,
      "reason": "testes negativos verdes",
      "evidence_refs": [
        "29a35ef7-4435-49e9-8d5a-d7399b0738bf"
      ]
    },
    {
      "gate": "G_LEDGER",
      "passed": true,
      "reason": "valid=True bad_hash=0",
      "evidence_refs": []
    },
    {
      "gate": "G_EVIDENCE",
      "passed": true,
      "reason": "evidência positiva e negativa registrada",
      "evidence_refs": [
        "0b76ecfe-c259-44bf-ba04-726fcce92fa3",
        "29a35ef7-4435-49e9-8d5a-d7399b0738bf"
      ]
    },
    {
      "gate": "G_NO_FALSE_GREEN",
      "passed": true,
      "reason": "PASS sustentado por artefato e testes",
      "evidence_refs": []
    },
    {
      "gate": "G_STABILITY",
      "passed": true,
      "reason": "estabilidade 3/3",
      "evidence_refs": []
    },
    {
      "gate": "G_NO_NEW_DEFECTS",
      "passed": true,
      "reason": "nenhum defeito novo",
      "evidence_refs": []
    }
  ]
}
```

```text
DEMO_EXIT_CODE=0
```

## Provado neste ambiente

- cadeia SHA-256 do ledger;
- adulteração detectada;
- falso verde bloqueado;
- teste negativo obrigatório;
- mesmo adapter constrói e critica;
- estabilidade `3/3`;
- break-glass externo;
- release manifest com hashes.

## Não executado neste ambiente

- build e execução do Docker;
- integração com Hermes real;
- integração com Bolt;
- VPS;
- GitHub.
