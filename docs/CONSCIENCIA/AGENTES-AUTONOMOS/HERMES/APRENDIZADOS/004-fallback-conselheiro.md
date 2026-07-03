# 004 — Fallback de conselheiro quando Elite Anthropic offline

**Data:** 2026-07-03  
**Categoria:** regra

## Contexto
Ao consultar Hermes real via `elite_gateway_chat` durante organização inicial da árvore, gateway retornou HTTP 500 (`Failed to connect to browser`). Não pode travar o fluxo esperando ele voltar.

## Aprendizado
**Ordem de fallback pra consultor IA (do mais forte pro mais leve):**
1. `elite_gateway_chat` (Elite Anthropic — Hermes real, id 52) — 1ª opção
2. Elite HTTP Gateway (id 51) — se Anthropic cair
3. Elite WebSocket (id 50) — última opção elite
4. `gemini_analisar` (gemini-flash-latest) — fallback rápido/barato/estável
5. `darkai` CLI (17 modelos) — se todos acima falharem

**Regra:** nunca travar workflow por 1 consultor offline. Cair pro próximo, gravar no DEBATE qual foi usado e por quê, e agendar re-consulta com o principal quando voltar.

## Ver também
- DEBATE-001 (primeiro caso de uso do fallback)
- Memória `mem://preferences/consultar-fabler-antes-de-executar`
