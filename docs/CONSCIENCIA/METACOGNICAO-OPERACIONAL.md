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

## Lei META — autoraplicação verificável

Na CentralDark, `META` não significa criar uma camada nova em cima da anterior. Significa **aplicar a própria lei de uma capacidade sobre ela mesma** e verificar se o resultado observável melhorou.

```text
META(X) = X APLICA A PROPRIA LEI SOBRE X
```

Os donos META obrigatórios são:

```text
META_EXPANSAO_DE_DOMINIO
→ a expansão pergunta se está enxergando o campo certo
→ mata ponto cego
→ VER MELHOR

META_MENOS_E_MAIS
→ o método pergunta quanto do próprio método é realmente necessário
→ mata gordura
→ CARREGAR MENOS

META_LUPA
→ a Lupa tenta falsificar a própria conclusão e a própria cadeia de prova
→ mata autoengano
→ SABER/PROVAR MELHOR

META_INSTINTO_SUPERIOR
→ o reflexo verifica se virou comportamento melhor, com menos atrito e sem perder missão
→ mata atrito operacional
→ AGIR MELHOR

META_METACOGNICAO_OPERACIONAL
→ o método de aprender observa e falsifica o próprio modo de aprender
→ mata aprendizado ornamental
→ APRENDER A APRENDER MELHOR
```

O ciclo não termina numa escada:

```text
VER MELHOR
→ CARREGAR MENOS
→ SABER MELHOR
→ AGIR MELHOR
→ APRENDER COM O DELTA
→ VER MELHOR DE NOVO
↺
```

### Refino META cruzado — minerar o minério da mineração

Autorreflexão individual não esgota a lei META. Quando uma capacidade META produz um resultado material, esse resultado também vira matéria para **as outras lentes META aplicáveis**. O objetivo é extrair estrutura residual que uma única lente não conseguiria perceber, simplificar ou falsificar sozinha.

```text
MATERIA|ERRO|OURO|CRISTAL|ARTEFATO|DELTA_DE_METODO
→ META_EXPANSAO_DE_DOMINIO
   → FALTA CAMPO|CANAL|PREMISSA|CONSUMIDOR RELEVANTE?
→ META_MINERACAO
   → O RESULTADO AINDA ESCONDE ESTRUTURA CAUSAL REUTILIZAVEL?
→ META_MENOS_E_MAIS
   → O QUE PODE SER ESPREMIDO SEM PERDER CAPACIDADE?
→ META_LUPA
   → QUAL CLAIM|PROVA|PREMISSA PODE SER FALSIFICADA?
→ META_INSTINTO_SUPERIOR
   → QUAL DELTA PROVADO DEVE VIRAR REFLEXO MAIS RAPIDO E SEGURO?
→ META_METACOGNICAO_OPERACIONAL
   → O PROPRIO MODO DE APRENDER PODE MELHORAR?
→ CROSS_META_COUNTERPROOF
→ NOVA_INFORMACAO_OU_CAPACIDADE?
   SIM → REPETIR SOBRE O NOVO RESIDUO
   NAO → FIXED_POINT → STOP
```

Esse ciclo é **recursivo por informação**, não por número de camadas. `META_META_META` não é objetivo, métrica nem licença para criar novos motores. Cada nova passagem precisa acrescentar pelo menos um delta discriminável: estrutura causal, capacidade, simplificação sem perda, contraprova, reflexo operacional ou melhoria verificável do scaffold.

```text
META_EVALUATION_REQUIRED=true
META_MUTATION_REQUIRES_PROVEN_DELTA=true
CROSS_META_REFINEMENT_REQUIRED_WHEN_REUSABLE_DELTA=true
SAME_EVIDENCE_RELABELLED != NEW_INFORMATION
RECURSION_DEPTH_IS_NOT_PROGRESS=true
NO_NEW_INFORMATION → FIXED_POINT → STOP
```

"Evoluir ao máximo" significa **maximizar ganho verificável de capacidade e densidade de conhecimento sob os mesmos guardrails**, não maximizar texto, iterações ou mutações.

