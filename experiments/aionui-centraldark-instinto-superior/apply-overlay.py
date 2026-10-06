#!/usr/bin/env python3
from pathlib import Path
import json
import shutil
import sys

HERE = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit("usage: apply-overlay.py /path/to/AionUi")

ROOT = Path(sys.argv[1]).resolve()
PACKAGE = ROOT / "package.json"
BUILDER = ROOT / "packages/desktop/electron-builder.yml"
INDEX = ROOT / "packages/desktop/src/process/index.ts"
SIDER = ROOT / "packages/desktop/src/renderer/pages/settings/components/SettingsSider.tsx"
WRAPPER = ROOT / "packages/desktop/src/renderer/pages/settings/components/SettingsPageWrapper.tsx"
ROUTER = ROOT / "packages/desktop/src/renderer/components/layout/Router.tsx"
BOTS_PAGE = ROOT / "packages/desktop/src/renderer/pages/settings/CentralDarkBotsSettings/index.tsx"

for required in (PACKAGE, BUILDER, INDEX, SIDER, WRAPPER, ROUTER):
    if not required.exists():
        raise SystemExit(f"missing upstream file: {required}")

pkg = json.loads(PACKAGE.read_text(encoding="utf-8"))
if pkg.get("version") != "2.2.2":
    raise SystemExit(f"wrong AionUi version: {pkg.get('version')}")
if pkg.get("license") != "Apache-2.0":
    raise SystemExit(f"unexpected AionUi license: {pkg.get('license')}")

pkg["name"] = "centraldark-instinto-superior"
pkg["description"] = "CentralDark — Instinto Superior · AionUi shell + CentralDark persistent runtime"
pkg["productName"] = "CentralDark — Instinto Superior"
PACKAGE.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

builder = BUILDER.read_text(encoding="utf-8")
replacements = {
    "appId: com.aionui.app": "appId: com.centraldark.instintosuperior",
    "productName: AionUi": "productName: CentralDark — Instinto Superior",
    "executableName: AionUi": "executableName: CentralDark-Instinto-Superior",
    "copyright: Copyright © 2024 AionUi": "copyright: Copyright © 2026 CentralDark; AionUi portions Apache-2.0",
    "  - name: AionUi Protocol": "  - name: CentralDark Protocol",
    "      - aionui": "      - centraldark",
    "  maintainer: aionui": "  maintainer: CentralDark",
    "  vendor: aionui": "  vendor: CentralDark",
    "      Name: AionUi": "      Name: CentralDark — Instinto Superior",
    "      Icon: AionUi": "      Icon: CentralDark-Instinto-Superior",
    "      MimeType: x-scheme-handler/aionui;": "      MimeType: x-scheme-handler/centraldark;",
    "  owner: iOfficeAI": "  owner: ServerVpss",
    "  repo: AionUi": "  repo: CentralDark",
}
for old, new in replacements.items():
    if old in builder:
        builder = builder.replace(old, new, 1)
    elif new not in builder:
        raise SystemExit(f"overlay guard missing in electron-builder.yml: {old!r}")

seed_binding = "  - from: resources/hub\n    to: hub\n"
seed_extra = (
    "  # CentralDark CURRENT seed — optional in thin dev; populated by build-prototype.sh\n"
    "  - from: resources/centraldark-seed\n"
    "    to: centraldark-seed\n"
)
if seed_extra not in builder:
    if seed_binding not in builder:
        raise SystemExit("cannot locate extraResources hub anchor")
    builder = builder.replace(seed_binding, seed_binding + seed_extra, 1)
BUILDER.write_text(builder, encoding="utf-8")

bootstrap_dst = ROOT / "packages/desktop/src/process/centraldark/bootstrap.ts"
bootstrap_dst.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(HERE / "centraldark-bootstrap.ts", bootstrap_dst)

index = INDEX.read_text(encoding="utf-8")
import_anchor = "import initStorage from './utils/initStorage';"
if import_anchor not in index:
    raise SystemExit("index import anchor missing")
if "initializeCentralDark" not in index:
    index = index.replace(
        import_anchor,
        import_anchor + "\nimport { initializeCentralDark } from './centraldark/bootstrap';",
        1,
    )

