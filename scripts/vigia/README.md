# Vigia de Actions Vermelhos

Bot 24/7 que **detecta workflows do GitHub Actions falhando** e abre Issue
automática pra revisão posterior. Quando a IA pedir "olha os vermelhos",
basta filtrar Issues pela label `vigia`.

## Como funciona

1. **Gatilho 1 — `workflow_run` completed:** sempre que QUALQUER workflow
   termina, o vigia avalia. Falhou → abre/atualiza Issue. Falha sem step vira alerta de esteira/runner/billing. Verde → fecha
   Issue existente.
2. **Gatilho 2 — cron `7 8 * * *`:** varredura diaria dos últimos 100
   runs (cobre forks/PRs onde `workflow_run` não dispara).
3. **Gatilho 3 — `workflow_dispatch`:** botão manual.

## Dedupe

- 1 Issue por workflow, via label `red-action:<slug-do-nome>`.
- Novas falhas viram **comentário** na mesma Issue.
- Quando o workflow volta ao verde, a Issue **fecha sozinha** com `state_reason: completed`.

## Labels aplicadas

| Label              | Significado                                           |
| ------------------ | ----------------------------------------------------- |
| `vigia`            | Aberta pelo Vigia                                     |
| `auto`             | Automação (não criada à mão)                          |
| `p2`               | Prioridade média (default)                            |
| `red-action:<x>`   | Workflow específico, usado pra dedupe                 |
| `assign:<bot>`     | Bot dono (codex/lovable/grok/supabase-bot) → Dispatcher |

## Roteamento por nome do workflow

- `codeql`/`security` → `assign:codex`
- `painel`/`frontend`/`ui` → `assign:lovable`
- `deploy`/`vps`/`pm2` → `assign:grok`
- `supabase`/`migrations`/`db` → `assign:supabase-bot`
- `bot-server`/`whatsapp`/`wuzapi` → `assign:codex`
- default → `assign:codex`

## Anti-loop

O próprio Vigia é ignorado (`IGNORADOS = ["vigia-actions-vermelhos"]`),
então se o vigia falhar não cria Issue de si mesmo.

## Como pedir revisão

> "Olha os vermelhos do Actions" → a IA consulta Issues abertas com a label `vigia` no repo `ServerVpss/CentralDark`.
> Se o ambiente tiver `gh`, pode usar `gh issue list -R ServerVpss/CentralDark -l vigia --state open`; se não tiver, usar a UI/API do GitHub.
> O Vigia em si não depende do CLI `gh`: opera pelo Octokit/API com `GITHUB_TOKEN`.
> Cada Issue tem run+commit+job+step+autor pra debug.


## Billing Guard / self-hosted

Quando uma falha chega sem step claro ou com indício de billing/spending limit/runner, o Vigia classifica como `esteira-runner-billing`, adiciona label `esteira` e, com `AUTO_REPAIR_BILLING_GUARD=true`, tenta o Auto-Repair seguro: localizar o arquivo `.github/workflows/<workflow>.yml`, criar branch `vigia/billing-guard-<workflow>`, trocar somente `runs-on: ubuntu-latest` literal por `runs-on: self-hosted` e abrir PR **draft**. Ele não faz merge automático e bloqueia workflows sensíveis por nome/caminho (`deploy`, `caddy`, `docker`, `pm2`, `wuzapi`, `whatsapp`, `crm`, `supabase`, `database`, `banco`, `secret`). Não autoriza deploy, restart, Caddy, Docker, PM2 ou leitura de secrets.

## `gh` CLI é opcional

O workflow do Vigia faz um preflight informativo (`command -v gh`) apenas para registrar se o GitHub CLI existe no runner. A ausência do `gh` não falha o job, porque o caminho principal do Vigia é Octokit/API (`@octokit/rest`) com `GITHUB_TOKEN`.
