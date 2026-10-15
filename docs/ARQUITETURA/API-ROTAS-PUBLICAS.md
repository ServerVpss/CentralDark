# API ROTAS PÚBLICAS — Catálogo + Proteção

**Status:** [ATUALIZADO 2026-10-14]  
**Domínio Oficial:** `https://api.centralldark.com`  
**Authority:** SEGREDO/CHEFE  
**Owner:** `docs/ARQUITETURA/API-ROTAS-PUBLICAS.md`  
**Consumidores:** Frontend, bots externos, clientes SDK, scripts de observação

---

## Intenção

A API pública da CentralDark publica **capacidades medidas** do Instinto Superior através de rotas HTTP assinadas, com garantias de autenticação, rate-limit, mutação serializada e prova observável.

```text
CAPACIDADE_INTERNA (Instinto Superior)
│
▼
CONTRATO_DE_CAPACIDADE
│
▼
ROTA_PUBLICA (HTTPS)
│
▼
ASSINATURA + AUTH + RATE_LIMIT
│
▼
CONSUMIDOR_AUTORIZADO
```

---

## Camadas de Proteção

Toda rota pública passa por:

### 1. Autenticação

```text
❌ Sem token
❌ Token inválido
❌ Token expirado
❌ Token sem escopo para rota
│
▼
✅ Token válido + escopo correto
```

**Mecanismos suportados:**

- Bearer token (JWT + renovação)
- API key (deprecado, migração em progresso)
- OAuth2 (para terceiros)
- mTLS (para serviços internos)

### 2. Rate Limit

```text
POR CLIENTE:      10 req/min (padrão)
POR IP:           1000 req/min (global)
POR ROTA:         100 req/min (hotspot)
POR CONSUMIDOR:   customizado via contract

VIOLAÇÃO → HTTP 429 + backoff header
```

### 3. Assinatura de Webhook

```text
POST /v1/whatsapp/webhooks/wuzapi
│
├─ Header: X-Signature = HMAC-SHA256(body, secret)
├─ Verify: compare header com compute local
└─ Recusar se não corresponder
```

### 4. Validação de Payload

```text
❌ Campo obrigatório faltando
❌ Tipo de dado incorreto
❌ Tamanho > limite
│
▼
✅ Payload bem-formado + conforme schema
```

### 5. Serialização de Mutação

```text
CONCURRENT_REQUESTS
│
▼
QUEUE (FIFO)
│
▼
LOCK (One Writer)
│
▼
EXECUTE
│
▼
RECEIPT + TIMESTAMP
```

---

## Catálogo de Rotas Públicas

### Health Check

```http
GET /health
```

