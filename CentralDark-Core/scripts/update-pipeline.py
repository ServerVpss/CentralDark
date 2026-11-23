#!/usr/bin/env python3
"""Updates painel-data.json when a pipeline stage changes (called by pipeline-notify.yml)."""
import json
import os
import datetime

stage  = os.environ.get('STAGE', '')
emoji  = os.environ.get('EMOJI', '')
label  = os.environ.get('LABEL', '')
desc   = os.environ.get('DESC', '')
title  = os.environ.get('TITLE', '')
number = os.environ.get('NUMBER', '0')
author = os.environ.get('AUTHOR', '')
url    = os.environ.get('URL', '')
now    = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

if not stage:
    print('Sem estágio — pulando atualização do painel')
    raise SystemExit(0)

path = 'apps/modulos/status/painel-data.json'
with open(path) as f:
    data = json.load(f)

# ── tarefasAtivas ──────────────────────────────────────────
tarefas = data.get('tarefasAtivas', [])
task_id = f'pr-{number}' if number != '0' else f'deploy-{now[:10]}'
existing = next((t for t in tarefas if t['id'] == task_id), None)

historico_entry = {'estagio': stage, 'emoji': emoji, 'label': label, 'time': now}

if existing:
    existing.update({'estagio': stage, 'emoji': emoji, 'label': label, 'updatedAt': now})
    h = existing.get('historico', [])
    h.append(historico_entry)
    existing['historico'] = h[-10:]
else:
    tarefas.insert(0, {
        'id': task_id,
        'tipo': 'PR' if number != '0' else 'DEPLOY',
        'titulo': title,
        'numero': int(number) if number != '0' else 0,
        'author': author,
        'estagio': stage, 'emoji': emoji, 'label': label,
        'url': url,
        'createdAt': now, 'updatedAt': now,
        'historico': [historico_entry]
    })

# Remove fechadas/mergeadas com mais de 3 dias
cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=3)

def keep(t):
    if t.get('estagio') not in ('FECHADO', 'MERGEADO', 'VPS', 'CONSOLIDADO'):
        return True
    try:
        return datetime.datetime.fromisoformat(t.get('updatedAt', '').replace('Z', '')) > cutoff
    except Exception:
        return True

data['tarefasAtivas'] = [t for t in tarefas if keep(t)][:20]

# ── iaTimeline ─────────────────────────────────────────────
tl = data.get('iaTimeline', [])
tl.insert(0, {
    'time': now,
    'ia': f'@{author}',
    'action': f'{emoji} {label} — PR #{number}: {title}' if number != '0' else f'{emoji} {label}: {title}',
    'area': 'GitHub',
    'status': 'sucesso' if stage not in ('FECHADO', 'VPS_ERRO', 'REVISAO_PEDIDA') else 'alerta'
})
data['iaTimeline'] = tl[:50]
data['updatedAt'] = now

with open(path, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'✅ painel-data.json: PR #{number} → {stage}')
