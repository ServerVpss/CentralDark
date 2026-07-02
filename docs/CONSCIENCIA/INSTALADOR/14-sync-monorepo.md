---
title: "14 Sync Monorepo"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 14 — Sync automático para o monorepo CentralDark

Você edita aqui no Lovable. A VPS sincroniza esse código pra dentro de
`ServerVpss/CentralDark/apps/web/` automaticamente, builda e serve.

```text
Lovable (edita)
   │
   │ git pull
   ▼
repo Lovable local  ──rsync──>  CentralDark-monorepo/CentralDark/apps/web
                                            │
                                            │ commit + push
                                            ▼
                                  GitHub (ServerVpss/CentralDark)
                                            │
                                            │ npm run build
                                            ▼
                                  /var/www/centralldark  → Caddy
```

## Pré-requisitos

- SSH key da VPS autorizada no GitHub na conta `ServerVpss` (com push em `CentralDark`).
- Testa antes: `ssh -T git@github.com` deve responder com seu user.
- `rsync`, `git`, `node`, `npm` instalados.

## Primeira execução (manual)

```bash
bash /root/Multizap/apps/clone-deck/scripts/sync-para-centraldark-monorepo.sh
```

O que esperar:
- Cria `/root/CentralDark-monorepo` clonando `ServerVpss/CentralDark`.
- Copia o código pra `CentralDark/apps/web/`.
- Commit + push automático com a mensagem `sync(web): <hash> do Lovable`.
- Roda `npm ci && npm run build`.
- Cria symlink `/var/www/centralldark` → `apps/web/dist`.

## Ativar sync automático (cron a cada 2 min)

```bash
(crontab -l 2>/dev/null; echo "*/2 * * * * /root/Multizap/apps/clone-deck/scripts/cron-sync-centraldark.sh") | crontab -
```

Conferir:
```bash
crontab -l | grep centraldark
tail -f /var/log/centraldark-sync.log
```

## Apontar o Caddy pro novo dist

Edite o Caddyfile principal (com calma — Caddy é sensível) e troque o
`root` do bloco `centralldark.com`:

```caddy
centralldark.com, www.centralldark.com {
    root * /var/www/centralldark
    try_files {path} /index.html
    file_server
    encode gzip
}
```

Validar e recarregar:
```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

## Variáveis configuráveis

Antes de rodar o script, dá pra sobrescrever:

| Variável | Default | Pra quê |
|---|---|---|
| `LOVABLE_REPO_DIR` | `/root/Multizap/apps/clone-deck` | Onde está o repo do Lovable na VPS |
| `MONOREPO_DIR` | `/root/CentralDark-monorepo` | Onde clonar o monorepo |
| `MONOREPO_GIT` | `git@github.com:ServerVpss/CentralDark.git` | URL SSH do monorepo |
| `MONOREPO_BRANCH` | `main` | Branch de destino |
| `WEB_SUBPATH` | `CentralDark/apps/web` | Caminho dentro do monorepo |
| `PUBLIC_LINK` | `/var/www/centralldark` | Onde o Caddy lê |

Exemplo:
```bash
MONOREPO_BRANCH=staging bash scripts/sync-para-centraldark-monorepo.sh
```

## Troubleshooting

**"Permission denied (publickey)"** ao push:
- A SSH key da VPS não tem acesso ao repo `ServerVpss/CentralDark`. Adicione
  a chave pública em Settings → Deploy Keys (com `Allow write access`) ou
  na conta GitHub do dono.

**"repo Lovable não encontrado"**:
- Passe explícito: `LOVABLE_REPO_DIR=/caminho/correto bash scripts/...`

**Build falha**:
- Rode manualmente em `/root/CentralDark-monorepo/CentralDark/apps/web` pra
  ver o erro completo.

**Symlink não criou**:
- `/var/www/centralldark` já existe como pasta normal. Apague e roda de novo:
  `rm -rf /var/www/centralldark && bash scripts/sync-para-centraldark-monorepo.sh`

## TODO (pra depois)

- Se o monorepo já tem estrutura própria pra edge functions Supabase, mover
  `apps/web/supabase/` pra `apps/api/` ou onde for o padrão.
- Webhook do GitHub no repo Lovable disparando o sync em vez de cron de 2min.
