# MICRO-HANDOFF — expressão Dependabot reparada

Data: 2026-09-20

O workflow `.github/workflows/dependabot-auto-merge.yml` preservou os jobs de reconciliação recentes e recebeu somente a correção da expressão multiline do `hosted-compatibility-gate`.

```text
MAIN_COMMIT=e563fc4a1e8cd54cef9326ff9d528229e01f7889
BROKEN_LITERAL_BACKSLASHES=REMOVED
RECONCILIATION_JOBS_PRESERVED=true
CI_RESULT=UNKNOWN_UNTIL_NEW_RUN
```

`PATCH_ATOMICO=true`
`NO_ROLLBACK_OF_1599_CAPABILITY=true`

Próximo cursor: remedir os novos runs da Porta e Dependabot; se parsing passar, seguir para deploy/runtime.
