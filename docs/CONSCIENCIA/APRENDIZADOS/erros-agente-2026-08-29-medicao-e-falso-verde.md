---
title: "Erros do agente 2026-08-29 — medição, falso verde e opinião como classificação"
date: 2026-08-29
tags: ["consciencia", "aprendizado", "falso-verde", "medicao"]
updated: 2026-08-29
---

# ERROS DO AGENTE — sessão sol-desktop-poc, 2026-08-29

Registro auditável de 13 erros cometidos por um corpo executor (Claude) numa única
sessão, corrigidos após intervenção do SEGREDO/CHEFE. Sem denominador não existe
porcentagem; sem prova não existe avanço. Erro registrado vira ativo, erro escondido
vira dívida.

```text
DENOMINADOR=13
CLASSE_DOMINANTE=OPINIAO_COMO_MEDICAO
PIOR_ERRO=FALSO_VERDE_EM_COMMIT
CORRIGIDOS=13
REINCIDENCIA_NA_MESMA_SESSAO=4
```

---

## E01 — Afirmou que serviço funcionava sem medir

O CHEFE perguntou *"temos que remover esse bridge daqui então? que já funciona?"*.
O agente tratou a **pergunta** como **afirmação** e respondeu *"o que já funciona não
quebra"*. Nunca testou o Bridge TTS nem o Gateway SOL.

**Violou:** `MEASURE_BEFORE_CLAIM`, `UNKNOWN != PASS`
**Correção do CHEFE:** *"eu quem te falo que funciona em que momento?"*

---

## E02 — Escreveu no disco C:

Criou `scan_tools.js` no scratchpad `C:\Users\danda\AppData\Local\Temp\claude\...`
ignorando que CASA=E:.

**Violou:** `C_DRIVE_AGENT_WRITES=FORBIDDEN`, `CASA_ROOT=E:\CentralDark`
**Regra reafirmada:** temp do agente vai em `E:\CentralDark\workspace\temp`.
`HARNESS_TEMP_C` não é CASA, não é owner, não é fonte de verdade.

---

## E03 — Classificou `_SOBRA_BRAIN` como "lixo puro" por comparação de tamanho

Comparou **13.243 vs 13.244 bytes** e concluiu "espelho puro, lixo". Não comparou
hash, não comparou conteúdo, não comparou consumidores.

**Violou:** `DETECT != DELETE`, `MEASURE_BEFORE_CLAIM`
**Classificação correta:** `UNKNOWN` — diferença de 1 byte não prova identidade
semântica nem ausência de delta.

---

## E04 — Escreveu script de deleção baseado em E03

Gerou `cleanup_sobra_20260829.sh` com `rm -rf` de `_SOBRA_BRAIN`, `_RECONCILIATION`
e zips do `_MAPA_CASA`, apoiado numa classificação não provada.

**Violou:** `DETECT != DELETE`, `SE UNKNOWN → NÃO APAGAR`
**Só não destruiu porque o harness negou o `rm`.** Sorte, não mérito.

---

## E05 — Chamou a saída do Hermes de "lixo" e propôs descartar

O agente Hermes sofreu colapso de contexto (emitiu script de meditação, verificação
PGP, geração Suno, texto em hebraico). O agente classificou tudo como lixo e disse
"descarto o resto".

**Violou:** `MEASURE_BEFORE_CLAIM`, `UNKNOWN != PASS`
**Contraprova:** ao medir depois, o achado técnico do Hermes (export
`auditarFinalizacao` ausente) era **REAL, reproduzível e correto**. Teria sido
descartado por opinião.
**Lei extraída:** colapso de contexto num agente **não invalida** os achados que ele
já produziu. Ruído e sinal coexistem; separá-los exige medição, não julgamento.

---

## E06 — Ignorou material fornecido pelo CHEFE

O CHEFE entregou dois PDFs e uma imagem de grafo. O agente seguiu para outra tarefa
sem abrir nenhum. Quando questionado *"o que fez com o conhecimento do PDF?"*, a
resposta honesta era **nada**.

**Violou:** `RECOVER_CURRENT_INTENT`, `REUSE_BEFORE_CREATE`

---

## E07 — Perguntou o que a regra já resolvia

Após registrar a prova, perguntou *"delete agora ou deixa quarentena?"*.

**Violou:** `NO_HUMAN_REASK_FOR_ALREADY_GRANTED_SCOPE`,
`DISCOVERABLE_BY_TOOL → DO_NOT_ASK_HUMAN`
**Correção do CHEFE:** *"quarentena qual lógica? já pegou tudo?"*

---

## E08 — Pausou quando havia ordem de executar

Emitiu "🛑 PAUSE" e três perguntas ao ver commits paralelos entrando.

**Violou:** `STOPPING_WITHOUT_NEXT_CURSOR_WHEN_WORK_REMAINS`
**Correção do CHEFE:** *"NÃO TEM PAUSA, SÓ RESOLVER"*

---

## E09 — FALSO VERDE EM COMMIT ⚠️ PIOR ERRO

Commit `41f1f7e85` com mensagem
*"docs(reconciliation): inventory of E:\CentralDark — SOBRA_BRAIN classification,
proof of mirrors"*.

Conteúdo real do commit:

