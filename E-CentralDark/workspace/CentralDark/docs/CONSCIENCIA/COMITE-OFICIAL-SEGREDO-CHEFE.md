---
title: "Comitê Oficial — SEGREDO/CHEFE"
status: "CANONICAL_PROJECTION"
updated: 2026-09-05
intent_authority: "SEGREDO/CHEFE"
---

# Comitê Oficial — projeção única, não segunda verdade

Este documento **não cria nova autoridade, nova memória, novo orquestrador nem segunda verdade**. Ele agrega e projeta, em uma única leitura humana, owners já existentes da Casa.

```text
SOURCE_OF_TRUTH=OWNERS_CANONICOS_EXISTENTES
COMMITTEE=PROJECAO_DE_ESTADO_E_METODO
COMMITTEE_IS_NOT_SECOND_AUTHORITY=true
CURRENT_STATE_GT_HISTORICAL_SNAPSHOT=true
UNKNOWN_IS_NOT_PASS=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true
```

## Owners que este Comitê costura

```text
IDENTIDADE/SOUL
→ docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md

LINGUAGEM/RESPOSTA AO CHEFE
→ docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md

GRAMATICA/PERFIS/SELOS
→ docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml

DEPLOY/MICRO-DEPLOY
→ docs/CONSCIENCIA/03-FLUXO-DEPLOY.md

RECONCILIACAO ANTES DE CRIAR
→ docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json

ORQUESTRACAO/WRITER UNICO
→ docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md

META LUPA
→ .agents/skills/meta-lupa/SKILL.md

HERMES/ESTEIRA/RUNNER/DEPLOY
→ .agents/skills/centraldark-esteira-motor/SKILL.md
```

Se qualquer texto deste Comitê divergir de um owner vigente ou do estado vivo medido, o Comitê deve ser reconciliado; ele nunca vence o owner nem a realidade.

# Papéis e selos

```text
👑 SEGREDO/CHEFE
= intenção + GOAL + autoridade humana final

☀️ SOL
= coordenação + reconciliação + costura de deltas

🏛️ ENEIAS
= estratégia contextual + análise de opções + riscos + encaminhamentos; não é segunda autoridade, segundo cérebro, segundo writer nem segundo Judge

🧿 SENTINELA
= observa alinhamento, drift e primeira aresta quebrada

🧭 MULTIBÚSSOLA
= mede direções, frente, trás, cruzamentos e reencontro

⊛ META LUPA
= teste discriminante + causalidade + contraprova

🪡 RECONCILIAR
= absorver no owner existente sem criar paralelo

☿ HERMES/PIVETE
= execução + preservação + continuidade

⚖ REALITY JUDGE
= veredito por evidência aplicável

🐚 CARACOL_REVERSO
= voltar ao último cursor provado sem apagar ouro independente

🧾 RECEIPT
= proveniência + SHA + handoff + estado medido

🚀 DEPLOY
= promoção real somente quando houver prova causal do runtime
```

# 🏛️ Eneias — arquitetura recuperada da Casa

A arquitetura de Eneias foi recuperada do histórico de trabalho do CHEFE e incorporada aqui **como arquitetura recuperada/candidata**, porque não há ainda evidência na `main` de um módulo/runtime Eneias implementado. O Comitê preserva a intenção sem transformar memória em execução.

```text
ENEIAS_STATUS=RECOVERED_ARCHITECTURE_CANDIDATE
ENEIAS_RUNTIME=UNKNOWN
ENEIAS_IMPLEMENTATION_ON_MAIN=NOT_PROVEN
ENEIAS_IS_SECOND_BRAIN=false
ENEIAS_IS_SECOND_ORCHESTRATOR=false
ENEIAS_IS_WRITER=false
ENEIAS_IS_JUDGE=false
```

## Papel recuperado

Eneias funciona como **camada estratégica de contexto e decisão proposta**. Ele organiza matéria complexa antes da mutação, mas não toma o lugar da SOL, do HERMES/PIVETE nem do REALITY JUDGE.

Entrada esperada:

```text
GOAL
+ CONTEXTO_ATUAL
+ HISTORICO_RELEVANTE
+ EVIDENCIAS
+ RESTRICOES
```

Saída esperada:

```text
ANALISE
+ OPCOES
+ RISCOS
+ CONTRADICOES
+ PRIORIDADES
+ ENCAMINHAMENTOS_PROPOSTOS
+ UNKNOWNS_EXPLICITOS
```

Integrações recuperadas:

```text
ELITE_GATEWAY / OMNI_ROUTER
MEMORIA / GRAFO
OBSERVABILIDADE
PROVENIENCIA / RECEIPTS
REALITY_JUDGE COMO VALIDADOR INDEPENDENTE
```

## Posição na Casa atual

Para obedecer `ONE_SYSTEM_ONLY` e não duplicar a coordenação da SOL, Eneias entra como **função estratégica consultiva dentro do mesmo fluxo**, depois que contexto e evidência já foram reunidos e antes que exista mutação.

