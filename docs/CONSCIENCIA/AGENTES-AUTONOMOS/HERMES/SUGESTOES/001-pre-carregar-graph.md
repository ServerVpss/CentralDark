# SUG-001 — Pré-carregar graph antes de qualquer bloco

**Data:** 2026-07-03
**Nasceu em:** AULA-011 (auto-aprendizagem)
**Categoria:** otimização
**Status:** proposta

## Observação
Cada bloco começa "do zero" abrindo arquivos crus. Graph-panel já tem tudo indexado — mas Hermes esquece de consultar primeiro. Resultado: gasto de token 5–10x maior que o necessário.

## Proposta
Adicionar passo obrigatório 0 no loop da AULA-011:
> **Passo 0:** `curl graph-panel/search?q=<tema-do-bloco>` ANTES de qualquer coisa. Se retorna hit relevante, usa. Se não retorna, escala pra memória → consciência → arquivos crus.

## Custo/benefício
- **Ganho:** economia estimada 60–80% de token por bloco. Latência menor.
- **Custo:** 1 request HTTP extra no início (~50ms).
- **Quebra algo?** Não. Graph já roda em produção (área protegida).

## Próximo passo (se admin aprovar)
1. Atualizar AULA-011 §3.1 marcando graph como **passo 0 obrigatório** (não só "mais barato").
2. Criar `HERMES/ROTAS-FIXAS/consultar-graph.md` com curl pronto + exemplos de query.
3. Bumpar skill "Auto-diagnóstico" +10 na primeira execução com graph-first.
