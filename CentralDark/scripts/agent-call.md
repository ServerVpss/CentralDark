# Agent Call — esteira de debug em tempo real

Este documento explica o mecanismo de `scripts/agent-call.mjs` para humanos e agentes. O código é o gate executável; este fluxo é a leitura rápida ao lado dele.

## 🎯 Intenção

Quando um agente, CLI ou runtime **possui capacidade real e comprovável de delegar agentes** e existe uma frente de investigação que pode avançar sem disputar escrita, a delegação deixa de ser opcional.

O objetivo não é criar enxame. É trabalhar em esteira:

```text
CHEFE / MISSÃO
      ↓
WRITER RESPONSÁVEL
      ├──────────────────────────────┐
      │                              │
      │ costura o delta já provado   │ DEBUGGER vai na frente
      │ no ponto exato               │ procurando próximo erro
      │                              │
      │  ←──── 📡 DELTA_MESSAGE ─────┘
      │
      ├─ costura
      ├─ testa
      ├─ prova
      └─ continua pelo mesmo trilho
```

O agente da frente não toma a caneta. Ele observa, depura, revisa ou julga e devolve **somente o delta útil**.

## 🔒 Regra obrigatória

```text
CAPACIDADE_REAL_DE_DELEGAR=COMPROVADA
+ FRENTE_DE_DEBUG_DELEGAVEL=true
= DELEGACAO_OBRIGATORIA
```

Capacidade não pode ser autoafirmação booleana. O `JARVIS_STATE` precisa registrar a descoberta da capacidade e sua evidência:

```json
{
  "capabilities": {
    "delegate_agents": {
      "supported": true,
      "source": "runtime-tool-inventory",
      "evidence_ref": "runtime:tools/delegate-agent"
    }
  }
}
```

Sem `source` + `evidence_ref`, a capacidade permanece `UNKNOWN`.

Antes de fechar a execução, o gate exige um **resultado de delegação concluído e validado** para cada frente delegável aberta:

```text
node scripts/agent-call.mjs --delegation-gate jarvis-state.json
```

Resultados:

```text
PASS_REQUIRED_DELEGATION
→ capacidade comprovada + frente delegável + DELEGATION_RESULT válido

NOT_APPLICABLE_NO_DELEGABLE_FRONTIER
→ não havia trabalho independente que justificasse outro agente

NOT_APPLICABLE_CAPABILITY_UNAVAILABLE
→ inventário do runtime provou que a capacidade não existe

BLOCKED_DELEGATION_CAPABILITY_UNKNOWN
→ existe trabalho delegável, mas a capacidade não foi provada

BLOCKED_REQUIRED_DELEGATION_MISSING
→ podia delegar, precisava delegar e não provou execução+retorno
```

`UNKNOWN` nunca vira PASS.

## 👁 Mesmo trilho

Uma chamada não abre outra missão nem inventa rota.

```text
MESMA_MISSAO
+ MESMA_ORIGEM
+ MESMO_DESTINO
= MESMO_TRILHO
```

Se `JARVIS_STATE.trail.route_id` existe, toda chamada precisa carregar o mesmo `trail_id`.

```text
trilho ausente   → BLOCKED_MISSING_TRAIL
trilho diferente → BLOCKED_ROUTE_DRIFT
```

O agente pode ir para a frente e voltar pelo rádio, mas não pode criar um desvio silencioso para chegar ao mesmo destino.

## 📡 Rádio: chamada aceita não é execução

O rádio usa o contrato já existente `DELTA_MESSAGE`, mas há três estados diferentes:

```text
CALL_ACCEPTED
≠
AGENTE_EXECUTOU
≠
RETORNO_VALIDADO
```

Uma chamada aceita só prova que o receptor **podia ser chamado**. Ela não satisfaz o gate de delegação.

Depois que o subagente realmente termina, sua volta passa pelo validador:

```text
node scripts/agent-call.mjs \
  --delegation-result result.json call-receipt.json jarvis-state.json
```

O retorno precisa bater com a chamada em:

