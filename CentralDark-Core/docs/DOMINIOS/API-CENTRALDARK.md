# API oficial — CentralDark / MultiZap

## Domínio oficial

```txt
https://api.centralldark.com
```

**Regra de grafia (errata 2026-10-21):** a identidade do produto e `CentralDark`; o dominio publico e `centralldark.com`, com **dois Ls**. Enderecos de acesso devem usar `*.centralldark.com` (por exemplo `api.centralldark.com` e `admin.centralldark.com`). A grafia do nome do produto nao e um hostname valido para os endpoints oficiais. Preservar grafias anteriores apenas como exemplos explicitamente marcados de erro ou evidencias historicas.

## Estado inicial comprovado — setor MCP (28/11/2026 03:34 UTC)

`api.centralldark.com` tem o setor MCP publicado por HTTPS normal, sem dependência de túnel nessa rota. A configuração canônica de domínio permanece nesta documentação; o roteamento vivo está no Traefik existente da Contabo (`vmi3790535`), e não em um segundo proxy.

- Cloudflare: registro A `144.91.114.42`, proxy ativo, Full (strict). Nameservers preservados. Regra de origem exclusiva do host API `b80f2bbc6ef44c149aaea62480257809` encaminha a porta HTTPS de origem 2053; a URL pública continua na porta padrão 443. A regra EasyPanel 8443 permanece intacta. O Worker reservado de `/api/mcp` foi desvinculado da rota, sem excluir seu script.
- Contabo: `/etc/easypanel/traefik/config/centraldark-api.yaml` SHA-256 `bdacf8ebf85b06e61f3760f89dadb66fcf0b8ad209263d17c1c6d9ec844a5e71`; `/etc/centraldark/contabo-private.nft` SHA-256 `b3cf9e59800a013ae11d8a0f5283488e34d348d52232e7df972180a701c3f060`. A porta 2053 aceita apenas IPv4 da Cloudflare; os bloqueios públicos de 80/443/3000/9100 foram preservados. Certificado Origin CA específico para a API, válido até 28/11/2027. Compose do MCP reaproveita a rede `easypanel`, com alias `centraldark-mcp-api`; porta 9100 permanece local. O Traefik foi atualizado, sem redeploy do Hermes ou MCP.
- Prova externa pela Casa: `GET /mcp/health` = 200 JSON `service=mcp-centraldark`, 162 ferramentas declaradas, CF-Ray `a61650562c0c8933-GRU`. `GET /api/mcp` e `POST /api/mcp` sem token = 401 JSON. `/admin/catalog` = 418 (bloqueio do roteador). EasyPanel = 302; `mcp.centralldark.com/` = 200 HTML. Os hosts administrativos também foram rejeitados no teste local da entrada 2053.
- Rollback preservado: backups dos arquivos existentes com sufixo `.before-api-https-20261128`; configuração anterior do DNS CNAME `centralldark.com.cdn.hstgr.net`; Worker `centraldark-mcp-reserve-route` preservado. Alteração do serviço Traefik depende de reconciliação caso o EasyPanel regenere a configuração.

**Limite:** o FIXED_POINT aqui é o transporte HTTPS do setor MCP e sua barreira sem credencial. O challenge OAuth ainda referencia `mcp.centralldark.com`; autenticação completa, `tools/list`, pareamento e os demais setores da API continuam pendentes. `/mcp/health` é health do MCP, não do ecossistema inteiro. Não promover catálogo declarado a ferramentas executadas.

<!-- CENTRALDARK_OAUTH_ROUTING_PREPARED_20261128 -->
## Continuidade OAuth — diagnóstico e alteração preparada (28/11/2026)

**Estado histórico anterior à autorização: PREPARED_NOT_DEPLOYED.** A revisão automática da plataforma rejeitou a tentativa de alterar o Traefik em produção antes de enviá-la à VPS: considerou insuficiente a autorização específica para publicar as rotas OAuth/pareamento. Não houve nova tentativa por outra rota. O readback manteve o SHA-256 `bdacf8ebf85b06e61f3760f89dadb66fcf0b8ad209263d17c1c6d9ec844a5e71`, `cd-api-mcp-auth` ausente e backup ainda inexistente. Cloudflare, variáveis, containers e autenticação não foram alterados nesta etapa.

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

