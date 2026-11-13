# #OBSERVACOES# @owner=.agents/skills/centraldark-operational-method/SKILL.md
# @doc_ref=.agents/skills/centraldark-operational-method/references/UI-MULTIJANELA-ROTAS-CACHE-20261030.md
# @last_updated=2026-11-10T01:40:16.491Z
# @implementado=mapa semantico Casa, janelas por tela e resolucao read-only de controle UIA para clique Cua virtual.
# @pendente=numeros nativos devem ser reconfirmados se o arranjo mudar; overlay nao prova automacao.
[CmdletBinding()]
param([switch]$Identify, [string]$Target, [switch]$ListWindows,
      [switch]$Overlay, [string]$CaptureDirectory, [ValidateRange(1,30)][int]$Seconds=5,
      [switch]$ResolveControl, [string]$WindowTitle, [string]$ControlName)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$screens=@([System.Windows.Forms.Screen]::AllScreens)
$portrait=@($screens | Where-Object {$_.Bounds.Height -gt $_.Bounds.Width} | Sort-Object {$_.Bounds.X})
$landscape=@($screens | Where-Object {$_.Bounds.Width -gt $_.Bounds.Height} | Sort-Object {$_.Bounds.Y})
if($screens.Count -ne 4 -or $portrait.Count -ne 2 -or $landscape.Count -ne 2 -or
   $portrait[0].Bounds.X -ge $landscape[0].Bounds.X -or
   $portrait[1].Bounds.X -le $landscape[0].Bounds.X -or
   $landscape[0].Bounds.X -ne $landscape[1].Bounds.X -or
   $landscape[0].Bounds.Y -eq $landscape[1].Bounds.Y){
  throw 'TOPOLOGY_CHANGED: confirmar numeros em Configuracoes > Sistema > Tela > Identificar; nao adivinhar.'
}
# Numeros humanos confirmados pelo CHEFE em 02/11; nunca derivados de DISPLAYn.
$map=@{
  1=@{screen=$portrait[1];role='direita'}
  2=@{screen=$landscape[0];role='centro-superior'}
  3=@{screen=$portrait[0];role='esquerda'}
  4=@{screen=$landscape[1];role='centro-inferior'}
}
$ids=@(1,2,3,4)
if($Target){
  $alias=$Target.ToLowerInvariant().Trim() -replace '^(monitor|tela)\s*',''
  $lookup=@{'1'=1;'um'=1;'direita'=1;'2'=2;'dois'=2;'centro-superior'=2;'superior'=2;
    '3'=3;'tres'=3;'três'=3;'esquerda'=3;'4'=4;'quatro'=4;'centro-inferior'=4;'inferior'=4}
  if(-not $lookup.ContainsKey($alias)){throw 'TARGET_UNKNOWN: use monitor 1, 2, 3, 4 ou posicao.'}
  $ids=@($lookup[$alias])
}
if(-not ('CentralDarkMonitorNative' -as [type])){
Add-Type -ReferencedAssemblies System.Windows.Forms,System.Drawing -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;
public class CentralDarkMonitorNative {
 [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left,Top,Right,Bottom; }
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out RECT r);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
}
public class CentralDarkMonitorBorder : Form {
 public CentralDarkMonitorBorder(){FormBorderStyle=FormBorderStyle.None;ShowInTaskbar=false;TopMost=true;StartPosition=FormStartPosition.Manual;}
 protected override bool ShowWithoutActivation {get{return true;}}
 protected override CreateParams CreateParams {get{var p=base.CreateParams;p.ExStyle|=0x08000020;return p;}}
}
'@
}
# Read-only UIA resolver for the existing Cua click route; no mouse, keys or overlay.
if($ResolveControl){
  if([string]::IsNullOrWhiteSpace($WindowTitle) -or [string]::IsNullOrWhiteSpace($ControlName)){
    throw 'WINDOW_AND_CONTROL_REQUIRED'
  }
  Add-Type -AssemblyName UIAutomationClient
  Add-Type -AssemblyName UIAutomationTypes
  $candidateWindows=@(Get-Process | Where-Object {
    $_.MainWindowHandle -ne 0 -and
    $_.MainWindowTitle.IndexOf($WindowTitle,[StringComparison]::OrdinalIgnoreCase) -ge 0 -and
    [CentralDarkMonitorNative]::IsWindowVisible($_.MainWindowHandle)
  })
  if($candidateWindows.Count -ne 1){throw "WINDOW_NOT_UNIQUE_OR_MISSING count=$($candidateWindows.Count)"}
  $windowProcess=$candidateWindows[0]
  $windowHandle=$windowProcess.MainWindowHandle
  $windowRect=New-Object CentralDarkMonitorNative+RECT
  if(-not [CentralDarkMonitorNative]::GetWindowRect($windowHandle,[ref]$windowRect) -or
     $windowRect.Left -le -30000 -or $windowRect.Right -le $windowRect.Left){
    throw 'WINDOW_MINIMIZED_OR_INVALID'
  }
  $windowElement=[System.Windows.Automation.AutomationElement]::FromHandle($windowHandle)
  if($null -eq $windowElement){throw 'WINDOW_UIA_UNAVAILABLE'}
  $allControls=$windowElement.FindAll([System.Windows.Automation.TreeScope]::Descendants,
                                       [System.Windows.Automation.Condition]::TrueCondition)
  $matchingControls=@(foreach($element in $allControls){
    try{
      $state=$element.Current
      if($state.Name -ieq $ControlName -and $state.IsEnabled -and -not $state.IsOffscreen){
        $element
      }
    }catch{continue}
  })
  # UIA can expose one button as a TabItem and a Group at identical coordinates.
  # Prefer the only actionable entry if every matching rectangle is identical.
  # Distinct controls remain ambiguous and fail closed.
  if($matchingControls.Count -gt 1){
    $actionable=@($matchingControls | Where-Object {
      $_.Current.ControlType.ProgrammaticName -in @('ControlType.TabItem','ControlType.Button','ControlType.MenuItem')
    })
    if($actionable.Count -eq 1){
      $reference=$actionable[0].Current.BoundingRectangle
      $coincident=@($matchingControls | Where-Object {
        $rect=$_.Current.BoundingRectangle
        $rect.X -eq $reference.X -and $rect.Y -eq $reference.Y -and
        $rect.Width -eq $reference.Width -and $rect.Height -eq $reference.Height
      })
      if($coincident.Count -eq $matchingControls.Count){
        $matchingControls=@($actionable[0])
      }
    }
  }
  if($matchingControls.Count -ne 1){throw "CONTROL_NOT_UNIQUE_OR_MISSING count=$($matchingControls.Count)"}
  $controlState=$matchingControls[0].Current
  $controlRect=$controlState.BoundingRectangle
  if($controlRect.IsEmpty -or $controlRect.Width -le 0 -or $controlRect.Height -le 0){
    throw 'CONTROL_BOUNDS_UNAVAILABLE'
  }
  $pointX=[int][Math]::Floor($controlRect.X + $controlRect.Width/2)
  $pointY=[int][Math]::Floor($controlRect.Y + $controlRect.Height/2)
  if($pointX -lt $windowRect.Left -or $pointX -ge $windowRect.Right -or
     $pointY -lt $windowRect.Top -or $pointY -ge $windowRect.Bottom){
    throw 'CONTROL_OUTSIDE_WINDOW'
  }
  $controlScreen=[System.Windows.Forms.Screen]::FromPoint([System.Drawing.Point]::new($pointX,$pointY))
  if(-not $controlScreen.Bounds.Contains([System.Drawing.Point]::new($pointX,$pointY))){
    throw 'CONTROL_OUTSIDE_MONITORS'
  }
  $mappedMonitor=@($map.Keys | Where-Object { $map[$_].screen.DeviceName -eq $controlScreen.DeviceName })
  if($mappedMonitor.Count -ne 1){throw 'CONTROL_MONITOR_BINDING_UNKNOWN'}
  [pscustomobject]@{
    pid=[int]$windowProcess.Id;hwnd=[long]$windowHandle.ToInt64()
    monitor=[int]$mappedMonitor[0];device=$controlScreen.DeviceName
    x=$pointX;y=$pointY;window_title=$windowProcess.MainWindowTitle
    control_name=$controlState.Name;control_type=$controlState.ControlType.ProgrammaticName
    evidence='LIVE_UIA_WINDOW_CONTROL_BOUNDS';input_dispatched=$false
  } | ConvertTo-Json -Compress -Depth 5
  exit 0
}
$stamp=[DateTime]::UtcNow.ToString('o')
$geometry=($screens | Sort-Object DeviceName | ForEach-Object {"$($_.DeviceName):$($_.Bounds)"}) -join '|'
foreach($id in $ids){
  $s=$map[$id].screen
  $windows=@()
  if($ListWindows){
    $windows=@(Get-Process | Where-Object {$_.MainWindowHandle -ne 0} | ForEach-Object {
      $r=New-Object CentralDarkMonitorNative+RECT
      $h=$_.MainWindowHandle
      if([CentralDarkMonitorNative]::IsWindowVisible($h) -and
         [CentralDarkMonitorNative]::GetWindowRect($h,[ref]$r) -and $r.Left -gt -30000 -and
         [System.Windows.Forms.Screen]::FromHandle($h).DeviceName -eq $s.DeviceName){
        [pscustomobject]@{pid=$_.Id;handle=$h.ToInt64();process=$_.ProcessName;title=($_.MainWindowTitle -replace '(?i)(https?://[^\s?]+)\?\S+','$1?[REDACTED]');
          rect=@{left=$r.Left;top=$r.Top;right=$r.Right;bottom=$r.Bottom}}
      }
    })
  }
  [pscustomobject]@{monitor=$id;role=$map[$id].role;device=$s.DeviceName;state='MAPPED';
    numbering_source='CHEFE_CONFIRMED_SETTINGS_20261102';geometry=$geometry;
    bounds=@{x=$s.Bounds.X;y=$s.Bounds.Y;width=$s.Bounds.Width;height=$s.Bounds.Height};
    primary=$s.Primary;windows=$windows;measured_at=$stamp} | ConvertTo-Json -Depth 6 -Compress
}
if($Overlay){
  $forms=New-Object System.Collections.ArrayList
  try{
    foreach($id in $ids){
      $b=$map[$id].screen.Bounds
      foreach($r in @(@($b.X,$b.Y,$b.Width,5),@($b.X,($b.Bottom-5),$b.Width,5),
                     @($b.X,$b.Y,5,$b.Height),@(($b.Right-5),$b.Y,5,$b.Height))){
        $f=New-Object CentralDarkMonitorBorder
        $f.BackColor=[System.Drawing.Color]::LimeGreen
        $f.MinimumSize=New-Object System.Drawing.Size($r[2],$r[3])
        $f.MaximumSize=New-Object System.Drawing.Size($r[2],$r[3])
        $f.Bounds=New-Object System.Drawing.Rectangle($r[0],$r[1],$r[2],$r[3])
        $f.Show();[void]$forms.Add($f)
      }
    }
    [System.Windows.Forms.Application]::DoEvents()
    if($CaptureDirectory){
      [void][IO.Directory]::CreateDirectory($CaptureDirectory)
      Start-Sleep -Milliseconds 300
      foreach($id in $ids){
        $b=$map[$id].screen.Bounds
        $bmp=New-Object Drawing.Bitmap($b.Width,$b.Height)
        $g=[Drawing.Graphics]::FromImage($bmp)
        try{
          $g.CopyFromScreen($b.X,$b.Y,0,0,$b.Size)
          $file=Join-Path $CaptureDirectory ("monitor-$id-overlay.png")
          $bmp.Save($file,[Drawing.Imaging.ImageFormat]::Png)
          $corners=0
          foreach($pt in @(@(2,2),@(($b.Width-3),2),@(2,($b.Height-3)),@(($b.Width-3),($b.Height-3)))){
            $c=$bmp.GetPixel($pt[0],$pt[1])
            if($c.G -gt 150 -and $c.R -lt 100 -and $c.B -lt 100){$corners++}
          }
          Write-Output "MONITOR=$id GREEN_CORNERS=$corners/4 CAPTURE=$file"
        }finally{$g.Dispose();$bmp.Dispose()}
      }
    }
    $end=[DateTime]::UtcNow.AddSeconds($Seconds)
    while([DateTime]::UtcNow -lt $end){[System.Windows.Forms.Application]::DoEvents();Start-Sleep -Milliseconds 40}
    Write-Output 'OVERLAY=CLOSED; PURPOSE=TARGET_PREVIEW; AUTOMATION_RUNNING=NOT_ASSERTED'
  }finally{foreach($f in $forms){$f.Close();$f.Dispose()}}
}

if(-not $Identify){exit 0}
Start-Process 'ms-settings:display'
Start-Sleep -Milliseconds 900
try{
  Add-Type -AssemblyName UIAutomationClient
  Add-Type -AssemblyName UIAutomationTypes
  $root=[System.Windows.Automation.AutomationElement]::RootElement
  $buttons=$root.FindAll([System.Windows.Automation.TreeScope]::Descendants,
    [System.Windows.Automation.PropertyCondition]::new(
      [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
      [System.Windows.Automation.ControlType]::Button))
  foreach($button in $buttons){
    $name=$button.Current.Name.Trim()
    if($name -in @('Identificar','Identify') -and $button.Current.IsEnabled){
      $pattern=$button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
      $pattern.Invoke()
      Write-Output 'NATIVE_IDENTIFY=INVOKED'
      exit 0
    }
  }
  Write-Output 'NATIVE_IDENTIFY=NOT_FOUND_IN_WINDOWS_SETTINGS'
  exit 2
}catch{
  Write-Output ('NATIVE_IDENTIFY=UNAVAILABLE REASON='+$_.Exception.GetType().Name)
  exit 3
}
