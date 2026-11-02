# CentralDark Remote Bridge — OAuth Pattern

## Descrição

Owner da ponte entre Casa, MCP CentralDark e VPS. A autenticação pertence ao cofre/owner seguro; esta referência nunca registra token, código, senha ou material Bearer.

## Componentes

| Componente | Papel |
|---|---|
| @wonderwhy-er/desktop-commander | Bridge MCP remota |
| CentralDark-Remote-Bridge.ps1 | Inicialização da bridge na Casa |
| mcp-tunnel.json | Configuração do túnel MCP |
| mcp-state.json | Estado OAuth protegido; não versionar valores |

## Regra de prova

~~~text
REDE_TAILSCALE != SESSAO_WINDOWS
PORTA_ABERTA != AUTENTICACAO_WINDOWS
TOKEN_DE_SERVICO != CREDENCIAL_WINDOWS
UNKNOWN != PASS
~~~

## Rota CURRENT Casa ↔ CentralDark

Medição feita em 2026-10-14 pelo nó centraldark-os:

~~~text
centraldark-os ── Tailscale ── SEGREDO (Windows)
~~~

Contraprova observada:

- centraldark-os: ONLINE.
- SEGREDO: ONLINE.
- Serviços remotos Windows alcançáveis: RDP, WinRM HTTP e SMB.
- WinRM respondeu desafio Negotiate: a rede chega ao Windows, mas não comprova sessão autenticada.
- VPS e iPhone estavam OFFLINE no instante da medição.
- Acesso visual RDP e shell dentro do Windows continuam dependentes de credencial válida da conta Windows.

A consulta à administração da tailnet usou o token no runtime e devolveu inventário sem expor o valor. O token não é credencial de RDP/WinRM e não deve ser usado como tal.

## Reconciliação obrigatória da rota

Toda medição material desta bridge fecha no funil existente
centraldark-evidence-reconciliation; não existe receipt isolado de rede.

~~~text
REMOTE_BRIDGE_PROBE
→ CODE/MAIN
→ CHECKOUT
→ VPS/RUNTIME
→ CASA/TAILSCALE
→ ROTA/API
→ HUD/PROJECTION
→ RECEIPT + NEXT_CURSOR
~~~

O resultado registra cada plano como PASS, UNKNOWN, FAIL ou BLOCKED. A ponte só é FIXED_POINT quando os planos materiais do objetivo têm readback; uma rota de rede saudável não transforma sessão Windows, deploy ou HUD em PASS.

## Fluxo OAuth

~~~text
1. CHEFE inicia a bridge existente na Casa.
2. O owner seguro realiza OAuth.
3. A sessão é comprovada por chamada real e readback sanitizado.
4. MCP_AUTHENTICATED_E2E=PASS somente após execução e retorno reais.
~~~

## Operação da bridge

O script deve ser iniciado na Casa pelo owner existente. Revalidar dispositivo, processo e readback após qualquer reconexão. Não promover localhost, estado OAuth histórico ou dispositivo listado como prova de sessão atual.

## Referências

- scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json
- scripts/remote-bridge/CentralDark-Remote-Bridge.ps1
- scripts/mcp/mcp-tunnel.json
- secrets/mcp-state.json


## Anexo de proveniencia — copia anterior, nao estado CURRENT
Os dados abaixo sao historicos. Nao executar como receita vigente nem promover endpoints, TTLs, IDs ou PASS antigos a prova atual. O owner e as regras acima prevalecem; revalidar no runtime.

# CentralDark Remote Bridge — OAuth Pattern

## Descrição

Padrão de autenticação e conexão do `@wonderwhy-er/desktop-commander` ao MCP CentralDark via OAuth, permitindo que o PC do SEGREDO/CHEFE (workdir Windows) se conecte ao servidor MCP na VPS através de um túnel autorizado.

## Componentes

| Componente | Local | Papel |
|------------|-------|-------|
| `@wonderwhy-er/desktop-commander` | PC do usuário (Windows) | Bridge MCP remoto |
| `CentralDark-Remote-Bridge.ps1` | `scripts/remote-bridge/` | Script de inicialização da bridge |
| `CENTRALDARK-REMOTE-BRIDGE.config.json` | `scripts/remote-bridge/` | Configuração da bridge |
| `mcp-tunnel.json` | `scripts/mcp/` | Configuração do tunnel MCP local |
| `mcp-state.json` | `secrets/` | Estado OAuth com tokens de todos os clientes |

## Configuração

