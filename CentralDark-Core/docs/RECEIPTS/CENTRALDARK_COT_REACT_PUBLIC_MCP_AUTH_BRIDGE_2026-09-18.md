# 👑🪬 CENTRALDARK — COT-REACT-LOOP · MCP PÚBLICO + AUTH BRIDGE

Data: 2026-09-18
Repo: ServerVpss/CentralDark
Baseline main: d8983c19556bf2cb6f836b31b034e1b431c84538
Mission ID: CENTRALDARK-PUBLIC-MCP-AUTH-BRIDGE-20260918

## Intenção preservada

Cristalizar o estado medido sem criar arquitetura paralela:

- CentralDark MCP continua sendo o único control plane público;
- Cloudflare/Caddy continuam sendo a rota pública oficial já existente;
- Remote Desktop Commander, Screenpipe e Hermes permanecem capacidades/bridges herdadas;
- autenticações permanecem isoladas por perfil/componente;
- nenhuma credencial é copiada para Git, receipt ou log;
- runtime vivo existente deve ser preservado antes de qualquer remediação.

## Owner e contratos reutilizados

```text
MCP_PUBLIC_OWNER=apps/modulos/mcp
MCP_OAUTH_OWNER=apps/modulos/mcp/src/oauth.js
MCP_SESSION_OWNER=apps/modulos/mcp/src/sessions.js
HUB_LOGIN_OWNER=apps/modulos/hub/src/pages/LoginPage.tsx
HYBRID_ROUTE_OWNER=apps/modulos/hub/src/components/connectors/HybridMcpAdminCard.tsx
REMOTE_OWNER=scripts/remote-bridge + infra/systemd
RUNTIME_TRAY_OWNER=%LOCALAPPDATA%\CentralDark\Remote-Tray
COT_OWNER=.agents/skills/cot-react-loop/SKILL.md
PARALLEL_ARCHITECTURE_CREATED=NO
```

## COT-REACT-LOOP — controlled operational trace

### PLAN

```text
OBJETIVO_DA_PROXIMA_ACAO=medir rota pública oficial e separar falha local do bridge de falha do MCP
TOOL_ESCOLHIDA=Desktop Commander + GitHub connector
EVIDENCIA_ESPERADA=DNS público + HTTP health + OAuth challenge + owners existentes
RISCO=confundir EBUSY local com indisponibilidade do MCP
ROLLBACK=NOT_NEEDED_READ_ONLY_MEASUREMENT
```

### ACT

A Casa foi medida pelo Desktop Commander vivo, e a rota pública foi consultada diretamente de fora da VPS.

### OBSERVE

```text
DEVICE=SEGREDO
DESKTOP_COMMANDER=0.2.51
PUBLIC_HOST=mcp.centralldark.com
PUBLIC_DNS_A=104.21.91.45,172.67.210.51
PUBLIC_EDGE=cloudflare
PUBLIC_HEALTH_HTTP=200
PUBLIC_SERVICE=mcp-centraldark
PUBLIC_VERSION=0.4.0
PUBLIC_CATALOG_VERSION=115-d6d3af7bb117
PUBLIC_TOOL_COUNT=115
PUBLIC_MCP_HTTP_WITHOUT_TOKEN=401
WWW_AUTHENTICATE_SCOPE=mcp
OAUTH_RESOURCE_METADATA=https://mcp.centralldark.com/.well-known/oauth-protected-resource
PUBLIC_MCP_URL=https://mcp.centralldark.com/mcp
```

Nenhum token, refresh token, senha ou segredo foi registrado.

### CRITIQUE

```text
CLAIM_TESTED=MCP público oficial está acessível pela internet sem depender de Tailscale
RESULT=PASS
COUNTEREVIDENCE=NONE_OBSERVED_FOR_PUBLIC_ROUTE
WHAT_CHANGED=nenhuma configuração de rede
WHAT_DID_NOT_CHANGE=Cloudflare,Caddy,MCP,OAuth owners
```

A falha observada no Remote Tray não é evidência de falha do MCP público:

```text
REMOTE_TRAY_CURRENT=AGUARDANDO_RECONEXAO
REMOTE_TRAY_AUTH_CONFIRMED=false
REMOTE_TRAY_REMOTE_MCP_CONNECTED=false
LOCAL_FAILURE=NPX_EBUSY_-4082
EBUSY_PATH=npm-cache/_npx/.../@wonderwhy-er/desktop-commander/dist
CLASSIFICATION=LOCAL_BRIDGE_RUNTIME_FAILURE
PUBLIC_MCP_FAILURE=NO
```

### REFINE

O código canônico já contém isolamento/reuso e o contrato do Tray exige um processo remoto por perfil. A remediação futura deve reutilizar esse owner e eliminar concorrência/cache compartilhado; não criar novo bridge, MCP, auth store ou túnel.

