# CentralDark — consolidação setorial da API (23/10/2026)

INTENT_ID: CD-API-ROUTES-20261023
OWNER: infra/caddy + apps/modulos/oauth-broker/server.mjs + apps/modulos/mcp/src/index.js
MAIN_BASE: 48827a6fb
ACTIVE_WRITER: branch feat/api-consolidacao-gateway-hub-webhook-20261023
STATUS: CANDIDATE; não instalado no Caddy vivo
RECEIPT: catalogação versionada, sem autorização de HTTP 200 presumida

## Contrato de superfície

Domínios preservados pelo CHEFE: centralldark.com, www.centralldark.com, app.centralldark.com, admin.centralldark.com, api.centralldark.com, mcp.centralldark.com.
Outros hosts legados NÃO são removidos neste delta.

| URL pública alvo | Dono reutilizado | Rota legada/evidência | Estado |
|---|---|---|---|
| https://api.centralldark.com/gateway/* | ArsenalAdapter (histórico :8090) | api.centralldark.com, gateway e /v1/* | CANDIDATE, sem teste HTTP |
| https://api.centralldark.com/hub/* | OAuthBroker (histórico :8098) | hub.centralldark.com/oauth/{provider}/* | CANDIDATE; callback OAuth ainda depende de PUBLIC_BASE |
| https://api.centralldark.com/webhook | githubDeployWebhook do MCP (:9100 histórico) | POST /webhook no apps/modulos/mcp/src/index.js; evidência histórica em api.centralldark.com/webhook | IMPLEMENTED_IN_CODE; runtime atual UNKNOWN |
| https://api.centralldark.com/deploy/health | githubDeployHealth do MCP | GET /deploy/health no mesmo módulo; HTTP 200 documentado em 07/10 | IMPLEMENTED_IN_CODE; runtime atual UNKNOWN |

## Roteamento preparado

Arquivo candidato: infra/caddy/api-consolidacao-candidate.Caddyfile. **Não importar isoladamente**: é fragmento de handles a integrar ao vhost EXISTENTE `api.centralldark.com`, depois de inspecionar o Caddy carregado. Ordem importa; os handles /gateway/* e /hub/* devem preceder catch-alls. Não sobrescrever /webhook nem /deploy/health: preservar handlers existentes até observar o reverse proxy real.

### Contraprovas obrigatórias antes de ativar
1. Medir /etc/caddy/Caddyfile + imports e ss -tlnp + PM2/systemd na VPS, incluindo 8090, 8098, 9100; conciliar divergência de arquivos históricos (hub :8098 ou :8790).
2. Confirmar saúde e contrato do ArsenalAdapter e do OAuthBroker (GET + negativa auth). `handle_path` remove prefixo: testar se os consumidores esperam isso.
3. Para OAuth, atualizar `PUBLIC_BASE` / callback autorizado de forma atômica apenas se a migração for aprovada; nunca assumir que redirect de /hub/oauth/... funciona com o BASE antigo.
4. Preservar webhook HMAC e corpo bruto (raw body); teste inválido deve ser rejeitado, sem disparar deploy. Não criar handler concorrente.
5. Backup de Caddy, `caddy validate`, deploy controlado, HTTP positivo/negativo em cada rota, regressão de /, /health, /v1/*, /api/*, /mcp e OAuth.
6. Só depois registrar RECEIPT com SHA, PID, HTTP, timestamp, origem, prova/contraprova e NEXT_CURSOR.

NOT_DEPLOYED=true
UNKNOWN_IS_NOT_PASS=true
NO_SECOND_GATEWAY=true
ONE_WRITER_PER_SCOPE=true
NEXT_CURSOR=INSPECT_LIVE_CADDY_BEFORE_IMPORT
