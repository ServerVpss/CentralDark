import subprocess
import sys

def run(cmd, timeout=45, label=""):
    """Executa comando, imprime resultado, retorna True se sucesso."""
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(f"CMD: hermes cron create " + " ".join(f'--{k} {v}' for k,v in {
        'name': cmd[2], 'deliver': cmd[4], 'script': cmd[6],
        'mode': cmd[8], 'workdir': cmd[10] if len(cmd) > 10 else None
    }.items() if v))
    print(f"SCHEDULE POSICIONAL: {cmd[1]}")
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        print(f"EXIT: {r.returncode}")
        if r.stdout:
            for line in r.stdout.split('\n'):
                if line.strip(): print(f"  >> {line[:200]}")
        if r.stderr:
            for line in r.stderr.split('\n'):
                if line.strip(): print(f"  !! {line[:200]}")
        return r.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT após {timeout}s")
        return False
    except Exception as e:
        print(f"ERRO: {e}")
        return False

print("=== CRIAR CRON JOBS - SINTAXE CORRETA (SCHEDULE POSICIONAL) ===\n")

# Jobs de telemetria (sem --schedule, schedule é positional)
jobs = [
    {
        "name": "Telemetry collection PS1",
        "schedule": "*/15 * * * *",
        "script": "logs/telemetria/CollectTelemetry.ps1",
        "deliver": "local",
        "workdir": r"E:\CentralDark\Pivete",
    },
    {
        "name": "Telemetry w/ model (tencent/hy4-preview)",
        "schedule": "*/15 * * * *",
        "script": "telemetry_model.py",
        "deliver": "local",
        "workdir": r"E:\CentralDark\Pivete",
        "provider": "openrouter",
        "model": "tencent/hy4-preview",
    },
    {
        "name": "Telemetry w/ free model (tencent/hy4-preview)",
        "schedule": "*/15 * * * *",
        "script": "telemetry_model_free.py",
        "deliver": "local",
        "workdir": r"E:\CentralDark\Pivete",
        "provider": "openrouter",
        "model": "tencent/hy4-preview",
    },
]

for job in jobs:
    # Construir comando: hermes cron create [options] schedule
    cmd = ["hermes", "cron", "create"]
    cmd += ["--name", job["name"]]
    cmd += ["--deliver", job["deliver"]]
    cmd += ["--script", job["script"]]
    cmd += ["--no-agent"]
    cmd += ["--workdir", job["workdir"]]
    if job.get("provider"):
        cmd += ["--provider", job["provider"]]
        cmd += ["--model", job["model"]]
    # schedule É POSICIONAL — vai no FINAL
    cmd.append(job["schedule"])
    
    run(cmd, timeout=45, label=f"CRIAR: {job['name']}")

# Job PRs com script Python
print("\n\n=== CRIAR JOB PRs (PYTHON) ===")
cmd = ["hermes", "cron", "create"]
cmd += ["--name", "PRs abertos com commits — ciclo interno (Python)"]
cmd += ["--deliver", "local"]
cmd += ["--script", "scripts/prs-open-commits-cycle.py"]
cmd += ["--no-agent"]
cmd += ["--workdir", r"E:\CentralDark\Pivete\CentralDark"]
cmd.append("every 30m")  # schedule posicional
run(cmd, timeout=45, label="CRIAR JOB PRs")

print("\n\n=== VERIFICAR CRON LIST ===")
cmd = ["hermes", "cron", "list"]
try:
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    print(f"EXIT: {r.returncode}")
    if r.stdout:
        for line in r.stdout.split('\n'):
            if line.strip(): print(f"  {line[:150]}")
except Exception as e:
    print(f"ERRO: {e}")

print("\n\n=== FIM ===")
