import json

with open('/root/.hermes/cache/spillover/call_bc8e71211cb14c4b8d64606a.txt') as f:
    outer = json.load(f)
inner = json.loads(outer['result'])
runs = inner.get('workflow_runs', [])
print('TOTAL_RUNS:', len(runs))

pending = [r for r in runs if r.get('status') in ('queued','in_progress')]
print('PENDING_INPROGRESS:', len(pending))
for r in pending:
    print('QUEUED', r.get('id'), r.get('name'), '|', r.get('head_branch'), r.get('head_sha'), '|', r.get('created_at'), '|', r.get('url'))

failed = [r for r in runs if r.get('conclusion') in ('failure','cancelled','timed_out')]
print('FAILURES:', len(failed))
for r in failed[:20]:
    print('FAILED', r.get('id'), r.get('name'), '|', r.get('status'), r.get('conclusion'), '|', r.get('head_branch'), r.get('head_sha'), '|', r.get('created_at'), r.get('concluded_at'), '|', r.get('url'))
