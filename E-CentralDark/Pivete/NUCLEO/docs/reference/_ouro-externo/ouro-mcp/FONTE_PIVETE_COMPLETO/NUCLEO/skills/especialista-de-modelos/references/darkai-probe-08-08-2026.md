# DarkAI (Supabase proxy) — free-tier credit probe

Data: 08/08/2026 · Profile: pivete · Provedor: DarkAI (Lovable Edge)

## Endpoint base
```
https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1
```
Auth: `Authorization: Bearer $DARKAI_ANON_KEY` (key_env: DARKAI_ANON_KEY)

## Recipe cirúrgica
```bash
B="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1"
K="$DARKAI_ANON_KEY"

# 1) lista modelos (sempre 200, sem pricing no corpo)
curl -s "$B/models" -H "Authorization: Bearer $K"

# 2) teste real de chat (é aqui que o saldo aparece)
curl -s -X POST "$B/chat/completions" \
  -H "Authorization: Bearer $K" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.5-flash-lite","messages":[{"role":"user","content":"hi"}],"max_tokens":5}'
```

## Resultado observado
- `GET /models` → HTTP 200, lista 19 modelos (gemini-2.5/3.x + gpt-5.x). Sem campo de preço/custo no JSON.
- `POST /chat/completions` (qualquer modelo) → HTTP 402, corpo: `{"error":"sem_creditos"}`.
- `GET /balance`, `/user/me`, `/v1/balance`, `/billing` → `{"error":"not_found"}` (não há endpoint de saldo).

## Veredito
Free tier do DarkAI está **sem crédito** (🔴 sem_credito). Diferente de `🟡 trial_exhausted` (MiniMax 1008). Não é 401 (chave) nem 404 (endpoint).
Único free utilizável no setup: `tencent/hy3:free` (Nous Portal) — rate-limited, sem saldo $, operando a sessão.

## Notas de execução
- MSYS no Windows: `/tmp` não existe — jogar saída pra stdout, não `-o /tmp/...`.
- Gateway local Hermes (127.0.0.1:9119) estava OFF (curl rc=7) — não dá pra listar via `/v1/models` do gateway; bater direto no proxy.
- Nous Portal não expõe API de saldo (portal devolve HTML, não JSON); free do nous é rate-limited por req, não por crédito $.