**Responsável:** HERMES  
**Contrato:** vazio  
**Resposta (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-10-14T15:30:00Z",
  "uptime_seconds": 86400,
  "components": {
    "instinto_superior": "healthy",
    "bot_server": "healthy",
    "elite_gateway": "healthy"
  }
}
```

**Teste Negativo:**

- ❌ Serviço down → 503
- ❌ Componente degraded → 200 + `components.X = "degraded"`
- ❌ Instinto Superior morto → 503 (nunca 200)

---

### WhatsApp — Capacidades Integradas

#### Get Sessions Status

```http
GET /v1/whatsapp/sessions/status
Authorization: Bearer <token>
```

**Responsável:** bot-server  
**Contrato:** sem mutação, somente leitura  
**Owner:** `apps/bot-server/src/api/sessions.ts`

**Resposta (200):**

```json
{
  "sessions": [
    {
      "sessionName": "default",
      "status": "connected|connecting|disconnected|unknown",
      "qr_code": "string | null",
      "last_activity": "2026-10-14T15:00:00Z"
    }
  ]
}
```

**Autorização:**

- ✅ Escopo: `whatsapp:read:sessions`
- ❌ Sem token → 401
- ❌ Token sem escopo → 403

**Rate Limit:** 10 req/min por cliente

**Teste Negativo:**

- ❌ Session não existe → 404 (nunca 500)
- ❌ QR code expirou → qr_code = null
- ❌ Sessão travada → status = "unknown" (nunca inventa estado)

---

#### Create Webhook (WhatsApp)

```http
POST /v1/whatsapp/webhooks/wuzapi
Content-Type: application/json
X-Signature: HMAC-SHA256(body, secret)
Authorization: Bearer <token>
```

**Responsável:** bot-server  
**Contrato:** mutação (queue FIFO, one writer)  
**Owner:** `apps/bot-server/src/gateways/whatsapp/webhook.ts`

**Payload:**

```json
{
  "event": "message|status_update|contact_change",
  "sessionName": "default",
  "data": { ... }
}
```

**Validações (inline):**

```text
1️⃣ Validar token
2️⃣ Validar assinatura X-Signature
3️⃣ Validar payload schema
4️⃣ Verificar rate limit cliente
5️⃣ Enqueue para processamento
6️⃣ Retornar receipt imediatamente
```

**Resposta (202 Accepted):**

```json
{
  "event_id": "evt_abc123",
  "timestamp": "2026-10-14T15:30:00Z",
  "status": "queued",
  "estimated_processing_time_ms": 500
}
```

**Observação:** client pode `GET /v1/whatsapp/webhooks/wuzapi/:event_id` para status

**Resposta (202 Accepted → evento processado):**

```json
{
  "event_id": "evt_abc123",
  "status": "processed",
  "effect": "message_sent|session_updated|contact_added",
  "proof": { ... }
}
```

**Teste Negativo:**

- ❌ Assinatura inválida → 400 (não enfileira)
- ❌ Payload malformado → 400
- ❌ Rate limit excedido → 429 + backoff
- ❌ Sessão inexistente → 400 (não cria sessão)
- ❌ Evento desconhecido → 400

---

#### Get Chats

```http
GET /v1/whatsapp/chats
Authorization: Bearer <token>
?sessionName=default
?limit=50
?offset=0
```

**Responsável:** bot-server  
**Contrato:** paginado, sem mutação  
**Owner:** `apps/bot-server/src/api/contacts.ts`

**Resposta (200):**

```json
{
  "chats": [
    {
      "jid": "55119999999@c.us",
      "name": "João",
      "type": "individual|group",
      "unread_count": 5,
      "last_message_timestamp": "2026-10-14T14:00:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 237,
    "has_more": true
  }
}
```

---

#### Get Contacts

```http
GET /v1/whatsapp/contacts
Authorization: Bearer <token>
?sessionName=default
?search=João
```

**Responsável:** bot-server  
**Contrato:** somente leitura, busca  
**Owner:** `apps/bot-server/src/api/contacts.ts`

---

#### Get Contact Profile

```http
GET /v1/whatsapp/contacts/:phone/profile
Authorization: Bearer <token>
?sessionName=default
```

**Responsável:** bot-server  
**Contrato:** somente leitura  
**Owner:** `apps/bot-server/src/api/contacts.ts`

**Resposta (200):**

```json
{
  "phone": "5511999999999",
  "name": "João Silva",
  "about": "Disponível",
  "profile_picture_url": "https://...",
  "is_business": false,
  "is_wa_verified": true
}
```

---

#### Get Contact Avatar

```http
GET /v1/whatsapp/contacts/:phone/avatar
Authorization: Bearer <token>
?sessionName=default
```

**Responsável:** bot-server  
**Contrato:** somente leitura, redirect/blob  
**Owner:** `apps/bot-server/src/api/contacts.ts`

**Resposta:** imagem (302 redirect ou 200 + content-type: image/jpeg)

---

#### Get Groups

```http
GET /v1/whatsapp/groups
Authorization: Bearer <token>
?sessionName=default
```

**Responsável:** bot-server  
**Contrato:** somente leitura  
**Owner:** `apps/bot-server/src/api/groups.ts`

---

#### Get Group Participants

```http
GET /v1/whatsapp/groups/:groupJid/participants
Authorization: Bearer <token>
?sessionName=default
```

**Responsável:** bot-server  
**Contrato:** somente leitura  
**Owner:** `apps/bot-server/src/api/groups.ts`

---

### Capacidades Futuras (Candidato)

#### Get Capabilities

```http
GET /api/v1/capabilities
Authorization: Bearer <token>
```

**Responsável:** Instinto Superior  
**Contrato:** catálogo de capacidades disponíveis  
**Owner:** `apps/instinto-superior/src/mcp/capability-publisher.ts`

**Resposta (200):**

```json
{
  "capabilities": [
    {
      "name": "whatsapp:send_message",
      "owner": "bot-server",
      "status": "healthy|degraded|unknown",
      "tools": ["send", "queue_batch"],
      "read_scope": ["sessions", "contacts"],
      "write_scope": ["messages"],
      "latency_class": "low",
      "cost_class": "free",
      "observed_at": "2026-10-14T15:00:00Z"
    }
  ]
}
```

---

#### Get Memory Manifest

```http
GET /api/v1/memory/manifest
Authorization: Bearer <token>
?type=decisions|learnings|context
```

**Responsável:** Instinto Superior (Cérebro Vivo)  
**Contrato:** somente leitura, metadados  
**Owner:** `apps/instinto-superior/src/memory/memory-vault.ts`

---

#### Observe Local State (SSE/WebSocket)

```http
GET /api/v1/observe?filter=state_change|effect|signal
Authorization: Bearer <token>
```

ou

```ws
wss://api.centralldark.com/api/v1/observe
Authorization: Bearer <token>
```

**Responsável:** Instinto Superior (observador)  
**Contrato:** stream em tempo real  
**Owner:** `apps/instinto-superior/src/services/observation-stream.ts`

---

## Governança de Rota

### Antes de Propor Nova Rota

```text
1️⃣ INVENTARIAR
   ├─ Capacidade já existe em owner semântico?
   ├─ Consumidores existentes?
   └─ Autenticação/rate limit já definidos?

2️⃣ MAPEAR
   ├─ URL_PUBLICA = contrato de interface
   ├─ DIRETORIO_FISICO = implementação
   └─ OWNER_SEMANTICO = autoridade

3️⃣ TESTAR
   ├─ Positivo: comportamento esperado
   ├─ Negativo: recusa quando não autorizado
   └─ Readback: efeito real é efeito esperado

4️⃣ PROMOVER
   ├─ Git commit + PR
   ├─ Merge em main
   ├─ Deploy em VPS
   └─ Atualizar este catálogo
```

### Checklist Pré-Promoção

- [ ] Rota usa owner semântico existente?
- [ ] Autenticação está wired?
- [ ] Rate limit está configurado?
- [ ] Webhook tem assinatura valida?
- [ ] Testes positivos passam?
- [ ] Testes negativos passam?
- [ ] Sem side-effects indesejados?
- [ ] Documentação está atualizada?
- [ ] Consumidores foram notificados?

---

## Invariantes de Proteção

```text
AUTHENTICATION_REQUIRED=true
RATE_LIMIT_ENFORCED=true
WEBHOOK_SIGNATURE_VERIFIED=true
ONE_WRITER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
RECEIPT_ALWAYS_RETURNED=true
PROOF_MUST_BE_OBSERVABLE=true
MUTATION_IS_QUEUED=true
ACTION_IS_NOT_PROOF=true
```

---

## Monitoramento

### Métricas por Rota

```text
Latência (p50, p95, p99)
Taxa de erro (4xx, 5xx)
Taxa de throttle (429)
Taxa de rejeição (401, 403)
Tamanho de payload (distribuição)
Tempo de enfileiramento (mutação)
```

### Alertas

```text
🔴 Taxa de erro > 5%
🔴 Latência p95 > 5s
🔴 Qualquer 503 (nunca esperado)
🟡 Latência p95 > 2s (investigar)
🟡 Taxa de throttle > 10% (aumentar limites?)
```

---

## Próximos Passos

1. ✅ Documentar rotas WhatsApp existentes
2. ⏳ Adicionar rotas de observação (SSE/WebSocket)
3. ⏳ Implementar catálogo de capacidades
4. ⏳ Adicionar autenticação OAuth2 para terceiros
5. ⏳ Implementar circuit breaker para falha em cascata
6. ⏳ Adicionar versionamento semântico (v1, v2, ...)

---

## Referências

- **Autenticação:** `docs/DOMINIOS/AUTENTICACAO-API.md` (futuro)
- **Rate Limit:** `docs/DOMINIOS/RATE-LIMIT-POLITICA.md` (futuro)
- **Contratos:** `docs/ARQUITETURA/CENTRALDARK-CAPABILITY-CONTRACT-ROUTER.md`
- **API Design:** `docs/DOMINIOS/API-CENTRALDARK.md`

**[ATUALIZADO 2026-10-14]**
