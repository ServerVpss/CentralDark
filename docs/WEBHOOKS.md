<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Webhooks — Mapa Completo

>
> Este documento mapeia TODOS os webhooks ativos na VPS.
> NÃO TOCAR em webhooks de outros projetos sem autorização.

---

## Mapa de Webhooks

| Porta | PM2 | Repo/Serviço | URL | Status |
|-------|-----|--------------|-----|--------|
| 9001 | `github-webhook` | Recargas (antigo) | — | 🔒 NÃO TOCAR |
| 9002 | `MultiZap-GitHub-Webhook` | `segredounlock/atendimentoo` | — | 🔒 NÃO TOCAR |
| **9003** | **`CloneDeck-GitHub-Webhook`** | **`segredounlock/clone-deck`** | **`https://hook.multizap.dev/webhook`** | ✅ Ativo |

---

## CloneDeck-GitHub-Webhook (9003) — Detalhes

### Fluxo

```
push/merge na main
  → GitHub envia POST para https://hook.multizap.dev/webhook
    → Nginx proxy → 127.0.0.1:9003
      → Listener verifica assinatura HMAC SHA-256
        → Se válido: executa /usr/local/bin/clone-deck-gh-pull
          → git fetch + git reset --hard origin/main
            → /root/Multizap/apps/clone-deck atualizado
```

### Rotas

| Método | Path | Função | Auth |
|--------|------|--------|------|
| GET | `/health` | Health check | Nenhuma |
| POST | `/webhook` | Receber push do GitHub | HMAC SHA-256 obrigatório |

### Segurança

- Assinatura `x-hub-signature-256` obrigatória em todo POST
- Sem fallback vazio — se secret não configurado, processo não inicia
- Secret em `/root/clone-deck-webhook/.env` (chmod 600)
- Secret **NÃO** está no ecosystem.config.js do PM2
- Secret **NÃO** está no código fonte

### Filtros

- Repo: aceita apenas `segredounlock/clone-deck`
- Branch: aceita apenas `refs/heads/main`
- Qualquer outro repo ou branch → resposta 200 "Ignored"

### Script de Pull

**Arquivo:** `/usr/local/bin/clone-deck-gh-pull`

Proteções:
- `flock -n` — evita execuções simultâneas
- `git status --porcelain` — verifica tracked changes antes do reset
- Se tracked sujo → **aborta** e registra no log
- Arquivos untracked → preservados (não apagados)
- Log: `/var/log/clone-deck-webhook.log`

### Arquivos na VPS

```
/root/clone-deck-webhook/
├── clone-deck-github-webhook-listener.js   # Listener
├── ecosystem.config.js                      # PM2 config
├── .env                                     # Secret (chmod 600)
├── node_modules/                            # dotenv
└── package.json

/usr/local/bin/clone-deck-gh-pull            # Script de pull (chmod +x)
/var/log/clone-deck-webhook.log              # Log do pull
/var/log/clone-deck-webhook-pm2-out.log      # Log PM2 stdout
/var/log/clone-deck-webhook-pm2-error.log    # Log PM2 stderr
```

### Configuração no GitHub

- **Settings → Webhooks** do repo `segredounlock/clone-deck`
- Payload URL: `https://hook.multizap.dev/webhook`
- Content type: `application/json`
- Secret: (configurado, não exposto)
- Events: Just the push event
- Active: ✅

---

## Regras

- ❌ Nunca mexer na porta 9001 (Recargas)
- ❌ Nunca mexer na porta 9002 (atendimentoo)
- ❌ Nunca usar `pm2 restart all`
- ❌ Nunca expor o WEBHOOK_SECRET
- ✅ Para testar: `curl https://hook.multizap.dev/health`
- ✅ Para ver logs: `tail -f /var/log/clone-deck-webhook.log`
