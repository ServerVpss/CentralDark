# Self-Hosted Runner — Prevenção de Jobs Amarelos (Queued/Pending)

## Problema
Jobs GitHub Actions em self-hosted ficam "amarelos" (queued/pending) por tempo excessivo, travando CI e deploy.

## Causas Raiz & Soluções

| Causa Raiz | Sintoma | Solução no Workflow |
|---|---|---|
| **Runner offline/desconectado** | Job entra na fila mas não inicia | Healthcheck pré-job + auto-restart |
| **Concurrency group travado** | `cancel-in-progress: false` + job anterior travado | `cancel-in-progress: true` onde deploy atômico garante rollback |
| **Runner sem labels corretas** | `runs-on: [self-hosted, Linux]` não casa | Labels explícitas + verificação no bootstrap |
| **Job anterior não limpa lock** | `flock` ou PID file órfão | Step `post`-always cleanup |
| **Runner ocioso mas não pega job** | Runner `idle` mas job pendente | `_diag` logging + restart listener |

---

## Melhorias nos Workflows (aplicar em `vps-exec-selfhosted.yml` e similares)

### 1. `cancel-in-progress: true` onde seguro
```yaml
concurrency:
  group: centraldark-vps-production
  cancel-in-progress: true  # Era false - travava fila se job anterior bugasse
```
> Só onde deploy atômico garante rollback (já tem no script).

### 2. Healthcheck pré-job obrigatório
```yaml
jobs:
  runner-healthcheck:
    name: Verificar runner self-hosted vivo
    runs-on: [self-hosted, Linux]
    timeout-minutes: 2
    steps:
      - run: |
          pgrep -f "Runner.Listener" || { echo "RUNNER_DEAD"; exit 1; }
          curl -fsS --max-time 5 "https://github.com" >/dev/null || { echo "GITHUB_UNREACHABLE"; exit 1; }
  deploy-mcp:
    needs: runner-healthcheck
    # ...
```

### 3. Timeouts menores + step-level timeouts
```yaml
jobs:
  deploy-mcp:
    timeout-minutes: 20  # Era 25 - reduz pressão na fila
    steps:
      - run: |
          set -euo pipefail
          timeout 300s fase_build
          timeout 120s fase_deploy
```

### 4. Step `post`-always para limpar locks órfãos
```yaml
steps:
  - name: Deploy...
    id: deploy
    shell: bash
    run: |
      # ... script com flock ...
  - name: Cleanup lock órfão (post)
    if: always()
    run: |
      find /tmp -name "centraldark-*-deploy.lock" -mmin +10 -delete 2>/dev/null || true
      pkill -f "centraldark-mcp-deploy.lock" 2>/dev/null || true
```

---

## Monitoramento Cruzado VPS ↔ GitHub (Cron no VPS)

```bash
# Cron no VPS a cada 5min: reporta saúde do runner para GitHub
gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | select(.status=="online") | .name' | wc -l
# Se 0 → alerta + systemctl restart actions.runner.centraldark.service
```

Criar cron job Hermes local se necessário:
```bash
hermes cron create \
  --name "runner-health-monitor" \
  --schedule "*/5 * * * *" \
  --script "scripts/vps/runner-health-monitor.sh" \
  --workdir "E:/CentralDark/Pivete/CentralDark" \
  --no-agent
```

---

## Referência Cruzada
- Skill principal: `centraldark-vps-runner` (setup/manutenção do runner)
- Skill operacional: `centraldark-operational-discipline` (Regra 45: GH RUN ID ≠ PR/COMMIT COUNTER)
- Workflow canônico: `.github/workflows/vps-exec-selfhosted.yml`

---

## Prova de Eficácia
- Runner `online` na API ✅
- `gh run` de PR novo conclui (não queued) ✅
- Labels batem `runs-on: [self-hosted, Linux]` ✅
- Zero jobs travados em pending > 5min ✅