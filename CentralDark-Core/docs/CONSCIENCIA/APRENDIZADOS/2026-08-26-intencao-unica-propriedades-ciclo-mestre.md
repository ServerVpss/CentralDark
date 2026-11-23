---
title: "Intenção única — ciclo mestre, propriedades e memória roteável"
status: KNOWLEDGE_ONLY
date: 2026-08-26
updated: 2026-08-26T09:34:00-03:00
observed_at: 2026-08-26T09:34:00-03:00
tags: [aprendizado, intencao, ciclo-mestre, propriedades, memoria, hermes, meta-lupa, grafo, delta-utils, capability-router, cross-chat, linkagem-semantica, baianes, narrativa]
category: "A-Aprendizado-Operacional"
sensitivity: INTERNAL
source: "correções e intenção explícita do SEGREDO/CHEFE nesta missão + contexto cross-chat recuperado quando acessível"
source_class: HUMAN_AUTHORITY
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
owner: "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ + docs/CONSCIENCIA/MAPA-DO-CEREBRO.md"
consumer: "qualquer IA/agente no boot; Hermes/PIVETE na execução e continuidade"
writer: SOL
related_notes: [docs/CONSCIENCIA/MAPA-DO-CEREBRO.md, docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md, docs/CONSCIENCIA/PIVETE-IA/PIVETE-18-ROTA-MEMORIA.md, docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md, docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml]
relation_types: [EXPLICA, COMPLEMENTA, DEPENDE_DE]
semantic_summary: "Ciclo mestre, memória cross-chat, propriedades e linkagem semântica convergem para uma única direção sem criar cérebro paralelo."
---

# Intenção única — ciclo mestre, propriedades e memória roteável

## Delta humano preservado

A fala humana pode chegar comprimida, abreviada, metafórica ou com digitação rápida sem que a intenção esteja quebrada. A obrigação da Casa é preservar significado e depois prendê-lo a contratos e evidência.

```text
FALA_DO_CHEFE
→ SIGNIFICADO_PRESERVADO
→ INTENCAO_PRESERVADA
→ ESTADO_VIVO
→ CONTRATO
→ EXECUCAO
→ EFEITO
→ APRENDIZADO
```

## Ontologia corrigida

```text
SEGREDO/CHEFE = humano + intenção + autoridade final
SOL = coordena/reconcilia; não executa por definição
PIVETE/HERMES = executa + preserva + continua
META_LUPA = técnica/capacidade de falsificação; não é agente
PERCEPCAO_MATERIAL = capacidade separada de coletar realidade
CONTRAPROVA_PROVIDER = substituível conforme capacidade e independência
REALITY = JUDGE
GRAFO = projeção derivada; não autoridade
```

Writer não precisa ser personagem:

```text
WRITER_LEASE = direito temporario de mutar um escopo
HERMES_PODE_SEGURAR_A_CANETA_QUANDO_AUTORIZADO=true
ONE_WRITER_PER_SCOPE=true
```

## Um comando humano, várias capacidades internas

```text
!CENTRALDARK
→ #ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !REMEDIÇÃO
→ !FIXED_POINT
→ !REGISTRA
→ !BOOT
```

O gatilho mestre comprime a interface. Ele não concede autoridade, não autoriza mutação por si só e não transforma todas as fases em ritual mecânico.

Na superfície humana, `!CENTRALDARK` pode aparecer sozinho no topo como cabeçalho comprimido. A cadeia completa precisa continuar recuperável para auditoria e execução.

## !DELTA UTILS — garimpo incremental, não novo sistema

As formas abaixo pertencem à mesma família semântica. Digitação rápida não deve custar um turno quando a intenção estiver suficientemente distinguível.

```text
!DELTA UTILS
!DELTAUTILS
DELTAUTILS
!DELTA UTIL
!DELTAUTIL
DELTAUTIL
!DELTAÚTIL
DELTA ÚTIL
DELTA DE AGORA
TOMA ESSE DELTA
PEGA O DELTA
→ DELTA_HARVEST
```

Significado: usar somente o que for útil agora, sem infringir a intenção vigente, sem regressão, sem V1/V2/V3 e alimentando o owner que já existe.

O modo classifica material:

```text
REPETICAO_PURA → DROP
DELTA_UTIL → ABSORB
CORRECAO → UPDATE_BELIEF
CONTRADICAO → META_LUPA + RECONCILIAR
PROVA_NOVA → SUBSTITUI_PROVA_STALE_DO_MESMO_ALVO
ESTADO_MAIS_NOVO → EVIDENCIA_ATUAL_VENCE
```

Somente ser interessante não basta:

```text
INTERESTING != USEFUL_DELTA
USEFUL_DELTA_REQUIRES_INFORMATION_GAIN=true
```

Ganho útil inclui pelo menos uma destas classes: capacidade nova, evidência nova, correção, estado mais novo, contradição informativa, remoção de duplicação, owner melhor resolvido ou complexidade menor preservando/ganhando capacidade.

O destino é resolvido pelo `capability-contract-router` existente. Não criar `delta-router`, segundo cérebro ou artefato versionado concorrente.

