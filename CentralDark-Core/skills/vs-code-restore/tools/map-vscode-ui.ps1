param(
  [string]$OutputPath = 'K:\skills\vs-code-restore\ui-accessibility-20261014.json'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$source = @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class CDVsWin {
  public delegate bool Callback(IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(Callback f, IntPtr l);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr w, StringBuilder t, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr w);
}
'@
if (-not ('CDVsWin' -as [type])) { Add-Type -TypeDefinition $source }
$windows = [System.Collections.Generic.List[object]]::new()
$cb = [CDVsWin+Callback]{
  param($h, $unused)
  $b = [System.Text.StringBuilder]::new(360)
  [void][CDVsWin]::GetWindowText($h,$b,360)
  $title = $b.ToString()
  if ($title -match 'Visual Studio Code' -and [CDVsWin]::IsWindowVisible($h)) {
    $windows.Add([pscustomobject]@{handle=$h.ToInt64(); title=$title})
  }
  return $true
}
[void][CDVsWin]::EnumWindows($cb,[IntPtr]::Zero)
$reports = @()
foreach($w in $windows){
  $root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$w.handle)
  if($null -eq $root){continue}
  $nodes = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants,
    [System.Windows.Automation.Condition]::TrueCondition)
  $counts = @{}
  $buttons = [System.Collections.Generic.List[object]]::new()
  $seen = [System.Collections.Generic.HashSet[string]]::new()
  foreach($e in $nodes){
    try {
      $t = $e.Current.ControlType.ProgrammaticName
      if(-not $t){continue}
      $type = $t.Replace('ControlType.','')
      if(-not $counts.ContainsKey($type)){$counts[$type]=0}
      $counts[$type]++
      if($type -notin @('Button','MenuItem','TabItem','SplitButton','Hyperlink','ComboBox')){continue}
      $label = [string]$e.Current.Name
      if([string]::IsNullOrWhiteSpace($label)){continue}
      if($label -match 'https?://|[A-Z]:\\|\\\\|@|token|secret|senha|password|chave|/Users/'){continue}
      if($label.Length -gt 130){$label=$label.Substring(0,130)}
      $automationId = [string]$e.Current.AutomationId
      if($automationId.Length -gt 90){$automationId=$automationId.Substring(0,90)}
      $key = "$type|$label|$automationId"
      if(-not $seen.Add($key)){continue}
      $buttons.Add([pscustomobject]@{
        role=$type; label=$label; automation_id=$automationId
        enabled=[bool]$e.Current.IsEnabled
        offscreen=[bool]$e.Current.IsOffscreen
        effect_proof='UNKNOWN'
      })
    } catch {continue}
  }
  $reports += [pscustomobject]@{
    window_title=$w.title
    root_handle=$w.handle
    element_count=$nodes.Count
    counts=$counts
    actionable_controls=@($buttons)
  }
}
$snapshot=[pscustomobject]@{
  owner='skills/vs-code-restore'
  source='Windows UIAutomation; read-only'
  captured_utc=(Get-Date).ToUniversalTime().ToString('o')
  windows=$reports
  note='Identificado != clicado. Cada efeito exige readback; UNKNOWN != PASS.'
}
$dir=Split-Path $OutputPath -Parent
if(-not (Test-Path -LiteralPath $dir)){New-Item -ItemType Directory -Force -Path $dir|Out-Null}
$tmp=$OutputPath+'.new'
$snapshot|ConvertTo-Json -Depth 9|Set-Content -LiteralPath $tmp -Encoding utf8
Move-Item -LiteralPath $tmp -Destination $OutputPath -Force
Write-Output ('MAPPED_WINDOWS=' + @($reports).Count)
foreach($r in $reports){Write-Output ('UI_MAP window='+$r.window_title+' elements='+$r.element_count+' controls='+@($r.actionable_controls).Count)}
Write-Output ('UI_MAP_PATH='+$OutputPath)