```text
MAX_EVOLUTION
= MAX(VERIFIED_CAPABILITY_GAIN + INFORMATION_DENSITY + REUSABILITY)
  SOB:
  NO_CRITICAL_REGRESSION
  AUTHORITY_PRESERVED
  PROOF_OWNERSHIP
  MINIMUM_NECESSARY_COMPLEXITY
```

Se uma nova passagem apenas renomear a conclusão, repetir a mesma evidência ou aumentar complexidade sem ganho, o resultado correto é `NO_CHANGE`.

### Artefato inclui texto — classe de artefato não é classe de prova

`ARTEFATO` é qualquer representação persistente ou transmissível que possa ser consumida pela Casa e alterar coordenação, memória, decisão, execução, prova ou comportamento. Portanto texto é artefato tanto quanto código, schema, teste, configuração, receipt, diagrama ou dataset.

```text
TEXT_IS_ARTIFACT=true
CODE_IS_ARTIFACT=true
SCHEMA_IS_ARTIFACT=true
TEST_IS_ARTIFACT=true
CONFIG_IS_ARTIFACT=true
RECEIPT_IS_ARTIFACT=true
DIAGRAM_IS_ARTIFACT=true
DATASET_IS_ARTIFACT=true
```

A força probatória depende do **claim** e do **consumidor**, não do formato:

```text
ARTIFACT_CLASS != PROOF_CLASS
TEXT_ARTIFACT_CAN_PROVE_TEXTUAL_CONTRACT=true
TEXT_ARTIFACT_CAN_CHANGE_SCAFFOLD=true
TEXT_ARTIFACT_ALONE_CANNOT_PROVE_RUNTIME_EFFECT=true
RUNTIME_EFFECT_REQUIRES_RUNTIME_OBSERVATION=true
```

Um texto canônico que muda o comportamento esperado do organismo é um artefato real de scaffold. Ele não vira, por isso, prova automática de que um efeito físico, deploy, provider ou runtime aconteceu.

`DOCUMENTACAO_MELHOROU != SISTEMA_EVOLUIU`. Texto pode ser evidência de scaffold alterado, mas evolução só fecha quando uma capacidade ou comportamento observável muda na direção declarada e sobrevive à prova.

## Evolução obrigatória, contínua e verificável

A CentralDark não trata evolução como elogio, XP, quantidade de texto ou simples passagem do tempo. Evolução é **mudança de capacidade observável** que sobrevive a teste e contraprova sem perder capacidade anterior.

Os seguintes métodos/capacidades são explicitamente evolutivos e não podem ficar congelados quando surgir delta reutilizável:

```text
META_LUPA=EVOLUTION_REQUIRED
MENOS_E_MAIS=EVOLUTION_REQUIRED
INSTINTO_SUPERIOR=EVOLUTION_REQUIRED
EXPANSAO_DE_DOMINIO=EVOLUTION_REQUIRED
METACOGNICAO_OPERACIONAL=EVOLUTION_REQUIRED
```

A lei é universal: **qualquer componente que alegue `EVOLVED` ou melhoria permanente deve fornecer o mesmo tipo de prova verificável**, mesmo quando não pertence aos cinco donos META acima.

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

