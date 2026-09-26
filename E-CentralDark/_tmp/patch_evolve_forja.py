from pathlib import Path
p=Path(r'E:\CentralDark\_tmp\evolve_forja_max_rigor.py')
t=p.read_text(encoding='utf-8')
old="    for j in range(0,per_arm,4):\n        for a in range(arms): edges.append((f'a{a:02d}n{j:02d}',f'a{(a+1)%arms:02d}n{j:02d}','lateral'))\n"
new=old+"    for a in range(arms): edges.append((f'a{a:02d}n{per_arm-1:02d}',f'a{(a+1)%arms:02d}n{per_arm-1:02d}','lateral'))\n"
if old not in t: raise SystemExit('PATCH_TARGET_MISSING')
p.write_text(t.replace(old,new,1),encoding='utf-8')
print('PATCHED')
