import json

with open('/root/.hermes/cache/spillover/call_dbdd1973b6e443abae4aaefd.txt') as f:
    outer = json.load(f)
inner = json.loads(outer['result'])
prs = inner if isinstance(inner, list) else inner.get('result', inner)
if not isinstance(prs, list):
    prs = prs.get('pulls', prs.get('items', []))
print('TOTAL_PRS:', len(prs))
openprs = [p for p in prs if p.get('state')=='open']
print('OPEN_PRS:', len(openprs))
for p in openprs:
    print('PR#' + str(p.get('number')),
          '|', p.get('state'),
          '|', p.get('title'),
          '|', p.get('user',{}).get('login'),
          '|', 'head:', p.get('head',{}).get('sha'),
          '|', 'base:', p.get('base',{}).get('ref'),
          '|', p.get('created_at'),
          '|', p.get('html_url'))
print('--- últimos merges/fechados recentes ---')
closed = sorted([p for p in prs if p.get('state') in ('closed','merged')], key=lambda x: x.get('closed_at',''))[-8:]
for p in closed:
    print('PR#' + str(p.get('number')),
          '|', p.get('state'),
          '|', p.get('title'),
          '|', p.get('user',{}).get('login'),
          '|', 'head:', p.get('head',{}).get('sha'),
          '|', 'base:', p.get('base',{}).get('ref'),
          '|', 'created:', p.get('created_at'),
          '|', 'closed:', p.get('closed_at'))
