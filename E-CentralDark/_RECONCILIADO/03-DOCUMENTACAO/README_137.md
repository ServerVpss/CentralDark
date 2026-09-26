# scripts/deploy

Scripts de deploy e de fallback de sincronização.

- Destino na VPS: `/root/CentralDark/scripts/deploy/`

## Scripts existentes

- `post-deploy.sh`, `gh-pull.sh`, webhooks (legado).

## Fallback Lovable ↔ GitHub (novo)

Quando o sync da Lovable trava ou o webhook não chega, este conjunto resolve.

| Script | Função |
|---|---|
| `lovable-check.sh` | Compara estado local × `main` no GitHub. Gera `checks.json`. Não modifica nada. |
| `lovable-sync-fallback.sh` | Orquestra: check → escolhe camada → cria branch/PR → relatório. |
| `lovable-report.sh` | Mostra o último relatório de forma legível. |
| `_lib-sanitize.sh` | Função `sanitize` única (mascara tokens/secrets em qualquer saída). |
| `_lib-github-api.sh` | Wrappers da API do GitHub (`gh_get_ref_sha`, `gh_put_file`, `gh_open_pr` etc.). |

### Camadas de fallback (na ordem)

1. **PAT** via API do GitHub (`GITHUB_PAT_PERFIL` no sandbox ou `/root/CentralDark/secrets/github.env` na VPS).
2. **SSH** na VPS + `git push` (usa `scripts/lovable-agent/setup-vps-ssh.sh`).
3. **MCP CentralDark** (gancho deixado para fase 2).

### Variáveis

| Variável | Default | Função |
|---|---|---|
| `FALLBACK_DIRECT_MAIN` | `false` | `true` permite push direto na `main` (sem PR). |
| `FALLBACK_DRY_RUN` | `false` | `true` faz tudo menos abrir PR/push. |
| `FALLBACK_MAX_FILES` | `50` | Aborta se divergência ultrapassar N arquivos. |
| `FALLBACK_LAYER` | `auto` | `auto` \| `pat` \| `ssh` (força camada). |

### Uso rápido

```bash
# 1. Só conferir
GITHUB_TOKEN=$GITHUB_PAT_PERFIL bash CentralDark/scripts/deploy/lovable-check.sh

# 2. Sincronizar (abre PR por padrão)
GITHUB_TOKEN=$GITHUB_PAT_PERFIL bash CentralDark/scripts/deploy/lovable-sync-fallback.sh

# 3. Ver último relatório
bash CentralDark/scripts/deploy/lovable-report.sh
```

Após instalação via `install.sh`, ficam disponíveis como comandos curtos:

```bash
centraldark-lovable-check
centraldark-lovable-sync
centraldark-lovable-report
```

### Segurança

- Allowlist negativa: **não** mexe em `apps/crm/`, `infra/caddy/`, `infra/docker/`, `wuzapi/`, `whatsapp-server/`.
- Toda saída passa por `sanitize` antes de gravar/imprimir.
- Lock `flock` impede execução concorrente.
- Não faz `rm`, `pm2 restart`, `docker`, `sudo`.

### Relatório

Salvo em `/root/CentralDark/revisoes/YYYYMMDD-HHMMSS/sync-fallback-lovable/`:

```
resumo.md              ← humano-legível, em PT-BR
logs-sanitizados.txt   ← saída completa sem secrets
checks.json            ← estado detectado
acoes-executadas.md    ← cada comando + exit code
```
