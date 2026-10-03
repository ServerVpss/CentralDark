#!/usr/bin/env python3
from pathlib import Path
import json
import shutil
import sys

HERE = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit('usage: apply-overlay.py /path/to/AionUi')

ROOT = Path(sys.argv[1]).resolve()
PACKAGE = ROOT / 'package.json'
BUILDER = ROOT / 'packages/desktop/electron-builder.yml'
INDEX = ROOT / 'packages/desktop/src/process/index.ts'

for required in (PACKAGE, BUILDER, INDEX):
    if not required.exists():
        raise SystemExit(f'missing upstream file: {required}')

pkg = json.loads(PACKAGE.read_text(encoding='utf-8'))
if pkg.get('version') != '2.2.2':
    raise SystemExit(f"wrong AionUi version: {pkg.get('version')}")
if pkg.get('license') != 'Apache-2.0':
    raise SystemExit(f"unexpected AionUi license: {pkg.get('license')}")

pkg['name'] = 'centraldark-instinto-superior'
pkg['description'] = 'CentralDark — Instinto Superior · AionUi shell + CentralDark persistent runtime'
pkg['productName'] = 'CentralDark — Instinto Superior'
PACKAGE.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '
', encoding='utf-8')

builder = BUILDER.read_text(encoding='utf-8')
replacements = {
    'appId: com.aionui.app': 'appId: com.centraldark.instintosuperior',
    'productName: AionUi': 'productName: CentralDark — Instinto Superior',
    'executableName: AionUi': 'executableName: CentralDark-Instinto-Superior',
    'copyright: Copyright © 2024 AionUi': 'copyright: Copyright © 2026 CentralDark; AionUi portions Apache-2.0',
    '  - name: AionUi Protocol': '  - name: CentralDark Protocol',
    '      - aionui': '      - centraldark',
    '  maintainer: aionui': '  maintainer: CentralDark',
    '  vendor: aionui': '  vendor: CentralDark',
    '      Name: AionUi': '      Name: CentralDark — Instinto Superior',
    '      Icon: AionUi': '      Icon: CentralDark-Instinto-Superior',
    '      MimeType: x-scheme-handler/aionui;': '      MimeType: x-scheme-handler/centraldark;',
    '  owner: iOfficeAI': '  owner: ServerVpss',
    '  repo: AionUi': '  repo: CentralDark',
}
for old, new in replacements.items():
    if old not in builder:
        raise SystemExit(f'overlay guard missing in electron-builder.yml: {old!r}')
    builder = builder.replace(old, new, 1)

seed_binding = "  - from: resources/hub
    to: hub
"
if seed_binding not in builder:
    raise SystemExit('cannot locate extraResources hub anchor')
builder = builder.replace(
    seed_binding,
    seed_binding + "  # CentralDark CURRENT seed — optional in thin dev; populated by build-prototype.sh
  - from: resources/centraldark-seed
    to: centraldark-seed
",
    1,
)
BUILDER.write_text(builder, encoding='utf-8')

bootstrap_dst = ROOT / 'packages/desktop/src/process/centraldark/bootstrap.ts'
bootstrap_dst.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(HERE / 'centraldark-bootstrap.ts', bootstrap_dst)

index = INDEX.read_text(encoding='utf-8')
import_anchor = "import initStorage from './utils/initStorage';"
if import_anchor not in index:
    raise SystemExit('index import anchor missing')
if 'initializeCentralDark' not in index:
    index = index.replace(
        import_anchor,
        import_anchor + "
import { initializeCentralDark } from './centraldark/bootstrap';",
        1,
    )

call_anchor = "  await initStorage();
  mark('initStorage');"
if call_anchor not in index:
    raise SystemExit('index call anchor missing')
if "mark('centralDark')" not in index:
    index = index.replace(
        call_anchor,
        call_anchor + "

  await initializeCentralDark();
  mark('centralDark');",
        1,
    )
INDEX.write_text(index, encoding='utf-8')

# AionUi 2.2.2 assumes a separate bunx binary. Current Bun exposes the same
# package runner as "bun x"; patch only the build-critical calls.
for rel in ('scripts/build-with-builder.js', 'scripts/postinstall.js'):
    p = ROOT / rel
    text = p.read_text(encoding='utf-8')
    text = text.replace('bunx electron-vite', 'bun x electron-vite')
    text = text.replace('bunx electron-builder', 'bun x electron-builder')
    p.write_text(text, encoding='utf-8')

seed = ROOT / 'resources/centraldark-seed'
seed.mkdir(parents=True, exist_ok=True)
(seed / 'README.txt').write_text(
    'Thin prototype placeholder. Full build copies SOURCE_SNAPSHOT/CentralDark here.
',
    encoding='utf-8',
)

print('AIONUI_UPSTREAM_VERSION=2.2.2')
print('CENTRALDARK_OVERLAY=APPLIED')
print('BUNX_BUILD_COMPAT=PATCHED')
print('PRODUCT=CentralDark — Instinto Superior')
