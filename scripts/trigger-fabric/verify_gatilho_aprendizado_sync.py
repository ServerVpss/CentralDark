#!/usr/bin/env python3
"""
Gate: se docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml ganhar
'event:' novo neste diff, docs/CONSCIENCIA/APRENDIZADOS.md tem que mudar
no MESMO diff. Gatilho novo sem aprendizado registrado = FAIL, fail-closed.

Nao decide SE o aprendizado esta certo -- so que ele existe no mesmo commit
que introduziu o gatilho. Julgar o conteudo continua sendo trabalho humano/IA,
nao deste script.
"""
from pathlib import Path
import re, subprocess, sys

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
BASE_REF = sys.argv[2] if len(sys.argv) > 2 else 'HEAD^'

TRIGGERS_PATH = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml'
APRENDIZADOS_PATH = 'docs/CONSCIENCIA/APRENDIZADOS.md'
EVENT_RE = re.compile(r'^\s*-?\s*event:\s*(\S+)', re.MULTILINE)


def run(args):
    return subprocess.run(
        args, cwd=ROOT, capture_output=True, text=True, check=False
    )


def events_in(text):
    return set(m.group(1) for m in EVENT_RE.finditer(text))


def git_show(ref, path):
    r = run(['git', 'show', f'{ref}:{path}'])
    if r.returncode != 0:
        return None
    return r.stdout


def fail_closed(reason):
    print(f'GATILHO_APRENDIZADO_SYNC=UNKNOWN')
    print(f'REASON={reason}')
    print('UNKNOWN != PASS -- fail-closed')
    sys.exit(1)


merge_base = run(['git', 'merge-base', BASE_REF, 'HEAD'])
if merge_base.returncode != 0:
    fail_closed(f'nao consegui resolver merge-base entre {BASE_REF} e HEAD')
base_sha = merge_base.stdout.strip()

changed = run(['git', 'diff', '--name-only', f'{base_sha}...HEAD'])
if changed.returncode != 0:
    fail_closed('git diff --name-only falhou')
changed_files = set(line.strip() for line in changed.stdout.splitlines() if line.strip())

current_triggers_file = ROOT / TRIGGERS_PATH
if not current_triggers_file.exists():
    print('GATILHO_APRENDIZADO_SYNC=PASS')
    print(f'NOTE={TRIGGERS_PATH} nao existe neste checkout -- nada a comparar')
    sys.exit(0)

current_text = current_triggers_file.read_text(encoding='utf-8', errors='replace')
current_events = events_in(current_text)

base_text = git_show(base_sha, TRIGGERS_PATH)
base_events = events_in(base_text) if base_text is not None else set()

new_events = sorted(current_events - base_events)
aprendizado_touched = APRENDIZADOS_PATH in changed_files

result = {
    'base_sha': base_sha,
    'new_events': new_events,
    'aprendizado_touched': aprendizado_touched,
    'changed_files_count': len(changed_files),
}

if not new_events:
    print('GATILHO_APRENDIZADO_SYNC=PASS')
    print('NOTE=nenhum event: novo em TRIGGERS.yml neste diff')
    print(result)
    sys.exit(0)

if aprendizado_touched:
    print('GATILHO_APRENDIZADO_SYNC=PASS')
    print(f'NOTE=gatilho(s) novo(s) {new_events} + APRENDIZADOS.md tocado no mesmo diff')
    print(result)
    sys.exit(0)

print('GATILHO_APRENDIZADO_SYNC=FAIL')
print(f'REASON=gatilho(s) novo(s) em TRIGGERS.yml sem update em {APRENDIZADOS_PATH} no mesmo diff: {new_events}')
print(result)
sys.exit(1)
