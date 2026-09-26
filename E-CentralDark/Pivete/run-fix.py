import subprocess
import sys
import os

# Path absoluta correta
script_path = r"E:\CentralDark\Pivete\fix-cron-jobs.py"
print(f"Executando script: {script_path}")
print(f"Existe: {os.path.exists(script_path)}")

# Executar diretamente com o Python do venv, passando o script como argumento
python_exe = r"C:\Users\danda\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
cmd = [python_exe, script_path]
print(f"CMD: {cmd}")

result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
print(f"\n=== SAÍDA ===")
print(f"exit: {result.returncode}")
if result.stdout: print(result.stdout)
if result.stderr: print(f"STDERR:\n{result.stderr}")
