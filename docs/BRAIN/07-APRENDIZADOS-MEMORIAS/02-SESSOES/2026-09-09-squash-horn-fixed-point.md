# 2026-09-09 — Squash por fechamento monotônico

STATUS=CRISTAL_OPERACIONAL
OWNER=scripts/github-autonomia-promocao.mjs
ESCOPO=promoção automática por squash

## Intenção preservada

Executar squash somente quando o estado justificável do PR fecha no mesmo HEAD/base observado, sem transformar o próprio veredito do promotor em prova.

## Base lógica adaptada

O material `tlc23(2).pdf` usa cláusulas de Horn e descreve propagação de consequências até não ser possível acrescentar mais informação. A implementação adota apenas esse padrão de fechamento monotônico finito; não afirma implementar todo o modelo mínimo de Herbrand nem provar verdade absoluta.

```text
FATOS EXTERNOS
→ REGRAS HORN FINITAS
→ ADICIONAR CONSEQUÊNCIAS
→ REPETIR
→ NENHUM FATO NOVO
→ FIXED_POINT
```

## Guardas

- `SQUASH_READY` nunca entra como fato inicial.
- receipt SHA-256, HEAD/base, autoridade, mapa e mergeability vêm de observação externa ao fechamento.
- ciclo autorreferente sem âncora não cria fato novo.
- `UNKNOWN` continua não sendo PASS.
- `FIXED_POINT` significa fechamento do escopo operacional, não verdade metafísica final.
- guarda de Aquiles: subdivisão conceitual infinita não vira loop infinito; cada rodada produtiva aumenta monotonicamente um universo finito de fatos.

## Prova local

`github-autonomia-promocao.test.mjs`: 26/26 PASS após inclusão dos testes de fechamento, autorreferência circular e drift de HEAD.
`github-autonomia-varredura.test.mjs`: 12/12 PASS.
`github-autonomia-green-guard.test.mjs`: 8/8 PASS.
`agent-call.test.mjs`: 69/69 PASS.
`trigger-fabric/verify_repo_contract.py`: PASS.

Lacuna preexistente, não causada por este delta: `universal-method-contract.mjs --self-test` já falha em `c6553b02...` com `ENGINE_REGISTRY_SECTION_MISSING` e continua igual após o delta.