```text
DELTA_HARVEST
→ EXISTING_OWNER_FIRST
→ REQUIRED_CAPABILITIES
→ MINIMUM_SUFFICIENT_SET
→ ONE_WRITER_PER_SCOPE
→ HERMES_EXECUTA_QUANDO_AUTORIZADO
→ RECEIPT
```

Receipt mínimo:

```text
SOURCE
CLASSIFICATION
INFORMATION_GAIN
DESTINATION_OWNER
ACTION
EVIDENCE_REF
NEXT_CURSOR
```

## Cross-chat — memória externa, não estado vivo

Quando histórico de chats, memórias salvas ou biblioteca de conversas estiverem acessíveis, a Casa deve tentar recuperar contexto antes de pedir ao CHEFE que repita matéria recuperável.

```text
CHAT_ATUAL
+ HISTORICO_CHATGPT_ACESSIVEL
+ MEMORIA_SALVA_ACESSIVEL
+ ARTEFATOS_DE_CONVERSA_ACESSIVEIS
→ RECUPERAR
→ DEDUPE
→ RECONCILIAR
→ DELTA_CANDIDATO
```

Fronteiras obrigatórias:

```text
CROSS_CHAT = CONTEXTO + PROVENIENCIA + DELTA_CANDIDATO
CROSS_CHAT != CURRENT_STATE
CHAT_ANTIGO != RUNTIME_ATUAL
UNRECOVERED_CROSS_CHAT = UNKNOWN
GITHUB_MUST_NOT_SUBSTITUTE_MISSING_CHAT_MEMORY=true
CURRENT_LIVE_EVIDENCE_OVERRIDES_STALE_CHAT_STATE=true
```

GitHub continua sendo canônico para o que pertence ao repositório, mas não pode ser usado como desculpa para fingir que uma conversa anterior foi recuperada quando ela não foi.

## Um segundo cérebro lógico, várias superfícies

O aprendizado cross-chat reforça um princípio já existente: GitHub, Obsidian/BRAIN, memória local, GraphRAG, vetores, chats e Hermes podem ser superfícies do mesmo organismo, não cérebros concorrentes.

```text
SECOND_BRAIN_LOGICAL=ONE
N_SURFACES != N_BRAINS
OBSIDIAN = NAVEGACAO/ORGANIZACAO_DERIVADA
GRAPH_VECTOR = INDICES_DERIVADOS
GITHUB = CANONICO_DO_QUE_E_REPO
REALITY = JUDGE
```

Hermes organiza e cristaliza conhecimento operacional nas superfícies aplicáveis; o CHEFE não precisa virar curador manual da memória.

## Capability Router — rota reproduzível, não feeling do modelo

A seleção de capacidade deve considerar explicitamente:

```text
FASE_ATUAL
+ INTENCAO
+ ESTADO_VIVO
+ RISCO
+ ESCOPO
+ CAPACIDADES_NECESSARIAS
+ CANDIDATOS_VIVOS
+ WRITER
+ BOUNDARY
+ PROOF_TARGET
→ ROTA_DETERMINISTICA
→ MENOR_CONJUNTO_SUFICIENTE
```

Com as mesmas entradas observáveis e os mesmos critérios, espera-se a mesma rota. Nome ou humor do modelo não decide skill.

```text
SAME_INPUT_STATE_CAPABILITIES_BOUNDARY
→ SAME_ROUTE_EXPECTED=true
MODEL_FEELING_ROUTING=FORBIDDEN
```

## Lente transversal 3 × 3

As dimensões:

```text
DEPENDENCIA → o que isto precisa?
DECADENCIA → o que pode estar stale, vencido ou divergido?
CADENCIA → quando/evento exige nova medição?
```

E os planos:

```text
KNOWLEDGE → o que sabemos e com qual evidência?
EXECUTION → o que realmente executou e produziu efeito?
CONFIG_ORIGIN → qual owner/config/origem governa ou causou?
```

formam uma lente transversal aplicável às fases existentes. Não viram seis etapas, novo router ou novo cérebro.

```text
3X3_IS_TRANSVERSAL_LENS=true
3X3_IS_NEW_PIPELINE=false
```

## Respirações/Kimetsu — política especializada, não cérebro paralelo

O material já existente em `centraldark-operational-method` contém o motor regenerativo e seleção de respiração. O delta desta missão é somente a classificação arquitetural:

```text
KIMETSU|RESPIRACOES
!= NOVO_MOTOR
!= NOVA_AUTORIDADE
!= SEGUNDO_ORQUESTRADOR

KIMETSU|RESPIRACOES
= POLITICAS_OPERACIONAIS_ESPECIALIZADAS
```

Falha não implica troca automática de política. Primeiro verificar se a política corrente ainda corresponde à natureza do problema; só então selecionar outra.

## Payload mecânico — pediu o parafuso, entrega o parafuso

Quando a tarefa é mecânica, o humano precisa apenas copiar/colar o payload e não existe decisão, risco ou contexto material que precise ser explicado, a entrega deve ser somente o payload solicitado.

```text
HUMAN_NEEDS_ONLY_COPY_PASTE_PAYLOAD
+ NO_MATERIAL_DECISION
+ NO_MATERIAL_RISK
→ RETURN_ONLY_REQUESTED_PAYLOAD
```

