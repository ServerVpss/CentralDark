# CENTRALDARK REMOTE MCP GATEWAY

status: ATIVO_2026-09-08
owner: CENTRALDARK

## Rota operacional

- **Control plane primário:** `https://mcp.centralldark.com/mcp`
- **OAuth CentralDark:** `https://mcp.centralldark.com/authorize` → authorization code + PKCE S256 → `/token`
- **Remote Desktop Commander:** `https://mcp.desktopcommander.app/mcp` — legado/fallback opcional
- **Screenpipe local:** `http://127.0.0.1:3030`
- **Device:** `SEGREDO`

## Regra

CentralDark MCP é o control plane oficial e o fluxo padrão da Casa. O Bridge/Tray local autentica
diretamente no MCP CentralDark; Desktop Commander remoto deixa de ser requisito do fluxo normal e
permanece como capability/fallback quando explicitamente necessário.

```text
PRIMARY_CONTROL_PLANE=CENTRALDARK_MCP
DIRECT_MCP_AUTH=OAUTH2_PKCE
OWNER_CONSENT=ADMIN_PASSWORD_ON_CENTRALDARK_AUTHORIZE
TOKEN_EXCHANGE=AUTHORIZATION_CODE_PKCE
LOCAL_TOKEN_STORE=DPAPI_PER_PROFILE
LEGACY_REMOTE_ENABLED_BY_DEFAULT=false
REMOTE_DESKTOP_COMMANDER=OPTIONAL_FALLBACK
NPX_EBUSY_DOES_NOT_BLOCK_DIRECT_MCP=true
```

O fluxo chamado de “senha ou código” deve preservar a semântica real do OAuth atual: a senha é o
consentimento humano no `/authorize`; o servidor emite um authorization code ligado ao PKCE; depois
o cliente troca o code por access/refresh token e persiste localmente de forma protegida. O MCP
CentralDark **não declara device-code grant próprio** enquanto esse grant não existir na metadata e no
runtime vivo.

Nao expor senha, access token, refresh token, Authorization header, cookie ou secret no repo/log/receipt.

## Fluxo direto do Bridge da Casa

```text
CHEFE
→ CentralDarkBridge.exe (mesmo UI + Tray)
→ perfil Segredo/Fulano
→ cache/refresh DPAPI, se válido
→ senão https://mcp.centralldark.com/authorize
→ senha admin digitada na página CentralDark
→ authorization code + state
→ PKCE S256 /token
→ access + refresh protegidos por DPAPI
→ /admin/mcp initialize
→ tools/list
→ tool call real
→ receipt
→ Reality Judge
```

## Contexto local pelo MCP remoto

`CentralDark-Context-Sidecar.ps1` consulta o Screenpipe autenticado e grava um snapshot enxuto em
`GARIMPO-CHEFE/context/screenpipe-latest.json`. O Desktop Commander remoto pode ler esse arquivo
quando o agente precisar de contexto recente de tela/navegador, mantendo o dado na Casa.

`CentralDark-Remote-Bridge.ps1` sobe o sidecar e deve manter o pin provado
`@wonderwhy-er/desktop-commander@0.2.48 remote` até nova versão ser remensurada.
O pacote da Casa `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909` preserva o mesmo owner,
login URL e parser de device code, mas `latest` ali é evidência histórica/operacional,
não substitui automaticamente o pin canônico.

Para mais de uma conta, o modelo canônico é `MULTI_ACCOUNT_ISOLATED_HOME`: cada conta
usa um `HOME` próprio, um `device.json` próprio e um serviço/watchdog próprio, todos
passando pelo mesmo corredor Remote MCP/Desktop Commander.

Config canônica: `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json`.

## Padrão de idioma da CLI CentralDark

Toda mensagem destinada ao humano na CLI, instalador, bridge, painel de terminal e menus próprios da CentralDark deve aparecer em **português do Brasil**, de forma curta, legível e consistente.

```text
CLI_HUMANA_PADRAO=PT-BR
DETALHE_TECNICO_PODE_PRESERVAR_CHAVE_ESTAVEL=true
OUTPUT_EXTERNO_PODE_PERMANECER_NO_IDIOMA_ORIGINAL=true
OUTPUT_EXTERNO_DEVE_SER_MARCADO_COMO_DETALHE_EXTERNO=true
NAO_TRADUZIR_TOKEN_PROTOCOLO_ENDPOINT_SHA_OU_NOME_DE_FERRAMENTA=true
```

