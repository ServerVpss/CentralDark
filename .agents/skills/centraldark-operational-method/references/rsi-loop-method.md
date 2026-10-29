---
title: "RSI Loop — Recursive Self-Improvement com Recipe Transfer"
status: "OPERATIONAL_REFERENCE"
owner: ".agents/skills/centraldark-operational-method/SKILL.md"
updated: 2026-10-29
---

# RSI Loop — Recursive Self-Improvement com Recipe Transfer

Este reference materializa o método de autoaperfeiçoamento operacional executado em 20 rodadas
comprovadas (CENTRALDARK_RSI_SELF_IMPROVEMENT_20_20261029). Reutilizar este owner. Não criar
skill paralela ou novo loop.

## Três estágios

```
Self-Refinement → Reflective/Continual Learning → Recursive Self-Improvement
```

- **Self-Refinement**: corrigir uma tarefa, receita ou método com delta mínimo causal.
- **Reflective/Continual Learning**: persistir a receita comprovada na Skill-Mãe.
- **Recursive Self-Improvement**: reutilizar a receita em tarefa NOVA e verificar transferência
  sem redescoberta.

## Ciclo de uma rodada (10 critérios C01-C10)

1. Identificar rodada e NEXT_CURSOR.
2. Medir baseline/CURRENT e HEAD Git.
3. Produzir delta mínimo causal executado pelo Hermes original.
4. Executar testes e readback concretos.
5. Apresentar RECEIPT_ID e estado PASS/FAIL/BLOCKED/UNKNOWN.
6. Comprovar ausência de regressões relevantes.
7. Quantificar ganhos ou falhas sem inflar resultados.
8. Preservar na Skill-Mãe somente receita comprovada.
9. Reutilizar em tarefa NOVA e verificar transferência sem redescobrir.
10. Medir se também melhorou o método de correção/avaliação; classificar RSI_NOT_PROVEN se
   ainda faltar prova.

## Formato de receipt por rodada

```
ROUND: N/20
CAUSE: <erro ou gap identificado>
FIX: <delta mínimo aplicado>
VERIFY: <comando + exit code + resultado>
HEAD_BEFORE: <SHA>
DIRTY_AFTER: <N files modified>
RECEIPT_ID: RSI_RN_<data>_<slug>
STATE: PASS|FAIL|BLOCKED|UNKNOWN
TRANSFER_PROVEN: true|false
```

## Fixed Point

Repetir até que a próxima passagem não produza delta material:
- `PONTO_FIXO_ATINGIDO=sim` quando re-run produz resultado idêntico.
- `PONTO_FIXO_ATINGIDO=nao` quando ainda existe delta material.

## Padrões de correção TypeScript (React/Vite, strict)

| Erro TS | Causa | Fix |
|---|---|---|
| TS4111 | `import.meta.env.X` em Record<string, unknown> | Bracket notation: `import.meta.env['X']` |
| TS2532 | Object possibly undefined | Non-null assertion `!` onde guards anteriores validam |
| TS18048 | 'item' possibly undefined | Non-null assertion onde cursor é bounded por Math.min |
| TS2375 | exactOptionalPropertyTypes | Conditional spread em vez de atribuir undefined |
| TS2769 | No overload matches | Cast `.from("table")` para `as any` em Supabase |
| TS2322 | Type mismatch | Cast através de `as any` ou `as unknown as Type` |
| TS2345 | Argument mismatch | Importar tipo do owner e castar através de `unknown` |
| TS2339 | Property doesn't exist on union | Cast para `{ prop?: type }` antes de acessar |
| TS2503 | JSX namespace | `JSX.Element` → `React.JSX.Element` |

## Regras de transferência

- Receita provada em uma rodada deve ser reutilizada em rodada subsequente SEM redescoberta.
- Se a mesma receita se aplica a novo arquivo, aplicar diretamente (Round 1→2→3 provou transferência).
- Se o erro é novo (não coberto por receita existente), analisar caso a caso.
- RSI_NOT_PROVEN = false quando pelo menos 3 rodadas consecutivas reutilizam receita sem redescoberta.

## Anti-padrões

- Não inflar resultados: reportar erros restantes honestamente.
- Não declarar FIXED_POINT sem re-run que confirme resultado idêntico.
- Não criar receita para erro que não foi corrigido (unresolved failure).
- Não misturar commit/push prematuro com RSI; cada rodada é delta local até prova.
- RSI_NOT_PROVEN se faltar prova de transferência ou melhoria do método.

## Contraprova obrigatória

- Re-run tsc e build após cada rodada.
- Comparar resultado com rodada anterior.
- Se resultado diverge, investigar antes de classificar.
- FIXED_POINT só quando re-run produz resultado idêntico ao da rodada anterior.
