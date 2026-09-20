<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:09 BRT</samp>
</p>

# Estado do Projeto — MultiZap

## Repositório

```
https://github.com/segredounlock/clone-deck
```

## Estrutura

```
clone-deck/
├── apps/bot/          → Bot WhatsApp (React + Vite)
├── apps/crm/          → CRM Multicanal
├── apps/web/          → Landing Page
├── apps/consciencia/  → Centro WhatsApp (🔧 criado)
├── apps/notificacoes/ → Centro de Notificações (🔧 criado)
├── apps/portal/       → Portal de Módulos (🔧 criado)
├── infra/             → Supabase migrations, deploy, webhook
├── scripts/           → Scripts de automação VPS
├── scripts/run-once/  → Scripts de execução remota (1x)
├── conexao-ia/        → Memória de conexão IA/VPS
├── docs/              → Documentação do projeto
├── security/          → 🛡️ Documentação de segurança
└── START_HERE.md      → Ponto de entrada
```

## Domínios

| App | Domínio | Status |
|-----|---------|--------|
| Bot | bot.multizap.dev | ✅ Caddy ativo |
| CRM | crm.multizap.dev | ✅ Caddy ativo |
| Web | multizap.dev | ✅ Landing Page |

## Supabase

17+ tabelas ativas. Migrations via GitHub Actions.
Vault de segredos criptografados: `vault_secrets.secrets`
28 RLS policies aplicadas em 17 tabelas.

## WhatsApp Pipeline (2026-05-31)

| Componente | Status |
|------------|--------|
| WuzAPI (:8081) | ✅ Conectado |
| Gateway (:3100) | ✅ Online + Supabase Sync |
| Webhook configurado | 🔧 Run-once 011 (pós-merge) |
| Contatos no Supabase | ❌ 0 (aguardando sync) |
| Mensagens no Supabase | ❌ 0 (aguardando webhook) |
| Eventos mapeados | ✅ 8 tipos de evento |

## PR #98 — Pendente de merge

10 commits na branch `fix/reset-password-otp-flow`:
1. Reset password flow + OTP fix
2. Redirect seguro com whitelist + hash validation
3. Segurança: vault, RLS, email templates
4. Security/START_HERE.md + docs
5. Módulos: consciencia, notificacoes, portal
6. **WhatsApp real: webhook, sync, Supabase save**

## Acesso GitHub

- VPS usa Deploy Key read-only via alias `github-clone-deck`
- Push/PR deve usar branch separada
- Merge na `main` aciona webhook de deploy

## Serviços VPS

Gateway (:3100), Webhook (:9003), Receiver (:5000), Sync Bridge, Telegram Bot