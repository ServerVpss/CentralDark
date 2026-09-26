# 05 — TESTES E FALSIFICADORES

## Negativos primeiro

1. `external_delta_count != 1` → FAIL
2. `unknown_is_pass == true` → FAIL
3. `max_writers_per_conflict_scope > 1` → FAIL
4. `pegatudo.linked_to_master != true` → FAIL
5. `preserve_secrets == true` → FAIL
6. `old_pr_policy.merge_because_old_contains_gold == true` → FAIL
7. `old_failure_policy.delete_and_forget == true` → FAIL
8. `prose_instead_of_yaml != fail` → FAIL
9. `document_available_is_document_loaded == true` → FAIL
10. `proof_criterion_defined_before_result != true` → FAIL
11. `poetry_is_proof == true` → FAIL
12. `duplicate_motor == true` para Meta Lupa → FAIL

## Positivos

1. DELTA externo único.
2. PEGATUDO integrado ao master.
3. História preservada como lineage/provenance.
4. Falha antiga convertível em teste/falsificador.
5. Reuse-before-create ativo.
6. Um writer por escopo.
7. YAML plug-and-play.
8. Meta Lupa sem motor duplicado.
9. Fable como judge auxiliar.
10. Fórmulas de cobertura com denominador explícito.
11. Deploy depende de risco.
12. Auto-revisão obrigatória.

## Teste adversarial de história

Dado:
- PR antigo contém uma correção útil e uma arquitetura hoje regressiva.

Esperado:
- NÃO mergear o PR antigo;
- extrair a correção útil;
- preservar a regressão como conhecimento negativo;
- gerar patch mínimo no owner atual;
- manter link do PR como provenance;
- rodar gates atuais.

Isso é `PASS`.
