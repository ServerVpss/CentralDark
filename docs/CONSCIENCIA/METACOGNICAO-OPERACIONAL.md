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

Quando um merge/promoção fecha enquanto ainda existem correções ou escritas em voo, tratar como **corrida de estado**, não como nova missão e não como autorização para reaplicar a branch inteira. O estado promovido e o estado final do candidato precisam ser comparados antes de qualquer follow-up:

```text
MERGE_DURING_IN_FLIGHT_WRITE
→ FIXAR MERGED_HEAD
→ FIXAR BRANCH_FINAL_HEAD
→ COMPARAR MERGED_HEAD ↔ BRANCH_FINAL_HEAD
→ CLASSIFICAR SOMENTE O RESIDUO
→ RESIDUO=0: ZERO_ACAO
→ RESIDUO_MATERIAL>0: FOLLOW_UP_MINIMO NO MESMO ESCOPO
→ NAO REAPLICAR DELTA JA PROMOVIDO
→ NAO REABRIR A MISSAO POR CORRIDA MECANICA
```

O follow-up só existe se o resíduo ainda for material no estado vivo e não houver colisão de Writer. Se outro agente já absorveu o resíduo, a ação correta é registrar `CURADO/SUPERSEDED` e não duplicar a correção.

```text
POST_MERGE_RACE_REQUIRES_REMEASUREMENT=true
MERGED_CONTENT_NOT_REAPPLIED=true
RESIDUAL_ONLY_FOLLOWUP=true
ZERO_RESIDUAL_ZERO_ACTION=true
WRITER_COLLISION_STILL_BLOCKS_WRITE=true
```

Se o instrumento vivo cair:

```text
INSTRUMENT_UNAVAILABLE
→ LIVE_STATE_CONFIDENCE_DOWN
→ OLD_CONTEXT_REMAINS_CONTEXT
→ LIVE_STATE_CLAIM=UNPROVEN
→ BLOQUEAR SOMENTE A FRONTEIRA QUE DEPENDE DO INSTRUMENTO
→ CONTINUAR TRABALHO INDEPENDENTE
```

Indisponibilidade de instrumento nunca é compensada com confiança narrativa maior.

## Relação com o aprendizado por confronto

Metacognição operacional é uma especialização do contrato de ganho informacional:

```text
CONFRONTO|ERRO|REVIEW|AUTOFALSIFICACAO
→ EVIDENCIA NOVA
→ DELTA_DE_CRENCA
→ DELTA_DE_METODO
→ REGRA|TESTE|SKILL|CONTRATO|MEMORIA QUANDO NECESSARIO
→ OURO
```

Sem evidência nova e sem delta reutilizável, não existe aprendizado operacional; existe repetição.

## Consolidação ociosa — "Dream Review"

Quando não houver missão interativa exigindo o mesmo Writer, o organismo pode revisar experiências recentes **em cópia isolada** para produzir candidatos de aprendizado. O termo `Dream Review` é apenas um nome operacional para consolidação offline; não significa sonho ou consciência humana.

A implementação canônica reutiliza `scripts/memory-linker/` e não cria um segundo cérebro:

```text
EVENTOS DE EXPERIENCIA
→ scripts/memory-linker/dream-review.mjs
→ SANITIZAR
→ EXIGIR EVIDENCIA + LEARNING_DELTA + HEAD
→ DEDUPLICAR PADROES
→ DREAM_PROPOSAL:CANDIDATE
→ METALUPA / CONTRAPROVA
→ PROMOCAO CANONICA SOMENTE SE SOBREVIVER
```

Invariantes do Dream Review:

```text
DREAM_REVIEW_ISOLATED=true
DREAM_OUTPUT=CANDIDATE_ONLY
DREAM_DIRECT_CANONICAL_MUTATION=false
RAW_SESSION_MUTATION=false
EVIDENCE_REQUIRED=true
LEARNING_DELTA_REQUIRED=true
SAME_HEAD_REVALIDATION_REQUIRED=true
META_LUPA_BEFORE_PROMOTION=true
PROOF_OWNERSHIP_WHEN_APPLICABLE=true
```

