---
centraldark_note_schema: "brain07.v1"
centraldark_category: "02-SESSOES"
centraldark_kind: "CRISTAL_DE_SESSAO"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "2026-09-09 — Squash por fechamento monotônico"
centraldark_agent_recall: "Recuperar a intencao, correcoes, limites e NEXT_CURSOR antes de continuar; sessao historica nao equivale ao estado atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["yuji-identidade-e-continuidade","gojo-seis-olhos","goku-instinto-superior","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "15f53a6c2d14d55f1bf5162fb5fcb8a043b1ddf4"
---
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
