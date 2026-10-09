# Cloudflare OAuth no HUB/MCP canônico — 09/10/2026
Intent: 1 CentralDark, 1 MCP e 1 OAuthBroker; consultar as 3670 operações Cloudflare já inventariadas, conectar a conta via botão no Instinto Superior, sem segundo cérebro.
Owner: apps/modulos/oauth-broker/server.mjs; UI: apps/instinto-superior/src/components/central/ConexoesCentralDark.tsx; edge: infra/caddy/admin.Caddyfile.
OAuth Cloudflare oficial: https://developers.cloudflare.com/fundamentals/oauth/integrate-with-cloudflare/
Fluxo: admin.centralldark.com Contas/Conexões → /oauth/cloudflare/start → dash.cloudflare.com/oauth2/auth → /oauth/cloudflare/callback → oauth_connections (AES-256-GCM no cofre atual) → admin.
Env server-only: CLOUDFLARE_OAUTH_CLIENT_ID, CLOUDFLARE_OAUTH_CLIENT_SECRET, CLOUDFLARE_OAUTH_SCOPES (padrão zone.read), CLOUDFLARE_OAUTH_REDIRECT_URI (padrão https://admin.centralldark.com/oauth/cloudflare/callback). Nunca colocar secret no Git/Chat/browser.
Contraprovas do fluxo: state + cookie httpOnly/SameSite; redirect somente admin; token trocado pelo servidor; não inventar login autorizado.
Inventário: apps/modulos/mcp/src/modes/admin/tools/cloudflare-openapi-catalog.js, 3670 operações, fingerprint registrado no receipt anterior, permanece INVENTORY_ONLY; não criar segundo dispatcher.
agents-main.zip na VPS: presença provada, conteúdo NÃO VALIDADO; não executar/importar binário sem inventário.
Status: código submetido à main, sujeito a teste, readback do Caddy ativo e deploy. SOURCE != RUNTIME.