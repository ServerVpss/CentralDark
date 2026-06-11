## O que vai acontecer

Você continua editando aqui no Lovable (preview rápido, do jeito que você gosta). Em paralelo, a VPS roda um **robô de sincronização** que pega o código deste projeto, joga dentro de `ServerVpss/CentralDark/apps/web/`, comita, dá push, builda e serve no Caddy. O site que o mundo acessa passa a vir do monorepo CentralDark — não mais do repo antigo.

Resumo visual:

```text
   Lovable (você edita)
        |
        v
   repo Lovable deste projeto  ──(sync a cada 2min)──>  ServerVpss/CentralDark/apps/web
                                                                    |
                                                                    v
                                                              build + Caddy
                                                                    |
                                                                    v
                                                          centralldark.com
```

## Entregáveis (vou criar 3 arquivos no projeto)

**1. `scripts/sync-para-centraldark-monorepo.sh`** — o robô. Faz:
- Clona/atualiza `git@github.com:ServerVpss/CentralDark.git` em `/root/CentralDark-monorepo`
- Faz `git pull` no repo Lovable deste projeto (em `/root/Multizap/apps/clone-deck` ou onde estiver)
- `rsync` do código-fonte pra dentro de `CentralDark/apps/web/`, **excluindo**: `.git`, `node_modules`, `dist`, `.env`
- Se tiver mudança: `git add . && git commit -m "sync: <hash-curto> from Lovable" && git push`
- Roda `npm ci && npm run build` dentro de `CentralDark/apps/web/`
- Aponta link simbólico `/var/www/centralldark` → `CentralDark/apps/web/dist` pro Caddy servir

**2. `scripts/cron-sync-centraldark.sh`** — wrapper minúsculo pro cron, com lock pra não rodar em paralelo e log em `/var/log/centraldark-sync.log`.

**3. `docs/INSTALADOR/14-sync-monorepo.md`** — instruções pra você ativar na VPS:
- 1 comando pra primeira execução manual
- 1 linha de cron (`*/2 * * * *`)
- Como ajustar o Caddyfile pra ler `/var/www/centralldark`
- Como acompanhar o log

## Detalhes técnicos

- **Sem token**: usa sua SSH key já configurada (`git@github.com:...`).
- **Lock**: `flock` em `/tmp/centraldark-sync.lock` evita corrida.
- **Idempotência**: se nada mudou no Lovable, o script sai cedo sem commit.
- **Build só quando precisa**: detecta hash do último commit sincronizado e pula build se for igual.
- **Estrutura no monorepo**: tudo deste projeto vai pra raiz de `apps/web/` (mesmo `package.json`, `vite.config.ts`, `src/`, `public/`, `supabase/`, etc).
- **Pasta `supabase/`**: vai junto. Se o monorepo já tiver outra estrutura pra edge functions, ajusto depois (deixo TODO).
- **Repo antigo (`telegram-zen-panel-...`)**: continua existindo como remote do Lovable — não mexo. Só não é mais usado em produção.

## O que NÃO faço neste plano

- Não toco no `install.sh` principal.
- Não desconecto o Lovable do GitHub.
- Não mexo no Caddyfile automaticamente (você confirma a linha).
- Não apago o repo antigo.

## Depois que rodar 1x na VPS

```bash
# 1. Primeira sync manual
bash scripts/sync-para-centraldark-monorepo.sh

# 2. Ativar cron (sync a cada 2min)
(crontab -l 2>/dev/null; echo "*/2 * * * * /root/Multizap/apps/clone-deck/scripts/cron-sync-centraldark.sh") | crontab -

# 3. Conferir
tail -f /var/log/centraldark-sync.log
```

A partir daí: você edita no Lovable → 2min depois aparece no `ServerVpss/CentralDark` e o site rebuilda sozinho.