call_anchor = "  await initStorage();\n  mark('initStorage');"
if call_anchor not in index:
    raise SystemExit("index call anchor missing")
if "mark('centralDark')" not in index:
    index = index.replace(
        call_anchor,
        call_anchor + "\n\n  await initializeCentralDark();\n  mark('centralDark');",
        1,
    )
INDEX.write_text(index, encoding="utf-8")

# CentralDark Bots / Agentes surface: Rakazo remains a capability, never a second brain.
BOTS_PAGE.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(HERE / "centraldark-bots-page.tsx", BOTS_PAGE)

sider = SIDER.read_text(encoding="utf-8")
if "  'bots',\n" not in sider:
    anchor = "  'agent',\n"
    if anchor not in sider:
        raise SystemExit("settings sider builtin id anchor missing")
    sider = sider.replace(anchor, anchor + "  'bots',\n", 1)
if "id: 'bots'" not in sider:
    anchor = """      agent: {
        id: 'agent',
        label: t('settings.agents', { defaultValue: 'Agents' }),
        icon: <Speed />,
        path: 'agent',
      },
"""
    addition = """      bots: {
        id: 'bots',
        label: 'Bots / Agentes',
        icon: <Puzzle />,
        path: 'bots',
      },
"""
    if anchor not in sider:
        raise SystemExit("settings sider agent map anchor missing")
    sider = sider.replace(anchor, anchor + addition, 1)
SIDER.write_text(sider, encoding="utf-8")

wrapper = WRAPPER.read_text(encoding="utf-8")
if "id: 'bots'" not in wrapper:
    anchor = """    agent: {
      id: 'agent',
      label: t('settings.agents', { defaultValue: 'Agents' }),
      icon: <Robot theme='outline' size='16' />,
      path: 'agent',
    },
"""
    addition = """    bots: {
      id: 'bots',
      label: 'Bots / Agentes',
      icon: <Robot theme='outline' size='16' />,
      path: 'bots',
    },
"""
    if anchor not in wrapper:
        raise SystemExit("settings wrapper agent map anchor missing")
    wrapper = wrapper.replace(anchor, anchor + addition, 1)
WRAPPER.write_text(wrapper, encoding="utf-8")

router = ROUTER.read_text(encoding="utf-8")
if "CentralDarkBotsSettings" not in router:
    anchor = "const AgentSettings = React.lazy(() => import('@renderer/pages/settings/AgentSettings'));"
    if anchor not in router:
        raise SystemExit("router lazy import anchor missing")
    router = router.replace(
        anchor,
        anchor + "\nconst CentralDarkBotsSettings = React.lazy(() => import('@renderer/pages/settings/CentralDarkBotsSettings'));",
        1,
    )

route_anchor = "          <Route path='/settings/agent' element={withRouteFallback(AgentSettings)} />"
bots_route = "          <Route path='/settings/bots' element={withRouteFallback(CentralDarkBotsSettings)} />"
if bots_route not in router:
    if route_anchor not in router:
        raise SystemExit("router agent route anchor missing")
    router = router.replace(route_anchor, route_anchor + "\n" + bots_route, 1)
ROUTER.write_text(router, encoding="utf-8")

# AionUi 2.2.2 assumes a separate bunx binary. Current Bun exposes the same
# package runner as "bun x"; patch only the build-critical calls.
for rel in ("scripts/build-with-builder.js", "scripts/postinstall.js"):
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    text = text.replace("bunx electron-vite", "bun x electron-vite")
    text = text.replace("bunx electron-builder", "bun x electron-builder")
    p.write_text(text, encoding="utf-8")

seed = ROOT / "resources/centraldark-seed"
seed.mkdir(parents=True, exist_ok=True)
(seed / "README.txt").write_text(
    "Thin prototype placeholder. Full build copies SOURCE_SNAPSHOT/CentralDark here.\n",
    encoding="utf-8",
)

print("AIONUI_UPSTREAM_VERSION=2.2.2")
print("CENTRALDARK_OVERLAY=APPLIED")
print("CENTRALDARK_BOTS_RAKAZO=WIRED")
print("BUNX_BUILD_COMPAT=PATCHED")
print("PRODUCT=CentralDark — Instinto Superior")