O gate executável único pertence à MetaLupa e é consumido pelos cinco donos META e por qualquer outra capacidade que alegue evolução, sem criar motores paralelos:

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
META_SELF_APPLICATION_REQUIRED=true
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
META_SELF_APPLICATION_REQUIRED=true
META_EVALUATION_REQUIRED=true
META_MUTATION_REQUIRES_PROVEN_DELTA=true
CROSS_META_REFINEMENT_REQUIRED_WHEN_REUSABLE_DELTA=true
TEXT_IS_ARTIFACT=true
METACOGNICAO_OPERACIONAL=EVOLUTION_REQUIRED
```

## Distribuição canônica

Este arquivo é a fonte conceitual única. A distribuição ocorre sem copiar o contrato inteiro:

- `LEIA-ME-IA.md` referencia esta fonte no boot universal e no ciclo de aprendizado;
- `.agents/skills/meta-lupa/references/metacognicao-operacional.md` conecta AutoLupa/metodologia e a lei META a esta fonte;
- `.agents/skills/meta-lupa/scripts/evolution_gate.py` torna fail-closed a alegação universal de evolução e reconhece os cinco donos META obrigatórios;
- `AGENTS.md` mantém o contrato genérico de ganho informacional e continua semanticamente subordinado ao boot;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` mantém identidade, autoridade e aprendizado sem redefinir este conceito;
- `docs/CONSCIENCIA/LEMBRANCAS/2026-08-14-OURO-CONTEXTO-AUTONOMIA-SOL.md` preserva a proveniência histórica quando o aprendizado for consolidado;
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` limita circularidade da metaprova;
- `scripts/memory-linker/dream-review.mjs` materializa apenas o candidato isolado da consolidação ociosa.

Não duplicar este contrato integralmente nos consumidores; preservar uma única semântica e referenciar esta fonte quando o próprio método estiver sendo refinado.

## CRISTAL — saída irredutível do CROSS-META, não nova lente

`CRISTAL` é o nome de um **resultado mais forte** do CROSS-META quando a saída já chegou ao ponto fixo e também sobrevive a uma prova explícita de irreducibilidade no escopo declarado. Não existe `META_CRISTAL` como sétima lente, novo cérebro, nova skill ou novo motor.

```text
META_CRISTAL_IS_NEW_LENS=false
CRISTAL_IS_CROSS_META_OUTPUT=true
FIXED_POINT != IRREDUCIBLE
IRREDUCIBLE_REQUIRES_EXECUTABLE_RECEIPT=true
```

A essência operacional é:

```text
CAVA O QUANTO PRECISAR
→ PROVA O QUE SOBROU
→ ENTREGA SO O IRREDUTIVEL
```

`MENOS_E_MAIS` aqui não significa pensar pouco, pesquisar pouco ou esconder complexidade. Significa permitir profundidade interna proporcional ao problema e terminar com a menor representação **que ainda preserva capacidade, prova, proveniência, reconstrução e caminho de volta ao owner**.

```text
RESUMO → reduz texto
CRISTAL → reduz representação sem perder função verificável
```

O fluxo é o mesmo, sem nova camada META:

```text
MATERIA
→ CROSS_META
→ FIXED_POINT
→ DECLARAR RESIDUO CANDIDATO
→ TENTAR REMOVER CADA RESIDUO
→ REMOCAO PRESERVA TODOS OS CONTRATOS?
   SIM → REMOVER → CROSS_META DE NOVO
   NAO → PRESERVAR + EVIDENCIA DO CONTRATO QUE QUEBROU
