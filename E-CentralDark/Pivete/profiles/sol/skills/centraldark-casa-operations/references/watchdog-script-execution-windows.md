# Execução de Watchdog Scripts no Windows (Casa CentralDark)

Padrão de execução e captura de evidência para scripts de monitor/watchdog em `E:\CentralDark\Pivete\scripts\`.

## Pitfall Crítico — Bash indisponível no ambiente Python nativo

Scripts `.sh` (dependabot-monitor.sh, screenpipe-monitor.sh, etc.) **falham** quando executados via `subprocess` Python nativo no Windows:

```
<3>WSL (13 - Relay) ERROR: CreateProcessCommon:818: execvpe(/bin/bash) failed: No such file or directory
```

**Causa**: o processo Python do Hermes Agent roda no ambiente nativo Windows, sem `/bin/bash`. O `subprocess.run(['bash', 'script.sh'])` não encontra o binário.

**Workarounds (em ordem de preferência)**:

1. **Usar o script Python equivalente** quando existir (`screenpipe-monitor.py` instead of `screenpipe-monitor.sh`).
2. **Executar via `execute_code`** — o ambiente Python do execute_code tem mais capacidade de resolver caminhos; testar antes de assumir que `.sh` funciona.
3. **Executar via git-bash** explicitamente: `bash /c/Users/danda/.../script.sh` (se git-bash estiver no PATH).
4. **Próximo passo se nada funcionar**: reportar como BLOCKED + alternativa medida (ex: `monitor_screenpipe.py` já existe no mesmo diretório).

**Regra**: antes de executar um `.sh`, testar `which bash` ou `bash --version`. Se falhar, usar alternativa Python ou reportar.

## Captura de evidência confiável (padrão desta sessão)

Quando o objetivo é "executar cada script, capturar saída, exit code, tempo", usar `execute_code` com subprocess direto — **não** terminal() individual por script (riscos de timeout cumulativo e perda de contexto).

**Template de execução**:

```python
import subprocess, time, json
from datetime import datetime
from pathlib import Path

scripts_dir = Path("E:/CentralDark/Pivete/scripts")
results = []

for script, runner in [
    ("dependabot-monitor.sh", "bash"),
    ("screenpipe-monitor.sh", "bash"),
    ("cadeia-free-watchdog.py", "python"),
    ("webui-watchdog.py", "python"),
]:
    start = int(time.time() * 1000)
    try:
        proc = subprocess.run(
            [runner, str(scripts_dir / script)],
            capture_output=True, text=True, timeout=60,
            cwd=str(scripts_dir)
        )
        elapsed = int(time.time() * 1000) - start
        results.append({
            "script": script, "runner": runner,
            "exit_code": proc.returncode, "elapsed_ms": elapsed,
            "stdout": proc.stdout[-3000:], "stderr": proc.stderr[-1000:],
            "status": "SUCCESS" if proc.returncode == 0 else "FAILED"
        })
    except subprocess.TimeoutExpired:
        results.append({"script": script, "status": "TIMEOUT", "elapsed_ms": 60000})

# Salvar evidência
log_dir = Path("E:/CentralDark/Pivete/logs")
log_dir.mkdir(parents=True, exist_ok=True)
 증거 = {"executed_at": datetime.now().isoformat(), "results": results}
(log_dir / "watchdog-evidence.json").write_text(
    json.dumps(증거, indent=2, ensure_ascii=False), encoding="utf-8"
)
```

**Output**: JSON com timestamp, exit codes, tempos, stdout/stderr truncados. Arquivo: `E:\CentralDark\Pivete\logs\watchdog-evidence.json`.

## Verificação de serviços monitorados

Após executar os scripts, verificar manualmente os serviços que eles monitoram:

| Script | Serviço monitorado | Como verificar |
|--------|-------------------|----------------|
| `dependabot-monitor.sh` | PRs Dependabot no GitHub | `gh pr list --repo ServerVpss/CentralDark --json ...` |
| `screenpipe-monitor.sh` | Processo Screenpipe + porta 3030 | `tasklist | grep -i screenpipe` + `curl localhost:3030` |
| `cadeia-free-watchdog.py` | Portas 8099/8787/8788/3030 + Hermes Agent | `curl localhost:<porta>` + `hermes status` |
| `webui-watchdog.py` | WebUI Hermes (8788) | `curl localhost:8788` |

Se o script falhar antes de chegar à verificação (ex: bash indisponível), fazer a verificação manualmente e registrar no mesmo arquivo de evidência.

## Cron jobs (reminder)

Os scripts têm crons já configurados no sistema da Casa. Não reconfigurar sem ordem do CHEFE:

- `dependabot-monitor.sh`: `* * * * *` (a cada minuto) — se rodar, precisa de bash + gh CLI autenticado
- `screenpipe-monitor.sh`: `* * * * *` (a cada minuto) — mesma dependência de bash
- `cadeia-free-watchdog.py`: a cada 10 min (`no_agent=true`)
- `webui-watchdog.py`: a cada 5 min (`no_agent=true`)
