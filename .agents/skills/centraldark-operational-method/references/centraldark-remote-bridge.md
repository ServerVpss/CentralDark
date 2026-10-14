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

```text
1. CHEFE inicia @wonderwhy-er/desktop-commander
2. Redireciona para https://mcp.centralldark.com/oauth/authorize
3. AUTHORIZE=PASS → usuário autoriza
4. CODE_CAPTURED=true → authorization code capturado
5. Token trocado pelo owner seguro → sessão autenticada, sem expor o valor
6. `MCP_AUTHENTICATED_E2E=PASS` somente após chamada real e readback
7. Conexão MCP estabelecida somente após ferramenta descoberta e chamada de leitura
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

### Estado de autenticação

A autenticação pertence ao cofre/owner seguro. Não registrar tokens, códigos, expiração ou material Bearer nesta skill. Validar apenas por chamada real e readback sanitizado.

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

1. **Sessão autenticada** — validade é medida pelo owner seguro e por chamada real; não inferir por histórico.
2. **`mcp-tunnel.json`** — estado/configuração deve ser lido no owner atual; não promover `active` histórico.
3. **MCP local** — exigir autenticação configurada pelo owner; não imprimir headers.
4. **Admin MCP** — usar o transporte e Content-Type declarados pelo owner atual; não adivinhar formato.
5. **Workdir é Windows** — `K:\\_worktrees\\bolt-desktop` é o workspace atualmente confirmado; não reutilizar `E:` ou caminhos históricos.
6. **device_label = SEGREDO** — revalidar no `tailscale status`; não inferir identidade por IP antigo.

## Rota CURRENT Casa ↔ VPS (replay comprovado em 2026-10-14)

Use esta rota antes de criar túnel, plugin, segundo conector ou novo executor:

```text
CASA_ONLINE
→ TAILSCALE_PEER=100.123.93.25 (device label: segredo)
→ REMOTE_BRIDGE_OWNER=scripts/remote-bridge/CentralDark-Remote-Bridge.ps1
→ DESKTOP_COMMANDER_REMOTE (executado na Casa)
→ readback do device/terminal
```

A porta `100.123.93.25:54650` responde HTTP, mas é a página do dispositivo Tailscale; ela não é o terminal remoto. Não promovê-la como Desktop Commander ou shell.

### Critério de prova

```text
TAILSCALE_PEER_ONLINE = PASS somente com tailscale status/readback
REMOTE_BRIDGE = PASS somente com processo/saída "Device ready" e Device ID/Name
REMOTE_TERMINAL = PASS somente com comando executado na Casa e readback
PREVIEW = PASS somente com dev-server/Electron/DOM ou screenshot no alvo correto
```

O script da bridge deve ser iniciado na Casa, preservando o owner existente:

```powershell
cd K:\_worktrees\bolt-desktop
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remote-bridge\CentralDark-Remote-Bridge.ps1
```

A rota não usa `127.0.0.1` da VPS para alcançar a Casa. Endereços localhost são locais a cada máquina. Revalidar `tailscale status`, dispositivo, processo da bridge e readback após qualquer reconexão.

## Verificação de Passagem

A passagem só pode ser declarada depois do readback da rota CURRENT acima. Registros antigos de OAuth, contagem de ferramentas, tokens, workdir `E:` ou `localhost:9100` são contexto histórico e não provam a sessão atual.

```text
PASS = peer online + bridge executada na Casa + Device ready/ID/Name + comando/readback no alvo
UNKNOWN = qualquer elo sem readback
```

Nunca registrar valores de access token, refresh token, authorization code ou credenciais nesta referência, em skill, memória, log, PR ou receipt.

## Referência

- `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json` — configuração
- `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` — script de inicialização
- `scripts/mcp/mcp-tunnel.json` — configuração do tunnel local
- `secrets/mcp-state.json` — estado OAuth (tokens, clientes, sessions)
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
