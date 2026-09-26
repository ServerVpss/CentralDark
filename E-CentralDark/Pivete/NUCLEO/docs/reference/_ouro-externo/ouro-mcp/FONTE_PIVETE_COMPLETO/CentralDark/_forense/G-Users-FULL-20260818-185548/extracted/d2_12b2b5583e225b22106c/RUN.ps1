$ErrorActionPreference = "Stop"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$bootstrap = Join-Path $here "bootstrap.py"

if (-not (Test-Path $bootstrap)) {
    throw "bootstrap.py não encontrado em: $bootstrap"
}

function Test-PythonExe {
    param(
        [Parameter(Mandatory = $true)][string]$Exe,
        [string[]]$PrefixArgs = @()
    )

    try {
        & $Exe @PrefixArgs -c "import sys; raise SystemExit(0 if sys.version_info.major >= 3 else 1)" *> $null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
}

$pythonExe = $null
$pythonArgs = @()

# 1) Preferir Python real do usuário atual, sem depender de PATH nem de nome de usuário fixo.
$localPythonRoot = Join-Path $env:LOCALAPPDATA "Programs\Python"
if (Test-Path $localPythonRoot) {
    $localCandidates = @(
        Get-ChildItem -Path $localPythonRoot -Directory -Filter "Python*" -ErrorAction SilentlyContinue |
        ForEach-Object {
            $exe = Join-Path $_.FullName "python.exe"
            if (Test-Path $exe) { Get-Item $exe }
        }
    )

    foreach ($candidate in $localCandidates) {
        if (Test-PythonExe -Exe $candidate.FullName) {
            $pythonExe = $candidate.FullName
            break
        }
    }
}

# 2) Reutilizar python.exe válido já disponível no PATH, ignorando o alias da Microsoft Store.
if (-not $pythonExe) {
    $pathPython = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($pathPython -and
        $pathPython.Source -and
        $pathPython.Source -notmatch "\\WindowsApps\\" -and
        (Test-PythonExe -Exe $pathPython.Source)) {
        $pythonExe = $pathPython.Source
    }
}

# 3) Fallback para o Python Launcher oficial do Windows.
if (-not $pythonExe) {
    $pyLauncher = Get-Command py.exe -ErrorAction SilentlyContinue
    if ($pyLauncher -and (Test-PythonExe -Exe $pyLauncher.Source -PrefixArgs @("-3"))) {
        $pythonExe = $pyLauncher.Source
        $pythonArgs = @("-3")
    }
}

# 4) Fallback para instalação system-wide.
if (-not $pythonExe) {
    $systemRoots = @(
        (Join-Path $env:ProgramFiles "Python*")
    )

    if (${env:ProgramFiles(x86)}) {
        $systemRoots += (Join-Path ${env:ProgramFiles(x86)} "Python*")
    }

    foreach ($pattern in $systemRoots) {
        foreach ($dir in @(Get-Item $pattern -ErrorAction SilentlyContinue)) {
            $exe = Join-Path $dir.FullName "python.exe"
            if ((Test-Path $exe) -and (Test-PythonExe -Exe $exe)) {
                $pythonExe = $exe
                break
            }
        }
        if ($pythonExe) { break }
    }
}

if (-not $pythonExe) {
    throw @"
Python 3 real não encontrado.

O executor procurou, sem alterar o PATH:
- %LOCALAPPDATA%\Programs\Python\Python*\python.exe
- python.exe válido no PATH
- py.exe -3
- instalações system-wide em Program Files

Instale Python 3 ou confirme a instalação do usuário atual e rode novamente.
"@
}

Write-Host "✅ Python detectado: $pythonExe"
& $pythonExe @pythonArgs $bootstrap
exit $LASTEXITCODE
