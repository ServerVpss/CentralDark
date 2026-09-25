# Receipt — Tailscale como espinha permanente Casa ↔ VPS

Status: RUNTIME_PROVED
Authority: SEGREDO/CHEFE
Source commit inicial: 77efd91abd4d7106ff7c7dc17401b9e5a3233f63

## Intenção

Manter `VPS ↔ Tailscale ↔ SEGREDO` como rota-base estável. Bridges novos são testados por cima dela e não substituem a espinha.

## Owners reutilizados

- Hub/contas: `apps/modulos/oauth-broker/server.mjs` + `apps/modulos/hub`
- Admin: `apps/modulos/mcp/src/admin.js`
- Rede: Tailscale já instalado/autenticado; nenhum segundo túnel criado.

## Contrato aplicado

- Login humano inicia no Hub via `tailscale login`; consentimento permanece hospedado pelo Tailscale.
- Se a rota já estiver conectada, o botão não derruba nem reinicia a sessão.
- Logout exige confirmação explícita `DISCONNECT_TAILSCALE_ROUTE`.
- Token/secret não é renderizado nem logado.
- Admin mostra Tailnet, VPS, Casa, RDP 3389 e SSH 22.
- Hub expõe somente estado sanitizado em `/api/tailscale/status`.
- Admin consome status por rota protegida `/admin/api/tailscale`.
- Build do Hub normaliza `dist` para diretórios 755 e arquivos 644 para o Caddy.

## Prova runtime — 2026-09-25

- OAuthBroker `/health` = 200, versão `2.3-tailscale`.
- Tailscale runtime = `ok=true`, backend `Running`.
- Tailnet = `servervpss.org.github`.
- VPS = `vmi3256920` / `100.121.152.119`.
- Casa = `segredo` / `100.123.93.25`, online.
- Casa RDP 3389 = `OPEN`.
- Casa SSH 22 = `CLOSED_OR_FILTERED`.
- `https://hub.centralldark.com/api/tailscale/status` = 200.
- `https://hub.centralldark.com/oauth/tailscale/start?...` = 302 para Admin com `tailscale=connected` quando sessão já está autenticada.
- `https://admin.centralldark.com/admin?tab=tailscale` = 200.
- Hub root = 200 após corrigir permissões do build.
- MCP `127.0.0.1:9100/health` = 200 após janela normal de restart.
- `CentralDark-MCP` = online.
- `CentralDark-OAuthBroker` = online.
- Caddy validou configuração e passou a usar Origin CA existente válido até 2041 para o Hub.

## Contraprova

A suíte MCP completa apresentou 1 falha preexistente e fora deste delta:
`tests/health-deep-owner.test.mjs` importa `checkTelegramOwner`, export ausente em `src/health-deep.js`.
Não foi convertida em PASS.

Testes focados do delta Tailscale/provider = 11/11 PASS.
Hub build = PASS.
