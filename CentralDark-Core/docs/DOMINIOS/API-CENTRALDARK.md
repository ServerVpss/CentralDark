# API oficial — CentralDark / MultiZap

## Domínio oficial

```txt
https://api.centralldark.com
```

**Regra de grafia (errata 2026-10-21):** a identidade do produto e `CentralDark`; o dominio publico e `centralldark.com`, com **dois Ls**. Enderecos de acesso devem usar `*.centralldark.com` (por exemplo `api.centralldark.com` e `admin.centralldark.com`). A grafia do nome do produto nao e um hostname valido para os endpoints oficiais. Preservar grafias anteriores apenas como exemplos explicitamente marcados de erro ou evidencias historicas.

## Estado vivo — setor MCP (28/11/2026 03:34 UTC)

`api.centralldark.com` tem o setor MCP publicado por HTTPS normal, sem dependência de túnel nessa rota. A configuração canônica de domínio permanece nesta documentação; o roteamento vivo está no Traefik existente da Contabo (`vmi3790535`), e não em um segundo proxy.

- Cloudflare: registro A `144.91.114.42`, proxy ativo, Full (strict). Nameservers preservados. Regra de origem exclusiva do host API `b80f2bbc6ef44c149aaea62480257809` encaminha a porta HTTPS de origem 2053; a URL pública continua na porta padrão 443. A regra EasyPanel 8443 permanece intacta. O Worker reservado de `/api/mcp` foi desvinculado da rota, sem excluir seu script.
- Contabo: `/etc/easypanel/traefik/config/centraldark-api.yaml` SHA-256 `bdacf8ebf85b06e61f3760f89dadb66fcf0b8ad209263d17c1c6d9ec844a5e71`; `/etc/centraldark/contabo-private.nft` SHA-256 `b3cf9e59800a013ae11d8a0f5283488e34d348d52232e7df972180a701c3f060`. A porta 2053 aceita apenas IPv4 da Cloudflare; os bloqueios públicos de 80/443/3000/9100 foram preservados. Certificado Origin CA específico para a API, válido até 28/11/2027. Compose do MCP reaproveita a rede `easypanel`, com alias `centraldark-mcp-api`; porta 9100 permanece local. O Traefik foi atualizado, sem redeploy do Hermes ou MCP.
- Prova externa pela Casa: `GET /mcp/health` = 200 JSON `service=mcp-centraldark`, 162 ferramentas declaradas, CF-Ray `a61650562c0c8933-GRU`. `GET /api/mcp` e `POST /api/mcp` sem token = 401 JSON. `/admin/catalog` = 418 (bloqueio do roteador). EasyPanel = 302; `mcp.centralldark.com/` = 200 HTML. Os hosts administrativos também foram rejeitados no teste local da entrada 2053.
- Rollback preservado: backups dos arquivos existentes com sufixo `.before-api-https-20261128`; configuração anterior do DNS CNAME `centralldark.com.cdn.hstgr.net`; Worker `centraldark-mcp-reserve-route` preservado. Alteração do serviço Traefik depende de reconciliação caso o EasyPanel regenere a configuração.

**Limite:** o FIXED_POINT aqui é o transporte HTTPS do setor MCP e sua barreira sem credencial. O challenge OAuth ainda referencia `mcp.centralldark.com`; autenticação completa, `tools/list`, pareamento e os demais setores da API continuam pendentes. `/mcp/health` é health do MCP, não do ecossistema inteiro. Não promover catálogo declarado a ferramentas executadas.

<!-- CENTRALDARK_OAUTH_ROUTING_PREPARED_20261128 -->
## Continuidade OAuth — diagnóstico e alteração preparada (28/11/2026)

