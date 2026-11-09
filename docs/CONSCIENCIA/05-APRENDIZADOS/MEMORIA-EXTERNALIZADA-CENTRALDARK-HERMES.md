---
title: "Memória externalizada CentralDark + Hermes"
status: "DRAFT_LOCAL_NOT_PUBLISHED"
owner: "centraldark-operational-method"
source_of_truth: "ServerVpss/CentralDark"
updated: "2026-11-09"
---

# Memória externalizada CentralDark + Hermes

## Intenção

Reduzir a carga cognitiva do CHEFE sem transformar memória em autoridade automática.

A memória externalizada preserva contexto, decisões, aprendizados e próximos cursores. O sistema continua exigindo leitura, estado atual, evidência e contraprova antes de promover qualquer claim.

## Estado medido

```text
memory.write_approval = true
memory.memory_enabled = true
memory.user_profile_enabled = true
```

A leitura antes da alteração já retornou `true` para `memory.write_approval`. O comando oficial foi reaplicado e o readback confirmou `true`. Portanto, esta rodada não mudou o valor; apenas confirmou a configuração desejada.

## Benefícios esperados

- Menos repetição de contexto entre sessões.
- Recuperação mais rápida de decisões e bloqueios.
- Menor necessidade de o CHEFE manter detalhes técnicos na memória de trabalho.
- Continuidade entre Hermes, CentralDark, skills, receipts e próximos cursores.
- Registro explícito de owner, fonte, SHA e estado.
- Separação entre preferência do usuário, método operacional e evidência de runtime.
- Melhor recuperação depois de interrupção, compressão ou troca de sessão.
- Menor risco de reabrir uma decisão já resolvida.
- Mais facilidade para auditar o que foi aprendido e por que foi reutilizado.

## Limites

Memória gravada não prova que o runtime consumiu o conteúdo.

```text
RECORDED != LOADED
LOADED != APPLIED
APPLIED != EFFECT_PROVEN
DOCUMENTED != RUNTIME_PROVED
```

A memória não concede autorização nova. Não substitui confirmação humana em fronteira destrutiva, autenticação, segredo, deploy, merge ou publicação.

## Camadas e owners

| Conteúdo | Owner | Destino |
|---|---|---|
| Preferência estável do usuário | Hermes USER profile | USER.md / memória de usuário |
| Método reutilizável | Skill existente | Skill Mãe ou skill específica |
| Decisão e contrato CentralDark | Repositório | `docs/CONSCIENCIA/` |
| Resultado medido | Receipt | owner da operação |
| Estado corrente | Runtime | probe, log, banco ou endpoint correto |
| Próximo passo | Checkpoint/receipt | `NEXT_CURSOR` canônico |

## Fluxo de escrita

```text
INTENÇÃO
→ classificar o tipo de informação
→ localizar owner existente
→ registrar candidato
→ aprovação de escrita quando exigida
→ escrever no destino correto
→ ler de volta
→ testar recuperação
→ vincular fonte e evidência
→ reutilizar somente quando pertinente
```

## Regra para aprendizados

Uma correção do CHEFE deve ser registrada na skill que governa a classe da tarefa quando houver procedimento reutilizável.

Uma preferência que vale para todas as sessões pode ser registrada no perfil do usuário.

Uma decisão ou contrato da CentralDark deve permanecer no repositório canônico.

Não duplicar a mesma regra em memória, skill e documentação sem uma relação explícita entre os owners.

## Aplicação ao Self/META-RSI

A matriz 40/40 permanece na Skill Mãe:

```text
.agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md
.agents/skills/centraldark-operational-method/Skills/meta-rsi/SKILL.md
```

A memória registra somente o aprendizado validado e o receipt. Ela não cria 40 agentes, 40 loops ou uma segunda matriz.

Cada capacidade deve ser marcada como `APPLIED` ou `NOOP_JUSTIFIED` com razão. Runtime 40/40 continua `UNKNOWN` até prova real.

## Critério de sucesso

```text
MEMORY_WRITE = PASS
OWNER_CORRECT = PASS
READBACK = PASS
RETRIEVAL_RELEVANT = PASS
RUNTIME_CONSUMPTION = UNKNOWN até teste
EFFECT_READBACK = UNKNOWN até contraprova
```

## Próximo cursor

```text
revisar o owner central de documentação
→ anexar os critérios de efeitos visuais ao META-RSI/HUD existente
→ validar o loader da Skill Mãe
→ testar recuperação da memória em nova sessão
→ somente depois publicar commit específico
```

## Regra de realidade

A memória tira peso da cabeça porque guarda o contexto fora dela. Ela não deve tirar o julgamento do sistema.

```text
externalizar contexto
≠ terceirizar autoridade
```