Padrão visual recomendado para superfícies próprias:

```text
[OK]       = operação concluída e provada no escopo
[INFO]     = informação observada
[AGUARDE]  = operação em andamento
[AVISO]    = atenção sem falha comprovada
[ERRO]     = falha observada
[PARADO]   = serviço/componente não ativo
[DESCONHECIDO] = estado ainda não provado
```

Títulos próprios também devem preferir português:

```text
BOOT / PRE-FLIGHT      -> INICIALIZAÇÃO / PRÉ-VOO
REMOTE MCP             -> MCP REMOTO
CONNECTING             -> CONECTANDO
CONNECTED              -> CONECTADO
RETRY                   -> NOVA TENTATIVA
DETAILS                 -> DETALHES
STATUS                  -> ESTADO
```

Exceção importante: texto emitido diretamente por ferramenta externa, por exemplo `Hermes Agent`, `npx`, PowerShell, Git ou Desktop Commander, não deve ser adulterado como se fosse saída nativa da CentralDark. A camada CentralDark deve enquadrar esse texto com um rótulo humano em PT-BR, por exemplo `DETALHE EXTERNO`, preservando a mensagem original para diagnóstico.

```text
CENTRALDARK_OUTPUT -> PT-BR
UPSTREAM_OUTPUT -> ORIGINAL + ROTULO_PTBR
MACHINE_LOG_KEYS -> ESTAVEIS
HUMAN_SUMMARY -> PT-BR
```

## Receipt da correção

OBSERVED_AT=2026-09-08
SOURCE=imagem da CLI/instalador e Remote Bridge fornecida pelo CHEFE
SCOPE=UX_CLI_IDIOMA
DELTA=padronizar superfícies humanas da CentralDark em PT-BR sem quebrar logs/protocolos externos
OWNER_REUSED=this_document
NEW_ENGINE=false
NEW_ROUTER=false
RUNTIME_LOCAL_PATCH=NOT_PROVEN
REPO_CONTRACT=PERSISTED
NEXT_CURSOR=localizar cada wrapper/launcher que imprime texto humano -> aplicar mapa PT-BR -> testar renderização -> contraprova -> receipt

`DOCUMENTED != EXECUTED`: este contrato fixa o padrão do repositório. Scripts locais ainda não presentes no GitHub ou wrappers gerados fora do repo precisam ser medidos antes de declarar a tradução aplicada fisicamente.

## 🔒 Cristal — ChatGPT opera a Casa do SEGREDO

```text
CHATGPT_CAN_OPERATE_CASA_SEGREDO=true
TRANSPORT=REMOTE_DESKTOP_COMMANDER
DEVICE=SEGREDO
DIRECT_FILE_OPERATIONS=true
DIRECT_PROCESS_EXECUTION=true
DIRECT_TERMINAL_EXECUTION=true
DIRECT_SEARCH_AND_INSPECTION=true
OBSERVABLE_ACTIONS_REQUIRED=true
CENTRALDARK_REMAINS_CONTROL_PLANE=true
```

Isto significa: uma sessão ChatGPT com o conector Remote Desktop Commander autorizado e o device `SEGREDO` online consegue operar diretamente a Casa — ler/escrever arquivos, pesquisar, executar processos/comandos e medir o estado local — sem depender de narrativa de outro agente.

Não significa presença física nem funcionamento quando o device estiver offline. O estado vivo deve ser remedido; a capacidade em si fica cristalizada como parte oficial da arquitetura da Casa.

### Receipt 2026-09-14

`DEVICE_SEGREDO=ONLINE`; `AUTH_TOKEN=VALID`; `REMOTE_PING=PONG`; comando remoto observou `hostname=SEGREDO` e `whoami=segredo\danda`; GitHub respondeu `200`; MCP CentralDark respondeu `200` com catálogo ativo. A operação da Casa por ChatGPT foi, portanto, observada no runtime e não apenas documentada.

## Decisao CURRENT — transporte privado Tailscale como prioridade (08/10/2026)