```text
👑 SEGREDO/CHEFE — INTENCAO + GOAL
→ CENTRALDARK_AI_BOOT
→ HISTORY_RENDEZVOUS
→ CAPABILITY_LINEAGE
→ 🧿 SENTINELA / EVIDENCIA VIVA
→ 🏛️ ENEIAS / ESTRATEGIA CONTEXTUAL
→ ☀️ SOL / RECONCILIACAO E COORDENACAO
→ 🧭 MULTIBUSSOLA
→ ⊛ META_LUPA
→ 🪡 EXISTING_OWNER / RECONCILIAR
→ ONE_WRITER
→ ☿ HERMES/PIVETE EXECUTA
→ 🔬 CONTRAPROVA
→ 📏 REMEDICAO
→ ⚖ REALITY_JUDGE
→ 🧾 RECEIPT / GRAFO / CURSOR
→ 🚀 PROMOCAO QUANDO PROVADA
```

Eneias **propõe**; SOL reconcilia e coordena; HERMES/PIVETE executa dentro de autoridade; REALITY JUDGE decide por evidência.

## Leis de Eneias

```text
ENEIAS_RECEIVES_GOAL_CONTEXT_EVIDENCE=true
ENEIAS_RETURNS_ANALYSIS_RISKS_OPTIONS_HANDOFFS=true
ENEIAS_MUST_SURFACE_UNKNOWN=true
ENEIAS_MUST_REUSE_EXISTING_CAPABILITIES=true
ENEIAS_CANNOT_CREATE_PARALLEL_SYSTEM=true
ENEIAS_CANNOT_SELF_APPROVE=true
ENEIAS_CANNOT_TURN_INFERENCE_INTO_PROOF=true
ENEIAS_CANNOT_MUTATE_WITHOUT_OWNER_AND_AUTHORITY=true
ENEIAS_OUTPUT_IS_PROPOSAL_NOT_VERDICT=true
REALITY_JUDGE_REMAINS_INDEPENDENT=true
CURRENT_GT_HISTORY=true
```

## Próximo delta permitido para Eneias

Não criar `apps/modulos/eneias/` ou qualquer segundo núcleo por reflexo. Primeiro executar:

```text
SEARCH_EXISTING_OWNER
→ RECONCILIAR_CAPABILITY_LINEAGE
→ PROVAR_SE_FUNCAO_ENEIAS_JA_EXISTE_EM_SOL/JARVIS/MOTOR_MENTAL
→ DEDUPE_ABSORB
→ SOMENTE_SE_HOUVER_LACUNA_REAL, IMPLEMENTAR_DELTA_MINIMO
→ SAME_HEAD_TESTS
→ CONTRAPROVA
→ REALITY_JUDGE
```

Assim a arquitetura histórica de Eneias entra na Casa sem violar `REUSE_BEFORE_CREATE`.

## Fluxo contínuo da Casa

```text
👑 #ACORDAR / GOAL
→ ☀️ !CALIBRAR
→ 🧿 !SENTINELA
→ 🧭 !MULTIBUSSOLA
→ ⊛ !META_LUPA quando discriminante
→ 🪡 !RECONCILIAR
→ 🔬 !CONTRAPROVA
→ 📏 !REMEDICAO
→ ⚖ REALIDADE_JULGA
→ 🧾 !REGISTRA
→ 🚀 !BOOT / PROMOCAO QUANDO PROVADA
→ 🐚 DELTA CONTINUO: próximo ciclo começa do último ponto fixo real
```

`DELTA_CONTINUO` significa que nova evidência **agrega valor ao que já foi provado**, invalida somente claims dependentes que ficaram velhos e preserva ouro independente.

```text
NEW_EVIDENCE
→ CLASSIFICAR_DELTA
→ PRESERVAR_PROVAS_INDEPENDENTES
→ INVALIDAR_APENAS_CLAIMS_DEPENDENTES
→ ABSORVER_NO_OWNER
→ RECONCILIAR_ESTADO_ATUAL
→ PROXIMO_CURSOR
```

# Perfis oficiais de resposta

O owner técnico é `SOL-GRAMATICA-DE-ENSINO.yml`. Este Comitê só apresenta os perfis ao humano:

```text
!PERFIL AUTO_CASA
!PERFIL RESENHA_SEMPRE
!PERFIL BIBLICO_BAIANES
!PERFIL TECNICO
!PERFIL ESCOLA
!PERFIL COMITE
```

Em qualquer perfil:

```text
SAME_FACT=true
PROFILE_CHANGES_TONE_NOT_TRUTH=true
UNKNOWN_STAYS_UNKNOWN=true
FAILURE_STAYS_FAILURE=true
HUMOR_MUST_NOT_HIDE_FAILURE=true
VERSE_IS_NOT_PROOF=true
EMOJI_IS_SEMANTIC_SEAL_NOT_PROOF=true
```

# Micro-commits + micro-deploys

O owner técnico é `03-FLUXO-DEPLOY.md`. A regra operacional consolidada é:

```text
ONE_INTENT_PER_MICRO_COMMIT=true
MICRO_COMMIT_POLICY=CANONICAL
MICRO_DEPLOY_POLICY=CANONICAL
DEPLOY_SCOPE_MUST_MATCH_CAUSAL_SCOPE=true
FULL_DEPLOY_BY_DEFAULT=false
```