→ MEDIR CUSTO EFETIVO + QUALIDADE
→ COMPARAR CANDIDATOS AVALIADOS
→ SEM RESIDUO REMOVIVEL
+ SEM CANDIDATO AVALIADO QUE PARETO-DOMINE
+ TODOS OS GATES DE FIDELIDADE
→ CRISTAL_CONDENSADO_IRREDUTIVEL
```

### Irredutibilidade sem falso absoluto

A condição matemática ideal de mínimo global exigiria demonstrar que **nenhum subconjunto próprio possível** preserva todos os contratos. Essa afirmação só é válida com busca exaustiva do espaço correspondente. O gate atual deliberadamente **não fabrica essa prova**.

Ele prova uma afirmação menor e auditável:

```text
IRREDUCIBILITY_SCOPE=DECLARED_RESIDUE_SET
GLOBAL_POWERSET_MINIMALITY=UNPROVEN_UNLESS_EXHAUSTIVE
```

Portanto `IRREDUCIBLE` significa: no conjunto de resíduos explicitamente encontrado e coberto pelas seis lentes CROSS-META, cada candidato foi submetido a remoção discriminante; nenhum permaneceu removível sem quebrar contrato material.

Cada tentativa de remoção deve apontar qual classe de contrato quebra, por exemplo:

```text
CRITICAL_CAPABILITY
TRACEABILITY
RECONSTRUCTION
PROOF_OWNERSHIP
QUALITY_NONINFERIORITY
AUTHORITY
RUNTIME_CLAIM
```

`meta_fixed_point=true` sozinho continua insuficiente. Ponto fixo informacional diz que a nova passagem não encontrou informação/capacidade nova; não prova que a representação restante já é mínima no escopo testado.

### Custo efetivo — compacto que reabre tudo não é ganho

Quando existe `source-on-demand`, medir somente bytes/tokens do artefato compacto pode fabricar compressão. O custo relevante inclui o que realmente precisa voltar das fontes sob uma carga de trabalho declarada:

```text
L_effective = L_boot + L_source_on_demand_observed
```

`L_source_on_demand_observed` exige denominador de workload e evidência da distribuição usada. Não inventar `P(q)` ou custo esperado sem amostra defensável.

Para alegar cristal:

```text
L_effective_after < L_effective_before
```

O percentual de compressão é **calculado pelo gate**, não confiado ao candidato.

### Fidelidade, qualidade e densidade

Claims críticos não usam média para esconder perda:

```text
CRITICAL_CAPABILITY_RETENTION_REQUIRED=100%
MATERIAL_TRACEABILITY_REQUIRED=100%
LOST_CRITICAL_CAPABILITIES_REQUIRED=0
RECONSTRUCTION=PASS
PROOF_OWNERSHIP=PASS+EXTERNAL_ANCHOR_EVIDENCE
```

Para qualidade não crítica, o denominador e a margem `epsilon` são congelados **antes** do resultado.

Quando a avaliação é determinística:

```text
CONFIDENCE_METHOD=EXACT_DETERMINISTIC
```

Não fabricar intervalo estatístico.

Quando o mesmo benchmark é avaliado antes/depois de forma estocástica:

```text
CONFIDENCE_METHOD=PAIRED_BOOTSTRAP
CONFIDENCE_LEVEL=0.95
```

O limite inferior de 95% precisa provar ganho (`LCB(delta) > 0`) ou não-inferioridade (`LCB(delta) >= -epsilon`), conforme objetivo e `epsilon` pré-declarados. O contrato pareado não aceita um intervalo de proporção não pareado como atalho para o delta.

A densidade conservadora é:

```text
D = QUALITY_FLOOR / L_effective
```

e o cristal exige:

```text
D_after > D_before
```

Assim, reduzir muito o tamanho enquanto derruba qualidade não pode virar “densidade melhor” por narrativa.

### Pareto sem fingir domínio universal

O gate procura dominância somente entre alternativas **realmente avaliadas**:

```text
PARETO_SCOPE=EVALUATED_CANDIDATE_SET
```

O candidato selecionado é ligado às métricas do próprio receipt; não pode declarar números diferentes só para parecer Pareto-ótimo. Se qualquer alternativa avaliada tiver custo efetivo menor ou igual e todas as qualidades/fidelidades maiores ou iguais, com pelo menos uma melhora estrita, o claim `IRREDUCIBLE` falha.

Isso não prova ótimo global sobre candidatos nunca gerados ou nunca medidos.

### Receipt forte opcional

A evolução normal continua usando o contrato universal já existente. `crystal_claim=IRREDUCIBLE` é um claim **opcional e mais forte**; só então o receipt precisa acrescentar:

```text
CRYSTAL_CLAIM=IRREDUCIBLE
CRYSTAL_CONTRACT:
  OUTPUT_KIND=CRISTAL_CONDENSADO_IRREDUTIVEL
  META_CRISTAL_IS_NEW_LENS=false
  CRITICAL_RETENTION=100%
  TRACEABILITY=100%
  RECONSTRUCTION=PASS
  PROOF_OWNERSHIP=PASS+EXTERNAL_ANCHOR
  EFFECTIVE_LOAD=MEASURED
  QUALITY=PREDECLARED_DENOMINATOR+EPSILON
  IRREDUCIBILITY=DECLARED_RESIDUE_SET+REMOVAL_PROBES
  PARETO=EVALUATED_CANDIDATE_SET
