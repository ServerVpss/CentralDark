---
name: centraldark-forensic-attribution
description: Forensic attribution for VPS deploy and runtime issues.
---

# Forensic Attribution for VPS Deploy / Runtime Issues

## When to use

Use when:
- A deploy, service, or runtime on the VPS failed or is behaving unexpectedly
- You need to diagnose the CAUSE before declaring resolution
- You have an event (T0) and need to attribute it to a worker/PID/runtime that executed

Do NOT use when:
- You haven't identified the event yet (T0 unknown)
- The issue is purely code-level and doesn't involve runtime attribution
- You're in a purely read-only audit without a specific incident

## Pattern

### 1. Identify the event (T0)
- What happened? (deploy failed, service down, health check failed, etc.)
- When did it happen? (timestamp)
- What was the state before? (T-1 if measurable)

### 2. Attribute the event to a worker/PID
- Find the PID associated with the event
- Record the PID start time, command, working directory
- Link to process tree if available

### 3. Identify the code that executed
- Git HEAD at the time of the event
- Dist hash (if applicable)
- Dist mtime
- Any relevant build artifacts

### 4. Measure runtime state at T1 (after event)
- Is the service still running?
- Is the port still listening?
- Health check result (with body, not just HTTP 200)
- PM2 status, PID stability

### 5. Diagnose CAUSE only after attribution
- If attribution is incomplete → UNKNOWN, not a cause
- If attribution is complete → diagnose root cause from the linked worker/code/state

## Script

`scripts/vps/forensics-attribution.sh` — reusable forensics capture.

Usage:
```bash
bash scripts/vps/forensics-attribution.sh "<event-description>" "<output-dir>"
```

Captures:
- Event timestamp
- Worker/PID attribution (if identifiable)
- Git HEAD at time of forensics
- Dist mtime and hash
- Port listening status (9100 for MCP)

## Pattern: Configuration Drift Investigation (variant)

Use this variant when the incident is "service down due to config drift" rather than "deploy/runtime failure":

### 1. Locate ALL automatic restart mechanisms
Search the repo for scripts that restart the affected service or touch its config persistence directory:

```bash
# Restart mechanisms
grep -rln "pm2 restart\|docker restart\|systemctl restart\|service restart" scripts/ apps/ --include="*.sh" --include="*.py" --include="*.js" --include="*.ts" | grep -v node_modules

# Config persistence touch
grep -rln "\.calisto\|\.config/<service>\|state\.json\|credentials\.env" scripts/ apps/ --include="*.sh" --include="*.py" --include="*.js" --include="*.ts" | grep -v node_modules

# Scheduler/persistence
grep -rln "cron\|crontab\|@reboot\|systemd.*service\|startup\|LaunchAgents\|Startup" scripts/ --include="*.sh" --include="*.py" | grep -v node_modules
```

Record each mechanism found: arquivo, tipo (cron/PM2/systemd/supervisor), ação (stop/start/restart/reset), e se ele precisa de credenciais de rede.

### 2. Inspect how recovery scripts control startup
For each restart mechanism found, check:
- Does it check config integrity BEFORE restarting?
- Does it have access to the credentials needed (PEM keys, tokens, session files)?
- Does it silently fail if credentials are unavailable, or does it escalate?
- Does it write state back to the persistence directory after restart?

Common pattern in CentralDark: `scripts/cleanup-pm2-caddy.sh`, `scripts/run-once/003-cleanup-pm2-and-caddy.sh`, `scripts/rename-pm2.sh` — these kill/rename PM2 processes before recreating. They are "Kill-Side-Refresh" equivalents.

### 3. Confirm diagnosis: drift + recovery inability = root cause

The root cause is often NOT "config drift alone" but the COMBINATION:
- Config drifted (state.json corrompido, checksum diverge, arquivo essencial faltando)
- Recovery scripts CANNOT restore because they lack access to needed credentials
  (bloqueio de `.pem`, `.key`, `.env`, `secrets/`, `tokens/`, `sessions/`, `.ssh/` em vários scripts MCP/VPS)

**Diagnóstico canônico format:**
```
CAUSA RAIZ: drift de configuração + inabilidade de reinicializar via rede
  [1] DRIFT: ~/.calisto/state.json ou siblings modificados externamente
  [2] FALHA DE RECUPERAÇÃO: scripts de restart não têm acesso a credenciais
      (PEM, tokens, sessão) devido a políticas de bloqueio
  [3] CICLO: config corrompida → restart falha → estado piora → serviço down
```

### 4. Write diagnostic + correction files

Create `docs/<SERVICO>-DRIFT-ROOTCAUSE.md` with:
- Resumo executivo (1 parágrafo)
- Evidências colecionadas (tabela de scripts encontrados)
- Diagnóstico causa-raiz (diagrama ou lista numerada)
- Recomendações de correção (imediato, médio prazo, longo prazo)
- Próximos passos com checklist

Create `scripts/<servico>-drift/` com:
- `audit-<servico>-launch.sh` — auditoria de todos os mecanismos de inicialização
- `check-<servico>-drift.sh` — verificação de drift de configuração
- `restore-<servico>-network-reboot.sh` — restauração de capacidade de reboot via rede

### 5. Create branch and commit

```bash
git checkout -b pivete/work/<servico>-drift-rootcause
git add docs/<SERVICO>-DRIFT-ROOTCAUSE.md scripts/<servico>-drift/
git commit -m "$(cat <<'EOF'
feat(<servico>-drift): investigação forense e diagnóstico de causa raiz

- Localizados TODOS os scripts de reinicialização automática que mexem em
  ~/.<servico> ou persistência via crontab/Startup/scheduler/PM2
- Inspecionados scripts de Kill-Side-Refresh equivalentes
- Confirmado diagnóstico: drift de configuração + inabilidade de
  reinicializar via rede (credenciais bloqueadas) = causa raiz
- Criados scripts de auditoria, verificação e restauração
- Documentado causa raiz em docs/<SERVICO>-DRIFT-ROOTCAUSE.md

ONE_WRITER_PER_SCOPE: pivete/work/<servico>-drift-rootcause
EOF
)"
```

## Pitfalls (drift investigation specific)

- Do NOT diagnose cause before locating ALL restart mechanisms — missing one
  means your root cause analysis is incomplete
- Do NOT assume the drift is the only cause — check if recovery scripts have
  credential access; the combination is often the real root cause
- Do NOT write correction scripts without verifying bash syntax first:
  `bash -n script.sh`
- Do NOT skip the ONE_WRITER_PER_SCOPE documentation — write it in the commit
  message AND in the diagnostic file
- Do NOT treat absence of `~/.calisto` references in repo scripts as proof that
  no automated restart touches it — check PM2 ecosystem configs and crontab too
- Do NOT commit without first checking `git status` for unrelated modified files

## Evidence standards

Every claim in the diagnostic file must be provable by:
- Leitura de arquivo (campos do script, configuração do PM2, crontab)
- Execução de ferramenta (bash -n, grep, find, stat, md5sum)
- Saída de comando (git log, git branch, pm2 jlist)

Never assert a script "mexe em ~/.calisto" without showing the linha exata
do grep/leitura que comprova.

## Environment notes

The script requires on the target environment:
- `pgrep` for PID attribution
- `ss` for port listening status
- `git` for Git HEAD
- `sha256sum` for dist hash
- `stat` for mtime

If any of these are unavailable, the script will record UNKNOWN for that field. This is expected behavior — the script is robust to missing tools, but the forensics will be incomplete.