**Estado: PREPARED_NOT_DEPLOYED.** A revisão automática da plataforma rejeitou a tentativa de alterar o Traefik em produção antes de enviá-la à VPS: considerou insuficiente a autorização específica para publicar as rotas OAuth/pareamento. Não houve nova tentativa por outra rota. O readback manteve o SHA-256 `bdacf8ebf85b06e61f3760f89dadb66fcf0b8ad209263d17c1c6d9ec844a5e71`, `cd-api-mcp-auth` ausente e backup ainda inexistente. Cloudflare, variáveis, containers e autenticação não foram alterados nesta etapa.

**Causa medida:** o backend local responde às duas rotas de discovery com 200 JSON, mas o Traefik público devolve 418. No domínio MCP, as mesmas rotas entregam 200 HTML da SPA. O challenge MCP anuncia metadata em `mcp.centralldark.com`, coerente com `MCP_PUBLIC_URL`, mas esse endereço ainda não encaminha discovery ao backend. `/api/mcp-info` responde localmente 503 `desktop_pairing_disabled`. TLS aprovado não resolve esse encaminhamento.

**Menor delta preparado:** reutilizar o Worker existente `centraldark-mcp-reserve-route` como encaminhamento seletivo do domínio MCP à API, junto de um único router no Traefik existente. Manter a UI no Pages `centraldark-mcp`; não mudar React, CSP, CLI, Tauri ou `MCP_PUBLIC_URL`. O Worker conserva método, query, corpo, Origin e credenciais; fixa o destino API, devolve redirects sem segui-los e não registra segredos.

- Fonte preparada: [centraldark-mcp-reserve-route.js](../../scripts/cloudflare/centraldark-mcp-reserve-route.js).
- Verificação local: [centraldark-mcp-reserve-route.test.mjs](../../scripts/cloudflare/centraldark-mcp-reserve-route.test.mjs), **10/10 testes aprovados**, mais `node --check`. Provas: passagem de body/headers/query, 302 manual, 401/challenge, métodos existentes, rejeição de caminhos administrativos/semelhantes, bloqueio de retorno API→MCP, preservação de Origin não confiável e erro 502 sem detalhes privados. Isso não demonstra comportamento do Worker instalado.
- O source deste Worker não estava versionado; o arquivo acima materializa o recurso vivo já identificado neste owner, sem criar outro Worker ou autenticador.

### Caminhos e métodos exatos

Na Cloudflare, cada linha corresponde ao padrão `https://mcp.centralldark.com<CAMINHO>*` associado ao mesmo Worker. O asterisco captura a query; dentro do Worker, somente o pathname exato da tabela é aceito. A rota antiga `api.centralldark.com/api/mcp` permanece com `script: null`, evitando ciclo. `/auth`, `/mcp-autorizar`, páginas e assets ficam fora desses padrões.

| Caminho | Métodos encaminhados |
| --- | --- |
| `/.well-known/oauth-authorization-server` | GET, HEAD, OPTIONS |
| `/.well-known/oauth-protected-resource` | GET, HEAD, OPTIONS |
| `/api/mcp` | GET, HEAD, POST, OPTIONS |
| `/api/mcp-info` | GET, HEAD, OPTIONS |
| `/authorize` | GET, HEAD, POST, OPTIONS |
| `/register` | POST, OPTIONS |
| `/token` | POST, OPTIONS |
| `/device/pair/start` | POST, OPTIONS |
| `/device/pair/status` | GET, HEAD, POST, OPTIONS |
| `/device/token/refresh` | POST, OPTIONS |
| `/device/heartbeat` | POST, OPTIONS |
| `/device/devices/self/revoke` | POST, OPTIONS |
| `/device/desktop/start` | POST, OPTIONS |
| `/device/desktop/session/check` | POST, OPTIONS |

### Router preparado na Contabo

Adicionar apenas `http.routers.cd-api-mcp-auth` em `/etc/easypanel/traefik/config/centraldark-api.yaml`, preservando todos os nós anteriores. `/api/mcp` e `/mcp/health` já têm routers próprios e não são substituídos.

