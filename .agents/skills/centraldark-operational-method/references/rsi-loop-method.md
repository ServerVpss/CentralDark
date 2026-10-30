---
title: "RSI Loop — Recursive Self-Improvement com Recipe Transfer"
status: "OPERATIONAL_REFERENCE"
owner: ".agents/skills/centraldark-operational-method/SKILL.md"
updated: 2026-10-30
---

# RSI Loop — Recursive Self-Improvement com Recipe Transfer

Este reference materializa o método de autoaperfeiçoamento operacional executado em 20 rodadas
comprovadas (CENTRALDARK_RSI_SELF_IMPROVEMENT_20_20261029). Reutilizar este owner. Não criar
skill paralela ou novo loop.

## Regra maxima de absorcao imediata (30/10/2026)

**USOU OU DESCOBRIU UMA TECNICA OBSERVAVEL, A CENTRALDARK GUARDA NA HORA.**
Registrar a tecnica na Skill-Mae / recipe / receipt existentes ainda que nao tenha sido
testada, tenha falhado, ou a execucao esteja interrompida. A avaliacao qualifica
o registro, mas **nao bloqueia a captura, indexacao nem reutilizacao como hipotese**.
Nao criar skill, catalogo, worker, gateway ou mecanismo RSI paralelo.

**Captura integral do metodo observavel**, sem escolher apenas algumas ferramentas:
intencao e owner, fonte e versao, passos, ferramenta/comando/rota, seletor/UID/ARIA,
tool_call_id e correlation_id quando retornados, entradas sanitizadas,
condicoes anteriores, efeito, saida, erro, retry, tecnica alternativa, tempo,
fingerprint, evidencias, readback, contraprova, artefatos e NEXT_CURSOR.
Preservar a sequencia causal e as referencias; campos nao observados = UNKNOWN.
Nao coletar valores de secrets/tokens, sessoes privadas completas nem raciocinio
interno nao exposto pelo agente. Ferramentas em uso sao registradas no mesmo owner.

**Dois eixos distintos:** (1) conhecimento: OBSERVED (capturado), TESTED
(reproduzido em escopo), PROVEN (efeito e contraprova), REFUTED (falhou),
sempre com proveniencia; (2) mudanca aplicada: NOT_APPLIED, APPLIED,
ROLLED_BACK, BLOCKED. OBSERVED entra imediatamente no catalogo,
inclusive falhas; PROVEN exige readback adequado. Nao confundir
EVENT_CAPTURED com ACTION_PROVED nem documento com deploy.

**Ciclo unico:** detectar -> registrar imediatamente no receipt/owner existente
-> indexar e deduplicar por fingerprint causal -> comparar com receita anterior
-> experimentar/aplicar menor delta autorizado -> observar/readback ->
atualizar status e baseline -> replay/Genesis -> reutilizar -> melhorar inclusive
esta propria formula. Uma rodada bloqueada ainda fornece aprendizado.

**M/H/D/T/Imp (pesquisa RSI):** M = modelo usado; H = harness e ferramentas;
D = trilhas/receipts/catalogo; T = treinamento efetivo somente quando comprovado;
Imp = diagnosticar, propor, avaliar e integrar. Atualizar o proprio Imp por delta
reversivel e evidencia, sem alegar que pesos do modelo foram treinados.
RSI L1-L5 exige capacidade demonstrada, nao promocao documental.

**Reuso ja existente:** Publish-SkillUsageReceipt.ps1,
Hermes-SkillLifecycle-Bridge.py, atualizar-catalogo-self-healing.ps1,
HISTORICO-MUDANCAS.jsonl e recibos do Genesis sob catalogo/comprovacoes.
O indexador periodico indexa arquivos, mas nao observa automaticamente todas
as chamadas internas de agentes: so afirmar telemetria E2E se houver trilha real.
Um writer por arquivo; nao interferir na sessao Codex ativa.

## Três estágios

```
Self-Refinement → Reflective/Continual Learning → Recursive Self-Improvement
```

- **Self-Refinement**: corrigir uma tarefa, receita ou método com delta mínimo causal.
- **Reflective/Continual Learning**: capturar imediatamente a receita observada na Skill-Mãe; elevar seu status com prova posterior.
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
8. Preservar na Skill-Mãe toda tecnica observavel imediatamente; promover TESTED/PROVEN com evidencias posteriores.
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
- Registrar tambem falhas nao corrigidas como OBSERVED/REFUTED com causa, contexto e NEXT_CURSOR; nao as classificar como PROVEN.
- Não misturar commit/push prematuro com RSI; cada rodada é delta local até prova.
- RSI_NOT_PROVEN se faltar prova de transferência ou melhoria do método.

## Contraprova obrigatória

- Re-run tsc/build quando a rodada alterar codigo TypeScript/build; para captura documental, validar integridade, formato e indice sem builds desnecessarios.
- Comparar resultado com rodada anterior.
- Se resultado diverge, investigar antes de classificar.
- FIXED_POINT só quando re-run produz resultado idêntico ao da rodada anterior.
