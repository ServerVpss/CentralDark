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
