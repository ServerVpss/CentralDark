import os
import json
import base64
import re
import subprocess
import concurrent.futures

TOKEN = os.getenv("GH_TOKEN")
REPO = "ServerVpss/CentralDark1VPS"
# vps-healthcheck.yml mapping to sync-healthcheck.yml based on context
EXCLUDE = ["sync-healthcheck.yml", "vigia-actions-vermelhos.yml", "vps-ssh-exec.yml"]

def get_files():
    cmd = f'curl -s -H "Authorization: token {TOKEN}" https://api.github.com/repos/{REPO}/contents/.github/workflows'
    result = subprocess.check_output(cmd, shell=True)
    return [f["name"] for f in json.loads(result)]

def get_content(filename):
    cmd = f'curl -s -H "Authorization: token {TOKEN}" https://api.github.com/repos/{REPO}/contents/.github/workflows/{filename}'
    result = subprocess.check_output(cmd, shell=True)
    data = json.loads(result)
    if "content" not in data: return ""
    return base64.b64decode(data["content"]).decode('utf-8', errors='ignore')

def analyze(filename, content):
    if filename in EXCLUDE: return None

    # LEGADO check patterns
    if filename.startswith("one-shot-"): reason = "one-shot"
    elif filename.startswith("run-once-"): reason = "run-once"
    elif filename.startswith("fase-"): reason = "fase"
    elif filename.startswith("patch-"): reason = "patch"
    elif filename.startswith("auditoria-"): reason = "auditoria"
    elif "desativado" in content.lower(): reason = "desativado"
    elif "manual-only" in content.lower(): reason = "manual-only"
    else: reason = None

    if reason:
        return ("LEGADO", filename, reason)

    # DEPENDENTE check
    scripts = re.findall(r"scripts/[\w\-\./]+\.\w+", content)
    scripts = sorted(list(set(s.strip("'\" \t\n,") for s in scripts)))
    if scripts:
        return ("DEPENDENTE", filename, scripts)

    # PRONTO
    desc = "Workflow auto-suficiente"
    lines = content.splitlines()
    for line in lines:
        if line.strip().startswith("name:"):
            desc = line.strip().split(":", 1)[1].strip().strip("'\"")
            break
    return ("PRONTO", filename, desc)

files = get_files()
results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    future_to_file = {executor.submit(get_content, f): f for f in files}
    for future in concurrent.futures.as_completed(future_to_file):
        res = analyze(future_to_file[future], future.result())
        if res: results.append(res)

prontos = sorted([r for r in results if r[0] == "PRONTO"], key=lambda x: x[1])
dependentes = sorted([r for r in results if r[0] == "DEPENDENTE"], key=lambda x: x[1])
legados = sorted([r for r in results if r[0] == "LEGADO"], key=lambda x: x[1])

print(f"## PRONTOS ({len(prontos)})")
for _, name, desc in prontos: print(f"- {name} — {desc}")
print(f"\n## DEPENDENTES ({len(dependentes)})")
for _, name, scripts in dependentes: print(f"- {name} → {', '.join(scripts)}")
print(f"\n## LEGADOS ({len(legados)})")
for _, name, reason in legados: print(f"- {name} — {reason}")
