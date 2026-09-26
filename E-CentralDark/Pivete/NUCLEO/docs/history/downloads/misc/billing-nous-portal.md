# Billing & Subscription — Nous Portal (2026-08-23)

## Snapshot (2026-08-23 02:52)

| Campo | Valor | Status |
|-------|-------|--------|
| Plano | Free · $0/mo | ✅ Gratuito |
| Subscription Credits | $0.10 de $0.10 | ⚠️ QUASE ZERADO |
| Top-up Credits | $10.00 | ✅ DISPONÍVEL (não expira) |
| Balance Total | $10.10 | ✅ OK |
| Auto-refill | Desabilitado | ❌ SEM PAYMENT METHOD |
| Payment Method | Nenhum cadastrado | ⚠️ AUTO-REFILL OFF |

## Fluxo de Créditos

| Cenário | O que acontece | Risco |
|---------|----------------|-------|
| Subscription credits ($0.10) acabam | Cai automaticamente nos Top-up credits ($10.00) | BAIXO |
| Top-up credits ($10.00) acabam | Para de funcionar (sem auto-refill) | ALTO (futuro) |
| Payment method não cadastrado | Auto-refill desabilitado permanentemente | MÉDIO (futuro) |

## Modelos Ativos no Runtime (Custo Zero)

| Componente | Modelo | Provider | Custo |
|------------|--------|----------|-------|
| Reasoning/Chat Principal | nvidia/nemotron-3-ultra-550b-a55b | NVIDIA API | FREE ($0) |
| Vision Fallback | stepfun/step-3.7-flash:free | Nous (free SKU) | FREE ($0) |
| Auto-Destilador | Usa modelo free ativo | Local/Hermes | $0 |
| MCP/Kanban/BFF | Local | — | $0 |

## Veredito de Risco (Madrugada)

| Pergunta | Resposta | Evidência |
|----------|----------|-----------|
| Sistema vai parar agora? | **NÃO** | Modelo ativo é FREE (nvidia) |
| Créditos $0.10 acabam? | Cai nos $10 top-up | Backup confortável |
| Sistema para de madrugada? | **NÃO** | Modelo nvidia é gratuito |
| Precisa payment method AGORA? | **NÃO** | Só para auto-refill futuro |

## Modelos Free Disponíveis (Nous Portal)

| Categoria | Modelos Free Disponíveis |
|-----------|--------------------------|
| Reasoning/Chat | nvidia/nemotron-3-ultra-550b-a55b, stepfun/step-3.7-flash:free, meta-llama/llama-3.1-405b-instruct:free, google/gemma-2-9b-it:free |
| Vision | stepfun/step-3.7-flash:free, google/gemini-2.0-flash-exp:free |
| Embeddings | nvidia/nv-embed-v1:free, sentence-transformers/all-MiniLM-L6-v2:free |

## Links Úteis

- [Nous Portal - Manage Subscription](https://portal.nousresearch.com/manage-subscription?user_code=FE5G-WNKS)
- [Nous Portal - Top Up Credits](https://portal.nousresearch.com/top-up)
- [Nous Portal - API Keys](https://portal.nousresearch.com/api-keys)
- [Nous Portal - Billing/Usage](https://portal.nousresearch.com/billing)

## Ações Recomendadas

- ✅ OK agora: Modelo nvidia free roda tudo (chat, reasoning, auto-destilador)
- ✅ OK backup: $10 top-up credits disponíveis (não expiram)
- ⚠️ Futuro: Cadastrar payment method para habilitar auto-refill (evita surpresa)
- ⚠️ Futuro: Monitorar subscription credits ($0.10) — quando zerar, cai nos top-up
- 📝 Documentado: Este snapshot salvo em LEGENDA-SESSAO-20260823.html + billing doc