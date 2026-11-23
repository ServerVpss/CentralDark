@echo off
setlocal EnableExtensions DisableDelayedExpansion
rem Existing CentralDark Claude Code wrapper; forwarding owned by the existing PowerShell route selector.
if "%~1"=="" (
  echo CENTRALDARK_CLAUDE_WRAPPER_ERROR=missing_original_binary 1>&2
  exit /b 2
)
pwsh.exe -NoLogo -NoProfile -NonInteractive -File "%~dp0centraldark-claude-mode.ps1" -Mode EXEC %*
exit /b %ERRORLEVEL%
