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
