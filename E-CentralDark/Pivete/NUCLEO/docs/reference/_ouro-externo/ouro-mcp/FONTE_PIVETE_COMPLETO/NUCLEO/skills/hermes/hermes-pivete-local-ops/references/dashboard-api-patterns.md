# Dashboard API Patterns (profile pivete) — Descoberto 04/08/2026

## Endpoints que funcionam

### Health check (sem auth)
```
GET http://127.0.0.1:9119/api/health
→ {"ok":true,"version":"0.19.1","auth_required":false}
```

### Sessões do profile (precisa Bearer token)
```
GET http://127.0.0.1:9119/api/sessions?profile=pivete
Header: Authorization: Bearer <token_do_dashboard>
```

**Token do dashboard**: extraído do HTML de `http://127.0.0.1:9119/sessions?profile=pivete`
```html
window.__HERMES_SESSION_TOKEN__="[REDIGIDO-PRESERVACAO]"
```

### Estrutura da resposta de sessões
```json
{
  "sessions": [
    {
      "id": "20260803_212545_06b11f04",
      "source": "telegram",
      "model": "nvidia/nemotron-3-ultra-550b-a55b:free",
      "message_count": 22,
      "last_active": 1785827372.104665,
      "is_active": true,
      "profile": "pivete"
    }
  ],
  "total": 97,
  "limit": 20,
  "offset": 0
}
```

### OpenAPI spec
```
GET http://127.0.0.1:9119/openapi.json?profile=pivete
```

## Padrão de descoberta do token (read-only)
```bash
# 1. Pegar HTML do dashboard
TOKEN=$(curl -s http://127.0.0.1:9119/sessions?profile=pivete | \
  grep -oP 'window\.__HERMES_SESSION_TOKEN__="\K[^"]+')

# 2. Usar na API
curl -s -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:9119/api/sessions?profile=pivete
```

## Pitfalls observados 04/08

1. **Dashboard serve HTML, não JSON** — `GET /sessions?profile=pivete` retorna SPA HTML. A API JSON está em `/api/sessions`.

2. **`jq` não está no PATH do MSYS/bash** — usar Python ou grep/sed nativo para parse:
   ```bash
   python -c "import sys,json; print(json.load(sys.stdin)['sessions'][0]['id'])"
   ```

3. **Sem auth = 401 Unauthorized** — o endpoint `/api/sessions` exige o Bearer token do dashboard.

4. **Health check não prova auth** — `/api/health` retorna `ok:true` sem auth, mas não garante acesso aos endpoints protegidos.

## Uso no boot diagnóstico
Adicionado ao checklist: verificar token do dashboard → chamar `/api/sessions` → confirmar sessão ativa do Telegram (`is_active: true`, source: `telegram`).

## Referência cruzada
- `hermes-pivete-local-ops` §22 (boot-diagnostic-checklist.md)
- SOUL §14 (boot de sessão e continuidade por profile)