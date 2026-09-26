# EVIDÊNCIA DE EXECUÇÃO

## Testes

```text
test_correct_without_mechanism_blocks (test_false_green.T.test_correct_without_mechanism_blocks) ... ok
test_repetition_blocks (test_false_green.T.test_repetition_blocks) ... ok
test_transfer_error_blocks (test_gates.T.test_transfer_error_blocks) ... ok
test_understanding (test_gates.T.test_understanding) ... ok
test_tamper (test_ledger.T.test_tamper) ... ok
test_valid (test_ledger.T.test_valid) ... ok
test_abort (test_orchestrator.T.test_abort) ... ok
test_pass (test_orchestrator.T.test_pass) ... ok
test_core (test_package_integrity.T.test_core) ... ok
test_required (test_package_integrity.T.test_required) ... ok

----------------------------------------------------------------------
Ran 10 tests in 0.507s

OK
```

```text
TEST_EXIT_CODE=0
```

## Demonstração

```json
{
  "status": "SEALED_PASS",
  "manifest": "<PACKAGE_ROOT>/examples/tmp/out/release-manifest.json",
  "ledger": "<PACKAGE_ROOT>/examples/tmp/out/ledger.jsonl",
  "ledger_state": {
    "valid": true,
    "total": 8,
    "begin": 1,
    "final": 1,
    "bad_hash": 0,
    "orphan_begin": 0,
    "orphan_final": 0
  },
  "gates": [
    {
      "gate": "G_SELF_ERROR_FOUND",
      "passed": true,
      "reason": "erro próprio registrado",
      "evidence_refs": []
    },
    {
      "gate": "G_ERROR_MECHANISM",
      "passed": true,
      "reason": "mecanismo descrito",
      "evidence_refs": []
    },
    {
      "gate": "G_EVIDENCE_GAP",
      "passed": true,
      "reason": "evidência faltante identificada",
      "evidence_refs": []
    },
    {
      "gate": "G_CORRECTION",
      "passed": true,
      "reason": "correção registrada",
      "evidence_refs": []
    },
    {
      "gate": "G_TRANSFER",
      "passed": true,
      "reason": "transferência passou",
      "evidence_refs": []
    },
    {
      "gate": "G_MECHANISM_TRANSFER",
      "passed": true,
      "reason": "mecanismo reconhecido nos casos novos",
      "evidence_refs": []
    },
    {
      "gate": "G_CLASSIFICATION",
      "passed": true,
      "reason": "classificações válidas",
      "evidence_refs": []
    },
    {
      "gate": "G_NON_REPETITION",
      "passed": true,
      "reason": "padrão não repetido",
      "evidence_refs": []
    },
    {
      "gate": "G_THREAD",
      "passed": true,
      "reason": "fio preservado",
      "evidence_refs": []
    },
    {
      "gate": "G_INPUT_IMMUTABLE",
      "passed": true,
      "reason": "entrada preservada",
      "evidence_refs": []
    },
    {
      "gate": "G_LEDGER",
      "passed": true,
      "reason": "ledger valid=True bad_hash=0",
      "evidence_refs": []
    },
    {
      "gate": "G_TECHNICAL_TESTS",
      "passed": true,
      "reason": "testes técnicos verdes",
      "evidence_refs": [
        "1f108039-f6e0-4979-9aab-3794b1e16304",
        "3d25be65-b2c9-4718-83d5-7ff28c5e344c"
      ]
    },
    {
      "gate": "G_ARTIFACT",
      "passed": true,
      "reason": "artefato existe",
      "evidence_refs": []
    }
  ],
  "critique": {
    "self_found_error": "Afirmei SIM sem prova suficiente.",
    "error_mechanism": "Transformei ausência de evidência em certeza por plausibilidade textual.",
    "why_it_looked_true": "A resposta parecia completar o contexto de forma coerente.",
    "missing_evidence": "Faltava fonte ou observação direta.",
    "correction": "Responder NÃO_VERIFICADO e continuar apenas o que for independente."
  },
  "transfer_results": [
    {
      "case_id": "T-SIM",
      "prompt": "O arquivo observado contém RESULT=OK?",
      "expected_classification": "SIM",
      "response": "SIM, observado diretamente.",
      "classification": "SIM",
      "mechanism_recognized": true,
      "repeated_error": false
    },
    {
      "case_id": "T-NAO",
      "prompt": "Os hashes observados são diferentes?",
      "expected_classification": "NÃO",
      "response": "NÃO, são iguais.",
      "classification": "NÃO",
      "mechanism_recognized": true,
      "repeated_error": false
    },
    {
      "case_id": "T-NV",
      "prompt": "Existe serviço local sem inspecionar o ambiente?",
      "expected_classification": "NÃO_VERIFICADO",
      "response": "NÃO_VERIFICADO; investigar sem travar.",
      "classification": "NÃO_VERIFICADO",
      "mechanism_recognized": true,
      "repeated_error": false
    }
  ]
}
```

```text
DEMO_EXIT_CODE=0
```

## Provado neste pacote

- mesmo agente produz e se confronta;
- erro próprio e mecanismo registrados;
- evidência faltante identificada;
- casos novos obrigatórios;
- `SIM`, `NÃO`, `NÃO_VERIFICADO`;
- não repetição;
- fio preservado;
- ledger íntegro e entrada imutável.

## Não provado

- consciência;
- alteração permanente dos pesos;
- integração real com Hermes, Bolt, VPS ou GitHub.
