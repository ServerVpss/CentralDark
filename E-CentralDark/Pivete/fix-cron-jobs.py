import subprocess
import sys
import time

gateway_python = r"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"

def run_hermes(*args):
    """Executa um comando hermes via o python do venv para evitar timeout do terminal tool."""
    cmd = [gateway_python, "-c", f"import subprocess; subprocess.run(['hermes', {' '.join(repr(a) for a in args)}])"]
    print(f"EXECUTANDO: hermes {' '.join(args)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    print(f"exit: {result.returncode}")
    if result.stdout: print(f"stdout: {result.stdout[:300]}")
    if result.stderr: print(f"stderr: {result.stderr[:300]}")
    return result.returncode == 0

print("\n=== PASSO 1: RECRIA 3 JOBS DE TELEMETRIA SUMIDOS ===")

telemetria_jobs = [
    ("5050ea9f4723", "Telemetry collection PS1", "*/15 * * * *", "logs/telemetria/CollectTelemetry.ps1", None, None),
    ("8a7b98f04c7c", "Telemetry w/ model (tencent/hy4-preview)", "*/15 * * * *", "telemetry_model.py", "openrouter", "tencent/hy4-preview"),
    ("89f742175bac", "Telemetry w/ free model (tencent/hy4-preview)", "*/15 * * * *", "telemetry_model_free.py", "openrouter", "tencent/hy4-preview"),
]

for job_id, name, schedule, script, provider, model in telemetria_jobs:
    print(f"\n--- Recriando {job_id}: {name} ---")
    cmd = ["hermes", "cron", "create",
           "--name", name,
           "--schedule", schedule,
           "--script", script,
           "--mode", "no-agent",
           "--repeat", "∞",
           "--deliver", "local"]
    if provider:
        cmd += ["--provider", provider]
        cmd += ["--model", model]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    print(f"exit: {result.returncode}")
    if result.stdout: print(f"stdout: {result.stdout[:400]}")
    if result.stderr: print(f"stderr: {result.stderr[:400]}")

print("\n=== PASSO 2: CORRIGIR PATH DO SYSTEM BREATHING ===")
result = subprocess.run(["hermes", "cron", "edit", "0e769e2ce2b2", "--script", "scripts/system-breathing.py"],
                       capture_output=True, text=True, timeout=15)
print(f"exit: {result.returncode}")
if result.stdout: print(f"stdout: {result.stdout[:300]}")
if result.stderr: print(f"stderr: {result.stderr[:300]}")

print("\n=== PASSO 3: CONVERTER SCRIPT PRs PARA PYTHON E RECRIAR JOB ===")
# Criar script Python para PRs abertos
py_script = '''import subprocess
import json

result = subprocess.run(
    ['gh', 'pr', 'list', '--state', 'open', '--limit', '5', '--json', 'number,title,headRefName,updatedAt,additions,deletions'],
    capture_output=True, text=True, timeout=30
)
if result.returncode == 0:
    prs = json.loads(result.stdout)
    for pr in prs:
        print(f"[PR #{pr['number']}] {pr['title']} | branch: {pr['headRefName']} | updated: {pr['updatedAt']} | +{pr['additions']}/-{pr['deletions']}")
else:
    print(f"Erro ao listar PRs: {result.stderr}")
'''
with open("scripts/prs-open-commits-cycle.py", "w") as f:
    f.write(py_script)
print("Script Python criado: scripts/prs-open-commits-cycle.py")

# Recriar job com script Python
result = subprocess.run(["hermes", "cron", "create",
                        "--name", "PRs abertos com commits — ciclo interno até 18h (Python)",
                        "--schedule", "every 30m",
                        "--script", "scripts/prs-open-commits-cycle.py",
                        "--mode", "no-agent",
                        "--repeat", "∞",
                        "--deliver", "local"],
                       capture_output=True, text=True, timeout=20)
print(f"exit: {result.returncode}")
if result.stdout: print(f"stdout: {result.stdout[:300]}")
if result.stderr: print(f"stderr: {result.stderr[:300]}")

# Deletar job antigo bash
result = subprocess.run(["hermes", "cron", "remove", "7d71467a3e46"],
                       capture_output=True, text=True, timeout=15)
print(f"Remove job antigo 7d71467a3e46: exit {result.returncode}")

print("\n=== PASSO 4: ATUALIZAR MONITOR HERMEX PARA tencent/hy4-preview ===")
result = subprocess.run(["hermes", "cron", "edit", "6fa96b458564",
                        "--provider", "openrouter",
                        "--model", "tencent/hy4-preview"],
                       capture_output=True, text=True, timeout=15)
print(f"exit: {result.returncode}")
if result.stdout: print(f"stdout: {result.stdout[:300]}")
if result.stderr: print(f"stderr: {result.stderr[:300]}")

print("\n=== FINALIZADO ===")
