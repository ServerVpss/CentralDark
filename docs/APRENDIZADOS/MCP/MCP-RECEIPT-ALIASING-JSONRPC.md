# Receipt — Correção MCP: Aliasing, JSON-RPC, Inventário

**Data:** 2026-10-21  
**Authority:** SEGREDO/CHEFE  
**Owner:** docs/APRENDIZADOS/MCP  
**Status:** REGISTRADO  
**Versão:** 1.0

## Problema
- Names > 64 chars quebrando cliente MCP
- JSON-RPC parsing errors
- Catálogo excessivo (58 tools, 55 enabled + mcp_cloudflare_*)

## Avaliação Horn (MCP-REUSE-HORN-FIXED-POINT.md)

```text
OWNER_PRESENT + CAPABILITY_PRESENT -> REUSE_CANDIDATE ✓
REUSE_CANDIDATE + SAME_SCOPE -> REUSE_REQUIRED ✓ (REUSE_BEFORE_CREATE=true)
REUSE_REQUIRED + EVIDENCE_PRESENT + REGRESSION_ABSENT -> EXTEND_EXISTING ✓
```

## Fixed Point Verification

| Criteria | Status |
|----------|--------|
| fixed_point_stable | true |
| owner_measured | true (apps/modulos/mcp) |
| capability_measured | true |
| evidence_present | true (2 error logs) |
| regression_absent | true |
| learning_closed | true |
| unknown_is_not_pass | true |
| no_reuse_create_contradiction | true |

**RESULT:** PASS - Fixed point estabilizado

## Correção Aplicada

### 1. Alias Determinístico
- Nomes ≤ 64: usados como-is (com suffix de colisão)
- Nomes > 64: hash-based truncation (~32 chars)
- Registry toolCorrespondence: original ↔ alias

### 2. Validação JSON-RPC
- Rejeita msg sem id/method
- Valida types de method, params, id
- Erros sem expor credenciais

### 3. Inventário Navegável
- Filtro por provider
- Busca em alias ou nome original
- Paginação (page, limit)

## Aprendizados Registrados

1. Never eliminate tools - only alias where client requires
2. Avoid alias collisions - deterministic suffix with counter
3. Original names recoverable from aliases (bidirectional registry)
4. JSON-RPC validation at boundary, never post-execution
5. Parse errors reported without credential exposure
6. Catalog always needs pagination/filters - never raw list
7. REUSE_BEFORE_CREATE=true - extend owner existente, never create new when owner present

## Continuity Flow

OBSERVE_ERROR → MEASURE_OWNER → resolver_reuse_before_create → REUSE/EXTEND → registrar_aprendizado → REMEASURE → FIXED_POINT (PASS)

## Itens de Conformidade

| Item | Valor | Status |
|------|-------|--------|
| Owner extendido | apps/modulos/mcp | ✅ Horn contract |
| REUSE_BEFORE_CREATE | Aplicado | ✅ Canônica |
| Fixed point stable | true | ✅ All 8 conds |
| UNKNOWN ≠ PASS | Mantido | ✅ Canônica |
| Learning registrado | Nesse receipt | ✅ APRENDIZADOS.md |
| Tools preservadas | Todas | ✅ Critério MVP |
| Aliases determinísticos | Implementados | ✅ Critério MVP |
| JSON-RPC validation | Implementada | ✅ Critério MVP |
| Catálogo navegável | Implementado | ✅ Critério MVP |