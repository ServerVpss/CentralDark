# 🔐 Consolidação de Secrets — FRENTE 1 (BLOQUEADOR)

## Status Atual
- ✅ 28 secrets mapeados em `secrets-manifest.json`
- 🔴 BLOQUEADOR: SUPABASE_URL + SUPABASE_KEY faltando em `/root/.env`
  - **Causa**: sync-connections.sh hard-exits sem Supabase credentials
  - **Impacto**: Sincronização de conexões Telegram/WhatsApp não funciona
  - **Severidade**: CRÍTICO — impede operação da Casa

## Estratégia de Consolidação

### Estrutura Final em `/root/CentralDark/secrets/`
```
/root/CentralDark/secrets/
├── github/           # GITHUB_TOKEN, GH_PAT
├── supabase/         # SUPABASE_URL, SUPABASE_KEY, SUPABASE_ANON_KEY, DATABASE_URL, DATABASE_PASSWORD
├── telegram/         # TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET
├── mcp/              # MCP_ENDPOINT, MCP_ADMIN_KEY
├── cloudflare/       # CF_API_TOKEN, CF_ZONE_ID, CF_ACCOUNT_ID
├── wuzapi/           # WUZAPI_URL, WUZAPI_TOKEN, WORKSPACE_ID
├── vps/              # SSH_PRIVATE_KEY, PM2_SECRET
└── README.md         # Este arquivo
```

**Permissões**: `chmod 700` para `/root/CentralDark/secrets/` e todas as subpastas (apenas root, sem leitura para outros)

### Sincronização: GitHub → `/root/CentralDark/secrets/`

Script `sync-from-github.sh`:
1. **Lê secrets de GitHub Actions settings** via API autenticado
2. **Valida formato** sem expor valores (apenas fingerprint SHA256)
3. **Copia metadados + template vazio** para `/root/CentralDark/secrets/github/`
4. **Backup automático** de versão anterior antes de sobrescrever

### Arquivo `.env` na VPS

Localização: `/root/.env` (não versionado, criado via script)

Conteúdo crítico mapeado:
```bash
# SUPABASE — BLOQUEADOR
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=eyJ... (service_role_key)
SUPABASE_ANON_KEY=eyJ... (anon_key)
DATABASE_URL=postgresql://user:pass@host:5432/db

# TELEGRAM
TELEGRAM_BOT_TOKEN=123456:ABCdef...
TELEGRAM_CHAT_ID=[numeric-id]
TELEGRAM_WEBHOOK_SECRET=[random-string]

# MCP
MCP_ADMIN_KEY=Bearer [token]

# CLOUDFLARE
CF_API_TOKEN=Bearer [token]

# WUZAPI
WUZAPI_URL=http://127.0.0.1:8081
WUZAPI_TOKEN=[token]
```

## Rotação de Secrets

**Intervalo por categoria**:
- 30 dias: TELEGRAM_BOT_TOKEN (baixo risco, fácil regenerar)
- 90 dias: GITHUB_TOKEN, CF_API_TOKEN, MCP_ADMIN_KEY, WUZAPI_TOKEN (médio risco)
- 180 dias: SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, DATABASE_PASSWORD (alto risco, impacto em produção)

**Agendamento**: Via `cron` direto em `/root/` (não PM2, para evitar restart)

## ZERO REGRESSÃO

✅ Todas as operações mantêm sistemas online:
1. Criar estrutura `/root/CentralDark/secrets/` — apenas mkdir, zero impacto
2. Sincronizar GitHub secrets — cópia, backup automático
3. Gerar `.env` VPS — escreve novo arquivo, não toca em aplicações
4. Ativar cron de rotação — agendamento, executa offline-hours

**Rollback**: Restaurar `/root/.env` de backup (mantido em `/root/CentralDark/secrets/.backup/`) — 10 segundos, sem restart necessário

## Autoria

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0133AjFLRV4v6EMRKDvMk9SJ

---

Próximas Frentes:
- FRENTE 2: Google Drive OAuth + Hub Integration
- FRENTE 3: Builder Audit + Contract Review

**Ver**: docs/CONSCIENCIA/09-ESTADO-ATUAL.md (sistema atual)
**Bloqueador**: SUPABASE_KEY em /root/.env (resolve com Commit 3)
