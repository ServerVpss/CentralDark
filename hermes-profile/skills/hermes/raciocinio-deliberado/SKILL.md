---
name: raciocinio-deliberado
description: "Use when Pivete pede lógica deliberada ou patch mínimo."
version: 1.1.0
author: Pivete + Hermes profile pivete
license: MIT
metadata:
  hermes:
    tags: [pivete, deliberado, logica, gate, menor-mudanca, casa, kanban, autonomia]
    related_skills: [pivete-execution-standards, hermes-agent, meta-lupa]
triggers:
  - "raciocínio deliberado"
  - "usa lógica"
  - "se tem relação com a pergunta"
  - "melhoria com critério"
  - "pensa antes de mexer"
  - "patch mínimo"
  - "não inventa escopo"
  - "autonomia controlada"
  - "melhorar o que já tem"
  - "fórmula / acoplar kanban cron goal"
---

# Raciocínio Deliberado (profile pivete)

## Overview

Filtro **antes** da ação: só mexe no que tem relação causal com a dor.  
Não é autonomia solta. Não é XP, %, ranking nem “auto-evolução V2/V3”.  
É **cerca + freio + prova**: pensar → pesquisar o que já existe → menor ação → validar 100% → recibo.

Fonte de mapa (artigo, não ordem de instalar tudo):  
https://youmind.com/pt-BR/landing/x-viral-articles/hermes-agent-personal-ai-os

Combina com (não substitui):
- SOUL pivete — autoridade, R0–R4, gate, MetaLupa §
- `pivete-execution-standards` — ordem=executa no escopo, Windows/gateway/memória
- `meta-lupa` (profile) — falsificar falso verde, ponto fixo ≠ PASS
- Kanban nativo Hermes — fila/estado (não concede autorização sozinho)
- Cron do profile — despertador
- Card Hermes / Telegram — rádio, não cérebro

## When to Use

- Pivete pede lógica, deliberado, melhoria, relação, patch mínimo
- Config/profile/memória/gateway “sumiu” ou ficou estranho
- Artigo/fórmula longa → virar **uma** melhoria no que já existe
- Acoplar autonomia controlada (goal/kanban/cron) sem arquitetura paralela

**Don’t use for:**
- clique único óbvio sem ambiguidade
- inventar Kanban/swarm/provider porque o artigo citou
- teatro de %/XP/auto-level

## GATE 0 — PESQUISAR ANTES DE MELHORAR (obrigatório)

Antes de criar skill, regra, fila, cron ou “fórmula nova”:

```text
1. skills_list / skill_view / search no profile e no NÚCLEO
2. SOUL seções de risco, ciclo, MetaLupa, comunicação
3. pivete-execution-standards
4. meta-lupa (profile pivete/skills/meta-lupa)
5. kanban já existente? (hermes kanban list / kanban.db)
6. cron/jobs.json do profile
7. mission_panel / Card Hermes se for comunicação
```

Saída mínima do gate:

```text
EXISTENTE=
SOBREPOSICAO=BAIXA|MEDIA|ALTA
DESTINO_CANONICO=
ACAO=REUSAR|PONTEIRO|ESTENDER|NOVO_JUSTIFICADO|BLOQUEADO
```

**ALTA sobreposição** → não criar irmã; consolidar ou ponteiro curto.  
**Nunca** skill paralela de autonomia / deliberado / lupa.

## Loop deliberado (7 batidas)

```text
1. PERGUNTA REAL — 1 frase
2. SINAIS — disco/runtime
3. CAUSAS — 2–4 hipóteses
4. FILTRO DE RELAÇÃO — fora de relação = não tocar
5. MENOR AÇÃO QUE PROVA — R0/R1 preferidos
6. EFEITO COLATERAL — SOUL, 3T, gateway, sticky, Telegram
7. RECIBO — FATO | HIPÓTESE | PENDÊNCIA | AÇÃO | próximo
```

Parar a análise quando houver evidência, ação mínima clara, ou LACUNA de autorização.

## Autonomia controlada (papéis fixos)

```text
PIVETE     = território, objetivo, R2+ e críticos
/goal      = contrato da missão na sessão (slash command).
             Existe no chat CLI, Desktop e Telegram/gateway:
             /goal, /goal status|pause|resume|clear, /subgoal.
             NÃO confundir com `hermes goal` (subcomando de terminal) —
             esse CLI NÃO existe neste install.
             `hermes kanban create --goal` = loop de goal NO CARTÃO do
             Kanban; é irmão do motor Ralph, NÃO substitui o slash /goal.
KANBAN     = fila/estado visual — NÃO concede autorização sozinho
CRON       = despertador — NÃO cria missão nem libera BLOCKED
DELIBERADO = este filtro (relação + menor ação)
EXEC-STD   = pivete-execution-standards (como executar no escopo)
METALUPA   = prova / falso verde / ponto fixo
WRITER     = um só por cartão DOING
FERRAMENTAS= braço (CLI/tools/gateway)
TELEGRAM   = rádio (Card Hermes)
```

### Envelope = R0–R4 do SOUL (não criar escala concorrente)

| Nível | Pode sozinho? |
|---|---|
| R0 leitura/status/hash/compare/search | SIM, com evidência |
| R1 local reversível + backup + alvo explícito + missão | SIM no envelope autorizado |
| R2+ config interna sensível, destrutivo, VPS, merge, deploy, restart, secrets, exclusão | NÃO — parar e pedir |

Bloqueios automáticos: produção, VPS, merge, deploy, restart, exclusão, secrets, área protegida, alvo vago, writer concorrente, UNKNOWN relevante, sem rollback quando precisa, falso verde.

### Kanban controlado (mecanismo nativo)

