# RECEIPT — CENTRALDARK_INVOCATION_GRAMMAR_01

**Data:** 2026-09-27  
**Owner pai:** `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`  
**Subcontrato:** `docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md`  
**Modo:** DIRECT_MAIN_DOC_CRYSTAL  
**Runtime deploy:** não aplicável neste receipt.

---

## 1. Intenção do delta

O CHEFE consolidou que `CentralDark` não é só palavra ritual. É wake word operacional para dispatch semântico por verbo, comum a Texto, Voz, Work e Desktop.

```text
MESMA_INTENCAO → MESMO_FUNIL → MESMO_OWNER → MESMA_PROVA
```

O gatilho continua sob demanda: não carrega tudo por padrão, não abre runtime paralelo de voz, não cria V2 e não troca owner.

---

## 2. Dispatch cristalizado

```yaml
CENTRALDARK_INVOCATION_GRAMMAR_01: true
wake_word:
  canonical: "!CENTRALDARK"
  accepted: [CentralDark, centraldark, "#ACORDAR", "!CALIBRAR", "!AUTO_GRILL", "!GRILL_ME"]
verb_dispatch:
  visualize:
    decision: OBSERVE_OR_RENDER
    mutation_allowed: false
  faca:
    decision: EXECUTE_IF_AUTHORIZED_SCOPE
    mutation_allowed: true
  continue:
    decision: RESUME_NEXT_CURSOR
  cristalize:
    decision: WRITE_TO_EXISTING_OWNER
  contraprova:
    decision: RUN_OR_DESIGN_COUNTERPROOF
```

Regra crítica:

```text
NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE
NAO_CARREGAR_TUDO_POR_PADRAO
NORMALIZED_INTENT_SHARED=true
RAW_VOICE_TRANSCRIPT_PRESERVED=true
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true
```

---

## 3. Relação com a captura / delta útil

A captura anexada nesta sessão mostrou a outra caneta trabalhando no mesmo raciocínio: CentralDark + verbo precisa virar gramática verificável, não só lembrança de conversa. A `main` foi medida antes de mutar, e a costura foi feita em cima do HEAD vigente.

---

## 4. Arquivos tocados

```text
docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md
scripts/trigger-fabric/validate_unified_surface_parity_contract.py
docs/RECEIPTS/2026-09-27-CENTRALDARK-INVOCATION-GRAMMAR-01.md
```

---

## 5. Validação estática esperada

O validador de paridade agora exige:

```text
CENTRALDARK_INVOCATION_GRAMMAR_01
Owner pai: `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`
MESMA_INTENCAO → MESMO_FUNIL → MESMO_OWNER → MESMA_PROVA
NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE
NAO_CARREGAR_TUDO_POR_PADRAO
NORMALIZED_INTENT_SHARED=true
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true
```

E este receipt filho também passa a ser parte do conjunto validado.

---

## 6. PASS / UNKNOWN / BLOCKED

```yaml
PASS:
  - gramática estática materializada no owner correto
  - receipt filho criado
  - validador exige o subcontrato e o receipt filho
  - dispatch separa observação de mutação
UNKNOWN:
  - binding real da superfície Voice nesta conta/sessão
  - tokens/tool calls visíveis na lateral da Voz
  - parser/adaptador runtime ainda não implementado pelo Worker/Cloud Code
BLOCKED:
  - nenhum bloqueio documental nesta etapa
NEXT_CURSOR:
  - Worker/Cloud Code deve implementar parser/adaptador de superfície usando CENTRALDARK_INVOCATION_GRAMMAR_01 e devolver matriz Text × Voice × Work × Desktop
```

Verso operacional:

> Ôchí, verbo bom não corre solto: entra pelo funil, acha o dono e só mexe onde a prova alcança.
---

## 7. DELTAUTIL — binding nos owners executáveis existentes

T0 medido:

