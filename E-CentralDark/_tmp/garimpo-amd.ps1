$ErrorActionPreference='Stop'
$gar='E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\AMD'
New-Item -ItemType Directory -Force -Path $gar | Out-Null
$pdf=Join-Path $gar 'cuda-to-rocm-migration-paths-infographic.pdf'
Invoke-WebRequest -UseBasicParsing -Uri 'https://www.amd.com/content/dam/amd/en/documents/developer/resources/rocm-hub/cuda-to-rocm-migration-paths-infographic.pdf' -OutFile $pdf
$sha=(Get-FileHash -Algorithm SHA256 -LiteralPath $pdf).Hash.ToLowerInvariant()
[pscustomobject]@{Path=$pdf;Size=(Get-Item $pdf).Length;SHA256=$sha}|ConvertTo-Json -Compress