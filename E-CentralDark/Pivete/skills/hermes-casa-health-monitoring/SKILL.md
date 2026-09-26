---
name: hermes-casa-health-monitoring
description: Monitor Hermes-Casa health and safely remediate issues.
version: 1.0.0
author: Hermes-Casa
category: operational
---

# Hermes-Casa Health Monitoring

## Purpose
Provide a repeatable, safe way to monitor CPU, RAM, stuck processes, and key services on the local machine (Windows) without causing disruption.

## When to Use
- Periodic health checks (e.g., every 30 minutes) via cron job.
- When user reports slowness or unresponsiveness.
- Before making changes to ensure baseline.

## How It Works
1. Run a lightweight script that gathers:
   - CPU load percentage
   - RAM used/total
   - List of high‑memory processes (ChatGPT, codex, Hermes, python, pwsh, Code.exe)
   - Count of "Not Responding" processes
   - Optional: known CentralDark service ports
2. Compare against thresholds:
   - CPU > 80% → suspect
   - RAM used > 80% total → suspect
   - Any single process > 500 MB → suspect
   - Any "Not Responding" process → suspect
3. If 2/3 consecutive samples are suspect, classify cause and optionally remediate only the offending process (if safe).
4. Output short status (🟢 saudável, 🟡 observando, 🔴 intervenção necessária) and a detailed report when needed.

## Known Bugs & Fixes

### Live screen clutter vs distributed runtime noise
When the user says programs remain on screen, treat the visible windows as the primary symptom and startup logs only as independent clues.

1. Inventory every visible window, then correlate each one to PID, executable path, command line, parent PID, session/user, start time, children, listening ports, and launch owner.
2. Classify each window as user app, Hermes surface, ACP/MCP child, monitor/overlay, remote-control surface, or unknown. Map remote surfaces separately across local Casa, RDP/AnyDesk, VPS, and other reachable hosts; absence of access stays `UNKNOWN`.
3. Do not conclude that Hermes caused the clutter from a window count, title, or warning. Require a causal chain from Hermes/bridge parentage or launch evidence to the exact window.
4. Treat Job Object assignment failure as a subprocess-leak hypothesis only. Confirm whether the child outlives its parent and remains visible before calling it causal.
5. Never close by executable name or in bulk. Close only an exact PID after owner, current work, and impact are known; preserve other agents and remote sessions.
6. Report three independent verdicts: `VISIBLE_CLUTTER`, `HERMES_HEALTH`, and `REMOTE/DISTRIBUTED_STATE`. One may fail while the others pass.

See `references/window-inventory.md` for the Windows correlation recipe and proof gates.

### Windows startup log triage
When startup logs show one of these patterns, classify them before remediating:
- `Unknown toolsets: bfl` → stale config still carries the retired `bfl` toolset. Re-run the config checker, remove `bfl` from saved toolset lists, and restart; do not treat it as a runtime defect.
- `MCP server 'hermes-studio-*' failed initial connection ... Connection closed` → the Studio bridge did not stay up long enough for discovery. Verify the backing Studio service/bridge is running, or disable the Studio MCP servers if Studio is not in use.
- `Failed to assign process ... to Job Object: Acesso negado.` → usually a Windows permission warning. Leave it alone unless child processes leak, refuse to exit, or the agent fails to supervise subprocesses.

### Float arithmetic error in get_proc_mem
**Sintoma:** ao rodar `bash health_check.sh`, recebe erros como:
```
health_check.sh: line 12: ((: 221.712: arithmetic syntax error: invalid arithmetic operator (error token is ".712")
```
**Causa:** o `tasklist` devolve valores decimais (ex: "221.712" KB) quando o script usa `print $5` no awk sem arredondar. O `(( kb > 0 ))` do bash não aceita float.

**Correção:** arredondar com `printf "%d"` no awk ANTES do comparativo aritmético:
```bash
kb_int=$(echo "$line" | awk -F, '{gsub(/"/,"",$5); gsub(/ K/,"",$5); if($5+0>0) printf "%d", $5}')
if [[ -n "$kb_int" ]] && (( kb_int > 0 )); then
    total_kb=$((total_kb + kb_int))
fi
```
O teste estrutural verifica presença de divisão inteira e ausência do pattern legado `sum+=` — mas não prova execução. Rodar `bash health_check.sh` de fato para confirmar.

### Concorrência de escrita (Writer Collision)
**Sintoma:** após corrigir o script, ele volta ao estado anterior com `sum+=` e float errors em leituras subsequentes. Outro agente/Hermes está reescrevendo o arquivo entre edições.

**Contramedida:**
- Ler o arquivo COMPLETO antes de qualquer patch (read_file inteiro, não offset/limit)
- Escrever com write_file de uma vez só (não múltiplos patches parciais)
- Verificar checksum disco vs HEAD indiferente: `git hash-object scripts/health_check.sh` vs `git rev-parse HEAD:scripts/health_check.sh`
- Se houver divergência, reaplicar correção e commitar IMEDIATAMENTE (sem janela entre teste e commit)
- Verificar se há processos escrevendo no arquivo: `taskkill //F //IM nome.exe` ou `handle.exe`

## Thresholds atualizados
- CPU > 70% (não 80%)
- RAM > 70% (não 80%)
- Processo > 300MB (não 500MB)
- Qualquer "Not Responding" → suspeito

## Script Location
`scripts/health_check.sh` (bash, compatible with Git‑Bash/MSYS on Windows)

## Cron Job Example
```bash
cronjob create \
  --name HERMES-CASA-HEALTH-WATCH \
  --prompt "bash /E:/CentralDark/Pivete/CentralDark/scripts/health_check.sh" \
  --schedule "30m" \
  --deliver local
```

## Safe Remediation
- Only kill a process if it is confirmed "Not Responding" across two consecutive checks.
- Never kill based solely on high RAM usage.
- Never restart Hermes or other services unless explicitly authorized.
- Always verify PID and executable path before action.

## References
- references/health_check_script.md – the exact script used.
- references/cron_job_example.md – example cronjob command.