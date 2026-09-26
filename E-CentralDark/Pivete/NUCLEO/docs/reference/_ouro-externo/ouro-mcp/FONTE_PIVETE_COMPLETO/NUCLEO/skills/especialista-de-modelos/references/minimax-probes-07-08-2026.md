# MiniMax — probes 07/08/2026

## Resumo

**6 chaves MiniMax testadas.** Padrão majoritário: autenticam, mas saldo
de chat insufuciente. KEY5 retorna `2056` (Token Plan usage limit) — variação
documentada que NÃO é `1008`.

## Chaves testadas

| # | key_prefix | status chat | user |
|---|---|---|---|
| 1 | `sk-api-YxgBA...` | 1008 insufficient balance | Pivete (original) |
| 2 | `eyJhbGci...JWT` | 1008 insufficient balance | Falano DONe (2025-10) |
| 3 | `sk-api-C98I3...` | 1008 insufficient balance | Pivete (nova) |
| 4 | `sk-api-crumd...` | 1008 insufficient balance | Pivete (nova) |
| 5 | `sk-cp-eWg7...` | **2056 Token Plan usage limit reached** | Pivete (nova) |
| 6 | `sk-api-fxse...` | 1008 insufficient balance | Pivete (nova) |

**6 chaves testadas, 2 erros distintos.** `1008` ≠ `2056` — ver seção códigos.

## Códigos de erro distintos (07/08 tarde)

| code | msg | significa | ação |
|---|---|---|---|
| 1008 | insufficient balance | Conta sem saldo (sem ser rate limit) | comprar crédito / upgrade |
| 1002 | rate limit exceeded (RPM) | Requisições por minuto da janela | esperar janela resetar |
| 2056 | Token Plan usage limit reached | Plano Token Plan da janela 5h/window | esperar 5h ou upgrade |
| 2013 | invalid params, expr_path=... | Payload faltando campo | adicionar `bot_setting`/`reply_constraints` |

**Insight:** 1008 ≠ 1002 ≠ 2056. Não trate como "saldo zero" sem ler o `status_msg`.

## Endpoint base correto

```text
https://api.minimax.io/v1
```

> Gotcha: paste do Pivete (07/08) trouxe snippet apontando
> `https://minimax.io` (sem `api.`) — **404 page not found**. O correto é
> `https://api.minimax.io`. Atalhos sem `api.` em docs de terceiros são
> armadilha. Antes de curl, sempre `https://api.minimax.io/v1/...`.

## Endpoints de chat

| Endpoint | Header | Body mínimo | Notas |
|---|---|---|---|
| `POST /v1/text/chatcompletion_v2` | `Authorization: Bearer <key>` | `{"model":"MiniMax-M3","messages":[{"role":"user","content":"..."}],"max_tokens":N}` | Plano Token Plan. Funciona com payload simples. |
| `POST /v1/text/chatcompletion_pro` | mesmo | `{"model":"...","messages":[...],"bot_setting":[{"role":"system","content":"..."}],"reply_constraints":{"sender_type":"USER","max_tokens":N}}` | Plano Pro. **2013** se faltar `bot_setting` ou `reply_constraints.sender_type`. |
| `POST /v1/chat/completions` | mesmo | idem v2 | OpenAI-compat. Mesmos códigos de erro. |
| `POST /v1/text/chatcompletion` | mesmo | idem v2 | Retorna **1002 RPM** em rate-limit. |

## Endpoint `/v1/text/chatcompletion_pro` (07/08)

Existe e é **mais exigente** que o `v2`. Falha 2013 se faltar campo:

```bash
# ERRADO
curl ... /v1/text/chatcompletion_pro -d '{"model":"M3","messages":[...]}'
# → 2013: missing required parameter expr_path=bot_setting

# CERTO
curl ... /v1/text/chatcompletion_pro -d '{
  "model":"MiniMax-M3",
  "messages":[{"role":"user","content":"oi"}],
  "bot_setting":[{"role":"system","content":"Você é um assistente."}],
  "reply_constraints":{"sender_type":"USER","max_tokens":10}
}'
```

