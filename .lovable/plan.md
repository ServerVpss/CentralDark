# Plano — Zerar gatilho automático nos 4 workflows sensíveis (PR #86)

Trabalho 100% no repo externo `ServerVpss/CentralDark`, branch `chore/bots-guard-billing-antipublic-reload` (PR #86), via GitHub API. Sem merge, sem mexer em código sensível além do bloco `on:`.

## Objetivo
Manter os 4 em `ubuntu-latest` (motivos técnicos já discutidos), mas remover qualquer gatilho automático — só rodam quando humano clicar "Run workflow". Resultado: zero billing automático + zero risco de execução silenciosa.

## Arquivos afetados (só o bloco `on:`)
1. **`.github/workflows/deploy.yml`** — remover `push`/`pull_request` automáticos, deixar só `workflow_dispatch:`.
2. **`.github/workflows/supabase-bot.yml`** — remover `push`/`schedule`, deixar só `workflow_dispatch:`.
3. **`.github/workflows/vps-healthcheck.yml`** — remover `schedule` (cron). Deixar só `workflow_dispatch:`. ⚠️ Perde healthcheck contínuo — registrar pendência alta pra mover monitoramento pro MCP/Vigia interno depois.
4. **`.github/workflows/wuzapi-sessions-monitor.yml`** — remover `schedule`, deixar só `workflow_dispatch:`. Mesma observação: monitoramento contínuo some, vira manual.

## Execução
1. Ler os 4 arquivos atuais via GitHub API.
2. Editar SÓ o bloco `on:` de cada um (jobs, steps, secrets, runs-on — intocados).
3. Commit único na branch do PR #86, mensagem: `chore(ci): remove automatic triggers from 4 sensitive workflows (zero billing)`.

## Documentação no mesmo commit
- **`docs/RELATORIOS/2026-06-20-zero-github-hosted-runners.md`** — atualizar a seção dos 4 sensíveis: "Mantidos hospedados por necessidade técnica, gatilhos automáticos REMOVIDOS, execução agora 100% manual."
- **`docs/PENDENCIAS.md`** — adicionar 2 itens 🟡 médios:
  - "Substituir healthcheck VPS por monitoramento interno (MCP/Vigia)" — porque cron do `vps-healthcheck` foi desativado.
  - "Substituir cron do wuzapi-sessions-monitor por watcher local na VPS" — mesmo motivo.
- **`docs/CHECKLIST-SEGURANCA-BOTS.md`** — registrar regra: workflow sensível em hospedado = obrigatoriamente `workflow_dispatch` only.

## Restrições
Sem mexer em jobs/steps/secrets/runs-on dos 4. Sem aplicar SQL. Sem tocar em produção, Caddy, Docker, WuzAPI, CRM. Sem merge — só push e aguarda OK humano.

## Entrega
Relatório curto no chat com: arquivos alterados, commit hash, antes/depois dos blocos `on:`, pendências criadas, status do PR #86.