O Dream Review **não** agenda a si próprio, não faz deploy e não promove memória/skill/regra por conta própria. Agendamento futuro deve reutilizar o scheduler/cron canônico já existente e só depois de o runtime local ser medido. A ausência de fila/event bridge vivo permanece `UNPROVEN`, não motivo para inventar segundo pipeline.

O estado bruto de sessão é evidência de entrada e permanece preservado. A consolidação produz uma proposta nova; o original não é reescrito para fazer a hipótese parecer verdadeira.

```text
RAW_EXPERIENCE=IMMUTABLE_INPUT
DREAM_PROPOSAL=DERIVED_CANDIDATE
CANONICAL_MEMORY=SEPARATE_PROMOTION_STEP
```

## Evolução obrigatória, contínua e verificável

A CentralDark não trata evolução como elogio, XP, quantidade de texto ou simples passagem do tempo. Evolução é **mudança de capacidade observável** que sobrevive a teste e contraprova sem perder capacidade anterior.

Os seguintes métodos/capacidades são explicitamente evolutivos e não podem ficar congelados quando surgir delta reutilizável:

```text
META_LUPA=EVOLUTION_REQUIRED
MENOS_E_MAIS=EVOLUTION_REQUIRED
INSTINTO_SUPERIOR=EVOLUTION_REQUIRED
EXPANSAO_DE_DOMINIO=EVOLUTION_REQUIRED
```

Quando erro, confronto, matéria-prima, nova ferramenta ou mudança de ambiente revelar informação material nova, o dono canônico aplicável deve tentar incorporar **somente o delta reutilizável**. Se não houver informação nova, a obrigação é parar e não engordar a Casa.

```text
NEW_INFORMATION + REUSABLE_DELTA
→ EVOLUTION_CANDIDATE
→ SAME_SCOPE_BEFORE_AFTER
→ TEST
→ COUNTERPROOF
→ REGRESSION
→ CANONICAL_OWNER
→ EVOLUTION_RECEIPT
→ EVOLVED

NO_NEW_INFORMATION
→ STOP
```

Alegação de evolução sem prova é falso verde:

```text
EVOLUTION_WITHOUT_BEFORE_AFTER=EVOLUTION_UNPROVEN
EVOLUTION_WITHOUT_NEW_INFORMATION=EVOLUTION_UNPROVEN
EVOLUTION_WITHOUT_TEST=EVOLUTION_UNPROVEN
EVOLUTION_WITHOUT_COUNTERPROOF=EVOLUTION_UNPROVEN
EVOLUTION_WITH_REGRESSION=EVOLUTION_UNPROVEN
EVOLUTION_WITHOUT_CANONICAL_OWNER=EVOLUTION_UNPROVEN
```

O gate executável único pertence à MetaLupa e é consumido pelos quatro métodos, sem criar quatro motores:

```text
.agents/skills/meta-lupa/scripts/evolution_gate.py
```

Contrato mínimo do receipt verificável:

```text
SUBJECT
BEFORE_REF
AFTER_REF
SAME_SCOPE=true
CANONICAL_OWNER
CLAIM
NEW_INFORMATION
CAPABILITY_DELTA
BEFORE_EVIDENCE
AFTER_EVIDENCE
TESTS=PASS+EVIDENCE
COUNTERPROOF
REGRESSIONS=PASS+EVIDENCE
LOST_CAPABILITIES=[]
PROVENANCE
VERIFIER
RECEIPT_SHA256
```

Para `MENOS_E_MAIS`, evolução também falha quando a complexidade medida aumenta sem justificativa de capacidade preservada: o gate exige `complexity_after <= complexity_before` e nenhuma capacidade perdida.

