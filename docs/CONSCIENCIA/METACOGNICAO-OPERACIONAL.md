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
```

## Distribuição canônica

Este arquivo é a fonte conceitual única. A distribuição ocorre sem copiar o contrato inteiro:

- `LEIA-ME-IA.md` referencia esta fonte no boot universal e no ciclo de aprendizado;
- `.agents/skills/meta-lupa/references/metacognicao-operacional.md` conecta AutoLupa/metodologia a esta fonte;
- `AGENTS.md` mantém o contrato genérico de ganho informacional e continua semanticamente subordinado ao boot;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` mantém identidade, autoridade e aprendizado sem redefinir este conceito;
- `docs/CONSCIENCIA/LEMBRANCAS/2026-08-14-OURO-CONTEXTO-AUTONOMIA-SOL.md` preserva a proveniência histórica quando o aprendizado for consolidado;
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` limita circularidade da metaprova;
- `scripts/memory-linker/dream-review.mjs` materializa apenas o candidato isolado da consolidação ociosa.

Não duplicar este contrato integralmente nos consumidores; preservar uma única semântica e referenciar esta fonte quando o próprio método estiver sendo refinado.
