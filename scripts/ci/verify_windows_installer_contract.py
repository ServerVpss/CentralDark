#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / 'apps/modulos/Bolt/source'
BUILDER = APP / 'electron-builder.yml'
UPDATER = APP / 'electron/main/utils/auto-update.ts'
UPDATE_CHECKER = APP / 'electron/main/utils/update-checker.ts'
PACKAGE = APP / 'package.json'
MAIN = APP / 'electron/main/index.ts'
WINDOWS = APP / 'electron/main/ui/window.ts'
SOL_WIDGET = APP / 'app/routes/sol-widget.tsx'
WORKFLOW = ROOT / '.github/workflows/centraldark-desktop-windows-installer.yml'
ICON = APP / 'assets/icons/icon.ico'
CHECKER_CONTRACT = ROOT / 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CHECKER-CONTRACT.yml'
STEP_CHECKER = ROOT / 'scripts/checker/step-checker.mjs'

checks = {
    'builder_exists': BUILDER.exists(),
    'updater_exists': UPDATER.exists(),
    'update_checker_exists': UPDATE_CHECKER.exists(),
    'package_exists': PACKAGE.exists(),
    'main_exists': MAIN.exists(),
    'window_owner_exists': WINDOWS.exists(),
    'sol_widget_route_exists': SOL_WIDGET.exists(),
    'workflow_exists': WORKFLOW.exists(),
    'icon_exists': ICON.exists(),
    'checker_contract_exists': CHECKER_CONTRACT.exists(),
    'step_checker_exists': STEP_CHECKER.exists(),
}

if not all(checks.values()):
    for key, value in checks.items():
        print(f'{key.upper()}={"PASS" if value else "FAIL"}')
    sys.exit(2)

builder = BUILDER.read_text(encoding='utf-8')
updater = UPDATER.read_text(encoding='utf-8')
update_checker = UPDATE_CHECKER.read_text(encoding='utf-8')
package = PACKAGE.read_text(encoding='utf-8')
main = MAIN.read_text(encoding='utf-8')
windows = WINDOWS.read_text(encoding='utf-8')
workflow = WORKFLOW.read_text(encoding='utf-8')
checker_contract = CHECKER_CONTRACT.read_text(encoding='utf-8')

required_builder = [
    'target: nsis',
    'installerIcon: assets/icons/icon.ico',
    'artifactName: CentralDark-Setup-${version}-${arch}.${ext}',
    'provider: github',
    'private: true',
]
required_updater = [
    "from 'electron-updater'",
    'setupAutoUpdater',
    'checkForUpdates',
    'update-downloaded',
    'reconcilePendingUpdateCheckpoint',
    'recordUpdateCheckpoint',
    'markPendingUpdate',
]
required_update_checker = [
    'centraldark.desktop-update-checker.v1',
    'POST_UPDATE',
    'PRE_INSTALL',
    'unknown_is_not_pass: true',
    'previous_flow_continues: true',
]
required_package = [
    '"centraldark:build:win"',
    '"electron-updater"',
    '"electron-builder"',
    '"test:centraldark-desktop"',
]
required_main = [
    'createSolWidget',
    'solWidget = createSolWidget(rendererURL)',
    'SOL_WIDGET_SHORTCUT',
]
required_windows = [
    'export function createSolWidget',
    "new URL('/sol-widget', rendererURL)",
    'alwaysOnTop: true',
    'skipTaskbar: true',
    "title: 'SOL — CentralDark'",
]
required_workflow = [
    'CentralDark Desktop — Windows Installer',
    'runs-on: [self-hosted, Windows, X64]',
    'step-checker.mjs',
    'pnpm install --frozen-lockfile',
    'pnpm test:centraldark-desktop',
    'pnpm centraldark:build:win',
    'CentralDark-Setup-*.exe',
    'latest*.yml',
    'SHA256SUMS.txt',
    'CHECKER_CONTRACT=PASS',
]
required_checker_contract = [
    'every_material_state_transition_requires_checker: true',
    'previous_flow_continues: true',
    'before_update',
    'after_update',
]

failures = []
for token in required_builder:
    if token not in builder:
        failures.append(f'BUILDER_TOKEN_MISSING:{token}')
for token in required_updater:
    if token not in updater:
        failures.append(f'UPDATER_TOKEN_MISSING:{token}')
for token in required_update_checker:
    if token not in update_checker:
        failures.append(f'UPDATE_CHECKER_TOKEN_MISSING:{token}')
for token in required_package:
    if token not in package:
        failures.append(f'PACKAGE_TOKEN_MISSING:{token}')
for token in required_main:
    if token not in main:
        failures.append(f'MAIN_TOKEN_MISSING:{token}')
for token in required_windows:
    if token not in windows:
        failures.append(f'SOL_WIDGET_TOKEN_MISSING:{token}')
for token in required_workflow:
    if token not in workflow:
        failures.append(f'WORKFLOW_TOKEN_MISSING:{token}')
for token in required_checker_contract:
    if token not in checker_contract.lower():
        failures.append(f'CHECKER_CONTRACT_TOKEN_MISSING:{token}')

print('WINDOWS_INSTALLER_OWNER=apps/modulos/Bolt/source/electron-builder.yml')
print('AUTO_UPDATE_OWNER=apps/modulos/Bolt/source/electron/main/utils/auto-update.ts')
print('AUTO_UPDATE_CHECKER=apps/modulos/Bolt/source/electron/main/utils/update-checker.ts')
print('CHECKER_CONTRACT=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CHECKER-CONTRACT.yml')
print('SOL_WIDGET_OWNER=apps/modulos/Bolt/source/electron/main/ui/window.ts')
print('SOL_WIDGET_ROUTE=apps/modulos/Bolt/source/app/routes/sol-widget.tsx')
print('SOL_WIDGET_PACKAGE_MODE=SAME_ELECTRON_APP')
print('SOL_WIDGET_INCLUDED=' + ('PASS' if not any(x.startswith(('MAIN_TOKEN_MISSING:', 'SOL_WIDGET_TOKEN_MISSING:')) for x in failures) else 'FAIL'))
print('INSTALLER_ICON=apps/modulos/Bolt/source/assets/icons/icon.ico')
print('INSTALLER_FORMAT=NSIS_EXE')
print('AUTO_UPDATE_METADATA=latest.yml')
print('INSTALLER_CONTRACT=' + ('PASS' if not failures else 'FAIL'))
for failure in failures:
    print(failure)

sys.exit(0 if not failures else 3)