Intencao explicita do CHEFE: eliminar dependencias redundantes na operacao Casa/VPS, usar **Tailscale como transporte privado principal**, **MCP CentralDark como control plane e catalogo unico**, e **Hermes/executor nativo autorizado como corpo de execucao**. A bridge publica ja existente continua autenticada por OAuth2/PKCE; nao converte acesso a tailnet em acesso administrativo publico.

```text
CASA_VPS_PRIVATE_TRANSPORT_PRIORITY=TAILSCALE
CANONICAL_MCP_CONTROL_PLANE=CENTRALDARK_MCP
ADMIN_EXECUTION=AUTHORIZED_NATIVE_EXECUTOR
PUBLIC_BRIDGE=EXISTING_MCP_OAUTH2_PKCE
DESKTOP_COMMANDER_REQUIRED=false
DESKTOP_COMMANDER_DEFAULT_ROUTE=false
DESKTOP_COMMANDER_LEGACY_OPTIONAL=true
REMOVE_WORKING_COMPONENTS_AUTOMATICALLY=false
TAILSCALE_CONNECTED_IS_NOT_ADMIN_AUTHORIZED=true
NO_PARALLEL_BRIDGE=true
ONE_SYSTEM_ONLY=true
```

A prioridade diz respeito ao **roteamento novo**: nao depender do Desktop Commander para abrir, escrever, sincronizar ou monitorar a Casa. A ferramenta pode permanecer instalada/historica como fallback opcional, mas nao vira condicao de sucesso nem bloqueio do fluxo canônico. Falha na rota privada obriga descobrir outra rota autorizada existente; nao autoriza abertura publica indiscriminada de SSH, SMB, tela, tokens ou portas de administracao.

**Estado de prova:** Tailscale VPS/Casa e transferencia de `HUD.html` ja tiveram provas pontuais; escrita remota autenticada em `C:\Users\Administrador\Documents\Obsidian Vault\...` e sincronizacao bidirecional nao sao inferidas da conectividade da tailnet. Promover o efeito somente apos teste de permissao, readback, hash e criterio de rollback quando necessario.

**Owners reutilizados:** este documento, `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json`, `apps/modulos/mcp/`, `docs/HUD/HUD.html`. O config ja define `primary_control_plane=centraldark_mcp` e `legacy_remote_enabled_by_default=false`; manter sem editar para evitar delta cosmetico.


## Prova Tailscale Casa → iPhone — 2026-10-09

Registro append-only da medição realizada por SOL através do **Remote Desktop Commander** na máquina **SEGREDO** (Windows), durante a sessão de voz do CHEFE em 2026-10-09, horário local America/Bahia (-03:00). Esta evidência é **snapshot histórico verificável**, não afirmação de conectividade permanente ou de acesso à tela do celular.

### Alvo, binding e evidência

```text
ORIGEM=SEGREDO (Windows; Tailscale 100.123.93.25)
ORIGEM_EXECUCAO=Remote Desktop Commander / shell PowerShell
DESTINO=celular-segredo-iphone (iOS; Tailscale 100.91.226.70)
OUTRO_PEER_LISTADO=centraldark-os (Linux; Tailscale 100.90.199.124)
DATA_DA_MEDICAO=2026-10-09
STATUS_DISCOVERY=PEER_PRESENT
TAILSCALE_PING_RESPONSES=3/3
PONG_1=98ms via DERP(sao)
PONG_2=86ms via DERP(sao)
PONG_3=86ms via DERP(sao)
P2P_DIRECT=NOT_ESTABLISHED
TAILSCALE_PING_PROCESS_EXIT=1
IP_REACHABILITY_VIA_TAILSCALE_DERP=PASS
IPHONE_SCREEN_ACCESS=UNKNOWN_NOT_TESTED
IPHONE_REMOTE_CONTROL=UNKNOWN_NOT_TESTED
VPS_TO_IPHONE_DIRECT_PROBE=UNKNOWN_NOT_TESTED
PROOF_SCOPE=CASA_WINDOWS_TO_IPHONE_VIA_DERP_AT_OBSERVED_TIME
```

O `tailscale ping` entregou três `pong` válidos **via DERP São Paulo**, mas finalizou com `direct connection not established` e código de saída **1**. Portanto **ping por retransmissão PASS** e **P2P direto NÃO estabelecido** são fatos compatíveis; não promover o comando inteiro a PASS nem inferir controle do telefone.