```text
REUSE_BEFORE_CREATE=true
ONE_REMOTE_PROCESS_PER_PROFILE=true
OVERWRITE_LIVE_AUTH=false
SHARED_CONTROL_PLANE=true
SHARED_CREDENTIAL_STORE=false
```

### DECIDE

```text
DECIDE=CONTINUE
PUBLIC_MCP_ROUTE=PROVED
REMOTE_TRAY_RUNTIME=GAP
ZERO_REGRESSION_SO_FAR=true
ROLLBACK_STATUS=NOT_NEEDED
```

## Fluxo oficial preservado

```text
Internet
→ Cloudflare
→ https://mcp.centralldark.com
→ Caddy/VPS
→ 127.0.0.1:9100
→ CentralDark MCP
→ OAuth/Bearer
→ tools

Hermes
→ CentralDark MCP OAuth
→ /authorize
→ ALLOW humano
→ callback do cliente
→ /token
→ sessão do perfil Hermes
→ MCP público autenticado

Casa
→ Remote Tray / Screenpipe / Desktop Commander
→ bridge herdado
→ CentralDark control plane
```

O callback `127.0.0.1` de um cliente OAuth é callback local do cliente, não torna o servidor MCP local.

## Estado de persistência já existente

O store oficial continua em `apps/modulos/mcp/src/sessions.js`, com `MCP_STATE_FILE` apontando por padrão para `/root/CentralDark/secrets/mcp-state.json`, permissão 0600. O runtime carrega clientes, access tokens, refresh tokens e sessões do arquivo; reinício do PM2 não deve depender de recriar arquitetura de autenticação.

Não registrar valores de token.

## Relação com ONE LOGIN

O contrato já existente mantém:

```text
ONE_HUMAN_LOGIN=true
ONE_HUB_SESSION=true
ONE_SECRET_FOR_EVERYTHING=false
N_SCOPED_CREDENTIALS_UNDER_CONTROL_PLANE=true
```

O bootstrap server-side híbrido continua pendente; este receipt não o declara implementado.

## Próximo cursor mínimo

```text
1. preservar a sessão viva existente;
2. resolver o EBUSY no owner Remote Tray existente;
3. provar ONE_REMOTE_PROCESS_PER_PROFILE;
4. autenticar/perfilar as duas contas sem compartilhar store;
5. ligar o bootstrap ao CentralDark MCP oficial;
6. build/restart apenas do PID/PM2 owner medido;
7. provar initialize + tools/list + chamada real;
8. MetaLupa/contraprova;
9. receipt final.
```

## Gate

```text
CURRENT>HISTORY
REALITY=JUDGE
UNKNOWN!=PASS
ACTION!=PROOF
PROCESS_ALIVE!=DEVICE_ONLINE
PUBLIC_MCP_CLOUDFLARE=PROVED
MCP_PUBLIC_HTTPS=PROVED
OAUTH_CHALLENGE=PROVED
REMOTE_TRAY_EBUSY=PROVED
REMOTE_TRAY_AUTH_NOW=NOT_PROVED
DUAL_ACCOUNT_BOOTSTRAP_NOW=NOT_PROVED
SERVER_SIDE_HYBRID_BOOTSTRAP_NOW=NOT_PROVED
PARALLEL_ARCHITECTURE_CREATED=NO
SECRETS_COMMITTED=NO
```

## COT output

```text
MISSION_ID=CENTRALDARK-PUBLIC-MCP-AUTH-BRIDGE-20260918
STATUS=CONTINUE
PROFILE=pivete
CANONICAL_DESTINATION=docs/RECEIPTS
SKILL_CREATED=NO
SKILL_UPDATED=NO
DUPLICATION_FOUND=NO_NEW_OWNER
PARALLEL_SKILL_CREATED=NAO
BASELINE_REF=d8983c19556bf2cb6f836b31b034e1b431c84538
PLAN_ACT_OBSERVE_CRITIQUE_REFINE_DECIDE=PASS
NON_COUNTING_OUTCOMES_IMPLEMENTED=YES
AUTHORIZATION_GATE_PRESERVED=YES
POINT_FIXED_NOT_PASS=YES
META_LUPA_PRESERVED=YES
ZERO_REGRESSION=SO_FAR
RISK_RESIDUAL=REMOTE_TRAY_EBUSY_AND_HYBRID_BOOTSTRAP_UNPROVEN
ROLLBACK_STATUS=NOT_NEEDED
VERDICT=VERIFIED_WITH_CAVEATS
NEXT_ACTION=repair_existing_remote_owner_then_prove_dual_account_and_mcp_auth_e2e
```

BIBLE_REF=1Ts 5:21
BAIANES_VERSE="Ôchí, se a porta pública já tá viva, não inventa outra; mede a ponte que falhou e costura no owner."