```text
.agents/skills/voice-semantic-classifier/SKILL.md = NÃO EXISTE
.claude/skills/synced/voice-semantic-classifier/SKILL.md = owner real, vindo do PR #1616
centraldark-intent-deploy-router = já existe
INTENT-DEPLOY-BINDING.json = já existe
```

Costura aplicada sem parser novo:

```text
CENTRALDARK_INVOCATION_GRAMMAR_01
→ voice-semantic-classifier existente
→ centraldark-intent-deploy-router existente
→ INTENT-DEPLOY-BINDING root
→ capability/owner pertinente
→ tool real
→ prova/receipt
```

Cadeados:

```text
NO_SECOND_PARSER=true
NORMALIZED_INTENT_SHARED=true
TEXT_AND_VOICE_SHARE_SEMANTIC_ACTION=true
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true
```

Status desta camada:

```yaml
PASS:
  - owner real do voice classifier identificado pelo PR #1616
  - ponteiro stale removido do skill unificado
  - gramática ligada ao classifier existente
  - gramática ligada ao intent router existente
  - binding root ganhou contrato machine-readable
  - validador exige owners e valores reais do binding
UNKNOWN:
  - Voice Tool Binding real da plataforma nesta conta/sessão
  - paridade viva de SESSION_ID/tool calls/tokens entre Texto e Voz
BLOCKED: []
NEXT_CURSOR:
  - Worker/Cloud Code deve implementar ou expor somente o binding de plataforma que ainda estiver ausente; não criar parser/owner novo
```



---

## 8. DELTAUTIL — família canônica de gatilhos sem ritual

A gramática foi reconciliada com os owners já existentes da Trigger Fabric. Não nasce parser novo e não nasce segunda arquitetura.

```text
!CENTRALDARK → INTERLIGADOS → AURÉOLA → #ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REGISTRA → REALIDADE
```

Cadeados:

```text
CANONICAL_CYCLE_IS_CONDITIONAL=true
TRIGGER_FAMILY_IS_NOT_ALWAYS_FULL_EXECUTION=true
NO_SECOND_PARSER=true
VOICE_REUSES_EXISTING_CLASSIFIER=true
INTENT_ROUTER_REUSED=true
REALITY_IS_FINAL_JUDGE=true
```

Interpretação: o ciclo define a ordem semântica e os owners disponíveis; o comando concreto ativa somente o menor subconjunto pertinente. `CentralDark visualize` não vira mutação. `CentralDark faça` pode mutar somente no escopo autorizado. `CentralDark continue` retoma o NEXT_CURSOR sem reiniciar missão.

**Correção de contradição:** o NEXT_CURSOR anterior falava em “implementar parser/adaptador”. Isso conflita com `NO_SECOND_PARSER=true`. O cursor correto é reutilizar o classifier/router existentes e expor somente o binding de plataforma realmente ausente.

```yaml
STATIC_TRIGGER_FAMILY_BINDING: PASS
LIVE_VOICE_BINDING: UNKNOWN
DEPLOY: OUT_OF_SCOPE
```


## Delta — autoridade da intenção vs ônus de prova do modelo

Cristalizado no mesmo owner, sem parser, runtime ou arquitetura paralela:

```text
CHEFE_INTENT_IS_AUTHORITY=true
CHEFE_COMMAND_IS_NOT_MODEL_CLAIM=true
MODEL_CLAIM_REQUIRES_PROOF=true
MODEL_MAY_NOT_DOWNGRADE_CHEFE_INTENT_TO_UNKNOWN=true
UNKNOWN_APPLIES_ONLY_TO_UNMEASURED_EXTERNAL_STATE=true
EXTERNAL_REALITY_STILL_REQUIRES_MEASUREMENT=true
```

Semântica: a ordem explícita do CHEFE trava o destino e não é rebaixada a
`UNKNOWN` por insegurança do modelo. O modelo, por outro lado, deve provar
claims de leitura, tool call, escrita, execução, estado externo e resultado.
A realidade externa continua sendo medida; autoridade sobre intenção não é
confundida com evidência sobre o mundo.

