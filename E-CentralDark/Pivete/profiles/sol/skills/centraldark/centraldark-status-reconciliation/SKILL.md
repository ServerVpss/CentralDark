---
name: centraldark-status-reconciliation
description: "Status semáforo: cor não é prova; tem genealogia e HEAD."
trigger: "Painéis de status e screenshots em CentralDark"
author: "Hermes Agent"
license: "MIT"
---

# CentralDark Status Reconciliation

Indicadores visuais (❌ vermelho, ⏳ amarelo, ✅ verde) são evidência observacional com genealogia — não verdades eternas nem dívidas eternas.

## STATUS_VISUAL
1. Identificar origem do indicador
2. Identificar PR/commit/execução que o produziu
3. Registrar timestamp + HEAD/SHA + causa
4. Verificar estado posterior — foi resolvido?
5. Reconciliar com estado atual

## STATUS_KEY
```
source + scope + artifact + HEAD/SHA + timestamp + cause_signature
```

## Classificação
- **Vermelho histórico ≠ dívida atual** → pode ser `historical_resolved` se commit posterior resolveu
- **Verde ≠ verdade eterna** → revalidar quando HEAD muda (`GREEN_WITHOUT_DENOMINATOR` → `NOT_PROVEN`)
- **Fotos são evidência, não prova** — screenshots valem como observação mas não provam Git/runtime
- **STATUS_RECONCILIATION_REQUIRED=true** quando visual não bate com realidade

## Regras de deduplicação
- `SE mesmo problema reaparece` → dedupe pela causa
- `SE evidência posterior resolve` → `historical_resolved`
- `SE ainda reproduz no presente` → `current_residual`
- `SE estado não liga ao HEAD atual` → `UNKNOWN`

## Quando fotos contam
Fotos/screenshots são evidência observacional válida — bom para detectar sinais de trabalho, falhas, frentes concorrentes. Mas a cor sozinha não prova estado atual do Git ou runtime. Dois painéis bonitos da CentralDark são arquitetura visual desejada, não prova de "Sistema estável, 128 checks, 52 receipts".

## Pitfalls
- Tratar vermelho passado como dívida sem checar estado posterior
- Tratar verde como eterno sem revalidar com HEAD
- Achar que cor = prova sem genealogia
- Repetir indicador reconciliado como problema novo

## References
- `references/status-genealogy-rules.md` — regras detalhadas, exemplos, templates de genealogia