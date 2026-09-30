# 🔄 Rotation Schedule — Secrets Consolidation

## Política de Rotação

Cada secret tem intervalo diferente baseado em **risco + impacto**:

### 30 DIAS — TELEGRAM_BOT_TOKEN ⏰
- **Risco**: MÉDIO (comprometimento = notificações falsas)
- **Impacto**: BAIXO (fácil regenerar, sem downtime)
- **Procedimento**:
  1. Gerar novo token em https://t.me/BotFather
  2. Copiar para `/root/CentralDark/secrets/telegram/TELEGRAM_BOT_TOKEN`
  3. Atualizar em PM2 env: `pm2 restart unified-bot` (id 27)
  4. Testar: `curl -s https://api.telegram.org/bot[TOKEN]/getMe`
  5. Arquivar token antigo em `/root/CentralDark/secrets/.archive/TELEGRAM_BOT_TOKEN.old-[date]`

### 90 DIAS — GitHub + Cloudflare + MCP + WuzAPI ⏰⏰
Tokens com acesso limitado a APIs externas:

#### GITHUB_TOKEN
- **Risco**: ALTO (CI/CD automation)
- **Impacto**: MÉDIO (workflows pausam)
- **Procedimento**:
  1. Gerar novo token em GitHub > Settings > Developer settings > Personal access tokens
  2. Testar scopo: `repo, workflow, read:org`
  3. Copiar para `/root/CentralDark/secrets/github/GITHUB_TOKEN`
  4. Atualizar GitHub Secrets: `gh secret set GITHUB_TOKEN -R ServerVpss/CentralDark -b [NEW_TOKEN]`
  5. Aguardar próximo workflow run
  6. Validar em logs do GitHub

#### CF_API_TOKEN (Cloudflare)
- **Risco**: ALTO (DNS + CDN)
- **Impacto**: MÉDIO (downtime possível se mal feito)
- **Procedimento**:
  1. Gerar novo token em Cloudflare > Account > API Tokens
  2. Testar scopo: `Zone.DNS:Edit, Zone.Zone:Read`
  3. Validar: `curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer [TOKEN]"`
  4. Copiar para `/root/CentralDark/secrets/cloudflare/CF_API_TOKEN`
  5. Atualizar PM2 env (se usado em scripts)
  6. Revogar token antigo em Cloudflare

#### MCP_ADMIN_KEY
- **Risco**: ALTO (agent orchestration)
- **Impacto**: MÉDIO (MCP server fica offline durante rotação)
- **Procedimento**:
  1. Gerar novo key em https://mcp.centralldark.com/admin/keys
  2. Validar acesso: `curl -H "Authorization: $NEW_KEY" https://mcp.centralldark.com/admin/status`
  3. Copiar para `/root/CentralDark/secrets/mcp/MCP_ADMIN_KEY`
  4. Atualizar PM2: `pm2 set-env MCP_ADMIN_KEY $NEW_KEY` + restart
  5. Revogar key antiga

#### WUZAPI_TOKEN
- **Risco**: MÉDIO (WhatsApp sync)
- **Impacto**: BAIXO (fila de sync pode atrasar)
- **Procedimento**:
  1. Gerar novo token no WuzAPI dashboard
  2. Validar: `curl -H "Authorization: $NEW_TOKEN" http://127.0.0.1:8081/api/health`
  3. Copiar para `/root/CentralDark/secrets/wuzapi/WUZAPI_TOKEN`
  4. Atualizar `scripts/sync-connections.sh`

### 180 DIAS — Supabase + Database ⏰⏰⏰
Credentials críticas com impacto **MUITO ALTO**:

