# 👑🪬 CentralDark HUD · setor de infra e contas externas

**PR:** `#1551`  
**Owner visual:** `CentralDarkUnifiedHud` dentro de `apps/modulos/Bolt/source`  
**Trilho:** `👑🪬 !CENTRALDARK → 🔗 !># INTERLIGADOS → 1 PAINEL → 1 INTENÇÃO → VÁRIOS BRAÇOS → 1 SÓ LUGAR`  
**Regra:** `OPTIONAL_EXTERNAL_SERVICE != CORE_REQUIRED`

---

## 🎯 Intenção

Organizar no mesmo cockpit da CentralDark as superfícies externas que ajudam a observar, operar ou entender o sistema, sem transformar cada serviço em painel paralelo, motor novo ou autoridade.

```text
1 PAINEL
→ 1 INTENÇÃO
→ VÁRIOS BRAÇOS
→ 1 SÓ LUGAR
```

---

## 🧩 Capacidade real por braço

| Braço | Papel correto | Core? | Estado canônico |
|---|---|---:|---|
| GitHub | source, PR, CI, labels, commits | sim | owner de código/proveniência |
| MCP Admin | runtime/logs/health/tools | sim | painel operacional principal |
| VPS / Contabo | execução remota: MCP, Hermes, PM2, Caddy, receipts | sim | infraestrutura runtime |
| Cloudflare / Caddy / túnel | transporte/rota pública/proxy | parcial | adaptador de conectividade |
| Remote Tray / Desktop Commander | presença, ponte e execução remota autorizada | parcial | adaptador de controle |
| Screenpipe | observação visual/áudio/desktop na Casa | parcial | evidência auxiliar quando medido |
| Google Drive / Files | biblioteca, docs, receipts externos | parcial | memória documental, não juiz |
| Gmail | notificações e sinais externos | opcional | adapter quando autorizado |
| PostHog | analytics de produto, erro de navegador, funil, uso real | opcional | sensor externo, não requisito core |
| Datadog | observabilidade avançada de produção | opcional | sensor externo, não requisito core |

---

## 📍 Onde cada coisa entra no HUD

```text
CENTRALDARK HUD
├── STATUS
│   ├── MCP health
│   ├── toolCount
│   ├── CI/head
│   └── runtime known/unknown
│
├── INFRA
│   ├── VPS / Contabo
│   ├── Caddy
│   ├── Cloudflare / túnel
│   ├── PM2
│   └── receipts runtime
│
├── CONTAS
│   ├── GitHub
│   ├── ChatGPT/OpenAI
│   ├── Google/Gemini/Drive
│   ├── Claude/Anthropic
│   ├── Desktop Commander principal
│   └── Desktop Commander conta2
│
├── OBSERVABILIDADE
│   ├── MCP Admin logs
│   ├── Screenpipe
│   ├── PostHog
│   └── Datadog
│
└── PROVA
    ├── PR/commit/head
    ├── CI/checks
    ├── labels canônicas
    ├── audit_event
    ├── receipt_ref
    └── next_cursor
```

---

## ✅ Rotas já existentes no MCP Admin

O painel MCP Admin já possui rotas de saúde, catálogo, OAuth/MCP, logs, métricas e E2E:

```text
GET      /health
GET      /health/deep
GET      /status.json
GET      /tools.json
GET      /openapi.json
GET      /.well-known/oauth-authorization-server
GET      /.well-known/oauth-protected-resource
POST     /register
GET/POST /authorize
POST     /token
POST     /mcp
GET      /admin
GET      /admin/logs/stream
POST     /admin/api/e2e
GET      /admin/api/logs
GET      /admin/api/metricas
```

Isto cobre o núcleo operacional: MCP, health, tools, logs, métricas e teste E2E.

---

## 🟡 Rotas que ainda não existem como setor próprio

Não há prova canônica nesta medição de rotas dedicadas para:

```text
/admin/api/posthog
/admin/api/cloudflare
/admin/api/contabo
/admin/api/accounts
/admin/api/provider-usage
/admin/api/billing
```

Logo, esses braços devem aparecer como:

```text
ADAPTER_REQUIRED
OPTIONAL_SENSOR
EXTERNAL_ACCOUNT
NOT_CORE_BLOCKER
```

---

## 🧠 Decisão sobre PostHog

PostHog não é obrigatório para a CentralDark funcionar.

Ele só vale se o CHEFE quiser observar uso real do cockpit/app:

```text
chat enviado
resposta concluída
resposta interrompida
importação feita
deploy concluído
erro de navegador
funil travado
```

Estado correto:

```text
POSTHOG_CORE_REQUIRED=false
POSTHOG_OPTIONAL_SENSOR=true
POSTHOG_PERSONAL_API_KEY_BACKEND_ONLY=true
POSTHOG_FRONTEND_PROJECT_KEY_ONLY=true
POSTHOG_RUNTIME_DELIVERY_UNKNOWN_UNTIL_EVENT_OBSERVED=true
```

---

## ☁️ Decisão sobre Cloudflare + Contabo

Cloudflare/Contabo entram no setor **INFRA**, não em analytics.

```text
CONTABO/VPS = onde roda MCP/Hermes/PM2/Caddy/receipts
CLOUDFLARE  = rota/túnel/proxy/DNS/proteção quando configurado
CADDY       = reverse proxy local/publicado
```

Eles ajudam o HUD a responder:

```text
VPS está viva?
MCP responde?
Domínio aponta?
Proxy encaminha?
Túnel está conectado?
Último deploy bate com o commit?
```

Mas:

```text
CLOUDFLARE_CONNECTED != MCP_TOOL_ACTIVE
CONTABO_ONLINE != APP_DEPLOY_VALIDATED
DNS_OK != RUNTIME_OK
```

---

## ⚖️ Cadeados

```text
POSTHOG_ENABLED != EVENT_DELIVERED
POSTHOG_DASHBOARD_CREATED != PRODUCT_TELEMETRY_PROVEN
CLOUDFLARE_TUNNEL_EXISTS != SERVICE_HEALTHY
CONTABO_SERVER_ONLINE != MCP_RUNTIME_PASS
MCP_HEALTH_OK != ALL_TOOLS_ACTIVE
ACCOUNT_CONNECTED != CAPABILITY_AUTHORIZED
OPTIONAL_SENSOR_MISSING != CORE_FAILURE
UNKNOWN != PASS
```

---

## 🧭 Próximo cursor

```text
1. manter GitHub + MCP Admin + VPS como core do HUD;
2. manter PostHog/Datadog como sensores opcionais;
3. criar adapters somente quando houver chave/conta autorizada e necessidade real;
4. projetar no HUD como cartões: CONNECTED / UNKNOWN / ADAPTER_REQUIRED / ERROR;
5. nunca bloquear merge core por falta de sensor opcional;
6. se Cloudflare/Contabo forem adicionados, entrar no setor INFRA com health/proxy/dns/tunnel, não como painel paralelo.
```

📜 **O painel é um só; os braços só trazem sinal. Quem julga é a Realidade.**