```

Se qualquer parte falhar, o resultado pode continuar sendo um `EVOLVED`, `FIXED_POINT` ou candidato condensado conforme a prova disponível, mas **não recebe o selo `IRREDUCIBLE`**.

```text
CRISTAL_CLAIM_DOES_NOT_UPGRADE_BASE_FAILURE=true
IRREDUCIBLE_IS_STRONGER_THAN_FIXED_POINT=true
NO_CRYSTAL_CLAIM_WITHOUT_STRICT_RECEIPT=true
```

## ZERO SILENT LEARNING — aprendizado material não pode morrer no executor

`ZERO_SILENT_LEARNING` é uma **invariante da Casa inteira**, não um formato de chat e não uma obrigação de despejar raciocínio privado. O alvo é impedir que um agente, workflow, ferramenta, motor ou sessão descubra uma correção material que altera a missão e depois deixe esse delta desaparecer quando o executor termina.

Aprendizado material é somente o delta que, sustentado por evidência, muda crença operacional, método, capacidade, decisão técnica ou scaffold de forma relevante para execuções futuras. Observação passageira, repetição, preferência sem impacto técnico e a mesma evidência renomeada não contam.

```text
MATERIAL_LEARNING
→ EVIDENCE
→ DELTA_DE_CRENCA|DELTA_DE_METODO|DELTA_DE_CAPACIDADE
→ EXPLICITAR CONCLUSAO + FONTE + O_QUE_MUDOU + IMPACTO
→ LOCALIZAR CANONICAL_OWNER
→ TESTAR/CONTRAPROVAR QUANDO APLICAVEL
→ CANDIDATE|NO_CHANGE|PROVEN
→ SE PROVEN + REUSABLE
   → MENOR REGRA|TESTE|SKILL|CONTRATO|MEMORIA APLICAVEL
   → PROXIMA EXECUCAO HERDA
```

A superfície do aprendizado deve ser auditável e inspecionável por `SEGREDO/CHEFE`, mas não exige cadeia de pensamento privada, token por token, scratchpad ou narrativa completa do raciocínio. O que não pode ficar escondido é o **resultado material**: conclusão, evidência/proveniência, delta, impacto, owner e estado de promoção.

```text
ZERO_SILENT_LEARNING=true
ZERO_SILENT_LEARNING_SCOPE=HOUSE
MATERIAL_LEARNING_MUST_SURFACE=true
MATERIAL_LEARNING_REQUIRES_EVIDENCE=true
MATERIAL_LEARNING_REQUIRES_OWNER=true
MATERIAL_LEARNING_REQUIRES_REUSABLE_DELTA=true
MATERIAL_LEARNING_MUST_OUTLIVE_EXECUTOR_WHEN_REUSABLE=true
MATERIAL_LEARNING_CANNOT_LIVE_ONLY_IN_SESSION=true
MATERIAL_LEARNING_MUST_BE_INSPECTABLE_BY_SEGREDO_CHEFE=true
MATERIAL_LEARNING_SURFACE=CONCLUSION+EVIDENCE+DELTA+IMPACT+OWNER+STATE
PRIVATE_CHAIN_OF_THOUGHT_NOT_REQUIRED=true
```

A lei não fabrica memória nem engorda a Casa. Se não houver informação nova ou delta reutilizável, o resultado correto continua sendo `NO_CHANGE`. Se houver delta material ainda não provado, ele deve ser visível como `CANDIDATE`, nunca promovido silenciosamente como verdade canônica.

```text
NO_NEW_INFORMATION_OR_REUSABLE_DELTA=NO_CHANGE
UNPROVEN_MATERIAL_LEARNING=CANDIDATE
UNSURFACED_MATERIAL_LEARNING=UNPROVEN
SILENT_CANONICAL_PROMOTION=FORBIDDEN
NO_NEW_MEMORY_ENGINE_REQUIRED=true
NO_NEW_WORKFLOW_REQUIRED=true
```

A aplicação é transversal: SOL, PIVETE/HERMES, agentes especialistas, workflows, ferramentas, modelos substituíveis e consolidação offline obedecem ao mesmo owner. Consumidores não copiam esta seção inteira; carregam `METACOGNICAO-OPERACIONAL.md` pelo boot e materializam o menor artefato no owner específico da ferida.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