**Dois campos obrigatórios** no `pro`: `bot_setting` + `reply_constraints.sender_type`. Não é um.

## Padrão de resposta

**Endpoint `/v1/models`** (GET): 200 OK, lista 8 modelos (M3, M2.7, M2.7-highspeed, M2.5, M2.5-highspeed, M2.1, M2.1-highspeed, M2).

**Endpoint `/v1/text/chatcompletion_v2`** (POST com payload correto):

```json
{
  "id": "06c54bba...",
  "choices": null,
  "model": "MiniMax-M3",
  "base_resp": {
    "status_code": 1008,
    "status_msg": "insufficient balance"
  }
}
```

**Diagnóstico correto:** a chave **autentica** mas o **saldo de chat é zero**. Não é 401 (chave inválida) nem 404 (endpoint errado).

## Histórico

- 04/08: Tentativa de configurar `darkai`/`custom` provider deu 402.
- 05/08: Algumas chamadas de listagem consumiram tokens, esgotando saldo.
- 07/08 14:30: 4 chaves testadas, todas insuficientes.
- 07/08 ~14:50: 6 chaves testadas — KEY5 documenta variante `2056`.

## Endpoint billing (não público)

`curl GET https://api.minimax.io/v1/dashboard/billing/credit` → **404 page not found**.
`curl GET https://api.minimax.io/v1/dashboard/billing/subscription` → **404 page not found**.

Saldo só pode ser visto no painel web do usuário: `platform.minimax.io` → Billing → Plan.

## Política Pivete (07/08) — save keys mesmo sem saldo

> "RELAXA FICA COM PENA NAO EIXA ROLAR SO MANTER AVISADO"

Aplicar:

```text
- Salvar TODA key MiniMax no `.env` mesmo sem saldo (status 🟡 trial_exhausted).
- NÃO deletar key só porque falhou agora — pode resetar (5h window).
- Manter backup `.env` antes de cada append.
- Manter NOME com sufixo (`MINIMAX_API_KEY_2`, `_3`, ...) pra rastreio.
- Quando uma passar a responder, REVERTER para 🟢 e atualizar score.
```

Justificativa: a key que falha agora (`1008` / `2056`) pode estar em
**janela de rate-limit** que libera sozinha. Não é heurística — é feature
documentada do Token Plan.

## Pivete mesmo org = múltiplas keys

4 keys da conta Pivete caíram juntas. KEY5 (mesma org, criada 07/08) → `2056`.
KEY6 → `1008`. **Conclusão:** Pivete tem múltiplas keys da **mesma org/family**.
Adicionar mais keys **NÃO resolve** esgotamento. A solução é **adicionar
crédito / upgrade plan** no `platform.minimax.io`.

## Probe batch (reutilizável)

```bash
for key in "${KEYS[@]}"; do
  result=$(curl -s --max-time 30 -H "Content-Type: application/json" \
    -H "Authorization: Bearer $key" \
    https://api.minimax.io/v1/text/chatcompletion_v2 \
    -d '{"model":"MiniMax-M3","messages":[{"role":"user","content":"oi"}],"max_tokens":10}' \
    | jq -r '.choices[0].message.content // "ERR: " + (.base_resp.status_code|tostring)')
  echo "$key: $result"
done
```

**Não consome quota** em `GET /v1/models` (só leitura). Probe barato.

## Lições

1. **Não salvar chave no `.env` antes de validar** com `chatcompletion_v2` real.
2. **Múltiplas chaves** da mesma conta caem juntas — não resolve esgotamento.
3. **`token plan trial`** tem limite global; um trial esgotado = todos os filhos caem.
4. **Endpoint `/v1/models`** responder 200 com lista ≠ saldo de chat disponível.
5. **1008 ≠ 2056** — Token Plan tem janela própria. Tratar como estados separados.
6. **`chatcompletion_pro`** exige `bot_setting` + `reply_constraints.sender_type`.
7. **URL correta** é `api.minimax.io` (com `api.`), nunca `minimax.io` raiz.
8. **Política Pivete:** key com saldo 0 não é deletável — pode resetar.
