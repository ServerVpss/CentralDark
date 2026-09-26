$ErrorActionPreference='Stop'
$b64 = Get-Content -Raw 'E:\CentralDark\_tmp\markdown_20260915_061140.b64'
$bytes = [Convert]::FromBase64String($b64)
$out = 'E:\CentralDark\worktrees\delta-continuo-20260915\docs\CONSCIENCIA\ARTEFATOS\2026-09-15_TLC23_simulacao-centraldark-e-autocorrecao.md'
[IO.File]::WriteAllBytes($out, $bytes)
Write-Host ((Get-FileHash -Algorithm SHA256 $out).Hash.ToLower())