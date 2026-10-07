---
title: "Hermes ↔ Oráculo — continuidade do controlador, reuse de prova e preservação CentralDark"
date: 2026-10-07
status: CRYSTALIZED_SESSION_DELTA
authority: SEGREDO/CHEFE
baseline_main_sha: 9bdf7d0abab7ca2acbce9c476a4bfb171228860c
owners:
  - .agents/skills/software-development/centraldark-oracle-surface/SKILL.md
  - apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
  - scripts/trigger-fabric/oracle_evidence_hook.py
  - docs/HUD/HUD.html
runtime_external_component:
  - hermes_cli/goals.py
---

# Hermes ↔ Oráculo — continuidade do controlador

## 1. Intenção consolidada

A missão desta sessão não é criar um novo Hermes nem contribuir para o produto upstream.

```text
CENTRALDARK_IS_THE_PROJECT=true
HERMES_IS_EXECUTOR_COMPONENT=true
NO_PARALLEL_HERMES=true
NO_SECOND_BRAIN=true
NO_UPSTREAM_PR_REQUIRED=true
```

Capacidades, automações e adaptações criadas pelo CHEFE para a operação da CentralDark devem permanecer preservadas na própria CentralDark como receita/fingerprint/owner reaplicável.

```text
CHEFE_CAPABILITY
→ PROVE
→ CRYSTALLIZE_IN_CENTRALDARK
→ OWNER_EXISTING
→ RECEIPT/FINGERPRINT
→ REAPPLY_WHEN_DEPENDENCY_CHANGES
```

## 2. Regra de reuse de prova

Ferida observada: o executor repetia confirmação de fatos já provados, em vez de avançar para o próximo delta.

Regra cristalizada:

```text
PROOF_FINGERPRINT_UNCHANGED
→ REUSE_PROOF
→ NÃO REPETIR CONFIRMAÇÃO
→ AVANÇAR NEXT_CURSOR
```

Nova prova só é exigida quando houver pelo menos uma destas mudanças:

- SHA/runtime;
- owner;
- estado;
- contradição;
- expiração da evidência;
- capability nova ainda não provada.

Exemplos desta sessão que não devem ser repetidamente redescobertos quando o fingerprint estiver intacto:

```text
HERMES_SESSION_ALIVE
VPS/IP já medidos na mesma rodada
Gateway/SSH previamente medidos
existência básica da superfície Hermes
```

## 3. Envelope Hermes ↔ CHAT_GLOBAL

O loop operacional usa envelope próprio para distinguir Hermes de intervenção humana.

```text
ACTOR=HERMES
LOOP_ID
TURN_ID
ATTEMPT_ID
RECEIPT_ID
PARENT_ID
INTENT_ID
EVENT_ID
CAUSATION_ID
SURFACE_ID
NEXT_CURSOR
```

Mensagens humanas sem envelope são `HUMAN_DELTA` e devem ser reconciliadas sem serem confundidas com mensagens do Hermes.

A correlação textual dos IDs Hermes→CHAT_GLOBAL→Hermes foi observada nesta sessão.

## 4. Regra de continuidade do Goal

A sessão confirmou a ferida:

```text
NEXT_READONLY_PROBE aberto
!= Goal concluído
```

O controlador não pode encerrar o Goal pai apenas porque um turno, probe, worker ou subagent terminou.

```text
LOCAL_DONE != PARENT_DONE
WAITING_EXTERNAL != CONTROLLER_BLOCKED
RESULT_READY != GOAL_DONE
```

Goal terminal só é permitido por condição terminal real do contrato, como `FIXED_POINT`, `HUMAN_FRONTIER` real ou cancelamento explícito do CHEFE.

Enquanto existir qualquer um dos estados abaixo, o Goal pai continua:

```text
NEXT_READONLY_PROBE
NEXT_CURSOR aberto
RUNNING
WAITING_EXTERNAL
RESULT_READY
ORACLE_RECONCILE
UNKNOWN recuperável
```

## 5. Control plane / work plane

Padrão consolidado:

```text
CONTROL_PLANE
→ mantém LOOP_ID
→ mantém LAST_GOOD_STATE
→ mantém NEXT_CURSOR
→ acompanha work items
→ recebe resultados
→ retorna ao CHAT_GLOBAL
→ continua o Goal

WORK_PLANE
→ executa probes independentes
→ read-only pode paralelizar
→ writers conflitantes continuam serializados
```

Cristais:

```text
PARALLEL_PERCEPTION=true
SERIALIZED_MUTATION=true
ONE_WRITER_PER_SCOPE=true
ONE_SYSTEM_ONLY=true
```

Um worker em `WAITING_EXTERNAL` não bloqueia outros probes read-only independentes.

## 6. Owner da ferida encontrado

O Hermes reportou nesta sessão que o owner do fechamento de Goal foi localizado em:

```text
hermes_cli/goals.py
GoalManager.evaluate_after_turn()
```

Foi aplicado guard narrow no checkout local do Hermes:

