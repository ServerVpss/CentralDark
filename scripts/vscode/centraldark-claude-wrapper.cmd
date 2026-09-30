@echo off
setlocal EnableExtensions
rem CentralDark wrapper for Claude Code VS Code extension.
rem Claude bundled executable is argv[1].
set "ORIGINAL=%~1"
if not defined ORIGINAL (
  echo CENTRALDARK_CLAUDE_WRAPPER_ERROR=missing_original_binary 1>&2
  exit /b 2
)
shift /1
set "MODE_FILE=%USERPROFILE%\.centraldark\claude-route.mode"
if exist "%MODE_FILE%" set /p CENTRALDARK_CLAUDE_MODE=<"%MODE_FILE%"
if /I "%CENTRALDARK_CLAUDE_MODE%"=="ON" (
  if defined CENTRALDARK_GATEWAY_URL set "ANTHROPIC_BASE_URL=%CENTRALDARK_GATEWAY_URL%"
  if defined CENTRALDARK_GATEWAY_KEY set "ANTHROPIC_API_KEY=%CENTRALDARK_GATEWAY_KEY%"
  set "CENTRALDARK_CLAUDE_ROUTE=HERMES"
) else (
  set "CENTRALDARK_CLAUDE_ROUTE=ANTHROPIC_DIRECT"
)
echo CENTRALDARK_CLAUDE_ROUTE=%CENTRALDARK_CLAUDE_ROUTE% 1>&2
"%ORIGINAL%" %*
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo CENTRALDARK_CLAUDE_EXIT=%RC% 1>&2
exit /b %RC%
@echo off
setlocal EnableExtensions
rem CentralDark wrapper for Claude Code VS Code extension.
rem Claude bundled executable is argv[1].
set "ORIGINAL=%~1"
if not defined ORIGINAL (
  echo CENTRALDARK_CLAUDE_WRAPPER_ERROR=missing_original_binary 1>&2
  exit /b 2
)
shift /1
set "MODE_FILE=%USERPROFILE%\.centraldark\claude-route.mode"
if exist "%MODE_FILE%" set /p CENTRALDARK_CLAUDE_MODE=<"%MODE_FILE%"
if /I "%CENTRALDARK_CLAUDE_MODE%"=="ON" (
  if defined CENTRALDARK_GATEWAY_URL set "ANTHROPIC_BASE_URL=%CENTRALDARK_GATEWAY_URL%"
  if defined CENTRALDARK_GATEWAY_KEY set "ANTHROPIC_API_KEY=%CENTRALDARK_GATEWAY_KEY%"
  set "CENTRALDARK_CLAUDE_ROUTE=HERMES"
) else (
  set "CENTRALDARK_CLAUDE_ROUTE=ANTHROPIC_DIRECT"
)
echo CENTRALDARK_CLAUDE_ROUTE=%CENTRALDARK_CLAUDE_ROUTE% 1>&2
"%ORIGINAL%" %*
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo CENTRALDARK_CLAUDE_EXIT=%RC% 1>&2
exit /b %RC%
