#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, shutil, zipfile, subprocess

ROOT = Path(__file__).resolve().parents[2]
FAMILY = ROOT / 'docs' / 'ARQUITETURA' / 'CENTRALDARK-TRIGGER-FABRIC'
STAGE = ROOT / '.artifacts' / 'trigger-fabric' / 'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE'
OUT = ROOT / '.artifacts' / 'trigger-fabric' / 'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip'
PNG = FAMILY / 'ARCHITECTURE.png'

# CHEFE 2026-10-03: o pacote deve carregar ~400 MB REAIS do CURRENT,
# sem padding sintético. O snapshot prioriza o cérebro/arquitetura/runtime
# e completa o orçamento somente com bytes rastreados no mesmo HEAD.
SNAPSHOT_TARGET_BYTES = 400_000_000
SNAPSHOT_MIN_BYTES = 390_000_000
ZIP_MIN_BYTES = 400_000_000
ZIP_MAX_BYTES = 430_000_000

ROOT_OWNERS = {
    'AGENTS.md',
    'LEIA-ME-IA.md',
    'CENTRALDARK_AI_BOOT.yaml',
    'SECOND-BRAIN.yml',
    'CLAUDE.md',
    'CODEX.md',
}
PRIORITY_PREFIXES = (
    'apps/modulos/HERMES-CORE/',
    'docs/CONSCIENCIA/',
    'docs/ARQUITETURA/',
    'docs/BRAIN/',
    '.agents/skills/',
    'scripts/trigger-fabric/',
    'apps/modulos/memoria-api/',
    'apps/modulos/mcp/',
    'apps/modulos/elite-gateway/',
    'apps/modulos/hub/',
    'apps/modulos/graph-panel/',
    'apps/modulos/mapeamento/',
    'apps/modulos/obsidian-plugin-grafo-vivo/',
    'apps/modulos/fixed-point-fabric/',
    '.github/workflows/',
)
SENSITIVE_PARTS = {
    'secrets', 'secret', 'credentials', 'credential',
    'private-keys', 'private_keys',
}
SENSITIVE_SUFFIXES = ('.pem', '.key', '.p12', '.pfx', '.jks', '.keystore')


def sha256(path):
    h = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def tracked_files():
    raw = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT)
    return [item.decode('utf-8', 'surrogateescape') for item in raw.split(b'\0') if item]


def sensitive_path(rel):
    low = rel.lower().replace('\\', '/')
    parts = [part for part in low.split('/') if part]
    name = parts[-1] if parts else ''
    if any(part in SENSITIVE_PARTS for part in parts):
        return True
    if name == '.env' or (name.startswith('.env.') and name != '.env.example'):
        return True
    if name.startswith('id_rsa') or name.startswith('id_ed25519'):
        return True
    return low.endswith(SENSITIVE_SUFFIXES)


def priority(rel):
    if rel in ROOT_OWNERS:
        return (0, rel)
    for index, prefix in enumerate(PRIORITY_PREFIXES, start=1):
        if rel.startswith(prefix):
            return (index, rel)
    return (100, rel)


