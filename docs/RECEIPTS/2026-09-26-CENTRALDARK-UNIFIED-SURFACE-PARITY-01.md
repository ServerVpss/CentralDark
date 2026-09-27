# RECEIPT — CENTRALDARK_UNIFIED_SURFACE_PARITY_01

**Data:** 2026-09-26  
**Origem:** conversa voz → texto com CHEFE/SEGREDO  
**Base:** intenção explícita de cristalizar paridade Texto/Voz/Work/Desktop, Intent Gateway, Auto-Grill, GEV/JEV opcional e replay de cristais provados.  
**Modo:** DIRECT_MAIN_DOC_CRYSTAL  
**Deploy runtime:** não aplicável neste receipt.  

---

## 1. Intenção cristalizada

O CHEFE determinou que `CentralDark` seja a semântica/gatilho mestre sob demanda.

Quando o CHEFE disser `CentralDark faça/visualize/mede/pluga/costura/testa`, a entrada deve passar pelo funil completo, mas somente pelo escopo pertinente:

```text
entrada multimodal
→ !CENTRALDARK
→ INTENT_CORE
→ Auto-Grill / Grill-Me
→ decisão type-safe opcional
→ owner existente
→ plug mínimo
→ teste vivo
→ receipt
```

Não é para puxar o sistema inteiro sempre. É para carregar o menor conjunto de owners, cristais e ferramentas suficiente para a intenção.

---

## 2. Defeito descoberto

Durante a voz, houve falsa promessa de arquivo/link/zip/commit porque a superfície Voice não expôs a ferramenta real de escrita/exportação.

Cristal:

```text
PERMISSION_EXISTS != TOOL_EXPOSED
TOOL_LISTED != TOOL_ACTIVE
VOICE_CLAIM_WITHOUT_TOOL_CALL=INVALID
```

Nome da peça ausente:

```text
Voice Tool Binding
Voice-to-tool capability binding
Unified tool surface binding
```

---

## 3. Regra de paridade

Texto, Voz, Work e Desktop devem consumir o mesmo capability bus quando a plataforma suportar.

```text
TEXT ⇄ VOICE ⇄ WORK ⇄ DESKTOP
same_intent_core=true
same_owner_fabric=true
same_capability_bus_when_supported=true
same_receipt_law=true
```

Se uma superfície não suporta determinada ferramenta, ela deve responder `PLATFORM_UNAVAILABLE`. Não pode simular execução.

---

## 4. Replay de cristal provado

Cristal provado não deve ser redescoberto. Deve ser reaproveitado.

```text
CRISTAL_PROVADO = REPLAY_FIRST
PROVE_ONLY_NEW_INTEGRATION=true
```

Fluxo:

```text
ID/SHA/hash/fingerprint/manifest/receipt
→ owner equivalente na main
→ fingerprint bate?
→ plugar delta faltante
→ testar efeito vivo
→ receipt
```

Proibido:

```text
auditar sistema inteiro sem ordem
reprovar cristal antigo sem evidência nova
criar owner paralelo
criar V1/V2/V3
```

---

## 5. GEV/JEV

GEV/JEV fica como micropeça opcional do portão de intenção, não como runtime novo.

```text
Hermes/SOL normaliza estado
→ Auto-Grill reduz lacunas
→ GEV/JEV retorna decisão tipada com confiança
→ gate decide executar/perguntar/rejeitar/indisponível
```

Regra:

```text
CONTRACT_FIRST_ENGINE_LATER=true
```

---

## 6. Arquivos materializados

```text
.agents/skills/centraldark-unified-surface-parity/SKILL.md
docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml
docs/RECEIPTS/2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md
```

---

## 7. Comando para Worker / Cloud Code

```text
!CENTRALDARK — EVOLUIR, NÃO CRIAR PARALELO.

Carregue e implemente CENTRALDARK_UNIFIED_SURFACE_PARITY_01.
Owners já materializados:
- .agents/skills/centraldark-unified-surface-parity/SKILL.md
- docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml
- docs/RECEIPTS/2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md

Objetivo:
Dar paridade real entre Texto, Voz, Work e Desktop usando o mesmo capability bus,
mesmo Intent Gateway, mesmo Auto-Grill, mesma lei de receipt e mesmos owners.

Regras duras:
- Não criar V1/V2/V3.
- Não criar arquitetura paralela.
- Não criar plugin paralelo se owner existente comportar o delta.
- Não simular ferramenta.
- Se Voice não suportar tool real, marcar PLATFORM_UNAVAILABLE.
- Cristal provado = replay primeiro.
- Provar somente a integração nova.
- Owner é destino lógico, não identidade do executor.

Implementar/validar:
1. Matriz Text × Voice × Work × Desktop.
2. Descoberta de ferramentas por superfície antes de qualquer claim.
3. Voice Tool Binding design.
4. Session/Tracing/Tool Calls/Usage Tokens/Receipts visíveis quando suportado.
5. Intent Gateway sob demanda acionado por !CENTRALDARK/CentralDark/#ACORDAR/!CALIBRAR.
6. Auto-Grill antes de perguntar ao CHEFE.
7. Adapter opcional GEV/JEV como decisão tipada, sem substituir Hermes/SOL.
8. Anti-fake execution rule.
9. Anti-loop EVENT_ID/SOURCE_ROUTE/SOURCE_DEVICE/INTENT_ID/CAUSATION_ID.
10. Validation cost by blast radius.

Entrega obrigatória:
- arquivos alterados
- owners tocados
- matriz de capacidades
- testes rodados
- receipts
- PASS / UNKNOWN / BLOCKED
- NEXT_CURSOR
```