DB canônico observado: `C:\Users\danda\AppData\Local\hermes\kanban.db`  
CLI: `hermes -p pivete kanban …`  
**Não** criar segundo Kanban. **Não** `kanban swarm` sem ordem literal.

Cartão executável precisa carregar no body (ou comments) no mínimo:

```text
CARD_ID= (id nativo)
MISSION_ID=
OBJETIVO=
ALVO=
ESCOPO=
NÍVEL_DE_RISCO=R0|R1|R2|R3|R4
AUTORIZAÇÃO=
DEFINITION_OF_DONE=
TESTE_DE_VALIDAÇÃO=
ROLLBACK=
PRÓXIMO_PASSO=
STATUS_CASA=BACKLOG|READY|DOING|BLOCKED|PROOF|DONE
```

Regras Casa sobre o board nativo:
- só cartão **ready** (e autorizado) inicia
- um DOING por Writer
- sem autorização suficiente → **blocked**
- fim de execução → PROOF (comment + evidência) antes de **complete/done**
- DONE exige evidência reproduzível (hash, path, comando)
- cron **não** pega backlog nem desbloqueia blocked
- cartão DONE não se repete
- ponto fixo ≠ PASS

### Cron controlado

Ao despertar (job futuro ou manual):
1. profile pivete  
2. no máx. 1 cartão ready autorizado  
3. deliberado + autorização ainda vale  
4. só R0/R1  
5. validar → atualizar **mesmo** cartão → um recibo  
6. sem ready → IDLE; blocked → WAITING_FOR_PIVETE  

Jobs atuais do pivete (mapa, não apagar nesta skill): mapa-hermes, manual-sessao, gateway-watchdog, destilar-3-temp.

### Ponto fixo

```text
LEMBRAR → DESCONFIAR → RECALIBRAR → ÚLTIMO ESTADO CERTO COM EVIDÊNCIA
→ CONTINUAR DALI → PROSSEGUIR → PROVAR DE NOVO
```

Se nova passagem não muda hipótese/evidência/bloqueio/risco/checkpoint/autorização/próximo teste → `PONTO_FIXO_ATINGIDO` (não é PASS; cron não repete a mesma ação).

### Validação 100%

Não declarar DONE/APPLIED com:
- status visual sozinho  
- “deve estar ok”  
- UNKNOWN/SKIPPED como sucesso  
- % de confiança inventada  

DONE = evidência medida no disco/runtime.

## Filtro de relação

```text
TEM RELAÇÃO → na cadeia causal do sintoma
NÃO TEM → “já que estamos aqui” / artigo / reforma geral → fora
```

Exemplo OpenRouter pivete: só `.env` do profile; não SOUL, não reinstall, não trocar TTS.

## Protocolo de patch

1. Gate 0 pesquisa  
2. Ler alvo real  
3. Backup se escrita  
4. 1 intenção = 1 mudança  
5. Provar  
6. Listar o que **não** mexeu de propósito  

### Proibido
- V2/V3/paralelo de SOUL, Kanban, deliberado, lupa  
- swarm multi-writer sem ordem  
- provider memória externo “porque o texto falou”  
- XP/%/score de auto-evolução como verdade operacional  
- MEMORY.md com estado de missão  
- cron temporário de teste deixar ligado  

## Melhoria de fórmula (gatilho forçado)

Quando Pivete manda link/artigo/fórmula:

```text
1. Ler fonte (link + paste)
2. Gate 0 no que a Casa já tem
3. Tabela: camada do texto → artefato Casa → gap real?
4. No máx. 1–3 melhorias no existente
5. Implementar só o autorizado
6. Provar
7. Atualizar ESTA skill ou execution-standards com ponteiro — sem irmã
```

## Como falar

Comunicação leiga canônica do SOUL §24:  
SIGNIFICA → IMAGINE → NA PRÁTICA → NOME TÉCNICO → ESTADO → PRÓXIMO  
Duas camadas: leiga em cima, prova embaixo.

## Common Pitfalls

1. Criar skill sem Gate 0  
2. Achar que Kanban = autorização  
3. Achar que cron = missão  
4. Achar que `/goal` sumiu porque `hermes goal` (CLI de terminal) não existe —
   slash `/goal` na sessão SIM; `hermes kanban create --goal` é só o cartão,
   não substitui `/goal`  
5. Swarm “pra ficar igual o artigo”  
6. Tratar MetaLupa e deliberado como a mesma coisa (deliberado=escopo; lupa=falsificação)  
7. Sessão nova ≠ profile sticky provado  

## Integração (skills relacionadas)

- `pivete-execution-standards` — filtro pré-ação (Gate 0), execução Casa
- `meta-lupa` — falsificação pós-execução (AutoLupa, Gate Final)
- `cot-react-loop` — loop executável **DURANTE** tarefas complexas multi-step (`PLAN  ACT  OBSERVE  CRITIQUE  REFINE  DECIDE`)
- `pivete-comunicacao-leiga` — formato resposta leigo (simples em cima, técnico embaixo)
- `pivete-execution-standards` — protocolo execução, R0-R4, Windows

## Verification Checklist

- [ ] Gate 0 feito e registrado
- [ ] Papéis não misturados
- [ ] R0–R4 do SOUL (sem escala nova)
- [ ] Kanban nativo reusado se existir
- [ ] Evidência real no DONE
- [ ] Um Writer
- [ ] Sem paralelo V2
- [ ] Link YouMind preservado nesta skill
- [ ] Recibo final

## Recibo

```text
FEITO=
EVIDÊNCIA=
NÃO_MEXI_DE_PROPÓSITO=
DUPLICATION_CHECK=
RISCO_RESIDUAL=
PRÓXIMO_PASSO=
```
