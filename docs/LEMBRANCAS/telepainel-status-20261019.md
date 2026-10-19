# 📊 TelePainel — Status e Localização

**Data:** 2026-10-19 17:05 UTC  
**Status:** 🟡 **OFFLINE NA CASA** / ✅ **PRODUÇÃO NA VPS**  

---

## 📍 Onde Está TelePainel?

### ✅ Em K:\ (Casa — Código-fonte)

```
K:\src\funcionalidades\telepainel\
├── README.md                (documentação)
├── pages/                   (19+ páginas React)
│   ├── LandingTelePainel.tsx
│   ├── Dashboard (Index.tsx)
│   ├── BotSettings.tsx
│   ├── Consultas.tsx
│   ├── Plans.tsx
│   ├── PixTransactions.tsx
│   └── ... 13 mais
└── components/              (UI isolado)
    ├── admin/
    ├── backup/
    ├── payments/
    └── ... 10 mais
```

### 🔴 **OFFLINE** em Porta Local (Casa)

```
Porta procurada: 3000–8100 (dev) ou 8081 (escalação Vite)
Resultado: NÃO ENCONTRADO

Portas vivas:
  8081 → Instinto Superior ✅
  8080 → ??? (bloqueador desconhecido) 🟡
  3030 → Screenpipe ✅
```

---

## 🚀 Em Produção (VPS)

### Destino na VPS

```
/root/CentralDark/apps/modulos/telepainel/dist/
```

### Deploy via Caddy

```
Domínio: telepainel.centralldark.com
URL pública: https://telepainel.centralldark.com/dashboard
Roteamento: Caddy reverse proxy
Health check: CI/CD valida com curl -L
Status CI/CD: ✅ Workflow aprovado
```

### Workflow de Deploy

**Arquivo:** `.github/workflows/caddy-telepainel-v2.yml`

Triggers:
- ✅ `workflow_dispatch` (manual)
- ✅ `push` to `main`

Passos:
1. Checkout HEAD
2. Gate de deploy (Meta-Lupa)
3. Build + reconciliar Caddy
4. Validar Caddyfile
5. Reload Caddy
6. Health check público (3 URLs)

---

## 📋 Estrutura e Rotas

| Rota | Página | Acesso |
|------|--------|--------|
| `/telepainel` | Landing (pública) | Público |
| `/telepainel/dashboard` | Dashboard | Logado |
| `/telepainel/bots` | Gerenciar bots | 🔒 Admin |
| `/telepainel/consultas` | Query logs | Logado |
| `/telepainel/plans` | Planos/assinaturas | 🔒 Admin |
| `/telepainel/pix` | Transações PIX | 🔒 Admin |
| `/telepainel/security` | Segurança | 🔒 Admin |
| `/telepainel/audit` | Auditoria | 🔒 Admin |
| `/telepainel/status` | Status | 🔒 Admin |
| ... | ... mais 7 | 🔒 Admin |

---

## 🔌 Backend

**Edge Functions:** `supabase/functions/telepainel-webhook/`
- Webhook Telegram
- Geração PIX
- Broadcasts
- Analytics

**Tabelas principais:**
- `bots`
- `bot_settings`
- `telegram_users`
- `subscriptions`
- `query_logs`
- `pix_transactions`
- `user_roles`

**Realtime:** Supabase Realtime para atualizações ao vivo

---

## 🔗 Dependências Externas

- ✅ Telegram Bot API
- ✅ Provedor PIX (EFI via proxy PHP mTLS)
- ⚠️ Mercado Pago (opcional)
- ⚠️ Binance Pay (opcional)
- ✅ VeiculosAPI / iSeek (consultas de veículos)

---

## 📦 Como Atualizar (VPS)

```bash
# Na raiz do repo
1. bun run build              # Build tudo
2. cp -r dist/* /root/CentralDark/apps/modulos/telepainel/dist/
3. systemctl reload caddy     # Caddy auto-serve
4. Edge functions via Lovable Cloud (automático)
```

Detalhes completos: `docs/INSTALADOR/`

---

## 🤔 Por que TelePainel está offline na Casa?

1. **Não é app local de dev** — rodaria em produção (VPS) apenas
2. **Não há port mapping** para localhost:3000 ou :8081
3. **Código existe**, mas o **build/server não está rodando** na Casa
4. **Lovable Cloud** gerencia o deploy (não local)

---

## ✅ Próximos Passos

- [ ] Confirmar domínio `telepainel.centralldark.com` respondendo
- [ ] Verificar últimos 10 deployments via GitHub Actions
- [ ] Validar access token Telegram bot
- [ ] Testar login com admin credentials

---

**Criado:** 2026-10-19  
**Próxima revisão:** Após validação de deploy VPS
