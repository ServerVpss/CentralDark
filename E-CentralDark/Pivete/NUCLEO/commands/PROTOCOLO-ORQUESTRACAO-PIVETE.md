# COMANDO - PROTOCOLO-ORQUESTRACAO-PIVETE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\PROTOCOLO-ORQUESTRACAO-PIVETE.md
**SHA:** d290d2c69c663bd1
**Timestamp:** 2026-08-28T02:56:49.117646
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: <0|causa real>

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "PROTOCOLO DE ORQUESTRACAO CENTRALDARK"
tags: ["consciencia", "orquestracao", "ia", "centraldark"]
updated: 2026-08-16
---

# Protocolo de Orquestração CentralDark

Manual para qualquer IA entrar no CentralDark sem perder o fio e sem confundir o humano com o executor.

## 0. Identidade canônica

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, mordomo, preservação e continuidade
"pivete" na fala regional = vocativo informal; não é identidade técnica automática
```

O nome antigo deste arquivo é preservado por compatibilidade. Qualquer trecho histórico em que `Pivete` significava dono, humano, comandante ou decisor deve ser interpretado como `LEGACY_ALIAS_OF_SEGREDO_CHEFE`. Isso não muda o registro histórico; muda sua leitura normativa atual.

## Regra central

```text
SEGREDO/CHEFE COMANDA.
SOL COORDENA.
PIVETE/HERMES PRESERVA E EXECUTA.
ACTIONS PROVAM.
IAS VARIAM.
O MÉTODO PERMANECE.
```

SEGREDO/CHEFE define prioridade, limite, autorização e decisão humana final. SOL traduz e coordena. PIVETE/HERMES executa o que já foi autorizado, preserva estado/checkpoint e mantém continuidade. Especialistas entram por papel.

## Estado de bordo

```text
MISSION_ID:
Objetivo atual:
Fase atual:
Decisão mais recente de SEGREDO/CHEFE:
Plano em execução:
Última ação comprovada:
Evidências / validações:
Pendências:
Próximo passo único:
Travas:
Divergências / lacunas:
Agente e papel:
Fonte da verdade:
```

Mensagem atrasada entra como delta. Assunto paralelo não reinicia missão.

## #ACORDAR / !CALIBRAR / !RELOAD

### `#ACORDAR`

```text
RECUPERAR O ESTADO REAL ANTES DE CONTINUAR
→ missão/fio
→ Git/PR/HEAD
→ runtime/logs quando aplicável
→ evidência atual
→ divergências
→ próximo passo único
```

### `!CALIBRAR`

Interrompe nova ação, preserva operação em curso com segurança, reconcilia conversa + Git + PR + Actions + logs + estado vivo e atualiza apenas os destinos canônicos necessários.

### `!RELOAD`

Entra read-only, relê fontes canônicas, compara checkpoint com estado vivo e retoma somente o que continua válido. Não cria autorização nova.

## Handoff entre aplicativos/agentes

Quando a superfície atual não possuir capacidade:

```text
MESMA MISSION_ID
→ MESMO ESCOPO
→ HANDOFF DA SUBTAREFA
→ RECEPTOR RELÊ FONTE DA VERDADE
→ RESULTADO VOLTA AO MESMO FIO
```

Não criar segunda missão, segunda memória, segundo orquestrador ou segundo Writer para escapar de limitação da interface.

## Modos operacionais

| Modo | Significado |
|---|---|
| Conversa | explicar/orientar |
| Planejamento | organizar sem executar |
| Read-only | diagnosticar sem mutar |
| Edição controlada | escrever no escopo autorizado |
| Execução com travas | operar com gates e rollback |
| V-REALTIME desenvolvimento | iterar GitHub → runtime → prova sem repetir autorização ainda válida |

### Planejamento compilado — `COMPILE_THEN_APPLY`

Quando a missão trouxer muitas fontes, decisões concorrentes, aprendizado reutilizável ou uma solução que deve ficar rápida nas próximas execuções, o modo `Planejamento` pode operar como **compilador** antes da mutação. Isso não cria um modo de autoridade novo e não exige que o SEGREDO/CHEFE memorize um comando.

```text
COMPILE_THEN_APPLY=true
AUTO_TRIGGER_WHEN_MULTI_SOURCE_OR_REUSABLE_LEARNING=true
PLAN_ONLY_BEFORE_ROUTE_READY=true
```

Fluxo:

```text
INTENCAO + ESTADO_VIVO + FONTES
→ PLANEJAR SEM MUTAR
→ MINERAR
→ EXTRAIR
→ DEDUPLICAR
→ CONTRAPROVAR
→ ARBITRAR CONFLITOS
→ LOCALIZAR OWNER
→ LIGAR SKILL + CONSUMIDOR + TESTE + GATE
→ COMPILAR ROUTE_IR
→ ROTA PRONTA E AUTORIZACAO JA EXISTE?
   NAO → CANDIDATE|BLOCKED + RESIDUO
   SIM → APLICAR MENOR DELTA
→ PROVAR
→ CRISTALIZAR
→ FLASH_READY
```

A separação é deliberada:

```text
FORJA = aprendizado lento, profundo e rigoroso
FLASH = execução curta sobre rota já compilada

MINERAR UMA VEZ
→ CRISTALIZAR UMA VEZ
→ REUTILIZAR N VEZES
```

No runtime normal, não reler o corpus inteiro se a rota continua válida:

```text
INTENCAO
→ ROTEADOR
→ OWNER
→ SKILL
→ CONSUMIDOR
→ ACAO
→ PROVA
```

Se entrar informação nova, recalcular somente a rota dependente do delta. Não reconstruir a Casa inteira por reflexo.

```text
NEW_INFORMATION != REBUILD_ALL
DELTA_AFFECTED_ONLY=true
UNAFFECTED_ROUTE_REUSE=true
ONE_ACTIVE_ROUTE_PER_CAPABILITY_BOUNDARY=true
```

Planejamento, antecipação e rota compilada continuam sem poder criar permissão:

```text
PLAN_ONLY != EXECUTION
COMPILED_ROUTE != AUTHORIZATION
ANTICIPATION != AUTHORIZATION
APPLY_REQUIRES_EXISTING_AUTHORITY=true
```

Quando progresso visível ajudar a manter o fio durante uma tarefa longa, usar somente recibo comprimido, nunca scratchpad ou cadeia privada:

```text
TICK:
  phase: INGEST|DISTILL|ARBITRATE|COMPILE|APPLY|VERIFY|CRYSTALLIZE|FLASH_READY
  delta: <mudanca material>
  owner: <owner|UNKNOWN>
  route: <route_id|PENDING>
  blocker: <0|causa real>
  next: <proximo passo unico>
```

Implementação chamável: `.agents/skills/knowledge-compiler/SKILL.md`.
Owner de aprendizado/cri
```