```json
{
  "schema": "centraldark.remote-bridge.config.v2",
  "device_label": "SEGREDO",
  "workdir": "E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE",
  "package": "@wonderwhy-er/desktop-commander@0.2.48",
  "remote_mcp": "https://mcp.desktopcommander.app/mcp",
  "centraldark_mcp": "https://mcp.centralldark.com/mcp",
  "github_default": "ServerVpss/CentralDark",
  "screenpipe_url": "http://127.0.0.1:3030",
  "read_only_first": true,
  "secrets_in_repo": false
}
```

## Fluxo OAuth

```text
1. CHEFE inicia @wonderwhy-er/desktop-commander
2. Redireciona para https://mcp.centralldark.com/oauth/authorize
3. AUTHORIZE=PASS → usuário autoriza
4. CODE_CAPTURED=true → authorization code capturado
5. Token trocado → Bearer token válido (EXPIRES_IN=3599s)
6. MCPP_AUTHENTICATED_E2E=PASS → autenticação confirmada
7. Conexão MCP estabelecida com 103+ ferramentas
```

## Client ID

- **Client:** `mcp_5a7634a215dea12502157f3405fab811`
- **Name:** `CentralDark-OneShot-Bridge`
- **Redirect:** `http://127.0.0.1:62607/`
- **Scope:** `admin`
- **Token type:** Bearer, `owner-admin` via `gh_token`

## Tokens no mcp-state.json

O `secrets/mcp-state.json` contém:
- `accessTokens[]` — tokens ativos por client_id
- `refreshTokens[]` — tokens de refresh por client_id
- `authCodes[]` — codes autorizados

### Token de administrador (válido nesta sessão)

Não registrar valores de access token ou refresh token em Git, skill, memória ou receipt.
Registrar apenas metadados sanitizados:

```text
client_id: <client_id observado>
expires_in: 3599s
scope: admin
gh_scope: owner-admin
store: secrets/mcp-state.json ou DPAPI_CURRENT_USER
```

Para validar sessão, consultar presença/expiração no cofre local sem imprimir valores.

## Remote Bridge Script

```powershell
# CentralDark-Remote-Bridge.ps1
# Roda no PC do usuário (Windows)
# Inicia o @wonderwhy-er/desktop-commander com o workdir correto
param(
    [string]$Workdir = 'E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE',
    [int]$RetrySec = 5
)
# Loop contínuo: npx @wonderwhy-er/desktop-commander@latest remote
```

## Health Check

```bash
# MCP local (na VPS)
curl http://localhost:9100/health
# → {"ok":true,"service":"mcp-centraldark","version":"0.4.0","toolCount":114}

# Catálogo de ferramentas
curl -H "Authorization: Bearer <TOKEN>" https://mcp.centralldark.com/admin/mcp
# → JSON-RPC com 103+ ferramentas
```

## Pitfalls

1. **Token expira em ~1h** — o access token tem `EXPIRES_IN=3599s`. O refresh token (`<REFRESH_TOKEN_REDACTED>`) dura ~30 dias. Renovar antes de expirar.
2. **mcp-tunnel.json tem "active: false"** — o tunnel local aponta para `localhost:9100/mcp` mas o remote bridge funciona via `mcp.centralldark.com`. Não confundir os dois endpoints.
3. **O MCP local exige Bearer token** — `curl localhost:9100/mcp` sem header retorna "Authorization Bearer ausente".
4. **O admin MCP exige NDJSON** — `Content-Type: application/x-ndjson` é obrigatório. `application/json` retorna 415. O formato JSON-RPC sobre NDJSON com `\n` no final.
5. **Workdir é Windows** — o workdir `E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE` é do PC do usuário, não da VPS. A bridge conecta os dois mundos.
6. **device_label = SEGREDO** — o label do dispositivo no config é `SEGREDO`, que é o identificador do CHEFE. Não mudar sem autorização.

## Verificação de Passagem

Quando o usuário pergunta "tenho passagem para casa/vps/tunel/cas segredo":

```text
✅ CASA/VPS: localhost:9100 online (mcp-centraldark v0.4.0, 114 tools)
✅ TUNEL: @wonderwhy-er/desktop-commander autenticado via OAuth
✅ CAS SEGREDO: SEGREDO/CHEFE é a autoridade — fluxo OAuth admin confirmado
✅ BRIDGE: workdir E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE conectado
```

## Referência

- `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json` — configuração
- `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` — script de inicialização
- `scripts/mcp/mcp-tunnel.json` — configuração do tunnel local
- `secrets/mcp-state.json` — estado OAuth (tokens, clientes, sessions)