def build_current_snapshot():
    snapshot_root = STAGE / 'SOURCE_SNAPSHOT' / 'CentralDark'
    snapshot_root.mkdir(parents=True, exist_ok=True)

    selected = []
    skipped_sensitive = []
    skipped_budget = []
    total = 0

    for rel in sorted(tracked_files(), key=priority):
        src = ROOT / rel
        if sensitive_path(rel):
            skipped_sensitive.append(rel)
            continue
        if src.is_symlink() or not src.is_file():
            continue

        size = src.stat().st_size
        if total + size > SNAPSHOT_TARGET_BYTES:
            skipped_budget.append({'path': rel, 'bytes': size})
            continue

        dst = snapshot_root / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        selected.append({'path': rel, 'bytes': size})
        total += size

    if total < SNAPSHOT_MIN_BYTES:
        raise SystemExit(
            f'CURRENT_SNAPSHOT_TOO_SMALL bytes={total} min={SNAPSHOT_MIN_BYTES}; '
            'refuse synthetic padding'
        )

    snapshot_manifest = {
        'schema': 'centraldark.current-source-snapshot.v1',
        'head_sha': subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True
        ).strip(),
        'target_bytes': SNAPSHOT_TARGET_BYTES,
        'selected_bytes': total,
        'selected_files': len(selected),
        'skipped_sensitive_count': len(skipped_sensitive),
        'skipped_budget_count': len(skipped_budget),
        'policy': {
            'synthetic_padding': False,
            'tracked_current_only': True,
            'priority': [
                'CANONICAL_ROOT_OWNERS',
                'HERMES_CORE',
                'CONSCIENCIA_ARQUITETURA_BRAIN',
                'AGENT_SKILLS_TRIGGER_FABRIC',
                'RUNTIME_CAPABILITIES',
                'REST_OF_TRACKED_CURRENT',
            ],
            'secrets_values_allowed': False,
        },
        'selected': selected,
        'skipped_sensitive_paths': skipped_sensitive,
        'skipped_budget': skipped_budget,
    }
    (STAGE / 'SOURCE_SNAPSHOT' / 'SNAPSHOT-MANIFEST.json').write_text(
        json.dumps(snapshot_manifest, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    return snapshot_manifest


if not PNG.exists():
    raise SystemExit('ARCHITECTURE.png missing; render ARCHITECTURE.mmd before packaging')

if STAGE.exists():
    shutil.rmtree(STAGE)
STAGE.mkdir(parents=True)

# Pacote canônico existente: preservado.
for p in sorted(FAMILY.iterdir()):
    if p.is_file():
        shutil.copy2(p, STAGE / p.name)

shutil.copy2(ROOT/'scripts'/'trigger-fabric'/'verify_package.py', STAGE/'verify_package.py')
shutil.copy2(ROOT/'scripts'/'trigger-fabric'/'build_package.py', STAGE/'build_package.py')

resolver_src = ROOT/'scripts'/'trigger-fabric'/'centraldark_master_cycle.py'
resolver_dst = STAGE/'scripts'/'trigger-fabric'/'centraldark_master_cycle.py'
resolver_dst.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(resolver_src, resolver_dst)

partner_src = ROOT/'docs'/'ARQUITETURA'/'PADRAO-PARCEIRO-DELTA-JUDGE.md'
partner_dst = STAGE/'docs'/'ARQUITETURA'/'PADRAO-PARCEIRO-DELTA-JUDGE.md'
partner_dst.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(partner_src, partner_dst)

snapshot = build_current_snapshot()

files = []
for p in sorted(x for x in STAGE.rglob('*') if x.is_file() and x.name not in {'MANIFEST.json','SHA256SUMS.txt'}):
    files.append({
        'path': p.relative_to(STAGE).as_posix(),
        'bytes': p.stat().st_size,
        'sha256': sha256(p),
    })

manifest = {
    'schema': 'centraldark.package.manifest.v1',
    'mission': 'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE',
    'global_runtime_100_percent': False,
    'source_snapshot': {
        'head_sha': snapshot['head_sha'],
        'selected_bytes': snapshot['selected_bytes'],
        'selected_files': snapshot['selected_files'],
        'synthetic_padding': False,
    },
    'files': files,
}
(STAGE/'MANIFEST.json').write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
    encoding='utf-8',
)

sums = []
for p in sorted(x for x in STAGE.rglob('*') if x.is_file() and x.name != 'SHA256SUMS.txt'):
    sums.append(f'{sha256(p)}  {p.relative_to(STAGE).as_posix()}')
(STAGE/'SHA256SUMS.txt').write_text('\n'.join(sums) + '\n', encoding='utf-8')

OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, 'w', allowZip64=True) as z:
    for p in sorted(x for x in STAGE.rglob('*') if x.is_file()):
        rel = p.relative_to(STAGE).as_posix()
        info = zipfile.ZipInfo(
            f'CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE/{rel}',
            date_time=(1980,1,1,0,0,0),
        )
        # SOURCE_SNAPSHOT fica STORE: tamanho físico representa bytes reais do CURRENT,
        # não um ZIP minúsculo de texto repetido/padding.
        info.compress_type = (
            zipfile.ZIP_STORED if rel.startswith('SOURCE_SNAPSHOT/')
            else zipfile.ZIP_DEFLATED
        )
        info.external_attr = 0o644 << 16
        with p.open('rb') as handle:
            z.writestr(info, handle.read())

zip_bytes = OUT.stat().st_size
if not (ZIP_MIN_BYTES <= zip_bytes <= ZIP_MAX_BYTES):
    raise SystemExit(
        f'ZIP_400MB_CONTRACT_FAIL bytes={zip_bytes} '
        f'expected={ZIP_MIN_BYTES}..{ZIP_MAX_BYTES}'
    )

print(OUT)
print('CURRENT_HEAD=' + snapshot['head_sha'])
print('SNAPSHOT_FILES=' + str(snapshot['selected_files']))
print('SNAPSHOT_BYTES=' + str(snapshot['selected_bytes']))
print('SYNTHETIC_PADDING=false')
print('ZIP_BYTES=' + str(zip_bytes))
print('ZIP_SHA256=' + sha256(OUT))