### Receita de replay — REUSE_BEFORE_CREATE

No PowerShell da **mesma máquina SEGREDO**, pela rota de shell autorizada já disponível:

```powershell
& 'C:\Program Files\Tailscale\tailscale.exe' status
& 'C:\Program Files\Tailscale\tailscale.exe' ping --c=3 100.91.226.70
```

1. Identificar novamente o peer `celular-segredo-iphone`, iOS, e **confirmar IP atual**, que pode mudar. Se mudou, usar o IP novo retornado pelo `status`, não o histórico por suposição.
2. Observar `pong`, contagem, latência e tipo de rota (DERP/P2P); registrar **separadamente** mensagens de falha, exit code e P2P.
3. O mesmo binding pode ser usado via Remote Desktop Commander enquanto disponível; não criar outra bridge/daemon/owner para repetir o teste.
4. Só alegar acesso à tela, controle do iOS ou transferência de dados após uma prova específica dessas capacidades. Tailscale apenas fornece transporte.

```text
FIXED_POINT_DESTA_MEDICAO=REACHABILITY_DERP_PROVEN_AT_DATE
NO_NEW_ARCHITECTURE=true
REPLAY_TRIGGER=NEED_TO_RECHECK_CURRENT_REACHABILITY
INVALIDATION=PEER_IP|ONLINE_STATE|TAILNET_AUTH|TRANSPORT_PATH|DEVICE_STATE_CHANGED
NEXT_CURSOR=REMEASURE_iphone_route_only_when_needed; keep screen/control as UNKNOWN
```


## Delta ZENDRIVE / MCP nativo — 2026-10-17

O controle canônico permanece **CentralDark MCP** e a extensão VS Code
`skills/vs-code-restore` expõe agora:
`centraldark.probeVpsSsh` (sonda read-only com SSH Tailscale → público)
e `centraldark.connectVpsSsh` (picker do Remote-SSH já existente).
O comando de foco `centraldark.zendriveCli` permanece inalterado.
O alias e a identidade SSH da Casa continuam sob o owner humano original.

No mesmo owner `apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js`,
`tailscale_bridge_status` agora possui fallback LOCAL `tailscale status --json`
somente quando o Broker HTTP falha. O fallback retorna disponibilidade
do Tailscale da VPS, não valida controle administrativo, OAuth,
API key ou SSH da Casa; as duas falhas seguem evidentes.

**Status nesta etapa:** delta de código em PR isolado;
instalação da extensão e recarga MCP na Casa/VPS seguem ações distintas.
Nenhuma publicação automática. Não criar gateway paralelo.



## 2026-10-17 — Desktop Commander: cascas, tool-call e visualização no Instinto Superior

**Garimpo factual, sem substituir owners:**

| Camada | Artefato canônico | Responsabilidade |
|---|---|---|
| Máquina VPS | `/root/CentralDark` | Checkout da CentralDark que contém scripts e unidades declarativas |
| Entrada de unidade | `/etc/systemd/system/centraldark-desktop-commander*.service` | Destino definido pelo instalador; arquivo instalado efetivo exige inspeção do host |
| Executável de perfil | `/usr/local/sbin/centraldark-desktop-commander-profile.sh` | Destino de instalação do runner existente |
| Perfil principal | `/root` | HOME do perfil principal |
| Perfil segunda conta | `/root/.desktop-commander-profiles/conta2` | HOME isolada, sem compartilhar refresh token |
| Locks | `/run/centraldark-desktop-commander-<profile>.lock` | Impede múltiplas instâncias no mesmo perfil |
| Health/watchdog | `infra/systemd/centraldark-desktop-commander-watchdog.sh` | Verifica systemd/PIDs/cgroup/logs; não altera owner do remoto |
| Logs de watchdog | `/var/log/centraldark-desktop-commander-watchdog.log` | Histórico do watchdog no host |
| Pacote usado pela VPS | `@wonderwhy-er/desktop-commander@0.2.48 remote` | Processo do pacote público local em modo remoto |
| Serviço remoto de terceiro | `https://mcp.desktopcommander.app/mcp` | OAuth e encaminhamento ao device agent; implementação hospedada é fechada |
| Captura das calls da própria CentralDark | `apps/modulos/mcp/src/audit-logger.js` | Evento sanitizado `mcp_tool_execution`, com call/correlation/duration/ok |
| Admin/MCP NOC existente | `apps/modulos/mcp/src/admin.js` | `/admin/logs/stream`, `/admin/api/logs` e Tool Call Lens no MESMO painel protegido |
| Projeção no Cockpit | `apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx` | Consome apenas a consulta autenticada /admin/api/logs no owner Admin existente |

