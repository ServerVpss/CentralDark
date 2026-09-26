import subprocess
import sys
import os

# Script Python que será o novo job para PRs abertos
prs_py_content = '''import subprocess
import json

result = subprocess.run(
    ['gh', 'pr', 'list', '--state', 'open', '--limit', '5', '--json', 'number,title,headRefName,updatedAt,additions,deletions'],
    capture_output=True, text=True, timeout=30
)
if result.returncode == 0:
    try:
        prs = json.loads(result.stdout)
        for pr in prs:
            print(f"[PR #{pr['number']}] {pr['title']} | branch: {pr['headRefName']} | updated: {pr['updatedAt']} | +{pr['additions']}/-{pr['deletions']}")
    except Exception as e:
        print(f"Erro ao parsear PRs: {e}")
        print(f"stdout bruto: {result.stdout[:500]}")
else:
    print(f"Erro ao listar PRs (exit {result.returncode}): {result.stderr[:500]}")
'''

# Salvar script Python
with open("scripts/prs-open-commits-cycle.py", "w") as f:
    f.write(prs_py_content)
print("Script Python criado: scripts/prs-open-commits-cycle.py")

# Verificar se job antigo ainda existe e removê-lo
print("\n=== Verificando job antigo 7d71467a3e46 ===")
result = subprocess.run(["hermes", "cron", "info", "7d71467a3e46"],
                       capture_output=True, text=True, timeout=15)
print(f"info exit: {result.returncode}")
if result.stdout: print(result.stdout[:300])
if result.stderr: print(f"stderr: {result.stderr[:300]}")

# Criar job novo com script Python
print("\n=== Criando job novo para PRs (Python) ===")
new_job_cmd = [
    "hermes", "cron", "create",
    "--name", "PRs abertos com commits — ciclo interno (Python)",
    "--schedule", "every 30m",
    "--script", "scripts/prs-open-commits-cycle.py",
    "--mode", "no-agent",
    "--repeat", "∞",
    "--deliver", "local"
]
result = subprocess.run(new_job_cmd, capture_output=True, text=True, timeout=20)
print(f"create exit: {result.returncode}")
if result.stdout: print(result.stdout[:400])
if result.stderr: print(f"stderr: {result.stderr[:400]}")

# Remover job antigo se existir
print("\n=== Removendo job antigo bash (7d71467a3e46) ===")
result = subprocess.run(["hermes", "cron", "remove", "7d71467a3e46"],
                       capture_output=True, text=True, timeout=15)
print(f"remove exit: {result.returncode}")
if result.stdout: print(result.stdout[:300])
