# OAuth Broker — runtime persistente do owner existente

**Owner:** `apps/modulos/oauth-broker/server.mjs`. O Broker continua sendo o **único** dono OAuth; a unidade systemd substitui o PM2 ausente para esse owner, sem criar novo Hub, novo MCP ou cofre.

- Dependências exatas e lock: `apps/modulos/oauth-broker/package.json` + `package-lock.json`; somente `npm ci` local ao módulo.
- Instalação idempotente: `scripts/vps/install-oauth-broker-runtime.sh`.
- Unidade: `scripts/vps/systemd/centraldark-oauth-broker.service` em `127.0.0.1:8098`.
- Cofre/credenciais **fora do Git**: `/etc/centraldark/oauth-broker.env` (root, modo 0600). Requer `HUB_SUPABASE_URL`, `HUB_SUPABASE_SERVICE_ROLE_KEY` e `VAULT_MASTER_KEY`; Google OAuth exige adicionalmente `GOOGLE_OAUTH_CLIENT_ID` e `GOOGLE_OAUTH_CLIENT_SECRET` e consentimento humano.
- **Nunca gerar outra VAULT_MASTER_KEY** sem verificar se há conexões cifradas existentes no vault `oauth_connections`. Mudança da chave torna registros anteriores indecifráveis. Não registrar valores em receipts/logs/HUD.
- Ausência de env ou binding correto: serviço enabled, mas **não iniciado**; é `HUMAN_FRONTIER`, não PASS.
- Contraprova: status/fragmento/PID/cgroup da unidade, `ss` da porta loopback, HTTP `/health`, `systemctl restart` seguido do mesmo readback e, separadamente, login humano + readback real de arquivo Drive. Admin publicado e Broker local são superfícies diferentes; HTTP 200 não equivale a autenticação.
