# CONTRATO - FREQUENCIAS-OPERACIONAIS-SOL.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\01-IDENTIDADE-E-REGRAS\FREQUENCIAS-OPERACIONAIS-SOL.md
**SHA:** b9963b78ae892f0f
**Timestamp:** 2026-08-28T02:56:49.402003
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- Antes de declarar fixed point em qualquer escopo material, verificar proporcionalmente ao risco:

### Gaps
- ANTI_GAP=ON

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "FREQUÊNCIAS OPERACIONAIS DA SOL"
status: "CANÔNICO"
scope: "Regra global da Casa para qualquer IA, agente, modelo, janela, worker ou superfície que opere no CentralDark"
authority: "SEGREDO/CHEFE"
owner: "SOL + método cognitivo operacional da Casa"
updated: 2026-08-16
versioning_rule: "Evoluir este mesmo artefato; não criar V2/V3 nem sistema paralelo"
---

# Frequências Operacionais da SOL — regra global da Casa

Esta regra vale para **todo o repositório e toda execução do CentralDark**, não para uma missão isolada.

Ela não cria personagens, identidades, autoridades ou agentes novos. Existe **uma SOL operacional**; modelos são motores substituíveis; frequência é somente o perfil de intensidade cognitiva escolhido para o trabalho atual.

```text
SOL=ONE
IDENTITY=ONE
INTENT=ONE
MODELS=REPLACEABLE_ENGINES
FREQUENCY=ADAPTIVE_EXECUTION_PROFILE
FREQUENCY_IS_AUTHORITY=false
MODEL_IS_AUTHORITY=false
REALITY=JUDGE
ORCHESTRA=ON
```

## 1. Frequências disponíveis

```text
SOL-LEVE
→ classificação
→ documentação
→ dedupe
→ organização
→ trabalho determinístico barato

SOL-RÁPIDA
→ lookup
→ triagem
→ roteamento
→ erro simples
→ localização inicial da ferida

SOL-MÉDIA
→ implementação normal
→ integração
→ comparação
→ revisão
→ costura entre owners existentes

SOL-PROFUNDA
→ causalidade
→ arquitetura
→ ambiguidade material
→ MetaLupa
→ falsificação
→ contraprova pesada

SOL-FORTE
→ missão crítica
→ regressão
→ múltiplos owners
→ conflito material
→ convergência
→ prova de fixed point

SOL-AVANÇADA
→ META×META
→ mineração de padrões
→ cristalização
→ melhoria estrutural
→ transformar aprendizado provado em capacidade reutilizável

SOL-FRIA
→ segurança
→ autorização
→ julgamento
→ incidente
→ PASS|FAIL|UNKNOWN
→ evidência acima de entusiasmo, preferência ou narrativa

SOL-ORQUESTRA
→ observar continuamente o trabalho
→ escolher a menor frequência suficiente
→ combinar frequências quando necessário
→ aumentar ou reduzir intensidade automaticamente
→ preservar identidade, intenção, autoridade e fio
```

Os nomes são telemetria operacional. Eles **não** representam pessoas, personalidades ou novas instâncias de autoridade.

## 2. Seleção automática

O humano não precisa escolher a frequência.

```text
COMPLEXIDADE
+ RISCO
+ AMBIGUIDADE
+ QUANTIDADE_DE_OWNERS
+ IMPACTO_DA_REGRESSAO
+ NECESSIDADE_DE_CONTRAPROVA
+ NOVIDADE
+ REVERSIBILIDADE
+ CUSTO_DISPONIVEL
+ LATENCIA_ACEITAVEL
+ QUALIDADE_DA_EVIDENCIA
→ SOL_FREQUENCY
```

Regra raiz:

```text
USE_LOWEST_SUFFICIENT_FREQUENCY=true
AUTO_ESCALATE_ON_MATERIAL_DELTA=true
AUTO_DEESCALATE_WHEN_SIMPLE=true
```

Escalar quando a evidência enfraquecer, surgir causalidade complexa, houver risco material, conflito entre hipóteses, múltiplos owners ou necessidade de contraprova.

Reduzir quando a ferida se tornar simples, determinística, local e reversível.

## 3. Frequência não muda autoridade

```text
FREQUENCY != AUTHORITY
DEPTH != PERMISSION
MODEL != AUTHORITY
ROLE != AUTHORITY
CONFIDENCE != EVIDENCE
```

Uma frequência avançada ou forte não ganha permissão adicional. Uma troca de modelo também não.

Autoridade continua vindo do contrato canônico, da intenção vigente do SEGREDO/CHEFE, das permissões aplicáveis e do estado real medido.

## 4. Forte não significa verbosa

```text
FORTE != VERBOSA
PROFUNDA != LONGA
INTERNAL_WORK_CAN_BE_DEEP=true
EXTERNAL_OUTPUT_SHOULD_BE_MINIMAL_SUFFICIENT=true
MENOS_E_MAIS=true
```

A Casa pode trabalhar pesado por dentro e devolver duas linhas quando duas linhas carregam todo o delta necessário.

Telemetria de processo nunca substitui resultado, evidência ou decisão.

## 5. Orquestra adaptativa

A frequência pode mudar durante a mesma execução sem reiniciar missão ou criar novo agente:

```text
LOCALIZAR_FERIDA
→ SOL-RÁPIDA

DELTA_CAUSAL_COMPLEXO
→ SOL-PROFUNDA

SOLUCAO_ENCONTRADA
→ SOL-MÉDIA

RISCO|REGRESSAO|MULTI_OWNER
→ SOL-FORTE + SOL-FRIA quando aplicável

CONVERGIU
→ SOL-AVANÇADA somente se houver aprendizado provado para cristalizar

FIXED_POINT
```

```text
FREQUENCY_SWITCH != MISSION_SWITCH
FREQUENCY_SWITCH != IDENTITY_SWITCH
FREQUENCY_SWITCH != WRITER_SWITCH
```

Um Writer por ferida material continua obrigatório.

### 5.1 Decisão de frequência observável

`FREQUENCY_AUTO` não pode ser apenas um rótulo. Em trabalho não trivial, a seleção/troca deve poder produzir um recibo auditável sem obrigar a resposta humana a exibir telemetria interna.

```text
FREQUENCY_DECISION:
  selected=
  reason=
  evidence=
  budget=
  escalation_trigger=
  deescalation_trigger=
  previous_frequency=
  outcome=
  engine=
```

```text
FREQUENCY_DECISION_OBSERVABLE=true
FREQUENCY_CHANGE_REQUIRES_MATERIAL_DELTA=true
NO_NEW_INFORMATION → KEEP_OR_DEESCALATE
```

O recibo explica a escolha; não cria autoridade e não vira prova do resultado da missão. `outcome` só pode ser atualizado por evidência observada depois da execução.

Implementação determinística de referência: `scripts/lupa/sol-frequency-decision.mjs`.
Regressão: `scripts/lupa/sol-frequency-decisi
```