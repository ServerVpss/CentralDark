# Arquitetura de Segurança — ai-proxy (VPS → Edge → Lovable AI)

## Problema

A `LOVABLE_API_KEY` é uma chave gerenciada pelo Supabase Vault/Secrets.
Ela **não é legível** via painel nem via código externo — só dentro das
Edge Functions em tempo de execução. A VPS não pode nem deve tê-la.

---

## Solução: Proxy com Bearer Próprio

```
┌──────────────┐    Authorization: Bearer WEBUI_LOVABLE_KEY    ┌──────────────────────────────┐
│   VPS/Bot    │  ─────────────────────────────────────────►   │  Edge Function: ai-proxy     │
│  Open WebUI  │  POST /functions/v1/ai-proxy/v1/...           │  (Supabase — isolada)        │
│  CLI darkai  │                                                │                              │
└──────────────┘                                                │  1. valida Bearer recebido   │
                                                                │  2. lê LOVABLE_API_KEY       │
                                                                │     (só existe aqui)         │
                                                                │  3. repassa ao gateway       │
                                                                └──────────┬───────────────────┘
                                                                           │  Bearer LOVABLE_API_KEY
                                                                           ▼
                                                                ┌─────────────────────────────┐
                                                                │  ai.gateway.lovable.dev/v1  │
                                                                │  (Lovable AI Gateway)       │
                                                                └─────────────────────────────┘
```

---

## Segredos por Ambiente

| Variável            | Onde vive               | Legível pela VPS? | Legível pela Edge? |
|---------------------|-------------------------|-------------------|--------------------|
| `LOVABLE_API_KEY`   | Supabase Secrets/Vault  | ❌ Nunca          | ✅ Sim             |
| `WEBUI_LOVABLE_KEY` | Supabase Secrets/Vault  | ✅ Sim (você gerou)| ✅ Sim (valida)   |
| `WEBUI_LOVABLE_KEY` | VPS: `/root/keys.env`   | ✅ Sim (envia)    | ❌ Não acessa      |

---

## Como a Validação Funciona (sem vazamento)

```typescript
// Dentro da Edge Function — ai-proxy/index.ts
function authorizeOpenAI(req: Request): boolean {
  const expected = Deno.env.get("WEBUI_LOVABLE_KEY"); // lê do Supabase Secret
  if (!expected) return false;

  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";

  return bearer === expected; // comparação simples — nada é logado nem retornado
}
```

**Garantias anti-vazamento:**
- `WEBUI_LOVABLE_KEY` nunca é retornada no corpo da resposta.
- Erros retornam apenas `{ "error": { "message": "invalid_api_key" } }`.
- `LOVABLE_API_KEY` nunca sai da edge function — nem em erros.
- Logs do Supabase não imprimem valores de `Deno.env.get()`.
- Comparação direta (`===`) sem timing-attack relevante (segredo interno).

---

## Setup: Passo a Passo

### 1. Gerar WEBUI_LOVABLE_KEY (uma vez)
```bash
openssl rand -hex 32
# Exemplo: a3f9c2d1e4b7892f...  ← guarde este valor
```

### 2. Cadastrar no Supabase Secrets
```bash
# Via CLI Supabase:
supabase secrets set WEBUI_LOVABLE_KEY=<valor_gerado>

# LOVABLE_API_KEY já deve estar cadastrada como secret gerenciado.
# Se precisar setar manualmente:
supabase secrets set LOVABLE_API_KEY=<chave_lovable_gateway>
```

### 3. Configurar a VPS — /root/keys.env
```bash
# Conteúdo do arquivo (não commitar — ver .gitignore):
WEBUI_LOVABLE_KEY=<valor_gerado>
SUPABASE_URL=https://kagejpghnwdfymddwxuf.supabase.co
DARKAI_URL=https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy

# Carregar no shell atual:
source /root/keys.env

# Carregar no systemd (para serviços permanentes):
# EnvironmentFile=/root/keys.env
```

### 4. Testar a VPS → Edge (smoke test)
```bash
source /root/keys.env

# Listar modelos disponíveis:
curl -sf "$DARKAI_URL/v1/models" \
  -H "Authorization: Bearer $WEBUI_LOVABLE_KEY" | jq .data[].id

# Chat rápido:
curl -sf "$DARKAI_URL/v1/chat/completions" \
  -H "Authorization: Bearer $WEBUI_LOVABLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-3-flash-preview","messages":[{"role":"user","content":"ping"}]}' \
  | jq .choices[0].message.content
```

---

## Rotas Disponíveis (OpenAI-compatible)

| Método | Rota                          | Descrição                     |
|--------|-------------------------------|-------------------------------|
| GET    | `/v1/models`                  | Lista modelos disponíveis     |
| POST   | `/v1/chat/completions`        | Chat (streaming SSE suportado)|
| POST   | `/v1/audio/speech`            | TTS                           |
| POST   | `/v1/audio/transcriptions`    | STT (multipart/form-data)     |
| GET    | `/v1/audio/voices`            | Lista vozes disponíveis       |
| POST   | `/`                           | Legado darkai `{ prompt }`    |

---

## Rotação de Chave (sem downtime)

```bash
# 1. Gerar nova chave
NEW_KEY=$(openssl rand -hex 32)

# 2. Atualizar no Supabase (edge function recebe o novo valor instantaneamente)
supabase secrets set WEBUI_LOVABLE_KEY=$NEW_KEY

# 3. Atualizar na VPS
sed -i "s/^WEBUI_LOVABLE_KEY=.*/WEBUI_LOVABLE_KEY=$NEW_KEY/" /root/keys.env
source /root/keys.env

# 4. Recarregar serviços que usam a chave
systemctl restart open-webui  # ou o serviço relevante
```

---

## O que NÃO fazer

```bash
# ❌ VPS não deve ter LOVABLE_API_KEY
export LOVABLE_API_KEY="sk-..."

# ❌ Nunca commite keys.env
git add keys.env

# ❌ Nunca logue o Bearer recebido na edge function
console.log("token:", bearer)  # vaza nos logs do Supabase

# ❌ Nunca retorne o segredo em erros
return json({ error: "chave esperada: " + expected }, 401)  # vaza na resposta
```
