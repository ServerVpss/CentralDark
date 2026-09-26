from pathlib import Path
import hashlib,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else '.').resolve(); sf=root/'SHA256SUMS.txt'
if not sf.exists(): raise SystemExit('VERIFY=FAIL missing SHA256SUMS.txt')
bad=[]; count=0
for line in sf.read_text(encoding='utf-8').splitlines():
    if not line.strip(): continue
    expected,rel=line.split('  ',1); p=root/rel
    if not p.exists(): bad.append((rel,'MISSING')); continue
    got=hashlib.sha256(p.read_bytes()).hexdigest(); count+=1
    if got!=expected: bad.append((rel,got))
if bad:
    print('VERIFY=FAIL'); [print(x) for x in bad]; raise SystemExit(1)
print('VERIFY=PASS'); print(f'FILES_VERIFIED={count}')
