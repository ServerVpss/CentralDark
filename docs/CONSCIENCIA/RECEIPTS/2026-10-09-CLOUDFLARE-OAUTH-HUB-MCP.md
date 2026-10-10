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

## Readback e build do fluxo OAuth

- Fonte validada na `main`: commit inicial `dd8ffa14185c68a331a3c05589cae85c5cf5b46e`, broker com amarração de identidade `17536cc959e34b4b58695fba06121e7bb256ba9f`, UI one-click `170dbd3d210eb962e4e325a445df1e51bbf15a8e`.
- Bancada Casa isolada `E:\\CentralDark\\_cache\\cf-oauth-hub-20261009`, readback do SHA `170dbd3d210eb962e4e325a445df1e51bbf15a8e`.
- `node --check apps/modulos/oauth-broker/server.mjs` = PASS; `npm ci` = PASS; `npm run build` (apps/instinto-superior) = PASS; ESLint focado `ConexoesCentralDark.tsx` com regra Prettier CRLF isolada = PASS.
- Cloudflare OAuth client list via plugin conectado retornou `Authentication error 10000`; não inferir client cadastrado; nenhuma credencial do OAuth client no repo.
- JWT da sessão CentralDark validado contra o `user_id` pela auth Supabase do broker; role admin revalidada no backend. O consentimento no navegador segue sendo necessário; jamais bypass de identidade.
- Caddy REAL, deploy do novo SHA, sessão OAuth, token no cofre e API Cloudflare usando o token OAuth seguem UNKNOWN/NOT_EXECUTED. O `agents-main.zip` só teve presença/tamanho verificados; conteúdo ainda UNKNOWN.
- Estado: SOURCE_READBACK_PASS · BROKER_SYNTAX_PASS · INSTINTO_BUILD_PASS · LINT_SCOPED_PASS · LOGIN_E2E_UNKNOWN · VPS_DEPLOY_UNKNOWN.