### Plano de aplicação e reversão (histórico da preparação)

1. Obter a autorização específica exigida pela revisão automática para este patch no Traefik e para publicar o mesmo Worker nas rotas MCP da tabela.
2. Revalidar o hash de origem, dono `root:root`, modo `0644` e ausência do router candidato. Se houver drift, reconciliar apenas o delta. Preservar snapshot do script e das rotas Cloudflare atuais antes da aplicação.
3. Criar backup exclusivo `/etc/easypanel/traefik/config/centraldark-api.yaml.before-oauth-routing-20261128`, conferir seus bytes e substituir o JSON/YAML atomicamente no mesmo diretório. Usar o file provider do Traefik; nenhum restart de MCP ou Hermes faz parte do patch.
4. Publicar o source testado no Worker existente e associar somente os padrões listados. Conferir por leitura independente source/rotas e teste público: discovery JSON, 401 sem credencial, 302 de consentimento, health 200, UI HTML e bloqueio administrativo 418.
5. Para reversão, remover somente as novas associações MCP e restaurar o script preservado; conferir o hash aplicado antes de restaurar o backup Traefik. Revalidar o estado anterior. Não excluir o Worker.
6. Registrar SHAs, IDs e resultados observados neste owner e no rastro vigente. Só depois tratar a flag e o pareamento real: o preview Desktop permanece desabilitado e seu token de teste `pairing_only` não equivale à sessão persistente do Agente Remoto.

**Cursor histórico:** a aprovação específica era o próximo passo; a execução subsequente está registrada abaixo.
<!-- /CENTRALDARK_OAUTH_ROUTING_PREPARED_20261128 -->

<!-- CENTRALDARK_OAUTH_ROUTING_APPLIED_20261128 -->
## Estado vivo — publicação do roteamento OAuth (28/11/2026, 04:21–04:23 UTC)

**Estado: ROUTING_DEPLOYED; DISCOVERY_VERIFIED; AUTHENTICATED_PAIRING_PENDING.** Autorização específica recebida: aplicar a correção preparada no Traefik da Contabo e no Worker Cloudflare existente. O registro de preparação acima é histórico, não o estado atual. Não houve alteração da flag Desktop, autorização de dispositivo, emissão de token, reconstrução ou reinicialização do Hermes/MCP.

- **Traefik existente:** adicionado exclusivamente o router `cd-api-mcp-auth` da receita acima. Configuração ativa `/etc/easypanel/traefik/config/centraldark-api.yaml`, SHA-256 `677d7a697086d40b8127e9db2a1ded1437126ab0412d35ec1c934a9057e4ef7a`, modo 0644 root:root. Backup exclusivo `centraldark-api.yaml.before-oauth-routing-20261128`, SHA-256 `bdacf8ebf85b06e61f3760f89dadb66fcf0b8ad209263d17c1c6d9ec844a5e71`. O firewall `/etc/centraldark/contabo-private.nft` permaneceu com SHA-256 `b3cf9e59800a013ae11d8a0f5283488e34d348d52232e7df972180a701c3f060`.
- **Worker existente:** `centraldark-mcp-reserve-route`, código publicado idêntico ao blob Git `9356c5eb691d5e9457eec0552bcb1598e7aff3b0`, conferido por GET após upload. Deploy `637ae250-8c5d-4cd6-88f6-e843c275f382`, versão ativa 100% `bde297e4-80b5-4312-a9d3-55cc3bd7d309`; versão anterior preservada para rollback `17abb84d-ef52-4499-9d9f-cc53768726f2` (deploy anterior `355cdb13-64b9-4488-9682-a196ef853ace`). Sem criar Worker ou backend adicional.
- **Rotas:** 14/14 associações MCP confirmadas por leitura independente da API Cloudflare, com `request_limit_fail_open=false`. A associação nula `api.centralldark.com/api/mcp` (ID `cda0d066e8cd482f99725698faa3d91d`) permaneceu intacta. UI/Pages e regras DNS/origem não foram modificadas.

