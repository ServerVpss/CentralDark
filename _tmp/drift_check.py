import os, json, glob

mission_dir = '/root/CentralDark/apps/modulos/grupo-evolucao/missions'
files = sorted(glob.glob(os.path.join(mission_dir, 'drift-*.json')))
print(f'TOTAL_DRIFT_FILES: {len(files)}')

orphans = []
resolved_like = []

for f in files:
    try:
        with open(f) as fh:
            data = json.load(fh)
        did = data.get('id','')
        ts = data.get('contexto',{}).get('drift',[])
        has_resolution = any(k in data for k in ['resolvido','status','closed_at','concluded','consumido'])
        if has_resolution:
            resolved_like.append((f, did, data.get('tema','')))
        else:
            orphans.append((f, did, data.get('tema',''), len(ts)))
    except Exception as e:
        print('ERR', f, e)

print(f'\nORPHAN-LIKE (sem campo de fechamento): {len(orphans)}')
for f, did, tema, nd in orphans[:30]:
    print(f'  {did} | {tema} | {nd} drifts | {os.path.basename(f)}')

print(f'\nRESOLVED-LIKE (com campo de fechamento): {len(resolved_like)}')
for f, did, tema in resolved_like[:10]:
    print(f'  {did} | {tema} | {os.path.basename(f)}')