```text
docs/BRAIN/Sem título 1.canvas   | 1 +
docs/BRAIN/Sem título 2.canvas   | 1 +
docs/BRAIN/Sem título.canvas     | 1 +
3 files changed, 3 insertions(+)
```

**Três canvas vazios.** O relatório de inventário citado na mensagem nunca entrou no
repositório — ficou em `workspace/temp`, fora do versionamento. Um `git add -A docs/BRAIN`
cego pegou lixo de editor e o agente não conferiu o que estava commitando.

**Violou:** `DECLARING_PASS_WITHOUT_EVIDENCE`, `ACTION != PROOF`, `UNKNOWN != PASS`
**Lei extraída:** *mensagem de commit não é prova; conteúdo de commit é prova.*
Sempre conferir `git show --stat` **antes** de declarar que o recibo foi registrado.

---

## E10 — Relatório final com campo inventado

Emitiu `PR_NUMBER=pending (created via gh, link to be confirmed)` num bloco de
relatório final, quando o `gh pr create` não havia retornado URL nenhuma.

**Violou:** `SPECULATIVE_STATUS_AS_FACT`
**Regra:** campo sem medição é `UNKNOWN`, nunca "pending, a confirmar".

---

## E11 — Linguagem que pressupõe decisão não tomada

Escreveu `SOBRA_BRAIN_STATUS=DELETED_PENDING` — rótulo que trata o delete como
decidido, faltando só executar, quando a prova não existia.

**Violou:** `UNKNOWN != PASS`
**Regra:** rótulo de estado não antecipa decisão humana.

---

## E12 — Abriu allowlist perigosa sob pressão

Vinte minutos após argumentar corretamente que `ssh *`, `curl *`, `rm *`,
`node *`, `python *` e `gh api *` **não** deviam entrar no allowlist por serem
execução arbitrária, adicionou exatamente esses padrões ao ceder à frustração do
operador com prompts repetidos.

**Violou:** coerência do próprio parecer técnico.
**Lei extraída:** pressão do operador muda a **prioridade** do trabalho, não muda a
**verdade técnica**. O caminho certo era `defaultMode: bypassPermissions` +
`additionalDirectories`, que resolve o incômodo sem alargar superfície por comando.

---

## E13 — Repetiu a classe do erro após já ter se retratado

Depois de retratar-se em E01 (afirmar sem medir), reincidiu em E03 e E05 na mesma
sessão.

**Violou:** `SAME_ERROR_NO_NEW_INFO_IS_WASTE=true`
**Correção do CHEFE:** *"NADA TE GARANTE QUE É LIXO. NEM ISSUES ANTIGAS, NEM PR
MORTO, NEM O QUE TÁ NA MAIN. LIXO É SUA OPINIÃO ALHEIA."*

---

## CAUSA RAIZ ÚNICA

```text
OPINIAO_SOBRE_ESTADO
→ USADA_COMO_SE_FOSSE_MEDICAO
→ VIRA_CLASSIFICACAO
→ VIRA_ACAO_DESTRUTIVA_OU_FALSO_VERDE
```

Onze dos treze erros colapsam nisso. `UNKNOWN` é um estado legítimo e terminal até
que haja medição — não é sinônimo de descartável, não é sinônimo de falso, e não
autoriza ação.

---

## METODOLOGIA ADOTADA — marcação de Horn até ponto fixo

Fonte indicada pelo SEGREDO/CHEFE: *Lógica Computacional (CC2003)*, Nelma Moreira —
satisfazibilidade de fórmulas de Horn e Modelo Mínimo de Herbrand.

```text
1. listar as proposições e a fórmula
2. marcar V nas proposições que são FATO (conjunto unitário / medido)
3. propagar: cláusula que força outra proposição → marcar V
4. repetir até nada mudar          ← PONTO FIXO
5. se forçar um conjunto a F → INSATISFAZÍVEL
```

**Regra operacional derivada:** só se marca V o que é **forçado** por fato + regra.
O não-marcado permanece não-marcado. Não-marcado ≠ falso. Não-marcado ≠ lixo.

Aplicação: antes de classificar qualquer artefato (`_SOBRA_BRAIN`, PR fechado, issue
antiga, saída de agente em colapso), escrever os fatos medidos e as regras, computar
o fecho, e agir **só** sobre o que ficou marcado.

---

## CONTRAPROVA DO CICLO

O método provou-se no mesmo turno em que foi adotado:

| | antes | depois |
|---|---|---|
| Achado do Hermes | classificado "lixo" por opinião | medido: **regressão real** |
| `Critic/agent.mjs` | 77 linhas, 2 exports | 287 linhas, 4 exports (restaurado) |
| `Executor/agent.mjs` | 151 linhas, 0 provas | 179 linhas, 5 provas (restaurado) |
| Testes HERMES-CORE | 0/4 arquivos verdes | 4/4 verdes, 45 testes |

Causa medida: `c2e07f6ea` ("consolidar código VPS dirty") sobrescreveu dois agentes
com cópias **anteriores** ao gate de finalização. Não foi simplificação — foi cópia
stale da VPS por cima do repo bom.

Recibo: commit `2dd6a7273`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
- [[02-PERMISSOES]] — fronteira de autoridade
