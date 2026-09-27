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
