---
title: "ARQUITETURA CHAVES AI PROXY"
date: 2026-07-06
tags: ["consciencia"]
updated: 2026-07-06
---

# Arquitetura das Chaves de API — `ai-proxy` (CentralDark)

> Análise técnica real feita direto da VPS de produção contra a edge function
> `ai-proxy` (projeto Lovable Cloud `kagejpghnwdfymddwxuf`) e contra o
> Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1`).
> Data: 05/07/2026.

---

## 1. Mapa de rotas da edge `ai-proxy`

Base pública: `https://<projeto>.supabase.co/functions/v1/ai-proxy`

| Método | Path                                | Auth aceita                                       | O que faz |
|--------|-------------------------------------|---------------------------------------------------|-----------|
| POST   | `/` (root)                          | **NENHUMA** (aberto)                              | Legado darkai CLI + Arsenal. Body `{prompt, system?, model?}` → `{text, model}` |
| GET    | `/v1/models`                        | `Authorization: Bearer WEBUI_LOVABLE_KEY` **ou** `X-Arsenal-Key: WEBUI_LOVABLE_KEY` | Catálogo curado (5 modelos) |
| POST   | `/v1/chat/completions`              | idem acima                                        | Passthrough OpenAI-compat (com SSE quando `stream:true`) |
| POST   | `/v1/audio/speech`                  | idem acima                                        | TTS — repassa bytes do gateway |
| POST   | `/v1/audio/transcriptions`          | idem acima (multipart)                            | STT — repassa form-data |
| GET    | `/v1/audio/voices`                  | idem acima                                        | Catálogo estático de vozes |
| OPTIONS| qualquer                            | —                                                 | CORS preflight |

**Papel de cada chave (do lado da edge):**

- `WEBUI_LOVABLE_KEY` → é a **chave de porta de entrada**. A edge só olha pra ela em `authorizeOpenAI()`. Sem ela, todas as rotas `/v1/*` respondem `401 invalid_api_key`.
- `LOVABLE_API_KEY` → é a **chave de saída** (secret interna da edge). A edge usa como `Authorization: Bearer` na chamada upstream pro Lovable AI Gateway. **Nunca é validada como Bearer de entrada** — se o cliente mandar ela, a edge responde 401.

Anomalia intencional: `POST /` (legado darkai) **não exige auth**. Qualquer um que descubra a URL pode gastar créditos. Ver seção 5.

---

## 2. Fluxo real de comunicação

```
┌──────────────┐   Bearer WEBUI_LOVABLE_KEY    ┌───────────────────────────┐
│  VPS / CLI   │ ─────────────────────────────▶│ Edge ai-proxy (Supabase)  │
│  darkai      │   POST /v1/chat/completions   │  authorizeOpenAI()        │
│  Arsenal     │                                │  ├─ valida bearer         │
│  Open WebUI  │                                │  └─ re-emite com          │
└──────────────┘                                │     Bearer LOVABLE_API_KEY│
                                                └────────────┬──────────────┘
                                                             │
                                     Bearer LOVABLE_API_KEY  │ (secret)
                                                             ▼
                                            ┌───────────────────────────┐
                                            │ ai.gateway.lovable.dev/v1 │
                                            │  google/*, openai/*, …    │
                                            └───────────────────────────┘
```

- **A VPS NÃO precisa da `LOVABLE_API_KEY` crua** pra uso normal via `ai-proxy`.
  Basta `WEBUI_LOVABLE_KEY`. Toda a autoridade contra o gateway fica dentro
  da edge, onde a chave real vive como secret gerenciada.
- O `lovable-proxy` PM2 da VPS é só um **shim OpenAI-compat local**
  (ex.: `http://127.0.0.1:PORTA/v1/chat/completions`) que reenvia o request pro
  `ai-proxy` no Supabase, injetando `Authorization: Bearer WEBUI_LOVABLE_KEY`.
  Clientes locais (Cursor, Open WebUI, darkai.sh) apontam pra ele e nem
  precisam saber que existe uma edge no meio.
- `LOVABLE_API_KEY` **só é útil na VPS** pra 2 cenários:
  (a) chamadas diretas ao gateway (bypass do `ai-proxy`);
  (b) uso pelos **Standard Connectors** e Seamless Emails da Lovable Cloud.
  Fora disso, mantê-la fora da VPS reduz a superfície de ataque.

---

## 3. Diferença real entre as duas chaves

| Aspecto              | `LOVABLE_API_KEY`                                   | `WEBUI_LOVABLE_KEY`                                |
|----------------------|-----------------------------------------------------|----------------------------------------------------|
| Emissor              | Lovable (auto-provisionada, "managed")              | Você (secret livre da edge)                        |
| Prefixo/formato      | Formato Lovable interno (`sk_…` no gateway)         | Livre — qualquer string secreta                    |
| Aceita pelo gateway  | **Sim** (é a única que o gateway reconhece)         | **Não** (gateway retorna 401 "must start with sk_") |
| Aceita pelo `ai-proxy` como Bearer | **Não** (401)                          | **Sim** (única aceita)                             |
| Rotação              | `lovable_api_key--rotate_lovable_api_key`           | `update_secret` na Cloud                           |
| Escopo de billing    | Workspace/projeto Lovable (créditos + rate limit)   | Não bilha nada sozinha — só destrava o `ai-proxy`  |
| Onde deve viver      | **Só no server-side da Cloud** (edge, connectors)   | Pode circular entre VPS, clientes locais, workflows|
| Risco se vazar       | **Alto** — dá pra queimar créditos direto no gateway| Médio — quem tiver ela usa seu `ai-proxy` (rate-limitado pela sua edge, ainda dentro do seu workspace) |

