<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:09 BRT</samp>
</p>

# STATUS ATUAL DO PROJETO — WABOT CONSOLE

> **⚠️ LEITURA OBRIGATÓRIA PARA RETOMADA DE CONTEXTO**

## 🏗️ Metodologia de Operação

Systematic Debugging + Verification Before Completion (ver `apps/bot/skills/`)

## 📡 Fluxo Oficial

```
Arena/IA → GitHub/branch/PR → merge na main
  → GitHub webhook → VPS atualiza código
  → post-deploy.sh → run-once scripts executam
  → scripts/run-once/011, 012 configuram WhatsApp real
  → GitHub Actions → Supabase migrations aplicadas
```

## 📍 Estado Atual (2026-05-31)

### 🚀 O que está em produção

| Item | Status |
|------|--------|
| Landing page (`multizap.dev`) | ✅ Online |
| Bot SPA (`bot.multizap.dev`) | ✅ Online com Caddy |
| CRM (`crm.multizap.dev`) | ✅ Online com Caddy |
| Gateway (:3100) | ✅ Online + Supabase Sync |
| WuzAPI (:8081) | ✅ WhatsApp conectado |
| wabot-bridge (:9010) | ✅ Online |
| Webhook GitHub (:9003) | ✅ Online |
| Email templates (pt-BR) | ✅ Recovery, Confirmation, Magic Link |
| RLS Supabase | ✅ 28 policies em 17 tabelas |
| Secrets Vault (pgcrypto) | ✅ `vault_secrets.secrets` |
| Security docs | ✅ `security/START_HERE.md` + `README.md` |

### 🔧 PR #98 — Pronto para merge (10 commits)

| Commit | Área | Descrição |
|--------|------|-----------|
| 1-3 | Auth/Login | Reset password, OTP 2h, redirect seguro |
| 4-6 | Segurança | Script landing page com whitelist + hash validation |
| 7-9 | Documentação | Security/START_HERE.md, headers padronizados |
| 10 | **WhatsApp Real** | Webhook + Sync + Supabase Save pipeline |

### 📂 Módulos criados

| Módulo | Pasta | Status |
|--------|-------|--------|
| Centro WhatsApp | `apps/consciencia/` | 🔧 Estrutura criada |
| Central Notificações | `apps/notificacoes/` | 🔧 Estrutura criada |
| Portal Módulos | `apps/portal/` | 🔧 Estrutura criada |

## 🔗 Pipeline WhatsApp Real (criada, aguardando merge)

```
WuzAPI → Gateway webhook → SupabaseService
  ├── messages (mensagens em tempo real)
  ├── contacts (auto-upsert)
  └── system_logs (eventos)
```

### Eventos suportados: Message, ChatPresence, ReadReceipt, HistorySync, QR, Connected, Disconnected, Error

## 🎯 Próximos Passos (pós-merge)

1. Merge PR #98 → main
2. VPS auto-pull + post-deploy
3. Run-once 011: configurar webhook WuzAPI
4. Run-once 012: puxar contatos e mensagens
5. Verificar dados reais chegando no Supabase
6. Conectar chat UI com dados reais

---

*Atualizar ao final de CADA alteração significativa.*