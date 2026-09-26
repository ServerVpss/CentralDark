# CentralDark App Inventory & Filesystem Search (Windows multi-root)

## The "Chromium da CentralDark" app = MOTOR-TESTE

When the Chefe asks for the CentralDark Chromium/Electron app (cockpit, GitHub
connection, workspace), it is **MOTOR-TESTE**, NOT Obsidian / Overclock /
hermes-webui.

Evidence (measured 2026-08-23):
- `E:\CentralDark\MOTOR-TESTE\package.json` → `name: "omniroute"` (AI router,
  Electron/PWA/desktop, Chromium)
- `E:\CentralDark\MOTOR-TESTE\src\app\(dashboard)\dashboard\compression\studio\CompressionCockpit.tsx` → the cockpit
- `E:\CentralDark\MOTOR-TESTE\src\app\api\github-skills` → GitHub connection
- `E:\CentralDark\MOTOR-TESTE\docker\vnc-browser\chromium` → Chromium instance
- `E:\CentralDark\MOTOR-TESTE\apps\modulos\Bolt\source\` → Electron module (Bolt)

Two mirrors exist:
- `E:\CentralDark\MOTOR-TESTE`  ← primary
- `C:\CentralDark\MOTOR-TESTE`  ← canonical-repo mirror

Discarded false positives during the same search:
- `C:\CentralDark\obsidian-app\` → Obsidian (not the app)
- `E:\CentralDark\Pivete\MARKDOWN\APPCENTRALDARK EVOLUIR\` → Overclock multi-agent IDE
- `E:\CentralDark\hermes-webui\` → Hermes web BFF
- `node_modules/chrome-launcher`, `playwright`, `electron-to-chromium` → libs, not the app

## How to search the multi-root filesystem without timing out

`E:\` is huge and `grep -r` / `rg` over it TIMES OUT (180s+). The `search_files`
tool ALSO fails on Windows drive-letter paths (`E:\CentralDark` →
"IO error ... O sistema não pode encontrar o caminho especificado") — it wants
MSYS paths like `/e/CentralDark`.

WORKING pattern (terminal, Git Bash on Windows):

```bash
# 1. Orient with a root listing first (fast, shows the real tree)
ls -la "E:/CentralDark" | head -60
ls -la "C:/CentralDark" | head -60

# 2. Prune node_modules (the usual timeout source) and search by name
cd /e/CentralDark && find . -path ./node_modules -prune -o \
  \( -iname "*chromium*" -o -iname "*cockpit*" -o -iname "*electron*" \) \
  -print 2>/dev/null | head -40

# 3. For content grep, scope to a known subdir, never the whole drive:
grep -rilE "cockpit" "E:/CentralDark/MOTOR-TESTE/src" 2>/dev/null | head
```

If `find` still threatens timeout, lower depth: `find . -maxdepth 5 ...`.
Always set a `timeout=` on the terminal call (foreground max 600s).

NEVER run bare `find "E:/"` or `grep -r "E:/"` — the volume is too large and
the call will hang until the 180s default timeout. Prefer `cd /e/CentralDark`
then `find .` so traversal is bounded to the project, and prune `node_modules`.