| Caminho MCP (padrão HTTPS com `*`) | ID da associação |
| --- | --- |
| `/.well-known/oauth-authorization-server` | `60cb6d266fcd49b9bcac488db86d8ebf` |
| `/.well-known/oauth-protected-resource` | `489864b0373f4c4293927f1e716391a2` |
| `/api/mcp` | `722b68d3b9d1431b8d01b8b7fc7f9786` |
| `/api/mcp-info` | `96df6972b97c43f3a24ca7b148e6656d` |
| `/authorize` | `012b4575d7ff4b0aa3c05354ed7a2749` |
| `/register` | `74062e37d7a54744b013aecf86cc7de3` |
| `/token` | `e7c7c81a37214200ac461e23b448a9ff` |
| `/device/pair/start` | `42afafdec23d47ceab9552d4887095da` |
| `/device/pair/status` | `bcb041cf761342758ee88f2c07f81c1e` |
| `/device/token/refresh` | `9cd7c0bc19f54eaea2b069b4e29f4432` |
| `/device/heartbeat` | `2368308a056f432dae39458e50ac396f` |
| `/device/devices/self/revoke` | `00d0eb1908d749a79d0f729af5954b52` |
| `/device/desktop/start` | `54ec0223689943aca0106c0f0a8ba7b4` |
| `/device/desktop/session/check` | `28880f3158c84884a7b456857bfdfa16` |

### Contraprovas públicas pela Casa

| Prova | Resultado medido |
| --- | --- |
| API: discovery OAuth (HEAD, dois caminhos) | 200 JSON nos dois |
| MCP: discovery OAuth (GET, dois caminhos) | 200 JSON; issuer, resource e endpoints coerentes com `https://mcp.centralldark.com`; CF-Rays `a616962c0b7cb998-GRU`, `a61697028cf18ea4-CWB` |
| MCP: GET /api/mcp sem token | 401 JSON e WWW-Authenticate com metadata correta; CF-Ray `a61697166f691713-GRU` |
| API: HEAD /api/mcp sem token | 401 JSON; CF-Ray `a616987538d14d30-GRU` |
| API: GET /mcp/health | 200 JSON, MCP 0.4.0, 162 ferramentas declaradas; CF-Ray `a616973e5b6d5a8d-CWB` |
| MCP: HEAD /auth e /mcp-autorizar | 200 HTML, CSP preservada; CF-Rays `a61697674f7fc9fb-CWB`, `a6169778c864f250-GRU` |
| MCP: GET /authorize sem cliente | 400 JSON invalid_client; CF-Ray `a61698b6caef02f3-GRU` |
| MCP: GET /token (método fora da lista) | 405 JSON method_not_allowed; CF-Ray `a61698a42acd255e-GRU` |
| MCP: GET /authorize-extra | 404 JSON route_not_forwarded; CF-Ray `a6169789bab41920-CWB` |
| API: /admin/catalog e / | 418; CF-Rays `a61697500a9ac15f-CWB`, `a61698cbb9735a8d-CWB` |
| EasyPanel (HEAD /) | 302 com Cloudflare Access; CF-Ray `a61698886dabc15f-CWB` |
| MCP: GET /api/mcp-info | 503 JSON desktop_pairing_disabled; CF-Ray `a616972c6f31c15f-CWB` |
| MCP: POST /device/pair/start, fixture sem aprovação | 403; não houve ID/consentimento confirmado, nem token. Origem do 403 não identificada nesta rodada; não alterar WAF/autorização por hipótese. |

A primeira sondagem agregada pela Casa foi bloqueada pelo antivírus local antes da execução. As provas HTTP acima vieram de consultas públicas independentes; a sondagem externa via ferramenta web não retornou conteúdo. Não foi desativada nenhuma proteção. Readback SSH confirmou os hashes e os mesmos contêineres Traefik, MCP, Hermes e serviços auxiliares ativos; Traefik Up 50 minutos, MCP Up 6 horas, Hermes Up 9 horas (sem restart nesta intervenção).

