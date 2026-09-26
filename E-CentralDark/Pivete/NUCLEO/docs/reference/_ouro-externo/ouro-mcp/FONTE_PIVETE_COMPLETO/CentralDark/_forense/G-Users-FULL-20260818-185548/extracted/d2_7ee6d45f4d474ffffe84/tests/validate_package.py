from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1];errors=[]
for p in root.rglob('*'):
 if not p.is_file():continue
 t=p.read_text(encoding='utf-8',errors='replace')
 for pat in [r'gh[pousr]_[A-Za-z0-9]{20,}',r'sb_secret_[A-Za-z0-9_-]{20,}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----']:
  if re.search(pat,t) and p.name!='validate_package.py':errors.append(f'{p.relative_to(root)} secret-like pattern')
sql=(root/'db/000_private_security.sql').read_text().lower()
for x in ['revoke all on schema centraldark_private from anon','revoke all on schema centraldark_private from authenticated','enable row level security']:
 if x not in sql:errors.append('db missing '+x)
if errors:
 print('FAIL');[print('-',x) for x in errors];sys.exit(1)
print('PASS files='+str(sum(1 for p in root.rglob('*') if p.is_file())))