```text
call_id
mission_id
HEAD
frontier_id
trail_id
direção do rádio (filho → chamador)
status=COMPLETED
execution_ref
DELTA_MESSAGE
```

Só então nasce:

```text
receipt_type=DELEGATION_RESULT
delegation_completed=true
return_mode=DELTA_MESSAGE
radio_mode=DELTA_ONLY
```

Fluxo do rádio:

```text
AGENTE DA FRENTE
→ executa de verdade
→ finding / ausência comprovada de finding
→ evidência
→ ponto afetado
→ próximo alvo
→ DELTA_MESSAGE
→ valida retorno
→ WRITER
```

Não retransmitir a missão inteira quando o outro lado já possui `JARVIS_STATE`.

## Subagente e sub do sub

Chamadas aninhadas são permitidas sem limite artificial de profundidade no contrato.

Cada chamada aninhada carrega:

```text
parent_call_id
frontier_id
depth
mission_id
observed_head
trail_id
scope
requested_role
requested_action
```

Exemplo:

```text
Writer
  ↓
Debugger depth=1
  ↓
Reviewer depth=2
  ↓
DELEGATION_RESULT / DELTA_MESSAGE
  ↑
Debugger
  ↑
Writer continua costurando
```

Subagente continua **read-only por padrão**.

Uma chamada aninhada que pede escrita só pode existir após `WRITER_HANDOFF` explícito e válido. Sem handoff:

```text
BLOCKED_NESTED_WRITE_WITHOUT_HANDOFF
```

Assim existe paralelismo de inteligência sem dois Writers brigando pelo mesmo escopo.

## 🩹 HEALING STREET — cura da mesma rua

`HEALING_STREET` não é nova missão, novo agente, novo trilho nem bypass de gate. É a escalada determinística quando **a costura normal já falhou**.

```text
COSTURA NORMAL
   ↓ quebrou + falha provada
🔥 WELD / SOLDA
   ↓ falhou + causa/evidência
🩺 REBUILD_LOCAL / REFAZ LOCALMENTE
   ↓ falhou + causa/evidência
🌉 JUMP_BRIDGE / SALTO + PONTE
   ↓ falhou
BLOCKED_HEALING_EXHAUSTED
```

Não existe contagem arbitrária de tentativas. Uma camada só sobe quando a anterior possui `HEALING_RESULT status=FAILED` válido. Repetir a mesma solda sem informação nova é desperdício.

O estado abre a cura assim:

```json
{
  "healing": {
    "required": true,
    "trigger": "STITCH_FAILED",
    "frontier_id": "F-HEAL"
  },
  "healing_receipts": []
}
```

Consultar o próximo nível:

```text
node scripts/agent-call.mjs --healing-gate jarvis-state.json
```

Registrar o resultado real:

```text
node scripts/agent-call.mjs --healing-result healing-result.json jarvis-state.json
```

### Solda

`WELD` é o primeiro nível depois da costura quebrada. É uma correção localizada na mesma fronteira causal.

Se falhar, precisa registrar:

```text
failure_ref
cause_ref
evidence_refs[]
```

Sem falha provada não existe autorização lógica para subir de nível.

### Refaz + revisa

`REBUILD_LOCAL` reconstrói **somente a região afetada**, a partir de checkpoints conhecidos. Não reinicia a missão e não invalida provas fora da fronteira causal tocada.

Uma cura só pode declarar `HEALED` depois de:

```text
test_ref
counterproof_ref
review_forward_ref
review_backward_ref
checkpoint_before
checkpoint_after
postcondition_proven=true
affected_frontier_revalidated=true
material_delta_after_review=0
```

Ou seja: corrigiu, tentou derrubar e percorreu novamente a cadeia de ida e de volta antes de fechar.

### Salto + Ponte

`JUMP_BRIDGE` só existe quando a região local original ficou comprovadamente inviável. A ponte **não muda a missão nem cria outro trilho lógico**: ela atravessa o segmento quebrado e precisa religar em checkpoint provado do mesmo `trail_id`.

Contrato obrigatório:

