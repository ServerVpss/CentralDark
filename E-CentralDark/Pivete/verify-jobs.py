import subprocess
import sys

def run(cmd, timeout=15):
    """Executa comando, retorna (returncode, stdout, stderr)."""
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return result.returncode, result.stdout, result.stderr

print("=== SCRIPT DE CORREÇÃO DOS CRON JOBS ===\n")

# 1. Verificar job 0e769e2ce2b2 (System Breathing)
print("1. Sistema Breathing (0e769e2ce2b2):")
rc, out, err = run(["hermes", "cron", "info", "0e769e2ce2b2"])
if rc == 0:
    print(f"   EXISTE. Script apontado: ", end="")
    for line in out.split('\n'):
        if 'Script:' in line or 'script:' in line.lower():
            print(line.strip())
else:
    print(f"   NAO EXISTE ou erro (exit {rc})")

# 2. Verificar job 7d71467a3e46 (PRs)
print("\n2. PRs abertos (7d71467a3e46):")
rc, out, err = run(["hermes", "cron", "info", "7d71467a3e46"])
if rc == 0:
    print(f"   EXISTE.")
    for line in out.split('\n'):
        if 'Script:' in line or 'script:' in line.lower():
            print(f"   Script: {line.strip()}")
else:
    print(f"   NAO EXISTE ou erro (exit {rc})")

# 3. Verificar se script Python para PRs existe
print("\n3. Verificando scripts/prs-open-commits-cycle.py:")
rc, out, err = run(["cmd", "/c", "dir", "scripts\\prs-open-commits-cycle.py"])
print(f"   exit: {rc}")
if rc == 0:
    print("   EXISTE")
else:
    print("   NAO EXISTE — será criado")

# 4. Verificar se job de telemetria 5050ea9f4723 existe
print("\n4. Telemetria PS1 (5050ea9f4723):")
rc, out, err = run(["hermes", "cron", "info", "5050ea9f4723"])
if rc == 0:
    print(f"   EXISTE")
    for line in out.split('\n'):
        if 'Script:' in line or 'script:' in line.lower():
            print(f"   Script: {line.strip()}")
        if 'Model' in line or 'model:' in line.lower():
            print(f"   Model: {line.strip()}")
else:
    print(f"   NAO EXISTE (exit {rc}) — precisa recriar")

print("\n=== FIM DA VERIFICAÇÃO ===")
