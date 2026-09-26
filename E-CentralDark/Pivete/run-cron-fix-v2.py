import subprocess
import sys

def run(cmd, timeout=60, label=""):
    """Executa comando com subprocess.run, imprime resultado."""
    if label:
        print(f"\n{'='*60}")
        print(f"  {label}")
        print(f"{'='*60}")
    print(f"CMD: {' '.join(cmd)}")
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        print(f"EXIT: {r.returncode}")
        if r.stdout:
            for line in r.stdout.split('\n'):
                if line.strip():
                    print(f"  OUT: {line[:200]}")
        if r.stderr:
            for line in r.stderr.split('\n'):
                if line.strip():
                    print(f"  ERR: {line[:200]}")
        return r.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT após {timeout}s")
        return False
    except Exception as e:
        print(f"ERRO: {e}")
        return False

print("=== CORRECAO DOS CRON JOBS - EXECUCAO MANUAL ===\n")

# Passo 1: Recriar 3 jobs de telemetria (sem --repeat, usa default)
telemetria = [
    {
        "name": "Telemetry collection PS1",
        "schedule": "*/15 * * * *",
        "script": "logs/telemetria/CollectTelemetry.ps1",
        "mode": "no-agent",
        "deliver": "local",
        "provider": None,
        "model": None,
    },
    {
        "name": "Telemetry w/ model (tencent/hy4-preview)",
        "schedule": "*/15 * * * *",
        "script": "telemetry_model.py",
        "mode": "no-agent",
        "deliver": "local",
        "provider": "openrouter",
        "model": "tencent/hy4-preview",
    },
    {
        "name": "Telemetry w/ free model (tencent/hy4-preview)",
        "schedule": "*/15 * * * *",
        "script": "telemetry_model_free.py",
        "mode": "no-agent",
        "deliver": "local",
        "provider": "openrouter",
        "model": "tencent/hy4-preview",
    },
]

for job in telemetria:
    cmd = ["hermes", "cron", "create"]
    cmd += ["--name", job["name"]]
    cmd += ["--schedule", job["schedule"]]
    cmd += ["--script", job["script"]]
    cmd += ["--mode", job["mode"]]
    cmd += ["--deliver", job["deliver"]]
    if job["provider"]:
        cmd += ["--provider", job["provider"]]
        cmd += ["--model", job["model"]]
    
    run(cmd, timeout=45, label=f"CRIAR: {job['name']}")

# Passo 2: System Breathing já corrigido (verificado no log do processo anterior)
print("\n\nPasso 2 SKIP: System Breathing (0e769e2ce2b2) já corrigido — log confirmou 'Updated job'")

# Passo 3: Criar job PRs com script Python
print("\n\n=== CRIAR JOB PRs (PYTHON) ===")
cmd = ["hermes", "cron", "create"]
cmd += ["--name", "PRs abertos com commits — ciclo interno (Python)"]
cmd += ["--schedule", "every 30m"]
cmd += ["--script", "scripts/prs-open-commits-cycle.py"]
cmd += ["--mode", "no-agent"]
cmd += ["--deliver", "local"]
run(cmd, timeout=45, label="CRIAR JOB PRs")

# Passo 4: Remover job antigo bash (7d71467a3e46)
print("\n\n=== REMOVER JOB ANTIGO BANSH (7d71467a3e46) ===")
cmd = ["hermes", "cron", "remove", "7d71467a3e46"]
run(cmd, timeout=30, label="REMOVER 7d71467a3e46")

# Passo 5: Atualizar Monitor Hermex para tencent/hy4-preview
print("\n\n=== ATUALIZAR MONITOR HERMEX ===")
cmd = ["hermes", "cron", "edit", "6fa96b458564"]
cmd += ["--provider", "openrouter"]
cmd += ["--model", "tencent/hy4-preview"]
run(cmd, timeout=30, label="EDIT 6fa96b458564")

print("\n\n=== VERIFICAR STATUS FINAL ===")
cmd = ["hermes", "cron", "list"]
run(cmd, timeout=30, label="CRON LIST")

print("\n\n=== FIM ===")