**Fonte externa pública** (revisada em 2026-10-17):
- DesktopCommanderMCP (implementação local): `https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/src/server.ts`
- Remote Desktop Commander (docs e manifests públicos, implementação cloud privada): `https://github.com/desktop-commander/remote-desktop-commander`

### Fluxo de processo que queremos acompanhar

```text
CLIENTE AUTORIZADO → REMOTE MCP OAuth → DEVICE AGENT
  ├─ start_process → PID de processo FILHO + leitura inicial
  ├─ read_process_output(pid) → offset/novas linhas + exit code
  ├─ interact_with_process → input autenticado sob escopo do dono
  └─ process completed → encerramento e recibo
        ↓ (se atravesar MCP CentralDark, fluxo auditado)
    auditToolExecution → subscribeAuditEvents
        ↓ metadata whitelisted (nunca input/output bruto)
    pushAdminLog(mcp_tool_call) → /admin/logs/stream /admin/api/logs
        ↓ mesma autenticacao do MCP Admin
    Tool Call Lens · Admin + Observabilidade do Instinto Superior
```

Na captura CHEFE:
- `start_process` mostrou PID `16424` para PowerShell local do device conectado;
- `read_process_output` para PID `16424` devolveu `NODE_MODULES=True`, `LOCAL_GALLERY=True`, `LOCAL_AUTH=True`, `VPS_ONLINE`, `DEPS_YES`, `active`, `exit code 0`, `runtime 3.83s`;
- `transport=broadcast_v1` e `dispatch_device_status=online` pertencem ao caminho do conector externo, **não** ao protocolo público do MCP CentralDark.

**Limite preciso:** a assinatura `subscribeAuditEvents` registra somente chamadas que atravessam o MCP CentralDark. A call do Remote Desktop Commander feita diretamente pelo ChatGPT/Codex é visível no próprio cliente, mas não cruza automaticamente o MCP CentralDark. Logo, não afirmar que o Tool Call Lens já vê todos os dispositivos ou todas as execuções externas. Para absorção integral, deverá existir adaptador autorizado de eventos do cliente, com `source=REMOTE_DESKTOP_COMMANDER_CLIENT`, `client_call_id`, `device_id` e `receipt_ref` correlacionados. Não extrair stdout completo sem contrato privado/autorização.

**Estado do delta de UI e telemetria:**
- PR #1842 — `admin.js`: subscrição em audit-logger; metadados permitidos; pausa/revisão visual em SSE/Admin; `index.js`: CORS de **somente GET** para origins autorizadas nos endpoints autenticados de logs/metricas.
- PR #1838 — `ObservabilidadeCentralDark.tsx`: seção Tool Call Lens reutilizando owner Observabilidade/mesma API Admin. Polling 5s, pausa, revisão, filtro e correlação.
- `isAdmin(req)` continua exigido; autenticação administrativa não foi substituída por CORS.
- Código em PR != serviço publicado. Instinto Superior deve recarregar o componente e MCP deve recarregar o código após promoção aprovada.

**NEXT_CURSOR:** CI same HEAD #1842 e #1838 → deployment de cada owner na ordem causal (MCP antes do Cockpit) → cookie/admin readback (401/200) → registrar chamadas em `/admin/api/logs` → observar widget ao vivo → correlação opcional REMOTE_MCP_CLIENT ≠ MCP_NATIVO. Não promover `UI_OBSERVED` a `EXECUTION_PROVEN`.

## 🧬 Contrato autônomo: construir → instalar → conectar → provar → antirregressão

Contrato de entrega do CHEFE — 2026-10-17. Reutilizar owners: ZENDRIVE VS Code, MCP CentralDark, SSE Admin e Observabilidade do Cockpit. Não criar gateway nem executor paralelo.

