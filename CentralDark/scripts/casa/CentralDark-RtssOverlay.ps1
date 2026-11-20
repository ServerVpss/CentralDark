<#
#OBSERVACOES# @owner=scripts/casa/CentralDark-RtssOverlay.ps1 @doc_ref=docs/HUD/README.md @last_updated=2026-10-28T17:32:00.000Z
@escopo: bridge local allowlisted para o DesktopOverlayHost existente; sem shell livre, GPU tuning ou alteracao do layout Windows
@implementado: status, abrir, mover por posicao fisica e fechar somente PID explicitamente pertencente ao caller CentralDark
@pendente: etiqueta RTSS por monitor e modo todas-as-telas exigem prova separada; nao sao inferidos deste comando
@next_cursor: chamar somente via server function autenticada do Cockpit e conferir PID/retangulo apos cada acao
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('status','open','move','close')]
  [string]$Action,
  [ValidateSet('esquerda','centro-superior','centro-inferior','direita')]
  [string]$Target,
  [int]$ExpectedPid = 0
)

$ErrorActionPreference = 'Stop'
$hostPath = 'C:\Program Files (x86)\RivaTuner Statistics Server\DesktopOverlayHost.exe'

function Emit-Result([bool]$Ok, [string]$State, [hashtable]$Extra = @{}) {
  $payload = [ordered]@{ ok = $Ok; state = $State; measuredAt = [DateTime]::UtcNow.ToString('o') }
  foreach ($key in $Extra.Keys) { $payload[$key] = $Extra[$key] }
  $payload | ConvertTo-Json -Compress -Depth 5
}

function Get-OverlayProcess {
  @(Get-Process -Name 'DesktopOverlayHost' -ErrorAction SilentlyContinue | Sort-Object StartTime)[0]
}

function Get-DisplayMap {
  Add-Type -AssemblyName System.Windows.Forms
  $screens = @([System.Windows.Forms.Screen]::AllScreens | ForEach-Object {
    [pscustomobject]@{ device = $_.DeviceName; x = $_.Bounds.X; y = $_.Bounds.Y; width = $_.Bounds.Width; height = $_.Bounds.Height; primary = $_.Primary }
  })
  if ($screens.Count -lt 1) { throw 'SCREENS_EMPTY' }
  $byX = @($screens | Sort-Object x)
  $horizontal = @($screens | Where-Object { $_.width -ge $_.height } | Sort-Object y)
  if ($horizontal.Count -lt 2 -or $screens.Count -lt 4) { throw 'FOUR_SCREEN_TOPOLOGY_UNAVAILABLE' }
  $map = [ordered]@{
    'esquerda'        = $byX[0]
    'direita'         = $byX[$byX.Count - 1]
    'centro-superior' = $horizontal[0]
    'centro-inferior' = $horizontal[$horizontal.Count - 1]
  }
  return [pscustomobject]@{ all = $screens; aliases = $map }
}

if (-not ('CentralDarkRtssOverlayNative' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CentralDarkRtssOverlayNative {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll", SetLastError=true)] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll", SetLastError=true)] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr after, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
}
'@
}

function Get-OverlayView($Process, $DisplayMap) {
  if (-not $Process) { return [ordered]@{ running = $false; pid = $null; visible = $false; rect = $null; displays = $DisplayMap.all; aliases = $DisplayMap.aliases } }
  $Process.Refresh()
  $rect = New-Object CentralDarkRtssOverlayNative+RECT
  $hasRect = $Process.MainWindowHandle -ne 0 -and [CentralDarkRtssOverlayNative]::GetWindowRect($Process.MainWindowHandle, [ref]$rect)
  return [ordered]@{
    running = $true; pid = $Process.Id; visible = $Process.MainWindowHandle -ne 0 -and [CentralDarkRtssOverlayNative]::IsWindowVisible($Process.MainWindowHandle)
    rect = if ($hasRect) { [ordered]@{ x=$rect.Left; y=$rect.Top; width=($rect.Right-$rect.Left); height=($rect.Bottom-$rect.Top) } } else { $null }
    displays = $DisplayMap.all; aliases = $DisplayMap.aliases
  }
}

try {
  if ($env:COMPUTERNAME -ne 'SEGREDO') { Emit-Result $false 'RUNTIME_NAO_E_CASA_SEGREDO'; exit 0 }
  if (-not (Test-Path -LiteralPath $hostPath -PathType Leaf)) { Emit-Result $false 'RTSS_DESKTOP_OVERLAY_HOST_ABSENT'; exit 0 }
  $displayMap = Get-DisplayMap
  $process = Get-OverlayProcess
  $startedByCentralDark = $false

  if ($Action -eq 'status') { Emit-Result $true 'STATUS' (Get-OverlayView $process $displayMap); exit 0 }

  if ($Action -in @('open','move') -and -not $process) {
    $process = Start-Process -FilePath $hostPath -PassThru
    $startedByCentralDark = $true
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
      Start-Sleep -Milliseconds 150
      $process.Refresh()
      if ($process.MainWindowHandle -ne 0) { break }
    }
  }

  if ($Action -eq 'close') {
    if ($ExpectedPid -lt 1 -or -not $process -or $process.Id -ne $ExpectedPid) { Emit-Result $false 'REFUSE_CLOSE_NOT_OWNED' (Get-OverlayView $process $displayMap); exit 0 }
    Stop-Process -Id $process.Id -ErrorAction Stop
    Start-Sleep -Milliseconds 250
    Emit-Result $true 'CLOSED_TEMPORARY_HOST' @{ closedPid=$ExpectedPid; displays=$displayMap.all; aliases=$displayMap.aliases }
    exit 0
  }

  if (-not $process -or $process.MainWindowHandle -eq 0) { Emit-Result $false 'RTSS_HOST_WINDOW_UNAVAILABLE' (Get-OverlayView $process $displayMap); exit 0 }
  if ($Action -eq 'move') {
    if (-not $Target -or -not $displayMap.aliases.Contains($Target)) { Emit-Result $false 'TARGET_PHYSICAL_ALIAS_REQUIRED' (Get-OverlayView $process $displayMap); exit 0 }
    $screen = $displayMap.aliases[$Target]
    $moved = [CentralDarkRtssOverlayNative]::SetWindowPos($process.MainWindowHandle, [IntPtr]::Zero, [int]$screen.x, [int]$screen.y, [int]$screen.width, [int]$screen.height, 0x0040)
    if (-not $moved) { throw 'SET_WINDOW_POS_FAILED' }
    Start-Sleep -Milliseconds 250
  }
  $view = Get-OverlayView $process $displayMap
  Emit-Result $true ($(if($Action -eq 'move'){'MOVED_TO_PHYSICAL_TARGET'}else{'OPENED_EXISTING_HOST'})) (@{ startedByCentralDark=$startedByCentralDark; target=$Target } + $view)
} catch {
  Emit-Result $false 'RTSS_OVERLAY_OPERATION_FAILED' @{ detail=$_.Exception.Message }
}
