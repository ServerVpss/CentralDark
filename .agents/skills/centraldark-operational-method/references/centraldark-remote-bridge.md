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