```json
{
  "bridge": {
    "rejoins_same_trail": true,
    "target_checkpoint_proven": true,
    "authorization_preserved": true,
    "scope_preserved": true,
    "mandatory_gates_skipped": []
  }
}
```

Qualquer gate obrigatório pulado, troca silenciosa de trilho, perda de escopo ou autorização produz:

```text
BLOCKED_UNSAFE_BRIDGE
```

A ponte troca o **mecanismo de travessia**, não a verdade exigida no destino.

## MENOS É MAIS + Meta Lupa

Durante toda a esteira:

```text
META_LUPA_ALWAYS_ON=true
MENOS_E_MAIS_ALWAYS_ON=true
ONE_SCOPE_ONE_WRITER=true
SAME_DESTINATION_SAME_ROUTE=true
SILENT_REROUTE=false
HEAL_ONLY_AFFECTED_FRONTIER=true
```

A regra não manda criar agente por decoração.

```text
CAPACIDADE_COMPROVADA=true
+ NENHUMA_FRENTE_REALMENTE_DELEGAVEL
= NÃO CRIA AGENTE
```

Delegar trabalho que não existe seria desperdício e violaria o próprio MENOS É MAIS.

## 👊 Entrega pós-ação, não proposta prematura

Quando a intenção do CHEFE está clara, a ação está dentro do escopo/autorização vigente e o sistema consegue verificar o resultado por ferramenta, o coordenador **não deve interromper o CHEFE para apresentar uma solução que ele próprio já pode aplicar e provar**.

```text
INTENÇÃO CLARA
+ AÇÃO AUTORIZADA
+ FERRAMENTA DISPONÍVEL
+ RISCO DENTRO DOS GATES
→ EXECUTA
→ TESTA
→ CONTRAPROVA
→ REVISA IDA
→ REVISA VOLTA
→ REGISTRA
→ SÓ DEPOIS REPORTA O RESULTADO
```

Escalar antes da ação somente quando houver decisão/autorização exclusivamente humana, risco não autorizado, conflito de intenção ou bloqueio real que sobreviva ao ciclo completo.

O relatório ao CHEFE deve trazer **trabalho feito + eficácia + evidência + bloqueio real**, e não uma proposta que já poderia ter sido resolvida autonomamente.

## Fluxo completo

```text
🎯 INTENÇÃO
   ↓
📍 JARVIS_STATE / HEAD / ESCOPO / TRILHO
   ↓
👁 META LUPA + MENOS É MAIS
   ↓
EXISTE FRENTE DE DEBUG INDEPENDENTE?
   ├─ NÃO → Writer continua
   └─ SIM
       ↓
CAPACIDADE DE DELEGAR FOI PROVADA PELO RUNTIME?
   ├─ NÃO EXISTE → continua sem agente ornamental
   ├─ UNKNOWN → BLOCKED até saber
   └─ SIM
       ↓
DELEGA DEBUGGER/REVIEWER/JUDGE READ_ONLY
       ↓
WRITER CONTINUA COSTURANDO ATRÁS
       ↓
SUBAGENTE EXECUTA
       ↓
📡 DELTA_MESSAGE
       ↓
VALIDA DELEGATION_RESULT
       ↓
WRITER INCORPORA O DELTA
       ↓
COSTURA QUEBROU?
   ├─ NÃO → segue teste/contraprova
   └─ SIM
       ↓
🔥 WELD
       ↓ se falhar
🩺 REBUILD_LOCAL
       ↓ se falhar
🌉 JUMP_BRIDGE
       ↓
TESTE + CONTRAPROVA + REVISÃO IDA/VOLTA
       ↓
VALIDA HEALING_RESULT
       ↓
TESTE + CONTRAPROVA + JUDGE + META LUPA
       ↓
ANTES DE FECHAR:
--delegation-gate
--healing-gate (quando aplicável)
       ↓
PASS?
   ├─ NÃO → volta exatamente ao fio solto
   └─ SIM → continua o fechamento normal da missão
```

A chamada e o healing não concedem autoridade, não promovem código e não substituem os gates normais de Writer, teste, Judge, Meta Lupa, merge ou deploy.