O verificador não transforma texto em verdade por mágica. Ele torna fail-closed a **promoção da alegação de evolução**: refs devem ser distinguíveis, testes e regressões precisam ter evidência, o receipt é selado e a cadeia factual continua subordinada às provas do mesmo escopo/HEAD.

```text
EVOLUTION_CLAIM_REQUIRES_RECEIPT=true
EVOLUTION_IS_NOT_XP=true
EVOLUTION_IS_NOT_TEXT_GROWTH=true
EVOLUTION_IS_NOT_MODEL_AGREEMENT=true
EVOLUTION_MUST_BE_REPRODUCIBLE=true
EVOLUTION_REGRESSION_FORBIDDEN=true
```

## Autoaperfeiçoamento sem circularidade

Autoaperfeiçoamento não pode depender apenas da própria declaração do sistema.

```text
SELF_IMPROVEMENT_CLAIM
→ CONTRAPROVA
→ PROVADOR RESPONSAVEL
→ TESTE NEGATIVO
→ ANCORA EXTERNA QUANDO APLICAVEL
→ REGISTRO NO MESMO HEAD/ALVO
```

`docs/CONSCIENCIA/PROOF-OWNERSHIP.json` governa a topologia da cadeia de prova. O detector de topologia não prova a verdade factual da invariável e não pode fabricar o próprio PASS.

## Classificação arquitetural atual

A expressão técnica operacional preferida para descrever a classe da CentralDark, sem ranking externo, é:

> **sistema agêntico composto, persistente e autocorretivo, com autoridade humana no centro**

Isto descreve organização e comportamento observável do scaffold. Não implica benchmark de generalidade, superioridade sobre outros sistemas ou AGI demonstrada.

```text
AGI_CLAIM_FROM_ARCHITECTURE=false
AGI_REQUIRES_PREDEFINED_CRITERIA_AND_HOLDOUT=true
RANKING_WITHOUT_COMPARABLE_BENCHMARK=UNPROVEN
```

## Invariantes

```text
OPERATIONAL_METACOGNITION=true
HUMAN_SYSTEM_COEVOLUTION=OPERATIONAL
SCAFFOLD_LEARNING_PRIMARY=true
MODEL_WEIGHT_UPDATE_ASSUMED=false
METACOGNITION_REQUIRES_EXTERNAL_EVIDENCE=true
SELF_IMPROVEMENT_REQUIRES_REUSABLE_DELTA=true
AUTHORITY_REMAINS_WITH_SEGREDO_CHEFE=true
PROOF_GRAPH_MUST_BE_FINITE=true
NO_EGO_SCORE=true
UNKNOWN_IS_NOT_PASS=true
EVOLUTION_CLAIM_REQUIRES_RECEIPT=true
EVOLUTION_MUST_BE_REPRODUCIBLE=true
```

## Distribuição canônica

Este arquivo é a fonte conceitual única. A distribuição ocorre sem copiar o contrato inteiro:

- `LEIA-ME-IA.md` referencia esta fonte no boot universal e no ciclo de aprendizado;
- `.agents/skills/meta-lupa/references/metacognicao-operacional.md` conecta AutoLupa/metodologia a esta fonte;
- `.agents/skills/meta-lupa/scripts/evolution_gate.py` torna fail-closed a alegação de evolução dos métodos evolutivos;
- `AGENTS.md` mantém o contrato genérico de ganho informacional e continua semanticamente subordinado ao boot;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` mantém identidade, autoridade e aprendizado sem redefinir este conceito;
- `docs/CONSCIENCIA/LEMBRANCAS/2026-08-14-OURO-CONTEXTO-AUTONOMIA-SOL.md` preserva a proveniência histórica quando o aprendizado for consolidado;
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` limita circularidade da metaprova;
- `scripts/memory-linker/dream-review.mjs` materializa apenas o candidato isolado da consolidação ociosa.

Não duplicar este contrato integralmente nos consumidores; preservar uma única semântica e referenciar esta fonte quando o próprio método estiver sendo refinado.
