# API oficial — CentralDark / MultiZap

## Domínio oficial planejado

```txt
https://api.centralldark.com
```

## Regra

A documentação, os contratos internos e os catálogos de rotas devem usar `api.centralldark.com` como domínio público oficial da API CentralDark/MultiZap.

## Importante

Este documento apenas padroniza o domínio no repositório.

Alterações reais em DNS, Cloudflare, Caddy, SSL, proxy reverso ou domínio público são ações sensíveis e exigem confirmação explícita antes de aplicar.

## Organização de rotas públicas

```txt
https://api.centralldark.com/health
https://api.centralldark.com/v1/whatsapp/sessions/status
https://api.centralldark.com/v1/whatsapp/chats
https://api.centralldark.com/v1/whatsapp/contacts
https://api.centralldark.com/v1/whatsapp/contacts/:phone/profile
https://api.centralldark.com/v1/whatsapp/contacts/:phone/avatar
https://api.centralldark.com/v1/whatsapp/groups
https://api.centralldark.com/v1/whatsapp/groups/:groupJid/participants
https://api.centralldark.com/v1/whatsapp/webhooks/wuzapi
https://api.centralldark.com/v1/whatsapp/ws
```

## Arquitetura setorial da API — referências e intenção (13/10/2026)

A CentralDark adota **Domain-Oriented API Design** (organização de rotas por domínio/capacidade), combinado com **Vertical Slice Architecture** (cada capacidade concentra suas responsabilidades no owner semântico) e **Modular Monolith** como **disciplina de fronteiras e integração única**, quando aplicável ao mesmo deploy. A CentralDark real possui processos heterogêneos: estes conceitos **não autorizam** afirmar que tudo roda em um único processo nem criar novo backend.

- **Domain-Oriented / Resource-Oriented API Design:** o domínio funcional identifica o setor público e seus recursos; convenções consistentes, sem endpoints espalhados por nome de tecnologia. Referências: Google Cloud `https://docs.cloud.google.com/apis/design` (Resource-oriented Design) e `https://cloud.google.com/apis/design/naming_convention` (nomenclatura consistente).
- **Vertical Slice Architecture:** código que evolui junto deve ser encontrado no mesmo owner de capacidade, preservando os módulos reais já existentes. Referência: Microsoft Feature Slices `https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps`.
- **Modular Monolith:** fronteiras explícitas, interfaces públicas e governança integrada; conceito de referência, **não declaração de deploy monolítico**. Referência: Microsoft Learn `https://learn.microsoft.com/en-us/shows/on-dotnet/on-dotnet-live-clean-architecture-vertical-slices-and-modular-monoliths-oh-my` e Martin Fowler `https://martinfowler.com/bliki/MonolithFirst.html`.
- **FastAPI / APIRouter:** no setor escrito em FastAPI, agrupar routers por capacidade, com prefixos, dependências e tags; manter equivalente nos routers Node/Express já existentes. Referência: `https://fastapi.tiangolo.com/pt/tutorial/bigger-applications/`.

**Distinção inegociável:** `URL_PUBLICA != DIRETORIO_FISICO != OWNER_SEMANTICO`. Os três devem ser rastreáveis entre si; **não precisam ter nomes/caminhos idênticos**. Prefixo público é superfície de contrato, não ordem para movimentar código ou criar serviço.

### Exemplo intencional (NÃO é inventário de endpoints em produção)

```text
https://api.centralldark.com
├── /api
│   ├── /Grafo/graph?mode=vivo
│   └── /Telemetria/telemetry-ingest
└── /memoria
    ├── /manifest
    └── /ingest
```

Os segmentos `/Grafo` e `/Telemetria` reproduzem a intenção setorial do CHEFE; maiúsculas/minúsculas em URLs são relevantes e só serão fixadas para produção depois da reconciliação de consumidores, compatibilidade e roteadores. Rotas legadas (ex.: `/api/graph`, `/api/telemetry-ingest`, `/v1/whatsapp/...`) continuam contratos a preservar até migração provada. Uma URL proposta não é uma rota existente; HTTP 404 é contraprova de disponibilidade, não autorização para duplicar backend.

### Gatilhos de conformidade — antes de alterar uma rota

```text
REQUEST_NEW_OR_MOVED_API_ROUTE
→ IDENTIFY_DOMAIN + EXISTING_SEMANTIC_OWNER
→ INVENTORY_CURRENT_ROUTES + PUBLIC_CONSUMERS + AUTH
→ MAP PUBLIC_URL != PHYSICAL_DIRECTORY != OWNER
→ REUSE_EXISTING_ROUTER_GATEWAY_SERVICE
→ REQUIRE_SINGLE_CONTROL_PLANE + NO_PARALLEL_BACKEND
→ IF_PATH_CHANGES: LEGACY_COMPATIBILITY + MIGRATION_PLAN
→ CHECK_POSITIVE + CHECK_NEGATIVE + TARGET_HTTP_READBACK
→ PROMOTE_ONLY_PROVEN_ROUTE
```

**NEGATIVE_TEST:** reprovar proposta que cria domínio público/backend concorrente, muda URL sem mapear consumidores, inventa rota como `PASS`, confunde pasta com URL ou rompe autenticação/webhook existente. **POSITIVE_TEST:** aceitar novo prefixo setorial quando o owner atual é reutilizado, os consumidores foram reconciliados, o gate de segurança não regrediu e houve teste E2E na rota exata.

A governança semântica da árvore permanece no owner `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/LEI-ARVORE-SEMANTICA-DA-CASA.md`; verificação documental reutiliza `.agents/skills/visual-design-method/scripts/check-documentacao.mjs`, sem criar outro workflow. Documentação candidata/rota proposta **não equivale** a mutação no gateway, DNS ou runtime.

## Separação interna

| Público | Interno |
|---|---|
| `https://api.centralldark.com/v1/whatsapp/...` | `apps/bot-server/src/gateways/whatsapp/...` |
| `https://api.centralldark.com/health` | health do serviço API quando existir |
| `https://api.centralldark.com/v1/whatsapp/webhooks/wuzapi` | entrada futura de webhook sanitizada |

## Bloqueios atuais

- Não apontar frontend direto para token WuzAPI.
- Não expor Authorization, token, cookie, sessão ou `.env`.
- Não ligar escrita/envio antes de autenticação, rate limit e confirmação.
- Não alterar Caddy/DNS/SSL sem confirmação explícita.

---

## [REFERÊNCIA ATUALIZADA 2026-10-14]

Este documento estabelece o **domínio oficial** e as **políticas de organização** da API CentralDark.

O **catálogo completo de rotas públicas** com detalhes de contrato, autenticação, rate-limit e proteção está documentado em:

- **docs/ARQUITETURA/API-ROTAS-PUBLICAS.md** — Catálogo detalhado + camadas de proteção

A **organização arquitetural** (Vertical Slice, Domain-Oriented, Modular Monolith) está documentada em:

- **docs/ARQUITETURA/ARQUITETURA-CAPACIDADES.md** — Como apps/ se organiza
- **docs/ARQUITETURA/HIERARQUIA.md** — Instinto Superior como corpo primário

Para entender como as rotas públicas conectam-se à hierarquia interna:

- **docs/ARQUITETURA/00-INDICE-HIERARQUIA-CAPACIDADES.md** — Índice de navegação

Este arquivo (API-CENTRALDARK.md) permanece como **política de domínio oficial**; consulte os documentos de arquitetura para implementação e contrato de cada rota.