```text
NEXT_READONLY_PROBE presente
AND NEXT_CURSOR != FIXED_POINT
→ status active/continue
→ impedir verdict done
```

Commit local reportado:

```text
b7d2413738
```

Testes locais reportados para o patch:

```text
syntax=PASS
import=PASS
helper=PASS
```

Isso prova o patch local e os testes citados; não prova sozinho o ciclo E2E de continuidade.

## 7. 403 upstream — classificação correta

A tentativa de push para:

```text
NousResearch/hermes-agent
```

foi bloqueada por permissão efetiva do repositório remoto.

Isso não é requisito da missão CentralDark.

```text
UPSTREAM_WRITE_PERMISSION=FAIL
LOCAL_PATCH=preservado
CENTRALDARK_OPERATION_BLOCKED_BY_UPSTREAM_403=false
UPSTREAM_CONTRIBUTION_REQUIRED=false
```

A adaptação feita para a CentralDark deve ser preservada na CentralDark, não transformada em missão de contribuição ao upstream.

## 8. Reload do processo vivo

A investigação avançou do patch em disco para o processo vivo.

Sequência observada:

- inspeção dos processos Hermes Desktop;
- inspeção do parent process;
- inspeção de `systemd`;
- identificação de `hermes-gateway.service`;
- restart do gateway para carregar o código corrigido.

Readback reportado após restart:

```text
GATEWAY_RESTART=PASS
NEW_PID=2068697
ACTIVE_GATEWAY=active
ORACLE_GUARD=True
OPEN_WORK_GUARD=True
```

O novo PID foi reportado como iniciado após os commits locais e apontando para o checkout corrigido.

## 9. Limite atual da prova

Mesmo após o restart, os seguintes claims ainda permaneceram não observados na captura desta sessão:

```text
SAME_LOOP_ID=UNKNOWN
PENDING_PROBE_RESUMED=UNKNOWN
AUTO_NEXT_TURN=UNKNOWN
AUTO_RETURN_TO_ORACLE=UNKNOWN
GOAL_DONE_TERMINAL=UNKNOWN
```

Portanto:

```text
PATCH_PRESENT=PASS
GUARDS_PRESENT=PASS
GATEWAY_RESTART=PASS
ACTIVE_GATEWAY=PASS
FULL_CONTINUOUS_LOOP_E2E=UNKNOWN
FIXED_POINT=NOT_DECLARED
```

Não promover os campos UNKNOWN para verde sem readback real.

## 10. Próxima contraprova mínima

A única prova restante desta ferida é observar uma rodada viva após reload:

```text
NEXT_READONLY_PROBE aberto
→ turno termina
→ Goal permanece active
→ próximo probe inicia automaticamente
→ resultado retorna ao CHAT_GLOBAL
→ novo NEXT_CURSOR chega
→ mesmo LOOP_ID continua
→ UI não trata "Goal done · 1 turn" como terminal
```

Se o processo vivo estiver usando `GoalManager.evaluate_after_turn()` corrigido e ainda ocorrer encerramento, o próximo owner a localizar é o emitter downstream que converte o estado interno em `done`.

## 11. Relação CentralDark ↔ Hermes

Regra arquitetural explicitada pelo CHEFE nesta sessão:

```text
CentralDark = sistema/projeto
Hermes = componente/executor
```

Alterações feitas no Hermes especificamente para servir ao organismo CentralDark são tratadas como adaptações de integração/runtime da CentralDark.

Não criar:

```text
NO_NEW_HERMES_PRODUCT=true
NO_FORK_AS_SECOND_PRODUCT=true
NO_PARALLEL_BRAIN=true
NO_UPSTREAM_MISSION=true
```

Preservar:

```text
CAPABILITIES_CREATED_BY_CHEFE
AUTOMATIONS_CREATED_FOR_CENTRALDARK
RECOVERY
ORACLE_RETURN_PATH
NONBLOCKING_CONTROLLER_RULES
MULTI_SECTOR_READONLY_FANOUT
PROOF_FINGERPRINT_REUSE
RECEIPTS
REAPPLY_RECIPES
```

## 12. Estado do canônico no momento do cristal

Main medido antes desta gravação:

```text
ServerVpss/CentralDark@main
9bdf7d0abab7ca2acbce9c476a4bfb171228860c
```

A skill canônica existente continua em:

```text
.agents/skills/software-development/centraldark-oracle-surface/SKILL.md
```

O owner de percepção continua:

```text
apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
```

O hook já existente continua:

```text
scripts/trigger-fabric/oracle_evidence_hook.py
```

Este cristal registra a sessão sem criar scheduler, brain, dispatcher, perception engine ou writer paralelo.

## 13. NEXT_CURSOR

```text
NEXT_CURSOR=
PROVE_POST_RELOAD_CONTINUOUS_LOOP_E2E
→ SAME_LOOP_ID
→ AUTO_NEXT_TURN
→ AUTO_RETURN_TO_ORACLE
→ GOAL_DONE_NOT_TERMINAL_WHILE_OPEN_WORK
→ ONLY_THEN_PROMOTE_CONTINUITY_CAPABILITY
```
