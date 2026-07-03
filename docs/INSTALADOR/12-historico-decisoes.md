# 12 — Histórico de decisões técnicas

Log cronológico das decisões. Toda mudança arquitetural ganha uma entrada nova aqui.

## 2026-06-05 — Sync ServerVpss → segredounlock robustecido
- Decisão: assumir `ServerVpss/clone-deck` como origem de edição e `segredounlock/clone-deck` como destino espelho que alimenta deploy/VPS.
- Fluxo oficial: `ServerVpss/clone-deck → Sync to segredounlock → segredounlock/clone-deck → deploy/webhook/fallback/cron → VPS`.
- Workflow principal: `.github/workflows/sync-to-segredounlock.yml`.
- Excludes centralizados em `.github/sync-excludes.txt` para evitar espalhar regra sensível no YAML.
- Healthcheck novo: `.github/workflows/sync-healthcheck.yml`, cron horário + manual, comparando conteúdo espelhável com `rsync --dry-run`.
- Proteção anti-loop: marcadores `[sync-peer]` e `[sync-alert]`.
- Segurança: não usar `git push --force`; se destino divergir, rebase falha e o job para com erro claro.
- Documentação dedicada: `docs/SYNC_REPOS.md`.
- Não tocado: Docker, WuzAPI, WhatsApp, Caddy, CRM, banco real, secrets reais ou domínio.

## 2026-06-04 — Fallback Lovable↔GitHub criado
- Decisão: criar conjunto de scripts em `CentralDark/scripts/deploy/lovable-*.sh` pra quando o sync Lovable↔GitHub falhar.
- Camadas (na ordem): PAT (`GITHUB_PAT_PERFIL`) via API → SSH na VPS (`scripts/lovable-agent/setup-vps-ssh.sh`) → MCP (fase 2).
- Por padrão abre PR (`FALLBACK_DIRECT_MAIN=false`). Push direto na `main` só com flag explícita.
- Allowlist negativa: nunca toca em `apps/crm/`, `infra/caddy/`, `infra/docker/`, `wuzapi/`, `whatsapp-server/`.
- Lock `flock`, dry-run, sanitização de log, relatório em `/root/CentralDark/revisoes/`.
- Atalhos globais via `install.sh`: `centraldark-lovable-check`, `centraldark-lovable-sync`, `centraldark-lovable-report`.

## 2026-06-03 — Criada doc viva do instalador
- Decisão: centralizar tudo que o instalador precisa em `docs/INSTALADOR/`.
- Motivo: garantir que reinstalar em outra VPS seja determinístico.
- Regra nova: qualquer PR/commit que adiciona dependência, porta, serviço, env var ou pasta precisa atualizar o arquivo correspondente desta pasta no mesmo commit.

## 2026-06-03 — Fluxo de deploy confirmado
- Lovable commita direto em `main`.
- VPS sincroniza por: cron `gh-pull` a cada 5min + webhook instantâneo.
- Decisão: manter cron como garantia, registrar correção do webhook como pendência em `docs/PENDENCIAS.md`.

## 2026-06-03 — Limpeza automática de branches/PRs
- Criado `.github/workflows/housekeeping.yml` (cron diário 02:00 UTC).
- Apaga branches mergeadas, fecha PRs com 14d+ sem atividade (warn) e 21d (close), apaga órfãos `codex/*`, `lovable-backup-*`, `edit/edt-*`, `auto/*`, `diagnostics/*`, `chore/vps-*` com 30d+.
- Limpeza inicial manual feita: 60+ branches mortas removidas, repo enxugou de >80 pra 17 branches remotas.

## 2026-06-04 — ChatGPT conectado no MCP via OAuth GitHub (provisório)
- **Decisão:** ChatGPT (Custom Connector) plugado em `https://mcp.centralldark.com/mcp` usando o OAuth do GitHub já existente (Client ID `Ov23li1y2mZ3qbjVB4mC`, login com `segredounlock`).
- **Motivo:** validar o ciclo completo IA externa ⇄ MCP ⇄ Repo ⇄ Lovable antes de investir em OAuth próprio.
- **Status:** ✅ Funcional — ChatGPT enxerga as tools `ler_consciencia`, `ler_pendencias`, `adicionar_pendencia`, `fechar_pendencia`, `atualizar_consciencia` e as tools gerais de GitHub/VPS.
- **Persistência de sessão:** corrigida via `MCP_STATE_FILE` (`/root/CentralDark/secrets/mcp-state.json`, perm 0600) — `pm2 restart` não desloga mais.
- **OAuth próprio CentralDark:** fica pra futuro distante (pendência 🟢 baixa). Por enquanto, GitHub OAuth resolve.
- **Cloudflare:** DNS de `mcp.centralldark.com` já apontado pra VPS via Cloudflare (registro A); SSL termina no Caddy.

## 2026-06-04 — Doc viva do ciclo IA externa
- Atualizados `docs/INSTALADOR/14-conectar-ia-externa.md` e seção 8 da `docs/CONSCIENCIA/CONSCIENCIA.md` pra refletir o estado pós-conector e o ciclo bidirecional (IA externa lê E escreve no repo via MCP).
