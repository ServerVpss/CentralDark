# omega-scan.ps1 — mede o VS Code vivo e atribui T-ID estavel por janela/workspace
# Owner existente: scripts/enxame-3ias.sh (semantica de bracos paralelos) + HERMES-CORE/core/orchestrator.mjs
# Nao cria V2 de enxame. Apenas estende o conceito para multi-janela VS Code local.
# Regra: PRESERVE_CURRENT_WINDOWS / DO_NOT_KILL_STALLED_SESSION / NO mouse automation.

param(
  [string]$Registry = "E:/CentralDark/Pivete/OMEGA_RENDEZVOUS.json"
)

$ErrorActionPreference = 'SilentlyContinue'

# 1. Processos Code + terminais filhos (bash/node hermes/grok/codex/claude)
$codeProcs = Get-CimInstance Win32_Process -Filter "Name='Code.exe'" -ErrorAction SilentlyContinue
$allProcs  = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue

# 2. Janelas do VS Code (via shell.Application ou tasklist de janelas)
$sh = New-Object -ComObject Shell.Application
$windows = @()
try {
  foreach ($win in $sh.Windows()) {
    if ($win.FullName -like '*Code.exe*' -or $win.LocationName -like '*Visual Studio Code*') {
      $windows += [PSCustomObject]@{
        Title = $win.LocationName
        Path  = $win.FullName
      }
    }
  }
} catch {}

# 3. Mapear Code pai -> filhos terminais
$terminals = @()
foreach ($p in $allProcs) {
  $name = $p.Name
  if ($name -match 'bash.exe|node.exe|conhost.exe|powershell.exe|cmd.exe|python.exe|grok|codex|hermes') {
    $parent = $allProcs | Where-Object { $_.ProcessId -eq $p.ParentProcessId }
    $ppName = if ($parent) { $parent.Name } else { '?' }
    # so considera terminal sob arvore Code
    $underCode = $false
    $cur = $p
    for ($i=0; $i -lt 8; $i++) {
      if (-not $cur) { break }
      if ($cur.Name -eq 'Code.exe') { $underCode = $true; break }
      $cur = $allProcs | Where-Object { $_.ProcessId -eq $cur.ParentProcessId }
    }
    if ($underCode) {
      $terminals += [PSCustomObject]@{
        PID    = $p.ProcessId
        Name   = $name
        Parent = $ppName
      }
    }
  }
}

# 4. T-ID estavel: hash do (PID + nome) — apenas DESCOBERTA.
# O TERMINAL_ID logico e settado pelo braco no omega-register.ps1 (auto-declaracao),
# NAO pelo scan. Scan so popula PID/ENGINE/WORKSPACE/STATE para descoberta.
# Se o braco ja se declarou no registry (mesmo PID), preserva o TERMINAL_ID dele.
$arms = @()
$regPrev = if (Test-Path $Registry) { Get-Content $Registry -Raw | ConvertFrom-Json } else { $null }
foreach ($t in $terminals) {
  $existing = if ($regPrev -and $regPrev.WORKERS) { $regPrev.WORKERS | Where-Object { $_.PID -eq $t.PID } } else { $null }
  $tid = if ($existing -and $existing.TERMINAL_ID) { $existing.TERMINAL_ID } else { 'UNASSIGNED' }
  $hash = [System.BitConverter]::ToString((New-Object System.Security.Cryptography.SHA256Managed).ComputeHash([System.Text.Encoding]::UTF8.GetBytes("$($t.PID)-$($t.Name)"))).Replace('-','').Substring(0,12)
  $arms += [PSCustomObject]@{
    TERMINAL_ID = $tid
    STABLE_HASH = "ARM-$hash"
    ENGINE      = $(switch -Regex ($t.Name) { 'hermes' {'HERMES-CASA'} 'grok' {'GROK'} 'codex' {'CODEX'} 'claude' {'CLAUDE'} 'bash|node|conhost|cmd|powershell|python' {'UNKNOWN-CLI'} default {'UNKNOWN'} })
    PID          = $t.PID
    PARENT       = $t.Parent
    STATE        = 'ACTIVE'
    BORN_AT      = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
  }
}

# 5. Gravar no registry (NAO destrutivo: preserva bracos ja declarados)
$reg = if (Test-Path $Registry) { Get-Content $Registry -Raw | ConvertFrom-Json } else { @{ WORKERS = @() } }
$prevWorkers = if ($reg.WORKERS) { $reg.WORKERS } else { @() }
$merged = @()
# 1. manter TODOS os bracos ja existentes que tem T-ID fixo ou receipts (intocaveis)
foreach ($p in $prevWorkers) {
  $keep = ($p.TERMINAL_ID -and $p.TERMINAL_ID -ne 'UNASSIGNED') -or ($p.RECEIPTS -and $p.RECEIPTS.Count -gt 0)
  if ($keep) { $merged += $p }
}
# 2. so adiciona descobertas UNASSIGNED que nao colidem com PID ja conhecido
$knownPids = ($prevWorkers | Where-Object { $_.PID } | ForEach-Object { $_.PID })
foreach ($a in $arms) {
  if ($a.TERMINAL_ID -eq 'UNASSIGNED' -and $knownPids -notcontains $a.PID) {
    $merged += $a
  }
}
$reg.WORKERS = $merged
$reg.LAST_SCAN = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
$reg | ConvertTo-Json -Depth 8 | Set-Content $Registry -Encoding UTF8

# 6. Saida legivel
Write-Output "=== OMEGA SCAN ==="
Write-Output "VS Code windows: $($windows.Count) | Code procs: $($codeProcs.Count) | Terminals under Code: $($terminals.Count)"
foreach ($a in $arms) {
  Write-Output "  $($a.TERMINAL_ID) | $($a.STABLE_HASH) | $($a.ENGINE) | PID=$($a.PID) | $($a.STATE)"
}
Write-Output "Registry: $Registry"
