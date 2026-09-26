import json
from datetime import datetime, timezone, timedelta

JOBS_FILE = '/e/CentralDark/Pivete/cron/jobs.json'

FIXES = {
    # jobs com script path incorreto (prefixo duplicado ou inexistente)
    '0e769e2ce2b2': 'system-breathing.sh',  # era scripts/system-breathing.py → remove prefixo + .sh
    '7d71467a3e46': 'prs-open-commits-cycle.sh',  # era scripts/scripts/prs-open-commits-cycle.sh
    '7cb6bc563171': 'dependabot-monitor.sh',  # era scripts/scripts/dependabot-monitor.py → .sh existe
    '4e2282e4973d': 'screenpipe-monitor.sh',  # era scripts/scripts/screenpipe-monitor.sh → remove prefixo
    '6ed66b4cb005': 'webui-watchdog.py',  # era scripts/scripts/webui-watchdog.py → remove prefixo
    '006be2a2de0e': 'cadeia-free-watchdog.py',  # era scripts/scripts/cadeia-free-watchdog.py → remove prefixo
}

# Jobs de telemetria com script inexistente (logs/telemetria/CollectTelemetry.ps1 nunca existiu)
# São 4 jobs: 5050ea9f4723, 8a7b98f04c7c, 89f742175bac (model drift) + 8da666859a0d, b297a0bee23b (script inexistente)
TELEMETRY_JOB_IDS = {'8da666859a0d', 'b297a0bee23b'}
# Os 3 jobs de model drift (5050ea9f4723, 8a7b98f04c7c, 89f742175bac) mantêm-se mas com modelo corrigido

with open(JOBS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Jobs antes: {len(data["jobs"])}')
print()

removed = []
fixed_script = []
fixed_model = []

for job in data['jobs']:
    jid = job['id']
    name = job['name']
    script = job.get('script')
    
    # 1. Remover jobs de telemetria com script inexistente
    if jid in TELEMETRY_JOB_IDS:
        print(f'REMOVENDO (script inexistente): {jid} | {name}')
        removed.append(jid)
        data['jobs'].remove(job)
        continue
    
    # 2. Corrigir script path se estiver no FIXES
    if jid in FIXES and script:
        old_script = script
        new_script = FIXES[jid]
        # Verifica se o path corrigido existe
        import os
        full_path = f'/e/CentralDark/Pivete/scripts/{new_script}'
        if os.path.exists(full_path):
            job['script'] = new_script
            fixed_script.append((jid, name, old_script, new_script))
            print(f'CORRIGIDO SCRIPT: {jid} | {name} | {old_script} -> {new_script}')
        else:
            print(f'NÃO CORRIGIDO (script não existe): {jid} | {name} | {new_script} não encontrado')
    
    # 3. Corrigir modelo expirado (nous/tencent/hy3:free)
    model = job.get('model')
    if model == 'nous/tencent/hy3:free':
        old_model = model
        if job.get('no_agent'):
            job['model'] = None
            job['provider'] = None
        else:
            job['model'] = 'upstage/solar-pro4:free'
            job['provider'] = 'nous'
            job['provider_snapshot'] = None
            job['model_snapshot'] = None
        fixed_model.append((jid, name, old_model, job['model']))
        print(f'CORRIGIDO MODELO: {jid} | {name} | {old_model} -> {job["model"]}')

# Atualizar timestamp
data['updated_at'] = datetime.now(timezone(timedelta(hours=-3))).isoformat()

with open(JOBS_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print()
print(f'=== RESUMO ===')
print(f'Jobs removidos: {len(removed)}')
print(f'Scripts corrigidos: {len(fixed_script)}')
print(f'Modelos corrigidos: {len(fixed_model)}')
print(f'Jobs restantes: {len(data["jobs"])}')

print()
print(f'Jobs removidos:')
for jid in removed:
    print(f'  {jid}')

print()
print(f'Scripts corrigidos:')
for jid, name, old, new in fixed_script:
    print(f'  {jid} | {name} | {old} -> {new}')

print()
print(f'Modelos corrigidos:')
for jid, name, old, new in fixed_model:
    print(f'  {jid} | {name} | {old} -> {new}')

print()
with open(JOBS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)
for j in data['jobs']:
    print(f'  {j["id"]} | {j["name"][:30]} | model={j.get("model") or "(null)"} | script={j.get("script") or "(null)"} | no_agent={j.get("no_agent")}')
