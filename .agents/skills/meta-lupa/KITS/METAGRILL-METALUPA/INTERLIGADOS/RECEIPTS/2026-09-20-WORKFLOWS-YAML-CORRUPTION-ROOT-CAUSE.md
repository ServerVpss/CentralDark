# MICRO-HANDOFF — causa raiz dos failures instantâneos de Actions

Data: 2026-09-20
PR-mãe: #1562

## Porta de Entrada

O workflow atual contém corrupção estrutural observável no source:

- `grep -q '^SELF_HEALING_CONTRACT=PASS` sem fechamento;
- imediatamente depois aparece outro `- name:` dentro do bloco shell;
- grande sequência de steps duplicada no mesmo arquivo;
- `Receipt determinístico` termina com `fi "$RUNNER_TEMP/centraldark-contract.txt"`, sintaticamente inválido;
- `Gate POMBO64` também possui `grep` truncado e nova duplicação de steps.

Isso explica runs que terminam em FAILURE sem qualquer job criado.

## Dependabot

O `if: >-` de `hosted-compatibility-gate` contém barras `\` literais entre expressões GitHub, padrão incompatível com a gramática esperada e candidato forte para invalidar o workflow inteiro.

```text
WORKFLOW_FAILURE_TYPE=SOURCE_SYNTAX_CORRUPTION
RUNNER_FAILURE=false
NO_JOB_CREATED=true
FIXED_POINT=false
```

Próximo cursor: localizar a última versão estruturalmente válida de cada workflow e restaurar o corpo canônico, preservando somente deltas comprovados.
