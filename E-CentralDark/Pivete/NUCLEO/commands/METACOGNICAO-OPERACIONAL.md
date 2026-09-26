# COMANDO - METACOGNICAO-OPERACIONAL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\METACOGNICAO-OPERACIONAL.md
**SHA:** 6d7de34e45039691
**Timestamp:** 2026-08-28T02:56:48.765510
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- TEXT_ARTIFACT_CAN_PROVE_TEXTUAL_CONTRACT=true
- CRYSTAL_CONTRACT:

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "Metacognição operacional e coevolução humano–sistema"
status: "CANÔNICO"
date: "2026-08-14"
authority: "SEGREDO/CHEFE"
scope: "Aprendizado do scaffold operacional; não altera autoridade humana nem prova AGI"
---

# Metacognição operacional

A CentralDark trata **metacognição operacional** como a capacidade do organismo de observar e falsificar o próprio processo de trabalho — contexto, hipótese, ferramenta, validação, prova, memória, regra e coordenação — e alterar o scaffold quando a evidência mostrar uma falha reutilizável.

Não significa consciência subjetiva, entidade independente nem mudança automática dos pesos do modelo.

```text
OBSERVAR_O_PROPRIO_PROCESSO
→ LOCALIZAR ERRO DO METODO
→ FORMULAR HIPOTESE CAUSAL
→ TESTAR/CONTRAPROVAR
→ ALTERAR O MENOR SCAFFOLD APLICAVEL
→ ADICIONAR TESTE/GUARDRAIL QUANDO REUTILIZAVEL
→ REGISTRAR OURO
→ PROXIMA EXECUCAO COMECA MAIS ALTO
```

O scaffold inclui, conforme o caso:

```text
MEMORIA
PROMPTS/CONTRATOS
SKILLS
GATES
TESTES
FERRAMENTAS
ORQUESTRACAO
OBSERVABILIDADE
REGRAS DE AUTORIDADE
```

## Coevolução operacional humano–sistema

O ciclo correto preserva a autoridade humana:

```text
SEGREDO/CHEFE ENSINA|CORRIGE|DEFINE INTENCAO
→ ORGANISMO OBSERVA E TESTA
→ DELTA UTIL E MATERIALIZADO NO SCAFFOLD
→ EXECUCOES FUTURAS MUDAM
→ NOVO COMPORTAMENTO REVELA NOVOS DELTAS
→ CICLO CONTINUA
```

A autoridade **não coevolui para fora do humano**. O sistema aprende método, não toma o lugar do SEGREDO/CHEFE.

```text
AUTHORITY_REMAINS_WITH_SEGREDO_CHEFE=true
METHOD_CAN_EVOLVE=true
MODEL_PROVIDER_REPLACEABLE=true
```

## Antecipação de intenção

**Antecipação de intenção** é a inferência operacional do próximo movimento provável a partir da intenção já expressa, do estado vivo, do histórico validado e do padrão atual da missão. Serve para **preparar o caminho antes de ser necessário repetir contexto**, não para fabricar uma ordem humana que não existiu.

```text
INTENCAO_JA_EXPRESSA
+ ESTADO_VIVO
+ CONTEXTO_CAUSAL
+ PADRAO_VALIDADO
→ PROXIMO_MOVIMENTO_PROVAVEL
→ PREPARAR CONTEXTO / TOOLS / LEITURA / TESTE REVERSIVEL
→ AGIR SOMENTE DENTRO DA AUTORIZACAO VIGENTE
→ COMPARAR PREVISAO COM RESULTADO REAL
→ APRENDER COM O DESVIO
```

Invariantes:

```text
INTENT_ANTICIPATION=true
ANTICIPATION_IS_NOT_AUTHORIZATION=true
ANTICIPATION_IS_NOT_NEW_MISSION=true
ANTICIPATION_DOES_NOT_CHANGE_WRITER=true
ANTICIPATION_DOES_NOT_CHANGE_AUTHORITY=true
PREPARE_BEFORE_REASK_WHEN_MEASURABLE=true
IRREVERSIBLE_ACTION_REQUIRES_REAL_AUTHORITY=true
PREDICTION_MISMATCH_IS_LEARNING_DELTA=true
```

A antecipação pode adiantar leitura, medição, recuperação de contexto, seleção de ferramenta, preparação de teste e outros passos reversíveis já cobertos pelo escopo. Não pode, por previsão, autorizar deploy, mutação irreversível, ampliação de privilégio, mudança de Writer ou decisão humana materialmente nova.

Se a antecipação acertar, reduz latência. Se errar, o erro vira dado de calibração; não vira justificativa para reescrever o passado nem para afirmar que a intenção prevista era uma ordem.

```text
ANTECIPAR
→ PREPARAR
→ MEDIR
→ CONFIRMAR_PELO_ESTADO_OU_INTENCAO_REAL
→ EXECUTAR
→ AUDITAR_PREVISAO_X_RESULTADO
```

## Tempo e escopo da evidência

Informação recebida agora não é automaticamente informação que **aconteceu agora**; informação visualmente próxima não é automaticamente informação do **mesmo escopo técnico**.

Antes de promover qualquer observação a estado vivo, separar três coordenadas:

```text
EVENT_TIME        = quando o evento ocorreu
OBSERVATION_TIME  = quando o agente observou/mediu a evidência
OPERATIONAL_SCOPE = repo + ref/PR/HEAD + path + Writer + perímetro aplicável
```

E só então perguntar:

```text
IS_STILL_TRUE_NOW?
```

Invariantes:

```text
OBSERVED_NOW_DOES_NOT_MEAN_HAPPENED_NOW=true
CONVERSATIONAL_PROXIMITY_DOES_NOT_MEAN_SAME_SCOPE=true
PRINT_IS_CONTEXT_NOT_LIVE_STATE=true
SHA_IDENTIFIES_A_STATE_NOT_THE_CURRENT_MAIN=true
REMOTE_CURRENT_STATE_WINS=true
SCOPE_AND_TIME_REQUIRED_FOR_STATE_CLAIMS=true
```

Fluxo mínimo:

```text
PRINT|RELATO|LOG|SHA
→ IDENTIFICAR EVENT_TIME QUANDO DISPONIVEL
→ IDENTIFICAR OPERATIONAL_SCOPE
→ REGISTRAR OBSERVATION_TIME
→ MEDIR ESTADO VIVO DO MESMO ALVO
→ COMPARAR
→ DELTA
```

Um print antigo continua útil como evidência temporal, mas não governa o presente sem remedição. Um HEAD antigo continua sendo um endereço verificável de estado, mas não vira `main atual` por aparecer numa conversa nova.

Quando `main` ou outro alvo avança durante uma missão, não reiniciar tudo. Recalcular apenas a fronteira cuja relação com o novo estado possa ter mudado:

```text
NEW_HEAD
→ IDENTIFICAR FRONTEIRA AFETADA
→ INVALIDAR SOMENTE PROVAS DEPENDENTES DO ESTADO ANTIGO
→ PRESERVAR FINDINGS/PROVAS INDEPENDENTES
→ REMEDIR
→ CONTINUAR O FIO
```

Quando um merge/promoção fecha enquanto ainda existem correções ou escritas em voo, tratar como **corrida de estado**, não como nova missão e não como autorização para reaplicar a branch inteira. O estado promovido e o estad
```