**Limite:** publicação e discovery do roteamento APROVADOS. As 14 associações foram lidas de volta, não foram 14 testes funcionais autenticados. O redirect de consentimento 302 com solicitação válida, emissão de token, initialize, tools/list e vínculo real continuam PENDENTES. O preview Desktop continua desabilitado. O teste de fixture não aprovou dispositivo e não expôs credenciais. O estado global do Hermes e a versão do stamp não foram alterados.

**Reversão:** remover somente as 14 associações registradas, preservando a rota nula da API; restaurar a versão anterior do Worker (100%) sem excluí-lo; conferir SHA da configuração aplicada antes de restaurar atomicamente o backup Traefik de hash anterior. Revalidar health, 401, 418 e UI. Não reiniciar Hermes/MCP.

**Próximo passo:** correlacionar o 403 do POST com os logs/Cloudflare e o contrato de pareamento, distinguir preview da sessão persistente, concluir a autorização real com a conta e o consentimento apropriados, medir initialize/tools/list e comunicação ponta a ponta. **FIXED_POINT do delta de publicação: APROVADO; FIXED_POINT OAuth/Agente Remoto: PENDENTE.**
<!-- /CENTRALDARK_OAUTH_ROUTING_APPLIED_20261128 -->

<!-- CENTRALDARK_PAIRING_DIAG_20261128 -->
### Continuidade — diagnóstico do 403 e configuração Desktop (28/11/2026)

- Contabo: SSH confirmado em `vmi3790535`. MCP, Traefik e Hermes continuavam ativos. Inspeção de ambiente restrita a presença/booleanos: `CENTRALDARK_DESKTOP_PAIRING_ENABLED` ausente, `HUB_SUPABASE_URL` e `HUB_SUPABASE_PUBLISHABLE_KEY` presentes; URL confere com o projeto esperado pelo contrato `desktop-pairing-config.js` (blob `666efc3a35ac70d24a6638a23420d11841fc057e`). Presença da chave não comprova validade. Nenhum valor de credencial coletado.
- Cloudflare: Bot Fight Mode ativo (`fight_mode=true`, `enable_js=true`). Consulta de entrypoints custom, managed e rate limit retornou 404 de ruleset inexistente nessas fases da zona. Endpoint legado de firewall retornou 410 por descontinuação. Esses resultados não excluem outras proteções ou regras de conta.
- Sondagem pública única de repetição do POST de início de pareamento com fixture, sem aprovação de dispositivo: HTTP 403, `Content-Type: text/plain; charset=UTF-8`, `Server: cloudflare`, CF-Ray `a616c2690c7000f1-GRU`, sem cabeçalho CF-Mitigated. Não houve ID de pareamento ou token confirmado. Consulta dos logs Docker do MCP entre 04:20 e 04:30 UTC retornou zero linhas; ausência de log não prova ausência de chegada ao backend.
- **Hipótese, não causa comprovada:** Bot Fight Mode pode interferir com tráfego de API, conforme [documentação oficial](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/). O 403 e o cabeçalho Server isoladamente não demonstram qual proteção tomou a decisão. Correlacionar Ray ID em Security > Analytics > Events, conforme [documentação de Ray ID](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/). Não desabilitar proteção ou criar exceções por hipótese.
- **Próximo passo:** identificar a origem do bloqueio pelo Ray ID, corrigir somente o componente causal dentro do escopo autorizado, depois reconciliar a configuração Desktop e o contrato de sessão persistente do Agente Remoto. A flag desabilitada e o token pairing_only do preview não equivalem à sessão persistente. Nenhuma alteração de infraestrutura, configuração de segurança, sessão ou credencial nesta rodada. FIXED_POINT do pareamento permanece PENDENTE.
<!-- /CENTRALDARK_PAIRING_DIAG_20261128 -->

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