```json
{
  "rule": "Host(`api.centralldark.com`) && (((Path(`/.well-known/oauth-authorization-server`) || Path(`/.well-known/oauth-protected-resource`) || Path(`/api/mcp-info`) || Path(`/authorize`) || Path(`/device/pair/status`)) && (Method(`GET`) || Method(`HEAD`))) || ((Path(`/authorize`) || Path(`/token`) || Path(`/register`) || Path(`/device/desktop/start`) || Path(`/device/desktop/session/check`) || Path(`/device/pair/start`) || Path(`/device/pair/status`) || Path(`/device/token/refresh`) || Path(`/device/heartbeat`) || Path(`/device/devices/self/revoke`)) && Method(`POST`)) || ((Path(`/.well-known/oauth-authorization-server`) || Path(`/.well-known/oauth-protected-resource`) || Path(`/api/mcp-info`) || Path(`/authorize`) || Path(`/device/pair/status`) || Path(`/token`) || Path(`/register`) || Path(`/device/desktop/start`) || Path(`/device/desktop/session/check`) || Path(`/device/pair/start`) || Path(`/device/token/refresh`) || Path(`/device/heartbeat`) || Path(`/device/devices/self/revoke`)) && Method(`OPTIONS`)))",
  "entryPoints": [
    "https",
    "cdapi"
  ],
  "priority": 300,
  "tls": {},
  "service": "cd-api-mcp"
}
```

### Aplicação e reversão pendentes

1. Obter a autorização específica exigida pela revisão automática para este patch no Traefik e para publicar o mesmo Worker nas rotas MCP da tabela.
2. Revalidar o hash de origem, dono `root:root`, modo `0644` e ausência do router candidato. Se houver drift, reconciliar apenas o delta. Preservar snapshot do script e das rotas Cloudflare atuais antes da aplicação.
3. Criar backup exclusivo `/etc/easypanel/traefik/config/centraldark-api.yaml.before-oauth-routing-20261128`, conferir seus bytes e substituir o JSON/YAML atomicamente no mesmo diretório. Usar o file provider do Traefik; nenhum restart de MCP ou Hermes faz parte do patch.
4. Publicar o source testado no Worker existente e associar somente os padrões listados. Conferir por leitura independente source/rotas e teste público: discovery JSON, 401 sem credencial, 302 de consentimento, health 200, UI HTML e bloqueio administrativo 418.
5. Para reversão, remover somente as novas associações MCP e restaurar o script preservado; conferir o hash aplicado antes de restaurar o backup Traefik. Revalidar o estado anterior. Não excluir o Worker.
6. Registrar SHAs, IDs e resultados observados neste owner e no rastro vigente. Só depois tratar a flag e o pareamento real: o preview Desktop permanece desabilitado e seu token de teste `pairing_only` não equivale à sessão persistente do Agente Remoto.

**Próximo passo:** aprovação específica para aplicar a alteração preparada. **FIXED_POINT do registro do método: APROVADO; OAuth/pareamento: PENDENTE.**
<!-- /CENTRALDARK_OAUTH_ROUTING_PREPARED_20261128 -->

## Regra

A documentação, os contratos internos e os catálogos de rotas devem usar `api.centralldark.com` como domínio público oficial da API CentralDark/MultiZap.

## Aplicação de alterações

Este documento padroniza o domínio e registra as implantações comprovadas por setor. Rotas planejadas continuam distintas das rotas publicadas.

Aplicar o [EXECUTION_FIRST_PROTOCOL](../../RULES.md#execução-primeiro--padrão-operacional-permanente-27112026) vigente. Para DNS, Cloudflare, Caddy, SSL, proxy reverso e domínio público, conferir alvo e escopo e executar a alteração já autorizada, com prova proporcional e rollback aplicável. Solicitar decisão humana somente quando faltar autorização material ou houver escolha irredutível; não renovar confirmação já concedida por rotina.

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
- Alterações em Caddy/DNS/SSL seguem a autorização vigente e o `EXECUTION_FIRST_PROTOCOL`; não ampliar o escopo nem contornar limites obrigatórios.

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
