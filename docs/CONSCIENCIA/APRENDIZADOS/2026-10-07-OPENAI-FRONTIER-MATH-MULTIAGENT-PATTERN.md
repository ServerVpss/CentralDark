---
title: "Aprendizado — padrão multiagente de pesquisa de fronteira aplicado ao OMEGA"
status: KNOWLEDGE_ONLY
source_rule: "EXTERNAL_PRIMARY_SOURCE -> PROVENANCE + INDEPENDENT_CONFIRMATION; EXTERNAL_RESULT != CENTRALDARK_RUNTIME_PROOF"
date: 2026-10-07
updated: 2026-10-07T15:33:00-03:00
tags: [aprendizado, omega, openai, multiagente, frontier-math, provenance, contraprova]
category: "A-Aprendizado-Externo"
sensitivity: INTERNAL
source: "OpenAI official pages: Navier-Stokes solution; Advisory Group on Mathematics and AI; Sharing AI progress in mathematics"
source_class: EXTERNAL_UNTRUSTED
owner: "docs/CONSCIENCIA/PROGRAMAS/BOOT-ENXAME-OMEGA-20260924.md"
---

# Aprendizado — padrão multiagente de pesquisa de fronteira aplicado ao OMEGA

Data: 2026-10-07  
Status: CURRENT / EXTERNAL_PATTERN_ABSORBED  
Authority: SEGREDO/CHEFE  
Owner canônico: `docs/CONSCIENCIA/PROGRAMAS/BOOT-ENXAME-OMEGA-20260924.md`  
Base medida antes do delta: `9bdf7d0abab7ca2acbce9c476a4bfb171228860c`  
PR-mãe legado: #1562  
Rendezvous ativo: RESOLVE_FROM_CURRENT

## Intenção

Registrar ponta a ponta o que a OpenAI publicou sobre o sistema multiagente usado na resolução de Navier–Stokes e absorver somente o que melhora o Enxame OMEGA existente.

Não copiar escala por fetiche. Não transformar rumor em fato. Não criar arquitetura paralela.

## Fatos externos verificados

Fonte primária principal: https://openai.com/index/navier-stokes-solution/

- treinamento do novo modelo interno iniciado em 28 de agosto de 2026;
- agentes coordenados com internet em cache e execução de código;
- grupos independentes com comunicação intragrupo;
- variantes distintas do mesmo problema distribuídas para grupos diferentes;
- cerca de 10 mil agentes simultâneos no grupo que produziu a resolução de Navier–Stokes;
- quase 100 agentes por aproximadamente 50 horas na resolução relacionada de Euler;
- realocação de agentes dos demais Problemas do Milênio para o ramo mais promissor;
- reaproveitamento da resolução de Euler como contexto;
- troca para uma versão mais treinada do modelo durante o trabalho;
- Codex consolidando contribuições e promovendo cross-pollination entre grupos;
- resolução em 5 de setembro, aproximadamente 88 horas após o primeiro lançamento;
- mais 17 horas para formalização/verificação em Lean via GPT-6 Astra;
- aproximadamente 2,7 milhões de mensagens e 130 bilhões de tokens de saída em Navier–Stokes;
- aproximadamente 4,9 milhões de mensagens e 300 bilhões de tokens de saída no conjunto de problemas.

Fonte primária adicional: https://openai.com/index/advisory-group-on-mathematics-and-ai/

- em 21 de setembro, a OpenAI informou que o novo modelo interno já havia resolvido mais de 100 problemas antigos em aberto em grande parte da matemática.

Fonte de continuidade: https://openai.com/index/sharing-ai-progress-in-mathematics/

- em 6 de outubro, a OpenAI publicou uma faixa ampla de novos resultados do modelo interno e descreveu processo de divulgação orientado por recomendações de um grupo consultivo independente.

## O que realmente transfere para a CentralDark

```text
SHARD_PROBLEM_VARIANTS
→ INDEPENDENT_GROUPS
→ LOCAL_TOOL_USE
→ INTERMEDIATE_EVIDENCE
→ SYNTHESIS
→ CONTROLLED_CROSS_POLLINATION
→ PROMISING_BRANCH_RESOURCE_SHIFT
→ ONE_WRITER_EXECUTION
→ INDEPENDENT_VERIFICATION
→ REALITY_JUDGE
```

Isto reforça comportamentos que a CentralDark já possui:

- muitos leitores, um writer por escopo;
- papéis diferentes não são cópias do mesmo agente;
- percepção paralela deve preservar diversidade antes da síntese;
- resultados intermediários podem voltar como contexto causal;
- recurso deve migrar para o ramo que produziu evidência melhor;
- troca de modelo no meio da missão exige provenance;
- escala é adaptativa e limitada por orçamento;
- GREG/REALIDADE continuam separados do executor.

## Telemetria que passa a importar

Quando disponível, registrar por rodada:

- agentes/grupos;
- variante/hipótese;
- modelo e revisão;
- tempo de parede;
- mensagens;
- tokens de saída;
- ferramentas;
- evidências intermediárias;
- artefatos usados na cross-pollination;
- executor real;
- verificador;
- veredito;
- NEXT_CURSOR.

```text
MISSING_TELEMETRY=UNKNOWN
UNKNOWN != ZERO
UNKNOWN != PASS
```

## Contraprova

Não foi provado por fonte oficial:

```text
BELL_IS_THE_INTERNAL_MODEL=UNKNOWN
BELL_PARAMETER_COUNT=UNKNOWN
TEN_TRILLION_PARAMETERS=UNVERIFIED
```

Logo, esses itens não entram como fato canônico.

## Regra consolidada

```text
ABSORB_METHOD_NOT_HYPE=true
ADAPTIVE_SWARM_NOT_BLIND_FANOUT=true
DIVERSITY_BEFORE_SYNTHESIS=true
PROVENANCE_SURVIVES_MODEL_UPGRADE=true
RESOURCE_ACCOUNTING_IS_PART_OF_EVIDENCE=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
```