| Fase | Ação | Evidência para avançar | Falha |
|---|---|---|---|
| 01 CONSTRUIR | Fixar HEAD, compilar e testar | build exit=0; artefato identificado pelo SHA | BUILD_BLOCKED |
| 02 INSTALAR | Instalar artefato validado na Casa autorizada | versão instalada e timestamp do ambiente de destino | INSTALL_BLOCKED |
| 03 CONECTAR | Reusar SSH/MCP/SSE e sessão existente | handshake autenticado, rota, PID e endpoint real | CONNECT_BLOCKED |
| 04 PROVAR | Executar diagnóstico inofensivo e colher PID, read_process_output e exit code | recibo correlacionado (CID, fonte, PID e duração), saída sanitizada | PROOF_BLOCKED |
| 05 ANTIRREGRESSÃO | Testar owners afetados e comparar antes/depois | VS Code aberto, temas, ferramentas, login, HUD, SSE sem regressão | REGRESSION_BLOCKED |

Cada fase avança SOMENTE após readback PASS. Erro para a sequência, registra owner, sha, observed_at e next_cursor. Desconhecido não vira verde.

### Execução autônoma no escopo aprovado

- Inventário read-only, edição incremental em branch isolada, build, testes, empacotamento e validação local de desenvolvimento são automáticos quando a ferramenta de execução estiver disponível.
- Mudanças em main, VPS de produção, contas, segredos, ACL, publicação e limpeza destrutiva preservam a aprovação explícita de promoção estabelecida pelo CHEFE.
- Desktop Commander externo e MCP próprio não são equivalentes: o Tool Call Lens atual só vê auditoria do MCP que atravessa esse owner.
- O Browser conectado ao ChatGPT não é uma ponte automática de execução em Code.exe.

### Receita determinística de aceite

1. Medir o HEAD e a árvore de alterações; um writer por owner; não sobrescrever trabalho de outro agente.
2. Build/test/empacotamento; guardar sha e recibos.
3. Instalar a versão do artefato na Casa e reler a versão efetiva, sem abrir outro VS Code.
4. Conectar por sessão autenticada já existente; provar o handshake e as rotas.
5. Rodar comando inofensivo; correlacionar start_process, PID, leitura de saída incremental, fim e exit code.
6. Rodar antirregressão: ZENDRIVE CLI, SSH/PID, Tool Call Lens (ao vivo/pausa/rever), Cockpit, quatro peles, autenticação e HUD.
7. Persistir recibo detalhado por fase no PR e projetar o resultado no HUD; parar no primeiro bloqueio.

Regra do placar: SOURCE_WIRED, BUILD_PASS, INSTALLED, CONNECTED, RUNTIME_PROVEN e ANTI_REGRESSION_PASS são dimensões distintas. LOCAL_FIXED_POINT somente com provas das fases 1-5; não implica MAIN ou VPS_DEPLOYED.


## 🧬 Forja Autônoma — botão e receita (17/10/2026)

**REUSE_BEFORE_CREATE:** botão no Admin MCP existente, aba Auditoria → Tool Call Lens; entrada no Cockpit existente, área Observabilidade; dispatcher existente /admin/api/intent → intent-cycle-adapter.js → fila original HERMES-CORE. Sem segundo executor, segundo gateway ou nova fila.

### Uma intenção → cinco etapas sequenciais

1. ANTIRREGRESSÃO. Antes de editar: coletar HEAD, origin/main, worktree, writer atual, testes do owner; sem reset, clean, force-push, nem sobrescrever trabalho concorrente. Casa: npm run verify:hud, npm run lint em apps/instinto-superior; MCP: node --test apps/modulos/mcp/tests/intent-cycle-adapter.test.mjs e node --test apps/modulos/mcp/tests/tool-call-observability.test.mjs. Exigir exit code, timestamp e fonte.
2. CONSTRUIR. Sob mesmo writer, npm run build no cockpit e npm run compile em skills/vs-code-restore quando aplicável. Gravar hash do artefato, HEAD e comprovante de build. Build concluído não é instalação.
3. INSTALAR. Atualizar somente o artefato local autorizado na Casa, preservando a versão anterior, possibilidade de rollback e arquivo de prova. Não instalar nem deployar na VPS apenas por apertar o botão.
4. CONECTAR. Testar a rota existente VS Code ZENDRIVE → SSH/Remote-SSH → VPS e MCP CentralDark → Hermes, usando identidades atuais. Distinguir HEAD da Casa, identidade SSH, Tailscale CLI, API OAuth e servidor MCP. Gravar readback sem segredos.
5. PROVAR. Repetir antirregressão após instalar; testar UI e comandos relevantes; comparar hash do instalado e compilado; registrar estado real, exit codes, duração, objetivo/GOAL e Critic do Hermes. UNKNOWN/FAIL = parar; PASS por fase somente com recibo tipado do mesmo SHA.