Por que a `LOVABLE_API_KEY` é "managed": ela é a credencial de billing/registry do workspace. A Lovable cifra em repouso e só entrega no runtime das edges/connectors do próprio projeto. É o mesmo motivo do "não conseguimos ler o valor via tool": a plataforma trata como material sensível.

---

## 4. Testes práticos (executados da VPS agora)

Comandos rodados contra `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy` e contra `https://ai.gateway.lovable.dev/v1`:

| # | Alvo                                | Auth enviada             | HTTP | Comportamento observado |
|---|-------------------------------------|--------------------------|------|-------------------------|
| 1 | `GET /v1/models`                    | (nenhuma)                | 401  | `invalid_api_key` — confirma que `/v1/*` é fechado |
| 2 | `GET /v1/models`                    | Bearer `WEBUI_LOVABLE_KEY` | 200 | Lista os 5 modelos curados |
| 3 | `GET /v1/models`                    | Bearer `LOVABLE_API_KEY` | 401  | Confirma que a edge **não aceita** a chave managed como entrada |
| 4 | `POST /` (legado darkai)            | (nenhuma)                | 200  | Retornou `{"text":"OK.","model":"google/gemini-3-flash-preview"}` — rota aberta |
| 5 | `POST /v1/chat/completions`         | Bearer `WEBUI_LOVABLE_KEY` | 200 | Retornou `PONG` do `google/gemini-3-flash-preview-20251217` (passthrough OK, com `reasoning_details` do gateway) |
| 6 | `POST` **direto no gateway**        | Bearer `LOVABLE_API_KEY` | 200  | Chat completion funcionou — VPS consegue falar direto com o gateway quando quer |
| 7 | `POST` **direto no gateway**        | Bearer `WEBUI_LOVABLE_KEY` | 401 | `"Invalid API key format. Key must start with 'sk_' prefix"` — prova que `WEBUI_LOVABLE_KEY` não vale nada fora do `ai-proxy` |

Conclusões diretas dos testes:
- Separação de papéis está funcionando exatamente como o código descreve.
- Streaming SSE, TTS e STT não foram testados aqui, mas seguem o mesmo modelo de auth (mesmo `authorizeOpenAI()`), então o resultado esperado é idêntico ao da rota `/v1/chat/completions`.
- A rota legado `/` **é o ponto fraco** — respondeu 200 sem qualquer credencial.

---

## 5. Riscos e recomendação de uso no CentralDark

Pontos que valem virar backlog:

1. **Fechar o legado `POST /`.** Hoje qualquer pessoa com a URL da edge queima crédito. Solução mínima: exigir `X-Arsenal-Key === WEBUI_LOVABLE_KEY` também nessa rota, mantendo compat pro darkai (que já usa `WEBUI_LOVABLE_KEY` internamente).
2. **Manter `LOVABLE_API_KEY` fora da VPS por padrão.** Já está injetada em `keys.env` pra emergências (fallback direto no gateway), mas o fluxo normal (`darkai`, Arsenal, Open WebUI, Cursor) deve seguir usando **apenas `WEBUI_LOVABLE_KEY`** via `lovable-proxy` → `ai-proxy`.
3. **Rotação separada.**
   - `WEBUI_LOVABLE_KEY`: rotacionar pela Cloud e re-injetar na VPS (workflow já existente) sempre que qualquer cliente for descomissionado.
   - `LOVABLE_API_KEY`: rotacionar via `lovable_api_key--rotate_lovable_api_key` se houver suspeita de vazamento; depois refazer a bridge pra VPS.
4. **Rate-limit e log de abuso na edge.** Como o `ai-proxy` é a única porta que consome créditos do workspace, faz sentido logar `req.ip`/quantidade de tokens por chamada num tabela `ai_proxy_calls` (Lovable Cloud), permitindo auditar quem gastou o quê.
5. **Padrão recomendado no CentralDark:**
   - CLI/Arsenal/Hermes/Cursor → **sempre** via `lovable-proxy` local com `WEBUI_LOVABLE_KEY`.
   - Scripts pontuais que precisam de bypass (ex.: teste de saúde do gateway) → usar `LOVABLE_API_KEY` do `keys.env` direto contra `ai.gateway.lovable.dev`.
   - Código dentro de edges/connectors da Cloud → usar `LOVABLE_API_KEY` do env da própria edge, nunca importar de fora.

---

## 6. TL;DR

- `WEBUI_LOVABLE_KEY` = **crachá pra entrar no `ai-proxy`**. Circula livre.
- `LOVABLE_API_KEY` = **crachá pra falar com o AI Gateway**. Fica presa na Cloud.
- A VPS opera 100% do fluxo normal com só a primeira; a segunda é fallback/gateway-direto.
- Fluxo canônico: `cliente → lovable-proxy (VPS) → ai-proxy (edge) → ai.gateway.lovable.dev`.
- Único buraco real hoje: `POST /` do ai-proxy sem auth. Fechar quando puder.
