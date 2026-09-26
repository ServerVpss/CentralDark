$ErrorActionPreference = 'Continue'
$out = 'E:\CentralDark\_tmp\PDF_GATE_NOW_20260918.log'
$runner = 'E:\CentralDark\runtime\scheduled-jobs\run-scheduled-sector.ps1'
if (Test-Path -LiteralPath $runner) {
  & powershell -NoProfile -ExecutionPolicy Bypass -File $runner -Sector PDF_GATE *>&1 | Tee-Object -FilePath $out
  exit $LASTEXITCODE
}
'RUNNER_NOT_FOUND=' + $runner | Tee-Object -FilePath $out
exit 91
