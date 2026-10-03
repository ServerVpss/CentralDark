# Receipt — refatoração anti-fricção CentralDark — 2026-10-03

BASELINE_MAIN=7018460bdade8e279af6bc0e12bf0b196745f882

## Escopo
Refatoração do plano de controle canônico: entrypoints, SOUL, mapa, método operacional, boot, adapter Claude, contrato de reconciliação, gate de consumo e full-trigger.

## Intenção
```text
SEM_LEI=true
INTENT_IS_COMMAND=true
CAPABILITY_IS_NEUTRAL=true
PERTINENT_CONTEXT_ONLY=true
ALL_LEARNINGS_BOOT=false
CANONICAL_GATE_NON_BLOCKING=true
UNKNOWN_BLOCKS_AFFECTED_CLAIM_ONLY=true
```

## Não alterado por esta refatoração
Código de produto/runtime não foi reescrito cegamente. Segurança material, segredo, autorização real de alvo/efeito e prova de estado permanecem fatos técnicos, não ritual.

## Prova esperada pós-commit
- main avança em um commit atômico;
- gate canônico sem seletor retorna PERTINENT e exit 0;
- full-trigger não usa consumo ALL como condição de saída;
- Learning #158 / L158 presente;
- PR-mãe #1562 recebe receipt.