---

## 8. Status

```yaml
PASS:
  - contrato skill criado
  - contrato yaml criado
  - receipt criado
  - regra anti-fake materializada
  - regra replay de cristal materializada
  - Voice Tool Binding nomeado como lacuna
UNKNOWN:
  - plugin/voice binding realmente exposto pela plataforma atual
  - GEV/JEV real online/credencial/transporte
  - testes vivos na Casa após formatação
BLOCKED:
  - nenhum bloqueio de documentação nesta etapa
NEXT_CURSOR:
  - Worker/Cloud Code deve implementar paridade real e contraprovar com matriz de superfície
```

---

## 9. Frase núcleo

```text
NÃO É DAR PODER AO MODELO.
É EXPOR A MESMA CAPABILITY REAL PARA QUALQUER MODELO AUTORIZADO.
```


---

## 10. Delta — sessão, tracing e saída sem caixa-preta

**Requisito consolidado pelo CHEFE:** a mesma intenção em Texto/Voz deve permanecer na mesma sessão canônica, com a mesma visão lateral de sessões, tool calls, usage/tokens e receipts. A superfície pode mudar a apresentação, mas não o resultado estruturado, owner, ação ou prova.

Contrato:

```yaml
same_canonical_SESSION_ID: true
shared_ordered_TRACE: true
sidebar: [sessions, tool_calls, usage_tokens, receipts]
same_structured_outcome:
  - INTENT_ID
  - DECISION
  - OWNER
  - ACTION_RESULT
  - EVIDENCE
  - COUNTERPROOF
  - RECEIPT_ID
  - NEXT_CURSOR
voice_only_session_or_trace: forbidden
unexposed_platform_capability: PLATFORM_UNAVAILABLE
```

### Medição desta sessão — 2026-09-27 01:27 UTC

| Superfície observada | Evidência atual | Estado |
|---|---|---|
| Texto nesta sessão Work | Conector GitHub leu os quatro owners; ferramenta de escrita disponível. Esta atualização será provada pelo SHA de commit retornado. | PASS após confirmar os commits |
| Voz | Não é uma superfície exposta nesta sessão de texto; sessão/tracing/uso da Voz não foram medidos aqui. | UNKNOWN |
| Work | Esta execução está no Work Mode; GitHub e Remote Desktop Commander estão expostos. Não prova paridade em outra sessão Work. | PASS limitado à exposição atual |
| Desktop | Remote Desktop Commander encontrou dispositivo SEGREDO online (app 0.2.51), sessão de terminal PID 31412 (Blocked=true; Runtime=9760s), histórico recente de 20 tool calls e uso do Remote MCP: 3034 chamadas, 98% de sucesso, 60 sessões/21 ferramentas e 70% das chamadas restantes no mês. | PASS para telemetria de chamadas do Desktop Commander; tokens do modelo e vínculo da Voz = UNKNOWN |

O histórico consultado contém chamadas `edit_block`, `start_process`, `read_process_output`, `list_sessions` e `list_processes`. Os argumentos e outputs integrais não foram copiados para este receipt.

**Contraprova:** a captura de tool calls e uso do Remote MCP existe no Desktop Commander, mas não demonstra que Texto e Voz compartilham o mesmo `SESSION_ID`, nem que a lateral da Voz mostra esses eventos. Uso de chamadas MCP não equivale a contagem de tokens do modelo; tokens do modelo nesta sessão permanecem `UNKNOWN`. Portanto, paridade runtime Text↔Voice continua `UNKNOWN` até uma execução de Voz apresentar o mesmo contrato de sessão/tracing/usage e a mesma prova.

**NEXT_CURSOR:** validar uma ação real acessível em Texto e Voz; comparar `SESSION_ID`, sequência `TRACE_ID/TOOL_CALL_ID`, tokens de modelo e usage, owner, resultado estruturado e receipt. Se a plataforma Voice não expuser esses campos, registrar `PLATFORM_UNAVAILABLE` com a capability específica.


### Contraprova do contrato — 2026-09-27

Os quatro arquivos foram relidos do `main` e usados como entrada do validador `scripts/trigger-fabric/validate_unified_surface_parity_contract.py`.

```text
UNIFIED_SURFACE_PARITY_CONTRACT=PASS
exit_code=0
validator_commit=75975d7d139a2ea7c9f2412fb7982c4e2e302770
```

A primeira execução falhou e expôs marcadores desalinhados e um falso positivo para a frase válida `GEV/JEV não substitui Hermes`. O validador foi corrigido, commitado e executado novamente; a segunda execução passou.

```yaml
STATIC_CONTRACT_VALIDATION: PASS
LIVE_TEXT_VOICE_SESSION_PARITY: UNKNOWN
VOICE_BINDING: UNKNOWN
DESKTOP_TRACE_AND_USAGE_PROBE: PASS
```

Este PASS cobre somente a consistência estática entre contrato, skill e receipt. Não declara binding de Voz nem paridade viva entre sessões.