#### SUPABASE_URL + SUPABASE_KEY (service_role_key)
- **Risco**: CRÍTICO (acesso completo ao banco)
- **Impacto**: CRÍTICO (downtime = todas as operações pausam)
- **Procedimento**:
  1. ⚠️ **WINDOW de manutenção necessário** (2-3 hrs, notificar usuários)
  2. Backup do banco: `pg_dump $DATABASE_URL > backup-$(date +%s).sql`
  3. Regenerar keys em Supabase > Project > Settings > API
  4. Copiar SUPABASE_URL (mesma) + SUPABASE_KEY (novo) para `/root/CentralDark/secrets/supabase/`
  5. Atualizar `/root/.env`
  6. Restart PM2: `pm2 restart all`
  7. Validar: `psql $DATABASE_URL -c "SELECT version();"`
  8. Monitorar logs por 30 mins

#### DATABASE_URL + DATABASE_PASSWORD
- **Risco**: CRÍTICO (acesso direto PostgreSQL)
- **Impacto**: CRÍTICO (bloqueador de todas as apps)
- **Procedimento**:
  1. ⚠️ **MAINTENANCE WINDOW** (parar todas as apps antes)
  2. `pm2 stop all`
  3. Trocar senha em PostgreSQL: `ALTER USER postgres WITH PASSWORD 'new-password';`
  4. Gerar novo DATABASE_URL: `postgresql://postgres:new-password@host:5432/db`
  5. Copiar para `/root/CentralDark/secrets/supabase/DATABASE_URL`
  6. Atualizar `/root/.env`
  7. `pm2 start all`
  8. Aguardar 5 mins para estabilização

---

## Agendamento (via Cron)

```bash
# /etc/cron.d/centraldark-secrets-rotation
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# 30 dias: Dia 1, 11, 21 de cada mês às 02:00 UTC
0 2 1,11,21 * * root /root/scripts/rotate-telegram-token.sh >> /var/log/centraldark-rotation.log 2>&1

# 90 dias: Dia 1 de cada trimestre às 03:00 UTC
0 3 1 1,4,7,10 * root /root/scripts/rotate-github-token.sh >> /var/log/centraldark-rotation.log 2>&1
0 3 1 1,4,7,10 * root /root/scripts/rotate-cf-token.sh >> /var/log/centraldark-rotation.log 2>&1
0 3 1 1,4,7,10 * root /root/scripts/rotate-mcp-key.sh >> /var/log/centraldark-rotation.log 2>&1

# 180 dias: Dia 1 de cada semestre às 04:00 UTC (MANUTENÇÃO!)
0 4 1 1,7 * root echo "⚠️ SUPABASE ROTATION SCHEDULED - MANUAL INTERVENTION REQUIRED" >> /var/log/centraldark-rotation.log
```

## Alertas + Logs

- **Log centralizado**: `/var/log/centraldark-rotation.log`
- **Alertas**: Cada rotação envia notificação via Telegram (@srver1bot)
- **Histórico**: `/root/CentralDark/secrets/.archive/` com timestamps

## ZERO REGRESSÃO

✅ Todas as rotações seguem:
- Backup automático do valor anterior
- Teste de conectividade ANTES de desativar valor antigo
- Rollback via `/root/CentralDark/secrets/.backup/` se necessário
- Nenhuma rotação é forçada se não houver changelog explícito

## Responsabilidade

| Secret | Responsável | Revisão | Status |
|--------|---|---|---|
| TELEGRAM_BOT_TOKEN | PM2 automation | Mensal | 🟢 Ativo |
| GITHUB_TOKEN | CI/CD | Trimestral | 🟢 Ativo |
| CF_API_TOKEN | Infrastructure | Trimestral | 🟢 Ativo |
| MCP_ADMIN_KEY | Agent Orchestration | Trimestral | 🟢 Ativo |
| WUZAPI_TOKEN | WhatsApp Sync | Trimestral | 🟢 Ativo |
| SUPABASE_* | Database | Semestral | 🟡 Manual |
| DATABASE_URL | PostgreSQL | Semestral | 🟡 Manual |

---

**Gerado**: 2026-09-20  
**Próxima revisão**: 2026-12-20  

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>  
Claude-Session: https://claude.ai/code/session_0133AjFLRV4v6EMRKDvMk9SJ
