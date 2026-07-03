# 🤖 Time de Bots — CentralDark

> 📌 **Mapa visual e ordem de implementação:** `docs/BOTS/TIME-DE-BOTS.md`
> 📌 **Protocolo de revisão humana (obrigatório):** `docs/BOTS/PROTOCOLO-REVISAO-HUMANA.md`
> 📌 **Seed das labels oficiais:** workflow `.github/workflows/bots-labels-seed.yml` (rodar manual a cada bot novo)
> 📌 **Regra inquebrável:** todo bot abre Issue/PR com label `revisao-humana`. Nenhum bot mergeia em `main`, apaga arquivo, reinicia produção ou toca secret.

Matriz oficial "quem faz o quê". Cada bot tem escopo fixo e label de assign. Sentinela 24/7 detecta divergência → abre Issue → Dispatcher roteia.

## Quadro

| Bot | Label | Escopo | Onde mora | Como roda |
|---|---|---|---|---|
| **ChatGPT + MCP** | `assign:chatgpt` | Comando central, validação cadeia 7 passos, fechamento | `mcp.centralldark.com` | manual (humano) |
| **Codex** | `assign:codex` | Revisão código + PRs pequenos + build/test | GitHub App | `pr-auto-review.yml`, `codex-validate.yml` |
| **Supabase Bot** | `assign:supabase-bot` | Schema/RLS/migrations read-only | `CentralDark/apps/supabase-bot/` | `supabase-bot.yml` |
| **Lovable** | `assign:lovable` | Frontend/UI/painel | Lovable | sync repo |
| **Grok** | `assign:grok` | VPS/PM2/SSH read-only | sandbox | manual |
| **Dependabot** | — | Atualizações de dep | GitHub | `dependabot.yml` |
| **CodeQL** | — | Segurança JS/TS | GitHub | `codeql.yml` |
| **Sentinela** | — | Detecta divergência e abre Issue | `scripts/sentinela/` | `sentinela-divergencias.yml` (6h) |
| **Dispatcher** | — | Roteia Issue ao bot dono | — | `dispatcher-bots.yml` (on label) |
| **Doc-guardião** | `assign:doc-guardiao` | Cobra README/PLANO por pasta | planejado | modo relatório |
| **Faxineiro-repo** | `assign:faxineiro-repo` | Órfãos/ZIPs/dangling | planejado | modo relatório |
| **Auditor-divergência** | `assign:auditor-divergencia` | Repo vs origin/main vs VPS | planejado | modo relatório |
| **Guarda-segurança** | `assign:guarda-seguranca` | Gitleaks/Semgrep/OSV/Trivy | planejado | modo relatório |
| **VPS-healthcheck** | `assign:vps-healthcheck` | SSH read-only, sem restart | GitHub Actions | `vps-healthcheck.yml` |

> Compatibilidade: labels antigas (`assign:faxineiro`, `assign:auditor`, `assign:seguranca`, `assign:vps-health`) continuam no seed como aliases. Novos fluxos devem preferir os nomes completos.

## Regras invioláveis

1. **Anti-loop**: bot só age se a label `assign:<self>` estiver presente.
2. **TTL 7 dias**: Issue da sentinela sem PR/comentário em 7d → `stale` (escalada por `sentinela-stale.yml`).
3. **Dedupe**: sentinela calcula hash do título; não reabre Issue que já existe.
4. **Sensível bloqueado**: nenhum bot toca Docker, WuzAPI, WhatsApp, Caddy, banco real, secrets, sem confirmação humana.
5. **Relatório obrigatório**: toda execução de bot grava em `docs/RELATORIOS/<bot>/<data>.md`.

## Fluxo

```text
[Endpoint cai / workflow vermelho / PM2 errored]
       ↓
  Sentinela (cron 6h)
       ↓
  Issue [SENTINELA] com label assign:<bot> + p1/p2/p3
       ↓
  Dispatcher posta briefing pro bot
       ↓
  Bot age (PR, comentário, relatório)
       ↓
  ChatGPT valida cadeia 7 passos → fecha Issue
       ↓
  Painel registra evento via painel-auto-update.yml
```

## Status ao vivo
- Último relatório da sentinela: `docs/sentinela/last-report.md`
- Último relatório do Supabase Bot: `docs/RELATORIOS/supabase-bot/latest.md`
- Última validação do painel: `docs/RELATORIOS/painel-vivo-validacao/latest.md`