### Contrato do recibo do Hermes

Na missão concluída original criar o arquivo forja-4x-receipt.json ao lado de missao.md, state.json e finalization-receipt.json. Caminho relativo:

    apps/modulos/HERMES-CORE/missions/concluidas/YYYY-MM-DD/centraldark-intent-<fingerprint24>/forja-4x-receipt.json

Formato de referência (campos entre sinais angulares são EXEMPLOS, não resultados):

~~~json
{
  "schema": "centraldark.forja.4x.receipt.v1",
  "fingerprint": "<fingerprint SHA256 da missão>",
  "sourceHead": "<HEAD Git de 40 caracteres>",
  "stages": [
    {"id":"ANTIRREGRESSAO","status":"PASS","sourceHead":"<HEAD>","exitCode":0,"observedAt":"<ISO UTC>","antiregression":"PASS","receipt":"<teste e log>"},
    {"id":"CONSTRUIR","status":"PASS","sourceHead":"<HEAD>","exitCode":0,"observedAt":"<ISO UTC>","antiregression":"PASS","receipt":"<build e hash>"},
    {"id":"INSTALAR","status":"PASS","sourceHead":"<HEAD>","exitCode":0,"observedAt":"<ISO UTC>","antiregression":"PASS","receipt":"<instalação local>"},
    {"id":"CONECTAR","status":"PASS","sourceHead":"<HEAD>","exitCode":0,"observedAt":"<ISO UTC>","antiregression":"PASS","receipt":"<SSH/MCP readback>"},
    {"id":"PROVAR","status":"PASS","sourceHead":"<HEAD>","exitCode":0,"observedAt":"<ISO UTC>","antiregression":"PASS","receipt":"<teste E2E/Critic>"}
  ]
}
~~~

Cada etapa exige mesmo fingerprint/SHA, timestamp plausível de até 7 dias, exitCode 0, antiregression PASS e recibo. FAIL interrompe, SHA divergente volta a UNKNOWN. É um contrato de evidência; só os hashes e o readback real de cada artefato estabelecem instalação e conexão.

### Operação do botão existente

No Admin MCP autenticado: Auditoria → 🧬 Construir → Instalar → Conectar → Provar. POST same-origin /admin/api/intent com mode AUTONOMO encaminha um único GOAL, deduplicado por fingerprint. O botão Relê recibo usa GET na mesma rota e exibe as cinco fases via forja4x.stages. Não repete ferramentas ao rever; registra somente observação. O Cockpit aponta para a aba Admin já autenticada; a autenticação, o worker e o Tool Call Lens permanecem os existentes.

Gates globais: SOURCE_CURRENT, MCP_HEALTH, ONE_HEART, CI_SAME_SHA, HERMES_RUNTIME, OBJECTIVE_EFFECT, RECEIPT. O estado ENFILEIRADO não é EXECUTADO; FIXED_POINT exige etapas válidas, Critic, mesmos SHAs e critérios completos. Promoção para main/VPS exige autorização separada do CHEFE, revisão de PR e receipt de deploy. MERGED != DEPLOYED.

Código da missão/receipts: apps/modulos/mcp/src/intent-cycle-adapter.js. UI Admin: apps/modulos/mcp/src/admin.js. UI Cockpit: apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx. Tests: intent-cycle-adapter.test.mjs; tool-call-observability.test.mjs. PR MCP/ZENDRIVE #1842 e PR UI/HUD #1838.

NEXT_CURSOR: instalar a branch no runtime autorizado, clicar uma vez, medir ACK da fila, acompanhar o Hermes original, reler cada etapa, executar testes localizados; somente depois avaliar promoção separada.
