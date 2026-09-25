# Receipt — Tailscale como espinha permanente Casa ↔ VPS

Status: IMPLEMENTED_SOURCE_PENDING_RUNTIME_PROOF
Authority: SEGREDO/CHEFE

Intenção: manter VPS ↔ Tailscale ↔ SEGREDO como rota-base estável. Bridges novos são testados por cima dela e não substituem a espinha.

Owners reutilizados:
- Hub/contas: apps/modulos/oauth-broker/server.mjs + apps/modulos/hub
- Admin: apps/modulos/mcp/src/admin.js
- Rede: Tailscale já instalado/autenticado; nenhum segundo túnel criado.

Contrato:
- Login humano é iniciado pelo Hub com tailscale login; o consentimento continua hospedado pelo Tailscale e usa o provedor de identidade da tailnet.
- Se já conectado, login não reinicia nem derruba a rota.
- Logout existe somente com confirmação explícita DISCONNECT_TAILSCALE_ROUTE.
- Token/secret não é renderizado nem logado.
- Admin mostra status, Tailnet, VPS, Casa, RDP 3389 e SSH 22.
- /api/tailscale/status é same-origin via Caddy no Admin e via Hub.
