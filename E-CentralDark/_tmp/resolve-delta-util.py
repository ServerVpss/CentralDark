from pathlib import Path
import re
p=Path(r"E:\CentralDark\worktrees\delta-util-canais-20260915\docs\ARQUITETURA\CENTRALDARK-TRIGGER-FABRIC\CONTRACT.yml")
s=p.read_text(encoding='utf-8')
pat=re.compile(r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> 7d2b24872 \(cristal\(bot\): aprende erros e limpa helpers efemeros\)\n', re.S)
m=pat.search(s)
if not m:
    raise SystemExit('conflict block not found')
ours=m.group(1)
add='''  discover_existing_channels_before_blocked: true\n  ephemeral_helper_is_not_canonical_asset: true\n  safe_cleanup_after_use_required: true\n  user_report_is_signal_not_proof: true\n  meaningful_discovery_must_compare_canonical_owner: true\n'''
if 'normative_hierarchy:' not in ours:
    raise SystemExit('expected normative_hierarchy missing')
combined=ours.replace('normative_hierarchy:\n', add+'normative_hierarchy:\n',1)
s=s[:m.start()]+combined+s[m.end():]
p.write_text(s,encoding='utf-8',newline='\n')
print('RESOLVED')
