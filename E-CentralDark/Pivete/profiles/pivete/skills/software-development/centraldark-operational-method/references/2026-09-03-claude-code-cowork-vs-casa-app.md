# Claude Code / Cowork vs Casa app (2026-09-03)

## Binaries
- CLI: `%USERPROFILE%\.vscode\extensions\anthropic.claude-code-*-win32-x64\resources\native-binary\claude.exe` (e.g. 2.1.259, InternalName bun, Patched often False)
- Cowork: `C:\Program Files\WindowsApps\Claude_*\app\resources\cowork-svc.exe`
- Package: app.asar, i18n, smol-bin vhdx alongside

## Policy
```text
DEBUG_ATTACH ≠ OWN_PRODUCT
CLAUDE_PACKAGE ≠ CENTRALDARK_APP
CLI_OK as authenticated tool
CASA_APP = Sol/BridgeMind + Hermes pivete + :8099
```
cowork-svc.sln under WindowsApps path may not exist (ephemeral VS debug).
If Defender RealTimeProtectionEnabled=False → urge re-enable.
Do not ship Anthropic bins as CentralDark product substitute.
