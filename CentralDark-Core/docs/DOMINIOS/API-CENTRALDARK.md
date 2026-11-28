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

<!-- CENTRALDARK_PAIRING_BIC_CONFIRMED_20261128 -->
### Causa confirmada — bloqueio BIC da sondagem e contraprova de leitura (28/11/2026)

**Resultado: causa dos 403 identificada; pareamento real ainda PENDENTE.** Consulta somente de leitura à API GraphQL da Cloudflare, dataset `firewallEventsAdaptive`, zona `6986cded70ab6bec23a765496807b614`, correlacionou o host `mcp.centralldark.com` e o caminho `/device/pair/start` aos eventos abaixo. A hipótese anterior sobre Bot Fight Mode não deve ser promovida a causa: o evento que tomou a decisão informa explicitamente `source=bic`, `ruleId=bic` e `action=block`.

| Momento UTC | Ray ID | User-Agent observado | Decisão |
| --- | --- | --- | --- |
| 28/11/2026 04:23:34 | `a6169919788232c4` | `Python-urllib/3.14` | `block / bic` |
| 28/11/2026 04:51:46 | `a616c2690c7000f1` | `Python-urllib/3.14` | `block / bic` |

Os dois eventos pertencem à sondagem Python, não constituem um teste do cliente nativo ou de uma sessão Supabase. Eventos `link_maze_injected` apareceram com os mesmos Rays; a atribuição do bloqueio acima vem dos eventos `block`. A [documentação oficial do Browser Integrity Check](https://developers.cloudflare.com/waf/tools/browser-integrity-check/) explica que a proteção avalia cabeçalhos HTTP, inclusive User-Agent ausente ou fora do padrão.

**Contraprova externa sem criar pareamento:** duas requisições **GET**, à mesma URL `https://mcp.centralldark.com/device/pair/start`, diferiram somente no User-Agent. Nenhum corpo, credencial, código ou consentimento foi enviado.

| User-Agent declarado | Resposta observada | CF-Ray |
| --- | --- | --- |
| `Python-urllib/3.14` | 403, `text/plain` | `a616c440bd5400ae-GRU` |
| `CentralDark-Readback/1.0` | 405, JSON, `Allow: POST, OPTIONS` | `a616c44218041fb4-GRU` |

O 405 confirma que a segunda leitura chegou à validação de método do Worker existente; **não comprova POST, autenticação ou vínculo**. O identificador usado na contraprova declara o cliente de diagnóstico; não imita um navegador ou o Agente Remoto. A leitura do log JSONL do MCP percorreu 1.330 linhas e não encontrou eventos desses caminhos após 04:15 UTC; esse dado é corroborativo, não substitui a decisão registrada na borda.

**Limite de execução desta rodada:** a revisão automática da plataforma recusou o POST de teste por possível criação de estado de pareamento e exposição de código na resposta. A chamada recusada não foi executada. O diagnóstico prosseguiu por GraphQL e GET, sem repetir o POST por outra rota. Nenhuma regra Cloudflare, flag Desktop, credencial, sessão, registro de dispositivo ou serviço foi alterado.

**Continuidade:** reutilizar o cliente legítimo e sua identificação HTTP, conferir o contrato do pareamento persistente e executar uma solicitação real com resposta secreta mantida no cliente após a autorização específica exigida pela revisão. Depois comprovar login/consentimento, vínculo e chamadas autenticadas. Não desativar BIC/Bot Fight Mode nem habilitar o preview Desktop para corrigir por hipótese uma sondagem Python. `FIXED_POINT_DIAGNOSTICO_403=APROVADO`; `FIXED_POINT_PAREAMENTO=PENDENTE`.
<!-- /CENTRALDARK_PAIRING_BIC_CONFIRMED_20261128 -->

<!-- CENTRALDARK_DESKTOP_PAIRING_ENABLED_20261128 -->
### Continuidade — pareamento Desktop habilitado na Contabo (28/11/2026)

**Intenção expressa do CHEFE:** “Então liga primeiro paramento no conta bo”. **Estado medido:** DESKTOP_PAIRING_ENABLED; REAL_DEVICE_PAIRING_PENDING. A ativação foi solicitada separadamente do diagnóstico BIC; não é uma correção do 403.

- A validação nativa em `dist/desktop-pairing-config.js` com a flag candidata retornou configuração válida, protocolo `centraldark-device-v1`, `pairingOnly=true`. A importação inicial por `src/` falhou por se tratar de imagem compilada; corrigida antes da alteração. URL e formato da chave pública conferidos sem revelar valores.
- Menor delta no Compose existente `/etc/easypanel/projects/centraldark/mcp/code/docker-compose.yml`: acrescentada exclusivamente a variável `CENTRALDARK_DESKTOP_PAIRING_ENABLED: "1"`. A comparação do Compose resolvido aprovou igualdade dos demais campos. O hash Compose de origem diferia do rótulo da instância anterior; ambiente efetivo, imagem, volume, redes e porta foram reconciliados. SHA-256 anterior `0b95ef921274252ebbc8594a40a6f56fb2f3ceb2559968d8c0ded12875f1e554`; novo `3167b71ffd3f0cb94e8133e52d5e77291dc25be1714e7aa5d4af0381a4bf1d21`. Backup exclusivo `docker-compose.yml.before-desktop-pairing-20261128` modo 0600 e hash anterior conferido. Override preservado.
- Executado `docker compose up -d --no-deps --no-build --pull never mcp` no mesmo projeto `centraldark_mcp`; saída 0. Contêiner anterior `16c6e5d6f791`, atual `1b99ad3507bd`. Mesma imagem `centraldark/mcp:da49b5e9-desktop-pairing-preview`, volume `centraldark-mcp-stage-data` em `/data/mcp`, porta local 127.0.0.1:9100 e demais variáveis idênticas. Nenhuma reconstrução de imagem ou reinicialização de Hermes, Traefik ou EasyPanel.

| Prova | Resultado |
| --- | --- |
| GET local /api/mcp-info | 200 JSON, protocolo centraldark-device-v1, pairingOnly=true, chave pública presente |
| GET local /health | 200 JSON, ok=true, 162 ferramentas declaradas |
| HEAD público /api/mcp-info pela Casa | 200 JSON; Ray a616c779fdd8a432-GRU |
| HEAD público /mcp/health pela Casa | 200 JSON; Ray a616c78c7881f250-GRU |
| HEAD público /api/mcp sem credencial pela Casa | 401 JSON; desafio OAuth preservado; Ray a616c7a39983b54f-GRU |
| GET público via urllib a partir da Contabo | 403 text/plain nos três endpoints; Rays a616c7319bf230ea-FRA, a616c731edb0dc99-FRA e a616c73229be4d50-FRA |

**Limite:** `desktop_pairing_disabled` resolvido no runtime. O diagnóstico anterior confirmou BIC nos Rays anteriores de sondagem; os novos Rays não foram individualmente correlacionados. Nenhuma proteção Cloudflare alterada, dispositivo aprovado ou token emitido. O preview `pairingOnly=true` não equivale a sessão remota persistente. Flag salva no Compose efetivo da VPS; preservação em futura regeneração de fonte pelo EasyPanel não comprovada.

**Reversão:** conferir hashes do Compose atual e backup, restaurar exclusivamente esse arquivo e recriar somente MCP pela mesma receita, preservando imagem e volume. **Próximo passo:** testar o vínculo legítimo no cliente oficial com consentimento do responsável, sem contornar os limites da execução anterior. FIXED_POINT da ativação: APROVADO; integração: PENDENTE.
<!-- /CENTRALDARK_DESKTOP_PAIRING_ENABLED_20261128 -->

<!-- CENTRALDARK_CASA_PAIRING_READBACK_20261128 -->
### Contraprova na Casa — vínculo persistente verificado (28/11/2026)

**Intenção:** conferir diretamente a janela e a funcionalidade demonstradas pelo CHEFE, pelo Método Operacional/Skill Mãe. BOOT `5046b5f4794fed7df40a810397606c26a5bc7de2`, LEIA `3bfc1242697317fdce9f505dc0c62d4fde026df2`, Skill Mãe `0d712f5f8fbf1dfc5eaeac4ed1cabf580dafb4d2`, Skill visual `fa6f0b06286635678836a6ea4f5f9b24b5d2c482`. Rota: Remote Desktop Commander na Casa SEGREDO, PowerShell + UIAutomation, sem input.

- Janela viva `Segredo Agente Remoto`, processo `centraldark-halo-lite` PID 37500, HWND 660130 (efêmeros), executável DEV `C:\CentralDark-Harnes-projeto\CentralDark-RemoteDesktop-Comander\centraldark-halo-main\src-tauri\target\debug\centraldark-halo-lite.exe`. UIA encontrou CASA CONECTADA, Pareamento verificado com sucesso, Serviço local disponível. Conexão central AGUARDANDO, acesso à tela ainda não ativado e botão Iniciar atendimento desabilitado.
- Logger existente em `%LOCALAPPDATA%\Codex Halo\logs\centraldark-halo.log`: transição às 04:22:00.055 UTC de `mcp_heartbeat/ok/HTTP_2XX` e `pairing/ok/DEVICE_HEARTBEAT_VERIFIED`. A primeira extração filtrada retornou campos nulos; corrigida a leitura com regex, sem expor payloads. A transição antecede a ativação posterior da flag de preview Desktop.
- Contraprova independente no registro persistente do MCP Contabo: um dispositivo SEGREDO do executor remote-bridge, superfície tauri-windows-tray, vínculo original 26/11/2026 18:19:11.509 UTC. Heartbeats observados em duas leituras: 28/11/2026 04:58:53.171 e 04:59:08.826 UTC, idade de 0 e 2 segundos respectivamente; validade temporal do token positiva. O registro legado tem `owner_bound=false`; portanto não prova novo consentimento ou associação persistida ao ID da conta Supabase. Nenhum token, hash de token, código ou ID de conta exibido. `runtime=tauri-rust`, `remote_execution=not_verified`.
- GET local `http://127.0.0.1:9101/health`: ok=true, engine_connected=false. O contrato de `session_vault.rs` (blob `8ae240caea69f28a710b22fe0184acdd36d84419`) distingue PAIRED_VERIFIED por heartbeat autenticado de PENDING_EXECUTION_PROOF.

**Conclusão:** vínculo persistente legado e heartbeat vivo Casa→MCP comprovados. Não confundir recuperação desse vínculo com criação de dispositivo novo ou efeito causal exclusivo da flag Desktop. Acesso à tela, motor remoto, atendimento e chamada MCP autenticada de ferramenta continuam pendentes. Não se iniciou atendimento, alterou sessão ou clicou em controles. **FIXED_POINT do vínculo/heartbeat medido: APROVADO; associação de owner e execução ponta a ponta: PENDENTE.** Próximo passo: identificar a causa de engine_connected=false e reconciliar o contrato de associação do dispositivo, mantendo o vínculo atual.
<!-- /CENTRALDARK_CASA_PAIRING_READBACK_20261128 -->

<!-- CENTRALDARK_DESKTOP_FORK_BUILD_PARITY_20261128 -->
### Continuidade — motor Desktop Commander próprio compilado na Casa (28/11/2026)

**Intenção:** reaproveitar o fork existente no disco F:, preservar a arquitetura funcional do Desktop Commander oficial com infraestrutura e autenticação CentralDark, um motor compartilhado por NPX e Agente Remoto. BOOT `5046b5f4794fed7df40a810397606c26a5bc7de2`, LEIA `3bfc1242697317fdce9f505dc0c62d4fde026df2`.

- Checkout real `F:\CentralDark-DesktopCommanderMCP-main`, origin `ServerVpss/CentralDarkDesktopCommanderMCP`, branch existente `centraldark/remote-pairing-web`, HEAD inicial `77d8f1ba2b33555199c0f4dca53ecfe0176417d8`. Pacote privado `@centraldark/desktop-commander@0.3.3`, bin `centraldark/cli.mjs`. Não confundir a branch de trabalho com a main upstream nem com pacote publicado. Reuso da pasta, sem clone novo.
- Comparação com [upstream oficial](https://github.com/wonderwhy-er/DesktopCommanderMCP): `package.json` blob `100fc93bdfd5dad3d61d25bd2de8cdf9d128794c`; cliente de autenticação `src/remote-device/device-authenticator.ts` blob `7e63c8fb16b7743ae3db9a6fd21946a3cd6c3bf2`; canal `src/remote-device/remote-channel.ts` blob `ae7f25896f87919e275f6762ba0a25e325e05b12`. Upstream distingue stdio local de dispositivo remoto, usa start/poll, sessão vinculada à origem, Realtime e MQTT. Código público do cliente não prova a implementação completa do backend hospedado. O fork preserva o código-base, mas `centraldark/cli.mjs` libera apenas descoberta e teste de pareamento; `centraldark/README.md` e [DESKTOP-PAIRING-PREVIEW](../../apps/modulos/mcp/docs/DESKTOP-PAIRING-PREVIEW.md) delimitam sessão opaca de teste, sem execução, transporte/identidade de dispositivo pendentes. O motor antigo do Casa Commander continua separado em execução na porta 9101; não contornar a restrição da CLI via entrypoint upstream nem enviar sessão CentralDark à infraestrutura original.
- Instalação na Casa: Node v26.5.1, npm 11.17.0, `npm ci --include=dev --no-audit --no-fund` exit 0, 1042 pacotes; artefato `dist/index.js` presente após a instalação (SHA-256 `7e58b9d5d64732ff8cd77cd477de30751feb6b59bc2353dfaa78825f015b2f2b`, 7425 bytes), `node --check` exit 0. Avisos de tarballs no cache, depreciações e quatro scripts sem política allowScripts explícita reportados pelo npm; não foram removidos controles nem executado approve-scripts. Teste inicial 7/8: caminho URL .pathname incompatível com Windows. Corrigido somente teste `centraldark/test/remote-config.test.mjs` via fileURLToPath; reteste 8/8. Commit `a895c31283764a20bae5e71e55f3c61832c33195` publicado na branch existente, push exit 0, HEAD remoto conferido, blob `3560e937da7c9179ea7f69353190f9c985e7bc68` conferido por GitHub. Não houve merge ou publicação NPM.
- CLI `node centraldark/cli.mjs remote --check`: exit 0, descoberta do domínio MCP e projeto Supabase CentralDark confirmada; explicitamente informa execução remota bloqueada. Nenhuma nova tentativa de consentimento/dispositivo. Contraprova atual: registro do único dispositivo SEGREDO (remote-bridge, tauri-windows-tray), heartbeat 05:09:03.230 UTC, idade 2 s, validade temporal positiva, owner_bound=false (legado). Casa Commander /health ok=true, engine_connected=false, receipt=null. A compilação não mudou o executor ativo, pareamento, Hermes, Cloudflare ou Contabo.
- Referência comercial pública do original: [Pricing](https://desktopcommander.app/pricing/) e [Plans and tool call limits](https://desktopcommander.app/help/account-billing/plans-and-tool-call-limits): MCP local livre/open source, serviço remoto Free com 10.000 chamadas/mês e Pro US$20/mês mais impostos, chamadas ilimitadas segundo o plano anunciado; [cobrança](https://desktopcommander.app/help/account-billing/invoices-receipts-taxes-payments) via Stripe. Essa pesquisa é referência de arquitetura comercial, não verificação de transações pessoais nem decisão de implementar cobrança CentralDark.

**Próximo delta:** completar sessão de dispositivo restrita e transporte autenticado no owner existente, reutilizando o motor compilado e a sessão do Agente Remoto sem duplicar backend/launcher; medir chamada de leitura legítima, revogação e isolamento antes de publicar. Revisar dependências de configuração/telemetria/feature flags do upstream antes de colocar o motor próprio em runtime. `FIXED_POINT_BUILD_CASA=APROVADO`; `FIXED_POINT_EXECUCAO_REMOTA=PENDENTE`. Não substituir o processo ativo por uma versão sem contrato de sessão validado.
<!-- /CENTRALDARK_DESKTOP_FORK_BUILD_PARITY_20261128 -->

<!-- CENTRALDARK_NPX_PAIRING_PREFILL_20261128 -->
### Continuidade — NPX: código preenchido, consentimento explícito (28/11/2026)

**Intenção:** a página de pareamento abre com o código do terminal já preenchido; o responsável apenas confere e clica Confirmar. O aviso anterior de solicitação incompleta confundia campo de código vazio com pedido estruturalmente incompleto.

- Owner único do delta: `ServerVpss/CentralDarkDesktopCommanderMCP@centraldark/remote-pairing-web`, checkout existente `F:\CentralDark-DesktopCommanderMCP-main`. Commit inicial `a895c31283764a20bae5e71e55f3c61832c33195`, commit aplicado e push/readback `7d41836afcd6758c4c6b302699e4768563b5de02`. Alteração em CLI, rota React, retorno após login, testes e READMEs existentes, sem nova store ou backend. 
- Após verificar o redirect oficial e os campos do pedido, o NPX abre o navegador com fragmento local `#pair_code=...`. Código continua visível no terminal, nunca é aceito em query nem no redirect recebido do servidor. O navegador aceita somente formato de código, cliente Bridge, scope MCP, ID e nonce compatíveis, sem duplicidade; retira o fragmento da barra de endereço. O mecanismo de retorno após login já existente preserva o pedido validado na sessão da aba e consome-o uma vez. Fallback manual mantido. A lógica segue a otimização de verificação sem digitação da [RFC 8628 §3.3.1](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.3.1), sem alegar implementação integral dessa RFC.
- Nenhuma aprovação automática, alteração de JWT/admin, nonce, TTL, revogação, token, segredo de posse, Supabase, Traefik ou MCP. A mesma validação server-side permanece obrigatória. O preview continua pairing-only, sem liberação de execução remota. Código de exemplo em testes fictício; não registrar código da sessão real.
- Provas na Casa: CLI 8/8, Web 7/7, TypeScript e Vite build aprovados, `git diff --check` aprovado, push ao branch existente conferido. O primeiro comando de edição excedeu o limite de tamanho do shell; refeito por arquivo com SHA de origem e substituição exata. Wrangler 4.164.0 offline falhou por cache incompleto, instalação normal do mesmo pin e whoami aprovaram conta existente; não alteradas permissões.
- Pages `centraldark-mcp` produção, branch existente, deployment `4e7497af-23da-4a51-8767-167590a6dbb0`, commit `7d41836afcd6758c4c6b302699e4768563b5de02`, status success, `commit_dirty=false`. Deploy anterior `b7211c7b-c2ab-487f-8780-f26f9afb775f` preservado como referência. GET público /mcp-autorizar e asset JS 200; asset `/assets/index-BJsU6j8B.js` idêntico ao build da Casa (SHA-256 `de1bea07839a07f6850f83aa1aeb3dc8cb8005919a5fa382d56483d993b95d79`), marcador de prefill presente, Referrer-Policy no-referrer. A primeira sonda falhou por quoting do PowerShell; a leitura corrigida passou.
- FIXED_POINT do código/build/deploy: APROVADO. Consentimento humano real, prova de revogação e execução remota: PENDENTES. Próximo passo: nova tentativa NPX, conferir código preenchido e clique explícito do responsável; confirmar recibo da CLI e revogação antes de avançar.
<!-- /CENTRALDARK_NPX_PAIRING_PREFILL_20261128 -->

<!-- CENTRALDARK_NPX_PAIRING_REAL_PASS_20261128 -->
### Contraprova real — NPX aprovado pelo responsável (28/11/2026)

- Foto enviada pelo CHEFE após a tentativa iniciada no terminal da Casa: página CentralDark informa “Confirmação enviada”; CLI informa “APROVADO: pareamento autenticado e sessão de teste revogada” e `RESULTADO_NPX_EXIT=0`. Fonte da prova visual: fotografia fornecida pelo responsável, não captura independente do terminal. Código, identificador de tentativa e nonce não reproduzidos.
- Checkout na Casa confirmado no commit `7d41836afcd6758c4c6b302699e4768563b5de02`. O contrato da CLI somente declara APROVADO após verificar a sessão pairing-only, obter resposta positiva de revogação e confirmar HTTP 401 na nova tentativa de verificar a sessão revogada. A fotografia comprova o retorno da CLI; não representa uma captura independente de cada resposta HTTP.
- Contraprova de leitura do registro persistente do MCP Contabo: zero dispositivos da superfície centraldark-desktop-commander; dispositivo legado SEGREDO, tauri-windows-tray, mantém paired_at 2026-11-26T18:19:11.509Z, heartbeat 2026-11-28T05:22:08.248Z, idade 0 s, validade temporal positiva, remote_execution=not_verified. A ausência do registro preview é compatível com a revogação (revokeSelf remove o registro).
- GET local /health na porta 9101: ok=true, engine_connected=true, mudança observada em relação à medição anterior false. Causa da transição e identidade do motor ativo não verificadas; não atribuir à implementação NPX nem declarar execução remota aprovada. Nenhuma alteração de runtime ou autorização adicional feita nesta conferência.

**Estado:** FIXED_POINT_NPX_PAIRING_PREVIEW=APROVADO. A sessão de teste foi revogada por desenho; não é um vínculo NPX persistente. Execução de ferramenta autenticada e publicação NPM continuam PENDENTES. Próximo delta: reaproveitar o contrato de sessão de dispositivo próprio e completar transporte autenticado do NPX, preservando o consentimento simplificado e o vínculo existente. Cobrança fora do escopo.
<!-- /CENTRALDARK_NPX_PAIRING_REAL_PASS_20261128 -->

<!-- CENTRALDARK_NPX_UPSTREAM_RUNTIME_PARITY_20261128 -->
### Continuidade — NPX: paridade medida com o original em execução na Casa (28/11/2026)

**Intenção:** reproduzir a experiência do terminal do Desktop Commander original com identidade CentralDark e português, reaproveitando a arquitetura existente, sem substituir o executor ativo por uma variante não validada.

- BOOT `5046b5f4794fed7df40a810397606c26a5bc7de2`, LEIA `3bfc1242697317fdce9f505dc0c62d4fde026df2`, Skill Mãe `0d712f5f8fbf1dfc5eaeac4ed1cabf580dafb4d2`. Checkout `F:\CentralDark-DesktopCommanderMCP-main`, branch `centraldark/remote-pairing-web`, HEAD `7d41836afcd6758c4c6b302699e4768563b5de02`, limpo.
- Runtime original v0.3.4 em `C:\Users\Administrador\AppData\Local\npm-cache\_npx\4b4c857f6efdfb61\node_modules\@wonderwhy-er\desktop-commander`. Cadeia observada: PowerShell PID 31652 → NPX Node 45072 → cmd 45600 → Node remote 43428 → motor stdio `dist/index.js` PID 38628. PIDs efêmeros. Fotos mostram sessão restaurada, canal inscrito e presença online do serviço original, não do nosso NPX.
- Comparação direta de oito arquivos compilados original 0.3.4 × fork 0.3.3, normalizando apenas CRLF/LF: 7/8 iguais (`dist/index.js`, `dist/npm-scripts/remote.js`, `dist/remote-device/{device,device-authenticator,remote-utils,desktop-commander-integration}.js`, `dist/utils/terminal-timestamps.js`). `dist/remote-device/remote-channel.js` diverge (87.015 contra 85.444 bytes); não presumir paridade integral do canal nem substituir pelo cache NPM. 
- Owners fonte no fork: `src/npm-scripts/remote.ts` (banner, timestamps, opções e ciclo de execução, blob `876bcdeb7faf693fca45d588ded78e127b00ad59`); `src/remote-device/device.ts` (ciclo de vida, sessão, presença, status, blob `ebb5fab1d6cf32c0c9897b7e3fbaeda2ff64d8fa`); `device-authenticator.ts`, `remote-channel.ts`, `remote-utils.ts`, `desktop-commander-integration.ts` existentes. A entrada NPM efetiva do fork é `centraldark/cli.mjs`, blob `184ab398b7af8ca209c35992a10c2c9075daeac6`; ainda oferece apenas check/pair-test. O fluxo upstream mantém domínios, contexto Supabase, telemetria, sessão e protocolo remoto próprios do fornecedor: não é suficiente traduzir nem apontar o domínio. Reutilizar componentes e separar a identidade/sessão CentralDark, não carregar sessão upstream no nosso serviço.
- Casa Commander porta 9101: health ok=true, engine_connected=true, processo Node PID 16256 em `%LOCALAPPDATA%\CentralDark\Casa-Commander\CentralDark-Casa-Agent.mjs`; filho cmd PID 27112 contém referência ao pacote original, não ao fork F:. A versão/entrypoint final do filho não foi medido neste delta; não atribuir health=true ao motor próprio. Preservada a conexão original utilizada para operar a Casa.
- **Menor delta seguinte:** adaptar o ciclo de sessão persistente e o canal existente ao backend CentralDark com o contrato próprio de dispositivo; expor na entrada `centraldark/cli.mjs` os estados reais em português e banner CentralDark, reutilizando o motor stdio compilado, timestamps e ciclo de vida existentes. Não imprimir online antes de comprovar sessão, inscrição/canal e chamada autorizada. Antes da distribuição NPM, contraprovar reconexão, logout e leitura remota pelo próprio serviço. Sem cobrança.

**Estado:** levantamento e comparação APROVADOS; execução remota própria PENDENTE. Nenhuma alteração de processos, arquivos do checkout, sessão, backend ou publicação realizada neste delta.
<!-- /CENTRALDARK_NPX_UPSTREAM_RUNTIME_PARITY_20261128 -->

<!-- CENTRALDARK_AUTH_EVOLUCAO_CONJUNTA -->
<a id="evolucao-conjunta-da-distribuicao"></a>
## Evolução conjunta da distribuição CentralDark

**Decisão do responsável — 28/11/2026:** o conjunto completo de integração e distribuição deve evoluir como um produto único, não como arquivos ou aplicativos independentes. A alteração no login foi o exemplo inicial; a regra se aplica a qualquer mudança de contrato, funcionalidade, configuração ou dependência que afete o conjunto.

- **Escopo:** MCP/API, autenticação (login, cadastro, recuperação, callbacks, renovação, logout e revogação), consentimento e pareamento, página web, plugin ChatGPT completo, conexão HTTPS direta, pacote NPX completo e Agente Remoto/instalador. Incluir outros consumidores existentes quando efetivamente afetados.
- **Reuso e menor delta:** localizar os owners e dependências do contrato; alterar apenas os componentes que precisam mudar; verificar compatibilidade do conjunto inteiro. Reutilizar motor, serviços, sessão válida e infraestrutura existente. Não criar login, motor, backend ou distribuição paralelos, nem exigir reautenticação sem necessidade. Não confundir sessão de usuário, cliente MCP e dispositivo.
- **Entrega íntegra:** quando houver mudança distribuível, atualizar os fontes e manifestos afetados, preservar a identidade do plugin, gerar o ZIP completo e os pacotes/instaladores afetados a partir da revisão registrada, com todas as dependências, recursos e arquivos necessários. Nunca distribuir somente um fragmento de um pacote como atualização completa. Versões dos componentes podem ser diferentes; a compatibilidade e a origem de cada versão devem ser explícitas.
- **Publicação coordenada:** usar os Releases do fork [ServerVpss/CentralDarkDesktopCommanderMCP](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/releases), com novas tags/versões dos artefatos modificados, changelog, links, SHA-256 e revisão fonte de cada pacote. Reaproveitar artefatos inalterados cuja compatibilidade esteja comprovada. Preservar versões históricas; não sobrescrever binários antigos silenciosamente. Atualizar o README da branch de entrega e o índice da main. Publicação NPM ou no diretório ChatGPT segue a autorização e a disponibilidade de cada canal.
- **Teste de entrega:** validar arquivos internos/manifestos do pacote completo, instalação/atualização e os fluxos compartilhados afetados. Quando o delta tocar autenticação ou execução, testar login/consentimento com sessão válida e sem sessão, pareamento, reconexão, logout/revogação, isolamento e chamada autorizada de leitura conforme a capacidade entregue. Manter a confirmação humana aplicável. Conferir o release e o hash após baixar. Se uma superfície ainda não foi implementada ou provada, explicitar a pendência; não apresentar o conjunto como pronto nem transformar uma entrega de desenvolvimento em release estável.
- **Linguagem:** interface do cliente em português natural; NPX e diagnósticos com o termo técnico seguido de explicação humana, por exemplo `[OAuth] Conta autenticada`, `[MQTT] Canal de mensagens ativo`, somente quando medidos. Preservar identificadores e protocolos internos. Logs não podem anunciar sucesso inexistente nem expor credenciais.

Sequência subordinada ao EXECUTION_FIRST_PROTOCOL: mudança → identificar cone de impacto → evoluir fontes afetados → reconstruir artefatos completos → verificar compatibilidade do conjunto → publicar as versões autorizadas → baixar/conferir → registrar README, owner e continuidade. Não é novo workflow, serviço, gate global ou obrigação de reconstruir componentes comprovadamente inalterados por uma mudança meramente documental.

**Base atual:** [pré-release plugin-v0.1.5](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/releases/tag/plugin-v0.1.5), asset `CentralDark-Plugin.zip`, SHA-256 `571c8eca73d0aa17993a6c95a31697411714e897ac9130c404efd133b1c55393`, com download conferido. Fonte do pacote: `.agents/plugins/centraldark-unified-surface-parity/` e seu `SOURCE.json`. A distribuição GitHub está aprovada; instalação/OAuth pelo plugin, NPX persistente e atendimento remoto próprio continuam pendentes. Esta decisão documental não publica outro release, não altera runtime e não instala automação.
<!-- /CENTRALDARK_AUTH_EVOLUCAO_CONJUNTA -->

<!-- CENTRALDARK_MCP_OAUTH_CONSENT_DOMAIN_20261128 -->
### OAuth ChatGPT — consentimento no domínio MCP (28/11/2026)

**Evidência inicial:** captura do usuário mostra plugin CentralDark Unified Surface selecionável e tentativa de OAuth redirecionada a `admin.centralldark.com/mcp-autorizar`, com Bad Gateway. Isso não prova a versão instalada, a autorização OAuth ou ferramentas autenticadas. O MCP comum usava o destino administrativo antigo, enquanto o pareamento Desktop já usava o domínio MCP.

**Correção em main:** commit `bf985aad91313134499f131e7a2ab7cd19e8bab4` (src e dist de `apps/modulos/mcp/*/oauth.js`, regressão `tests/pairing-consent-flow.test.mjs`). O OAuth comum encaminha para a interface MCP existente; POST JSON do domínio MCP exige a validação JWT/role admin existente. A origem legada do Cockpit e os seletores de pareamento VS Code/Bridge permanecem compatíveis. PKCE, callback registrado, consentimento humano e autorização continuam exigidos. Não foi alterado Supabase, DNS, Worker, Cloudflare Pages, pacote ZIP ou NPX.

**Teste isolado:** 10/10 testes dirigidos usando a imagem anterior em contêiner descartável sem rede externa, arquivos de teste temporários e fixtures de autenticação; validação de origem, JWT/role, PKCE, redirect, nonce, expiração, pareamento legado e Desktop. Sintaxe src/dist aprovada. As verificações estáticas de outros artefatos não foram executadas por não integrarem este cone.

**Deploy e contraprova:** imagem anterior `centraldark/mcp:da49b5e9-desktop-pairing-preview`, nova `centraldark/mcp:bf985aad-oauth-mcp-consent` (mesma base, troca exclusiva de dist/oauth.js e label de revisão). Contêiner `1b99ad3507bd` → `8e8ad1cebfed`, SHA-256 do arquivo `c6ec22abb336e15cef448cb959d9f13afd1a569d8d2630609ffd317abe6363b7`. Compose efetivo difere apenas pela imagem; ambiente, volume /data/mcp, redes e porta preservados. Backup 0600 `docker-compose.yml.before-oauth-mcp-consent-bf985aad` SHA-256 `3167b71ffd3f0cb94e8133e52d5e77291dc25be1714e7aa5d4af0381a4bf1d21`; novo Compose SHA-256 `481a398191d5d1b9e471338242bf9111d0373baf9781484c1f6a6b25e05c83cd`. Mesmo serviço MCP na Contabo: /health local 200; /api/mcp anônimo local e público 401.

**Readback público pela Casa:** documento CIMD oficial `https://chatgpt.com/oauth/client.json?token_endpoint_auth_method=none` HTTP 200, callback registrado `https://chatgpt.com/connector_platform_oauth_redirect`. GET legítimo /authorize com state e PKCE de teste, sem credencial e sem confirmar consentimento, retornou 302 para `https://mcp.centralldark.com/mcp-autorizar`, preservando state, challenge e callback; nenhum código/token emitido. Página MCP 200 HTML, metadata OAuth 200 JSON e /api/mcp-info 200 JSON. A consulta pública /mcp/health não produziu JSON parseável e não foi usada como prova de saúde; /health local medido 200.

**Compatibilidade da distribuição:** o pré-release `plugin-v0.1.5` continua usando o mesmo endpoint /api/mcp, sem alteração dos três arquivos internos; não gerar outro pacote só por correção interna compatível. Não afirmar execução de plugin por descoberta HTTP. Próxima ação humana: iniciar nova tentativa de conexão pelo ChatGPT, entrar na conta se necessário, confirmar consentimento e retornar ao cliente. Em seguida, comprovar token exchange, initialize/tools/list e uma chamada MCP autorizada de leitura. NPX persistente e atendimento multicliente continuam pendentes.

`FIXED_POINT_OAUTH_CONSENT_ROUTE=APROVADO`; `FIXED_POINT_PLUGIN_AUTHENTICATED_TOOL_CALL=PENDENTE`.
<!-- /CENTRALDARK_MCP_OAUTH_CONSENT_DOMAIN_20261128 -->

<!-- CENTRALDARK_ACCOUNT_OAUTH_ROLE_CATALOG_20261128 -->
### OAuth por conta e catálogo por papel/escopo (28/11/2026)

**Intenção:** integrar a autenticação MCP ao `auth.users` e `public.user_roles.role` (enum app_role: admin, moderator, user) existentes, sem credencial de proprietário como precondição para a conta. Checkpoint anterior: consentimento no domínio MCP aprovado, erro "Token interno do dono ausente no servidor" em OAuth. A Contabo não tinha token de proprietário/GitHub nem chave Supabase privilegiada configurados; nenhuma dessas credenciais foi adicionada. Sem alteração de papéis, tabelas, políticas RLS ou dados Supabase.

**Fonte:** [commit c4714450b19f3c289104d372dbe4825686b63dcf](https://github.com/ServerVpss/CentralDark/commit/c4714450b19f3c289104d372dbe4825686b63dcf), main, seis módulos existentes src/dist (`desktop-pairing-config.js`, `oauth.js`, `sessions.js`, `index.js`, `mcp-server.js`, `tools/core/mcp-policy.js`), atualização da regressão de consentimento e teste `tests/account-oauth.test.mjs`. Quatorze arquivos conferidos por blob após commit sem force.

**Contrato:** consentimento OAuth padrão do domínio MCP usa JWT verificado por Auth /user e consulta de papel da própria identidade no projeto Supabase fixado, rejeita sessão inválida, papel ausente e escopos não autorizados. Papel deriva do banco, não do cliente. Prioridade admin > moderator > user quando houver mais de um papel. PKCE, callback registrado, estado e consentimento humano permanecem. A sessão opaca MCP reutiliza o store existente e mantém user_id, role, session_id e limite de validade do JWT; papel e identidade são revalidados no exchange, refresh e chamada. Refresh exige mesmo client_id e não estende validade além do JWT original. Token de acesso Supabase e grants novos ficam em memória e não são persistidos/retornados ao cliente. Assim, reinício ou expiração do JWT exige nova autorização neste delta; não há renovação Supabase persistente nem prova de revogação imediata em logout web antes da expiração. Não confundir esta entrega com solução final de sessão persistente.

**Catálogo e execução:** escopo mcp de conta vinculada permite somente `mcp_account_info` e `mcp_my_devices`; moderator permanece nessa mesma capacidade até existir contrato específico. O catálogo administrativo existente só é liberado para papel admin validado + escopo admin consentido, conservando guardas existentes. Ferramentas dependentes de credencial interna ainda exigem essa credencial na própria operação, não no login. Bloqueio no dispatcher, não apenas na apresentação. Recursos e eventos internos não são liberados aos usuários comuns. Lista de dispositivos usa o registro MCP existente, filtro owner_user_id da identidade autenticada e projeção de campos de exibição; exclui vínculo legado sem dono e dispositivos de outros usuários. Não implica pareamento de cliente comum, execução remota ou ativação das tabelas Supabase mcp_devices/mcp_remote_calls. Fluxos legados admin/VS Code/Bridge/Desktop preservados.

**Testes:** 17/17 (10 regressões + 7 contagens node:test, incluindo 6 subtestes da entrada HTTP) na base real e 17/17 na candidata canônica com o módulo events.js existente. Contêineres descartáveis sem rede externa e fixtures, sem credenciais de produção. Provaram consentimento/exchange sem token do dono, três papéis, negação de escopo admin a user/moderator, catálogo e chamada direta bloqueada, identidade própria, isolamento de dispositivos, refresh por cliente, mudança de papel, rejeição de conta inativa e ausência de grants de conta no JSON persistido. O primeiro ensaio canônico falhou com ERR_MODULE_NOT_FOUND em dist/events.js: a imagem instalada era anterior à evolução de eventos. Recuperação: adaptar exclusivamente as mesmas mudanças de sessões e dispatcher aos dois arquivos medidos da base ativa, sem introduzir o módulo de eventos em produção. Ensaio canônico usou dist/events.js existente (blob ae416d573cf1b8b2ab3303c404ec1217863aaba6) apenas na cópia isolada. Não declarar build integral da main, CI concluída ou certificação Michelin de mesmo SHA.

**Deploy localizado na Contabo:** base `centraldark/mcp:bf985aad-oauth-mcp-consent`, nova `centraldark/mcp:c4714450-account-oauth`, image ID sha256:f50c87ea0b3e4ac1421f385b989381c1a8a66a6de538784e82de57c994a37dac, contêiner 8e8ad1cebfed → 4ba41e778d3b. Troca exclusiva de seis arquivos dist, labels de fonte e base; sem deploy de eventos. SHA-256 runtime:
- desktop-pairing-config.js: 6a2beecf107e9be122a49712397e6a69e2289f989f94ee7d13fcebde575abc29
- oauth.js: 2bb94cec4f171ba77f948a3e44d3c3ada8cdc89c17887e2d4554441e9c74afee
- sessions.js: 0ea5c0218827e1d19148d2793980f860d365d4ecbd115c329922a3646d7e64bb
- index.js: 86f73316deb5bd34d84fcf0d19597b461086cc7255e8b6a2341c4d724fc54e0d
- mcp-server.js: 160ddcb66d31e8788770aa252f135749f6cfc4920989fe5ecafb9947709337c0
- tools/core/mcp-policy.js: 994f5dbca5c36e626d293ad5e9eac21a34261b3951f3f034fb31b6b0b81aeab5

Compose efetivo difere somente pela imagem; ambiente, volume /data/mcp, porta e redes preservados. Backup `docker-compose.yml.before-account-oauth-c4714450` 0600, SHA-256 481a398191d5d1b9e471338242bf9111d0373baf9781484c1f6a6b25e05c83cd; novo Compose a98bb519b5fb1530afe654f00a3b5af2820a659341e9d201fbf3463b970024ec. Saúde local 200, MCP anônimo local 401, seis hashes conferidos. Publicamente pela Casa: página de consentimento 200 HTML; /api/mcp 401 com challenge; metadata OAuth e /api/mcp-info 200 JSON. Sem mudança DNS/Pages, NPX, Agente Remoto ou ZIP: mesmo endpoint e contrato de consentimento; compatibilidade de protocolo não prova instalação real. Não repacotar sem alteração dos arquivos do pacote.

**Continuidade:** usuário pode iniciar/retomar a autorização pelo plugin ou Codex; confirmar consentimento real, executar `mcp_account_info` e `mcp_my_devices`, testar conta comum e admin com escopo admin explicitamente autorizado. Não simular autorização humana. Prova autenticada em produção e atendimento remoto próprio permanecem PENDENTES.

`ACCOUNT_OAUTH_HTTP_FIXTURE_TEST=APROVADO`; `ACCOUNT_OAUTH_RUNTIME_DEPLOY_READBACK=APROVADO`; `FIXED_POINT_PLUGIN_AUTHENTICATED_TOOL_CALL=PENDENTE`.
<!-- /CENTRALDARK_ACCOUNT_OAUTH_ROLE_CATALOG_20261128 -->

<!-- CENTRALDARK_OAUTH_LOOPBACK_COMPLETION_20261128 -->
### Conclusão OAuth local na mesma tela (28/11/2026)

**Evidência:** tentativa do usuário Codex às 12:29:21 UTC registrada como `oauth_authorize`, modo `account_session`, callback `http://127.0.0.1:59507/callback`. Não houve `oauth_token_issued` correspondente no log consultado. Porta 59507 sem listener na Casa e na Contabo na medição posterior; não prova que estava ausente na hora do clique. A configuração local do Codex `mcp_servers.centraldark.url` estava sem esquema HTTPS; corrigida somente para `https://mcp.centralldark.com/api/mcp`, TOML validado e demais entradas preservadas. Backup `config.toml.before-centraldark-callback-20261128T123536Z`. Não substituir o redirect_uri fornecido pelo cliente por um domínio público nem reaproveitar o código da captura.

**Core:** [e99a9b4c422e1bc88c46dcd4eebe57dfe6235030](https://github.com/ServerVpss/CentralDark/commit/e99a9b4c422e1bc88c46dcd4eebe57dfe6235030) em main, src/dist oauth.js e sessions.js, regressão account-oauth.test.mjs. Reutiliza a store de grants e o POST /authorize (action consent_status); não cria rota pública adicional, tabela, serviço, autenticação ou Worker. Recibo aleatório de 256 bits, hash associado ao grant, duração máxima de 5 minutos limitada pelo JWT, verificado somente com a mesma identidade/sessão/papel Supabase. Resposta de status não contém código ou credenciais. Estado pending enquanto existe código válido; authenticated apenas se existe access grant emitido após PKCE/exchange válido; desconhecido ou vencido nunca vira sucesso. Sem armazenamento persistente de grants novos. Compatibilidade dos callbacks HTTPS externos e pareamentos existentes preservada.

**Frontend:** fork `ServerVpss/CentralDarkDesktopCommanderMCP@centraldark/remote-pairing-web`, [fa6b48f7207ff39e7d69a782375e8f6bef9c9998](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/commit/fa6b48f7207ff39e7d69a782375e8f6bef9c9998), PR #1. Reutiliza a rota e cartão visual mcp-autorizar.tsx. Para loopback local, abre janela de retorno no gesto do usuário, entrega exatamente o callback registrado, preserva state e parâmetros originais, mantém o cartão em Permissão concedida e consulta o recibo até 60 segundos; se a janela for bloqueada oferece link Concluir no aplicativo. Autenticado com sucesso indica emissão da sessão OAuth pelo servidor, não prova tools/list ou execução. Se não confirmar, orienta nova conexão com listener ativo. Clientes HTTPS externos conservam navegação original. O navegador/cliente controla a janela de callback; não se promete ocultar ou fechar em todos os ambientes. README web atualizado. Nenhum código/token é exibido no texto da página ou persistido pelo componente.

**Testes:** 10 regressões de pareamento + 8 testes node:test (7 subtestes HTTP) passaram em contêiner descartável sem rede usando fixtures, na imagem base real. Inicialmente a expectativa do teste de status não considerou os campos de correlação adicionados pelo middleware; corrigida somente a asserção para aceitar esses metadados e exigir estado e campos permitidos; reteste 8/8. Validados pending antes de exchange, authenticated após exchange, conta divergente 404, sem sessão 401, origem inválida 403, PKCE inválido sem confirmação e regressões anteriores. Web: 9/9, TypeScript, Vite build e diff check aprovados. Primeiro script web perdeu acentos na transmissão PowerShell; regravados os arquivos a partir dos blobs canônicos com UTF-8 e verificados pelo build. Não declarar CI completa nem prova visual autenticada.

**Deploy localizado:** Contabo `centraldark/mcp:e99a9b4c-oauth-completion`, base `centraldark/mcp:c4714450-account-oauth`, image ID sha256:0fd100f405f386fab6a6c713fe2c142cf04a905b16c4a603224d54e5d7436ed1, contêiner 4ba41e778d3b → 8a6353c380d7. Somente dois arquivos dist alterados: oauth.js SHA-256 bdd705f50572c9735e5e2e420858996e7b9ebbc5b8070a2e93942a369461bab6; sessions.js SHA-256 4be60c8cfa0dfbfa80c368e067a6bffe863959022229f9b85edbbbc4c1efa04f (delta aplicado à base medida, sem introduzir eventos da main). Compose mudou somente imagem; env, portas, redes, volume preservados. Backup 0600 `docker-compose.yml.before-oauth-completion-e99a9b4c` SHA-256 a98bb519b5fb1530afe654f00a3b5af2820a659341e9d201fbf3463b970024ec; novo bb1afc770bd6d8664af37e67a0b9fea6309bd5ff464473ab3d965e07f8c050da. Saúde local 200, MCP e consulta de recibo anônimos 401.

**Pages/readback:** projeto existente centraldark-mcp, Wrangler 4.164.0, deploy https://29174eb4.centraldark-mcp.pages.dev, branch e commit acima. Pela Casa, domínio público /mcp-autorizar 200, asset /assets/index-C2wc_HqV.js 200, SHA-256 354bfff7ff197cf49234a6323b7b32bc9fc2f290ecace1f6d9c16d215f429d5a idêntico ao build local, marcadores de confirmação e consulta presentes, Referrer-Policy no-referrer, POST de consulta sem credencial 401 e /api/mcp anônimo 401. Não mudou ZIP, endpoint, DNS, Worker, Supabase, NPX ou Agente Remoto. Reinício do MCP invalida grants de conta em memória conforme limite documentado.

**Próximo passo:** iniciar nova autorização pelo cliente real (Codex com URL HTTPS corrigida), manter o listener local ativo e confirmar humanamente; observar oauth_token_issued, estado na tela e chamada autenticada de mcp_account_info. Se listener indisponível, não simular callback nem trocar localhost por domínio. Renovação persistente continua pendente.

`FIXED_POINT_OAUTH_COMPLETION_DEPLOY=APROVADO`; `FIXED_POINT_PLUGIN_AUTHENTICATED_TOOL_CALL=PENDENTE`.
<!-- /CENTRALDARK_OAUTH_LOOPBACK_COMPLETION_20261128 -->


<!-- CENTRALDARK_CASA_ENGINE_RECOVERED_20261128 -->
### Motor local recuperado — catálogo e leitura reais na Casa (28/11/2026)

**Resultado: motor local existente conectado e uma chamada de leitura comprovada.** A recuperação reutilizou o Casa Commander da porta `127.0.0.1:9101`, sem substituir o executor pelo fork compilado nem ampliar o preview de pareamento. Owner ativo `CentralDark-Casa-Agent.mjs`, blob `04bb9adc5cddc40d196bc1d6673f02d1908b224d`, igual à fonte canônica; listener PID 16256 conferido antes da ativação. O serviço não foi reiniciado por esta operação.

**Falha medida e causa:** o primeiro `tools/list` local autenticado retornou HTTP 200 com erro JSON-RPC `-32603`; o filho encerrou com código 1 às 05:03:31 UTC, antes de `MCP_INITIALIZE`. Em ensaio isolado, a mesma entrada e o mesmo Node 26.12.1 demonstraram `MODULE_NOT_FOUND: ajv`. Recuperar apenas esse módulo revelou outra ausência, `es-abstract/2025/Get`. A árvore do cache estava incompleta. O launcher também aponta por padrão para `F:\cache\npm`, ausente; esse drift não explica sozinho a queda da entrada direta e não foi alterado.

**Recuperação aplicada:**

- Mantido `@wonderwhy-er/desktop-commander@0.2.48`. A tentativa inicial de restaurar somente `ajv` reutilizou a cópia 8.20.0 já presente no SDK do mesmo cache, com 466 arquivos e hashes de árvore iguais; não foi suficiente para inicializar o motor.
- O `dry-run` do npm propôs 34 adições, 571 alterações e 6 remoções; não foi aplicado sobre a árvore ativa. A instalação isolada que reutilizou o cache global falhou por `ENOENT` de conteúdo do próprio npm. A recuperação completa usou diretório e cache de downloads exclusivos, versão do motor exata, `--ignore-scripts --no-audit --no-fund`; terminou com exit 0.
- A árvore isolada respondeu a `initialize` e `tools/list` com 26 ferramentas no mesmo Node 26.12.1; o processo de ensaio encerrou com código 0. Manifesto, lockfile e shim local foram conferidos. As dependências foram resolvidas novamente: isso não prova versões idênticas às da árvore antiga.
- Após confirmar identidade do serviço, `engine_connected=false` e ausência de consumidor usando o cache, a árvore antiga foi renomeada para backup exclusivo e a árvore aprovada ocupou **o mesmo caminho** `%LOCALAPPDATA%\npm-cache\_npx\81cb1ab08343aa85`. A receita previa restaurar o primeiro nome se o segundo rename falhasse. Os hashes conferiram após a troca. Nenhum novo launcher, tarefa, serviço, token ou vínculo foi criado.

| Evidência no alvo | Resultado |
| --- | --- |
| `POST /mcp` local autenticado, `tools/list` | HTTP 200, sem erro JSON-RPC, 10 ferramentas permitidas pela bridge |
| `POST /mcp` local autenticado, `tools/call: list_directory` | HTTP 200, `isError=false`; leitura da pasta Casa-Commander encontrou o arquivo esperado `CentralDark-Casa-Agent.mjs` |
| `GET /health` após a leitura e após a limpeza | HTTP 200, `engine_connected=true`, recibo `list_directory / READ_ONLY / verified=true` |
| `GET /mcp` sem credencial | HTTP 401, erro JSON-RPC `-32001` |
| Logger existente | `MCP_INITIALIZE PASS` às 05:17:09.715 UTC; `MCP_TOOLS_LIST PASS` às 05:17:09.767; `TOOL_RESULT list_directory PASS` às 05:18:08.698 |

A credencial da bridge foi reutilizada pelo mecanismo DPAPI existente, somente em memória, sem imprimir seu valor. Nenhum POST de pareamento recusado foi repetido por outra rota. As consultas autenticadas acima pertencem à bridge local e não emitem credenciais de dispositivo.

**Readback da árvore ativada (SHA-256):**

- Manifesto raiz: `1ef6be05693bf281c0ea5a81c34ff75383159c461391525b53834bec4b8eec3d`.
- Lockfile: `6ca46863c026c1c206535cdb2729de1ed4104d515a57437b3caf5c5e3dbfb6af`.
- Manifesto do motor: `d40e9b7da3a027eacdee3e0232507395991037749317ef145c7c68713e4ca0d9`.
- Entrada `dist/index.js`: `a4145198dc75cd34e7c7452c2054b4cc0d29e199ae1459961a17e4da25a13500`.

**Reversão e faxina:** backup preservado em `%LOCALAPPDATA%\npm-cache\_npx\81cb1ab08343aa85.centraldark-before-recovery-20261128`; ele também conserva a cópia anterior ao reparo parcial de ajv. Para reverter, primeiro comprovar que nenhum filho usa a árvore ativa, preservar a árvore recuperada e devolver o backup ao nome original. O cache exclusivo de downloads foi removido; a pasta de stage deixou de existir após a ativação. Saúde, recibo e lockfile foram relidos após a limpeza. Logs de prova e backup permanecem preservados. A pasta de ensaio antiga do executor indisponível `/workspace/scratch/e774bf64c555/centraldark_recipe_review` segue `PRESERVADO_COM_MOTIVO`; não foi simulada sua remoção.

**Limite e continuidade:** esta prova cobre o motor local, seu catálogo filtrado e uma ferramenta de leitura pela bridge existente. Não comprova todas as ferramentas, atendimento/acesso à tela, associação Supabase do vínculo legado (`owner_bound=false` na leitura anterior), transporte remoto do fork ou chamada pelo novo NPX/Tauri. Preservar o vínculo vivo e completar esses contratos no owner existente, sem acessar o entrypoint upstream para contornar a CLI restrita do fork. `FIXED_POINT_CASA_ENGINE_READ=APROVADO`; `FIXED_POINT_EXECUCAO_REMOTA=PENDENTE`.
<!-- /CENTRALDARK_CASA_ENGINE_RECOVERED_20261128 -->

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

### Continuidade — OAuth MCP durável (28/11/2026)
**Fonte e prova:** PR [#2194](https://github.com/ServerVpss/CentralDark/pull/2194) integrado em main `b4bd434d1946666f4739597329f532ef75516671`, fonte testada `1d4859eae4047d14f1c0b379269b99eb3ed4829c`. 26/26 regressões src, 11/11 src durável, 11/11 dist durável; variante exata da base Contabo, teste HTTP em contêiner Node 22 isolado sem rede 11/11. Sem promoção de eventos alheios à missão. Hooks canônicos PASS sem desativação. Frontend produção permanece commit [5f6c2ae](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/commit/5f6c2ae2d508ef8c9117c74e8c7fb292bcad28ed), Pages 581650b1.
**Contrato:** store MCP existente grava grants de conta criptografados AES-256-GCM com chave derivada do MCP_SESSION_SECRET, gravação atômica e confirmação antes de resposta; grant durável limitado a 30 dias e not_after da sessão original. Revalidação servidor-servidor de identidade e papel da conta existente por Edge `mcp-session-validate` e RPC invoker `public.mcp_validate_session_binding`, definer privado restrito ao service_role. Não copiar refresh token do navegador, não transferir service_role ao MCP ou cliente. Revogação por família em POST /token?action=revoke e da própria sessão autenticada em POST /authorize action=revoke_session. Ausência do validador conserva limite do JWT; indisponibilidade de validador configurado nega acesso e não consome refresh.
**Supabase:** migration efetivamente aplicada versão `20261128140242` nome mcp_validate_session_binding, mesmo blob `c72820f52afbdd653995be8a50bce0dc85f2d42d`; filename reconciliado com histórico remoto, não reaplicar a versão inicial gerada pela CLI. SQL transação revertida prévia com binding positivo/negativo, grants; readback service_role=true, anon=false, authenticated=false, public_definer=false. Edge v1 ACTIVE, id 63742809-7c7e-48fb-b1a9-ce04296dd3ce, sem chave dedicada retorna 503; nenhum segredo publicado. Advisors consultados, nenhum apontamento específico ao novo validador. Sem alterações de dados ou papéis.
**Contabo:** candidato local `centraldark/mcp:b4bd434d-durable-candidate` image digest sha256:4a8dd431adbb187bc094d41cd69f120887e388d4198e8ca48dfe5ccdb0755336; somente dist/sessions.js SHA256 6a46352f2f46b4587e52c6c79d4c878416003dc7d61066a80600cb6d443ff41f e dist/oauth.js SHA256 dc857e1642267d709d22119ac024e8894e96c1b70a043a665f86443c95601976. Candidato testado isoladamente, NÃO promovido. Instância ativa ainda `centraldark/mcp:e99a9b4c-oauth-completion`, não reiniciada. Chave dedicada CENTRALDARK_MCP_SESSION_VALIDATOR_KEY não provisionada: ferramenta bloqueou operação de provisionamento; não contornar nem expor valor. Ação indelegável atual: configurar mesmo segredo de 32 bytes aleatórios em hex no Supabase Edge Secrets e ambiente privado do Compose Contabo. Confirmar validador real antes de promover imagem; preservar credenciais e sessões existentes até o momento da troca.
**Rastro:** workspace canônico F:\.tmp\centraldark-oauth-final-20261128 e scratch Contabo /tmp/centraldark-mcp-oauth-20261128-1357 preservados até conclusão. Nenhum arquivo de segredo temporário criado (readback). Prosseguir no mesmo fio sem parar em próximo passo/next cursor; chamar usuário somente para autorização real ou ação que não possa ser feita por ferramentas disponíveis.
`PERSISTENCE_HTTP_FIXTURE=APROVADO`; `VALIDATOR_SCHEMA_DEPLOY=APROVADO`; `VALIDATOR_SECRET=PENDENTE`; `CANDIDATE_IMAGE_TEST=APROVADO`; `FIXED_POINT_INTEGRAL=PENDENTE`.

<!-- CENTRALDARK_OAUTH_DURABLE_PROMOTION_20261128 -->
### Atualização de estado — OAuth durável promovido na Contabo (28/11/2026)

Este recibo atualiza o estado histórico anterior: chave dedicada provisionada pelo CHEFE nos dois ambientes; função Edge ativa, candidato promovido. Não tratar as pendências antigas de provisionamento como atuais.

- **Validador:** RPC retornava HTTP 404 porque a chamada não selecionava explicitamente o schema public, com api priorizado. Correção Content-Profile: public na main [89ef4804](https://github.com/ServerVpss/CentralDark/commit/89ef480498d906205025b75c3af46ebcd0439cbe), blob ba502a72fad13887acd8846167d2c7ba946e6fda. Edge v8 ACTIVE, fonte idêntica à main, verify_jwt=false preservado e prova dedicada exigida. Prova humana na Contabo: HTTP 200, {"valid":false} para UUIDs fictícios; log Supabase function_edge_logs confirma 200, versão 8, 28/11/2026 15:50:04 UTC. Chaves correspondentes e rejeição de sessão inexistente comprovadas; identidade válida via cliente ainda pendente.
- **Promoção:** alterados somente image e referência ao arquivo de ambiente privado do serviço MCP no Compose. Configuração candidata comparada com original: nenhum delta adicional. Primeira tentativa retornou ao estado anterior (rollback PASS) por sondagem pública Python inadequada; contraprova na imagem anterior mostrou Python 403 e curl 401 nos dois hosts. Segunda tentativa com curl, sem desativar proteções: PROMOTION=PASS. Imagem ativa centraldark/mcp:b4bd434d-durable-candidate, SHA256 4a8dd431adbb187bc094d41cd69f120887e388d4198e8ca48dfe5ccdb0755336. Runtime dist/sessions.js e dist/oauth.js têm exatamente os hashes do candidato acima. Compose SHA256 2c2f946e67a5687905e3fbc7768106a0fb238f42ba14f233d16a303fde98f88b; backup privado original conferido bb1afc770bd6d8664af37e67a0b9fea6309bd5ff464473ab3d965e07f8c050da; override, volume /data/mcp, portas e redes preservados.
- **Contraprova:** health local HTTP200; GET público MCP/API HTTP401, POST tools/list anônimo HTTP401; catálogo declarado 164-6824a062c000, 164 ferramentas, sem definições inválidas ou nomes duplicados. Não equivale à execução autenticada de cada ferramenta. Nome da variável do validador presente no ambiente, sem exibir valores. A primeira reinicialização pode exigir novo login dos grants antigos que não eram persistidos.
- **Cliente:** Codex 0.160.1, servidor centraldark HTTP habilitado, status not_logged_in. Terminal CentralDark - OAuth Codex aberto no monitor principal para novo consentimento. Login/retorno, tools/list+call com sessão real, refresh, persistência após restart, revogação e catálogo ChatGPT permanecem pendentes. Nenhuma confirmação humana simulada. O fork e suas frentes de consolidação não foram promovidos nesta operação.

Continuidade: PR [#2172](https://github.com/ServerVpss/CentralDark/pull/2172), HUD [#1977](https://github.com/ServerVpss/CentralDark/pull/1977), PR durabilidade [#2194](https://github.com/ServerVpss/CentralDark/pull/2194). Scratch prévio preservado até a prova de sessão; limpeza do staging do Compose concluída pelo próprio procedimento.
`VALIDATOR_SECRET=APROVADO`; `VALIDATOR_NEGATIVE_BINDING_REAL=APROVADO`; `MCP_PROMOTION=APROVADO`; `AUTHENTICATED_CLIENT_E2E=PENDENTE`; `FIXED_POINT_INTEGRAL=PENDENTE`.
<!-- /CENTRALDARK_OAUTH_DURABLE_PROMOTION_20261128 -->

<!-- CENTRALDARK_OAUTH_DURABLE_E2E_20261128 -->
### Prova cliente real — OAuth durável, renovação e retorno (28/11/2026)

**Cliente/servidor:** após consentimento do CHEFE, Codex CLI 0.160.1 informou auth_status=o_auth. Novo app-server nativo stdio isolado, sem inferência de modelo e sem extrair tokens: configuração somente centraldark habilitado; mcpServerStatus/list (serverName=centraldark, detail=toolsAndAuthOnly) retornou oAuth, 147 ferramentas visíveis, mcp_account_info presente, sem toolsError, origem https://mcp.centralldark.com. Thread efêmera read-only; mcpServer/tool/call de mcp_account_info retornou structuredContent.result.ok=true, identidade presente, role=admin, isError=false. Não publicar a identidade. Receita reutilizável: gerar schema com codex app-server generate-json-schema; selecionar somente o MCP por configuração transitória, validar config/read, usar métodos nativos reais; structuredContent.result contém o payload espelhado, centraldark é metadado. Não usar codex exec como dependência da prova de transporte. Primeiras tentativas de override falharam invalid transport/isolamento, depois corrigidas sem mudar config habitual; primeira chamada teve parse incompleto do envelope, corrigido pelo owner tool-result-envelope.js. Sondagem exec sem resultado encerrada.

**Persistência e renovação reais:** state file no volume existente, modo 600, envelope AES-GCM presente, 2299 bytes após emissão; sem ler/decriptar credenciais. Log app filtrado pelo CIMD Codex: oauth_token_issued 2026-11-28T15:55:29.197Z, oauth_token_refreshed 2026-11-28T16:57:50.344Z, exatamente 1 renovação observada. TTL de access 1h. Reinício controlado apenas do contêiner centraldark_mcp-mcp-1 (imagem candidata já promovida, mesmo ID, volume, portas e redes), StartedAt 15:53:21.364568394Z -> 17:02:03.251798859Z; state_loaded 17:02:04.305Z; health200 e ambos hosts públicos sem autenticação401. Novo app-server e thread efêmera repetiram tools/list (147) e mcp_account_info admin com sucesso, exit0, sem novo login. Não revogar a sessão ativa para comprovar a própria revogação. Revogação e isolamento continuam comprovados nas fixtures anteriores; teste real de revogação com grant dedicado separado e catálogo ChatGPT ainda pendentes.

**Retorno visual:** as capturas do teste anterior confirmaram consentimento, sessão emitida, fallback popup branco e diálogo de seleção de aplicativo após 3s; o Windows não identificou associação codex:// corretamente. O mesmo CIMD oficial identifica CLI e desktop, portanto não inferir superfície pelo nome/OS. Em vez de forçar a abertura, opção explícita desktop inicia desmarcada; se marcada, mantém tentativa única após 3s quando recibo confirma sessão. Fallback Codex, após confirmação do servidor de estado pending e tentativa em background encerrada, navega para o callback registrado na mesma aba (sem criar popup), mantendo PKCE/host/porta/path/state e sem replay automático. Outros clientes preservados. Acesso loopback e fechamento/abertura de aba dependem do navegador; não alterar política LNA/COOP nem associação do Windows sem autorização específica. Se background falhar, a aba pode exibir a página final do próprio cliente local. [Referência Chrome](https://developer.chrome.com/docs/modern-web-guidance/guides/security/local-network-access) e [COOP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy).

**Fonte e deploy frontend:** fork PR #1, commit [ff5fa98c82a3edd4e63e34885a05294946c8fa70](https://github.com/ServerVpss/CentralDarkDesktopCommanderMCP/commit/ff5fa98c82a3edd4e63e34885a05294946c8fa70), três blobs conferidos (return-to d4552396b0fafe175238ae97decb46d8817a1682, rota 5b80ab308c92f1370b1a4d0cc770596a2c47223b, teste 8779c21bb31ee836870d85af91f785302ea88ca8). Testes 15/15, typecheck e Vite PASS após restaurar dependências existentes. Build com URL e publishable key públicos já publicados, guarda de configuração passou; nenhum segredo privado no bundle. Wrangler 4.164.0 existente, Pages produção 3bf6a69b-3db1-4745-b185-64b0e3521b6a, canonical success, branch centraldark/remote-pairing-web e commit conferidos. Domínio mcp.centralldark.com/mcp-autorizar HTTP200, CSP presente, asset index-D2J0u4J3.js SHA256 ca829a07fdd58eb57f9e12899086cc598d2176ae6dc626a862257b0e7a2d1d80 igual no dist, domínio e deployment (hash dos bytes via fetch arrayBuffer; primeira tentativa sobre texto decodificado não equivalia aos bytes). MCP sem credencial HTTP401. Rollback frontend 581650b1-9a53-4782-ad6d-926a53148074. Sem alteração de DNS, Worker, Cloudflare/WAF ou backend neste delta de UI.

`CLIENT_AUTH=APROVADO`; `TOOLS_LIST_REAL=APROVADO`; `TOOLS_CALL_REAL=APROVADO`; `REFRESH_REAL=APROVADO`; `RESTART_SESSION_REAL=APROVADO`; `FRONTEND_BUILD_DEPLOY=APROVADO`; `VISUAL_NEW_FLOW=PENDENTE`; `CHATGPT_RUNTIME=PENDENTE`; `REVOCATION_REAL_ISOLATED=PENDENTE`; `FIXED_POINT_OAUTH_DURABILITY=APROVADO`; `MISSION_FIXED_POINT=NO`. Preservar sessão atual; prova visual na próxima autorização real, não obrigar novo login apenas para abrir popup. Continuidade #2172 / #1977 / fork #1; migração integral das capacidades permanece em frente própria.
<!-- /CENTRALDARK_OAUTH_DURABLE_E2E_20261128 -->