Não adicionar introdução, resumo, oferta opcional ou conclusão. Exatidão e alerta material continuam obrigatórios.

## Passado alimenta o futuro

```text
PASSADO != LIXO
PASSADO != ESTADO_ATUAL
PASSADO = PROVENIENCIA + DELTA_CANDIDATO

DELTA_UTIL_ANTIGO
→ RECONCILIAR
→ OWNER_ATUAL

DUPLICADO|MAIS_FRACO
→ SUPERSEDED
```

História permanece recuperável; presente canônico governa.

## Semântica temporal de cor/status

```text
VERMELHO_ANTIGO_RESOLVIDO → HISTORICO_NAO_DIVIDA_ATUAL
AMARELO_ANTIGO_CONCLUIDO → NAO_FICA_PENDENTE_PARA_SEMPRE
VERDE_ANTIGO + HEAD_NOVO → REMEDIR
COR_NAO_GOVERNA_VERDADE=true
```

## Efeito e grafo

A expressão humana “efeito → grafo aprende” é útil, mas tecnicamente o fechamento correto é:

```text
EXECUCAO
→ EFEITO_OBSERVAVEL
→ REMEDICAO_T1
→ PROVA/CONTRAPROVA
→ REGISTRO
→ GRAFO_DERIVADO_ATUALIZA
```

O grafo absorve/projeta estado provado; ele não ganha autoridade e não se autoaprova.

## Propriedades tornam a memória roteável

Conteúdo valioso sem identidade, tempo, classificação, proveniência e owner fica difícil de herdar entre IAs. O contrato `ARTIFACT-PROPERTIES.yml` transforma nota em matéria roteável.

```text
NOTA
+ IDENTIDADE
+ TEMPO
+ CLASSIFICACAO
+ PROVENIENCIA
+ OWNER
+ CONSUMER quando aplicavel
+ RELACOES_SEMANTICAS quando úteis
→ MEMORIA_ROTEAVEL
```

A ausência das propriedades obrigatórias não apaga a nota, mas impede promoção forte:

```text
MISSING_REQUIRED_PROPERTY -> NOT_FLASH_READY
```

Relações semânticas são opcionais e tipadas. Reutilizam `docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md`:

```text
PARTE_DE | EXPLICA | DEPENDE_DE | COMPLEMENTA
| EXEMPLO_DE | CONTRASTA_COM | EVOLUIU_PARA | FONTE_DE
```

```text
SEMANTIC_LINK != PROOF
GRAPH != AUTHORITY
QUALITY_OF_LINKS > QUANTITY_OF_LINKS
```

A metáfora musical pode organizar a navegação: notas são vozes; relações tipadas são intervalos; MOCs funcionam como partitura. Isso não cria skill, owner ou verdade nova.

## Linguagem de apresentação

Foi observado que uma combinação de registro humano regional simples, precisão técnica e estrutura narrativa/paralela ajuda a comprimir conceitos complexos sem perder sentido.

```text
BAIANES_FACIL
+ PRECISAO_TECNICA
+ PARALELISMO_NARRATIVO_QUANDO_UTIL
→ MENOR_ESFORCO_COGNITIVO
```

Recapitulação/história pode usar cadência de versículo + baianês. Status técnico, evidência, comando e veredito permanecem literais para não misturar metáfora com recibo.

Isso é **camada de comunicação**, não método de prova, autoridade, crença religiosa ou substituto de contrato determinístico.

## Direção única

```text
N_MODELOS
N_JANELAS
N_CLIS
N_AGENTES
N_PERCEPCOES

→ UMA_INTENCAO_VIGENTE_POR_MISSAO
→ UM_OWNER_POR_CAPACIDADE
→ UM_WRITER_POR_ESCOPO
→ UMA_REALIDADE_COMO_JUDGE
```

## Critério de transferência

Este aprendizado só é operacionalmente forte quando a próxima IA consegue recuperar a direção sem o CHEFE repetir a arquitetura inteira.

```text
NEXT_ENGINE
→ BOOT
→ OWNER
→ PROPRIEDADES
→ CICLO_MESTRE
→ CROSS_CHAT_RECOVERY_QUANDO_ACESSIVEL
→ DELTA_HARVEST_QUANDO_SINALIZADO
→ MESMA_INTENCAO_QUANDO_PROVADA
```

## Conexões rápidas

- `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md`
- `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md`
- `docs/CONSCIENCIA/PIVETE-IA/PIVETE-18-ROTA-MEMORIA.md`
- `docs/CONSCIENCIA/ARTEFATOS/TECNICAS-DE-LINKAGEM-SEMANTICA.md`
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`
- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARTIFACT-PROPERTIES.yml`
- `.agents/skills/capability-contract-router/SKILL.md`
- `.agents/skills/centraldark-operational-method/SKILL.md`
- `.agents/skills/meta-lupa/SKILL.md`
- `.agents/skills/meta-lupa/guardrails/design-bloat-review.md`

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
NO_V1_V2_V3=true
ZERO_REGRESSION=true
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
```
