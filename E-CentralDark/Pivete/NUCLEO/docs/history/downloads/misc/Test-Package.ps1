$ErrorActionPreference="Stop"
$Root=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location $Root
try {
  python -m unittest discover -s tests -v
  python scripts/Verify-Package.py
} finally { Pop-Location }