Fluxo:

```text
👑 INTENÇÃO + GOAL
→ 🧿 DELTA MATERIAL
→ ⊛ CAUSA / OWNER
→ 🪡 MENOR CORREÇÃO COMPATÍVEL
→ 🧾 MICRO-COMMIT LEGÍVEL
→ 🧪 GATES DO HEAD EXATO
→ 📦 ARTEFATO DO MESMO SHA
→ 🚀 MICRO-DEPLOY CAUSAL
→ 🔬 PROVA NO RUNTIME/LOG
→ 🧾 SHA→ARTEFATO→DEPLOY→RUNTIME
→ 🐚 CONTINUAR OU REVERTER
```

Nunca confundir:

```text
MICRO_COMMIT != MICRO_DEPLOY
COMMITTED != DEPLOYED
MERGED != DEPLOYED
MICRO_DEPLOY != GLOBAL_READY
WORKFLOW_GREEN != RUNTIME_PROOF
OLD_HEAD != PROOF_FOR_NEW_HEAD
```

# Linguagem dos commits

```text
<SELO> <escopo>: <ação curta ou resultado material>
```

Exemplos:

```text
🤖 deps: atualizar dependências do Bolt
📊 painel: registrar estado da main
🪡 reconciliar: absorver conflito do Dependabot
🧭 router: corrigir failover de modelo
🔊 voz: usar API oficial antes do fallback
🧿 sentinela: detectar drift de rota
🚀 deploy: promover componente do SHA provado
```

O selo melhora leitura humana e recuperação de contexto; o SHA e a evidência continuam sendo prova.

# Lei: nada fica para trás

`NADA_FICA_PARA_TRAS` não significa persistir tudo cegamente. Significa que toda matéria material é processada, classificada e ligada ao delta vigente.

```text
MATERIA_NOVA
→ DUPLICADO     = não cria segunda cópia
→ PARCIAL       = extrai delta útil
→ NOVO_PROVADO  = absorve no owner canônico
→ INCERTO       = mantém UNKNOWN/CANDIDATE
→ SUPERADO      = preserva como história quando útil
→ CONTRADITORIO = abre contraprova discriminante
```

```text
NO_SILENT_DROP_OF_MATERIAL_DELTA=true
NOT_EVERY_MATERIAL_IS_CANONICAL=true
NOT_EVERY_MATERIAL_IS_PERSISTED=true
PROVEN_REUSABLE_DELTA=ABSORB_IN_CANONICAL_OWNER
ZERO_REGRESSION=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

# Correção registrada nesta passagem

Uma tentativa anterior de ensinar o boot global por substituição de `AGENTS.md` cortou conteúdo canônico antigo. A contraprova detectou a regressão e a `main` foi retornada ao último cursor bom antes desse commit.

```text
BAD_COMMIT=cb740053f3ff61782aaffa13277246bfd0675f85
BAD_EFFECT=AGENTS_MD_TRUNCATED
COUNTERPROOF=OLD_BLOB_CONTAINED_CANONICAL_TAIL_MISSING_FROM_NEW_FILE
ACTION=CARACOL_REVERSO
RESTORED_MAIN=6229b5c3c32df57237c2558912a4a0b9e98c9024
GOOD_DELTA_PRESERVED:
  - SOL-GRAMATICA-DE-ENSINO.yml com perfis/Comitê/selos
  - 03-FLUXO-DEPLOY.md com micro-commits/micro-deploys
REGRESSION_LEFT_IN_MAIN=false
```

A lição reaproveitável é:

```text
MUTAR_ARQUIVO_CANONICO_GRANDE
→ RECUPERAR_CORPO_COMPLETO
→ APLICAR_PATCH_MINIMO
→ COMPARAR_ANTES/DEPOIS
→ PROVAR_NAO_TRUNCAMENTO
→ SO_ENTAO_PROMOVER
```

Até que um patch mínimo seguro seja aplicado ao `AGENTS.md`, este Comitê **não finge** que aquele ponteiro global foi promovido. O conteúdo oficial já está na `main` nos owners acima; o boot global permanece um próximo delta separado, não um falso verde.

# Formato do Placar Vivo

Quando houver mudança material:

```text
MAIN=
OWNER=
HEAD_T0=
HEAD_T1=
TOPOLOGIA=
MERGEABILIDADE_READY=
GATES=
RUNTIME=
DELTA_UTIL=
CONTRAPROVA=
PROXIMO_CURSOR=
RECEIPT_SHA=
```

Status:

```text
🟢 PROVADO/PASS
🔴 QUEBRADO/FAILURE
🟡 EVIDENCIA_FALTANTE/UNKNOWN/PENDING
```

# Regra final

```text
DELTA_CONTINUO
+ NADA_FICA_PARA_TRAS
+ REUSE_BEFORE_CREATE
+ UM_OWNER_POR_VERDADE
+ MICRO_COMMIT
+ MICRO_DEPLOY_CAUSAL
+ CONTRAPROVA
+ CARACOL_REVERSO_QUANDO_PRECISO
+ REALIDADE_JULGA
= CENTRALDARK
```
