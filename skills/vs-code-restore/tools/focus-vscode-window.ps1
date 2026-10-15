# Fast UI sensor for the EXISTING vs-code-restore skill. No terminal input.
[CmdletBinding()]
param(
  [ValidateSet('Inventory','Focus','Capture','FocusCapture')]
  [string]$Mode = 'Inventory',
  [int]$TargetPid = 0,
  [long]$WindowHandle = 0,
  [string]$CapturePath = ''
)
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class CDVsFocus {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr state);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc proc, IntPtr state);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int len);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [StructLayout(LayoutKind.Sequential)] public struct RECT {public int Left,Top,Right,Bottom;}
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
}
'@
$active = [CDVsFocus]::GetForegroundWindow().ToInt64()
$found = [System.Collections.Generic.List[object]]::new()
$cb = [CDVsFocus+EnumProc] {
  param($h,$unused)
  if (-not [CDVsFocus]::IsWindowVisible($h)) { return $true }
  $titleBuilder = [System.Text.StringBuilder]::new(512)
  [void][CDVsFocus]::GetWindowText($h,$titleBuilder,$titleBuilder.Capacity)
  $title = $titleBuilder.ToString()
  if ($title -notmatch 'Visual Studio Code' -or $title -notmatch 'CentralDark') { return $true }
  $ownerId = [uint32]0
  [void][CDVsFocus]::GetWindowThreadProcessId($h,[ref]$ownerId)
  try { $processName=(Get-Process -Id $ownerId -ErrorAction Stop).ProcessName } catch { return $true }
  if ($processName -ne 'Code') { return $true }
  $safeTitle = ($title -replace 'https?://\S+','[URL]' -replace '[\r\n]',' ')
  if ($safeTitle.Length -gt 128) { $safeTitle = $safeTitle.Substring(0,128) }
  $rect = New-Object CDVsFocus+RECT
  [void][CDVsFocus]::GetWindowRect($h,[ref]$rect)
  $found.Add([pscustomobject]@{
    handle=$h.ToInt64(); pid=[int]$ownerId; title=$safeTitle
    foreground=($h.ToInt64() -eq $active)
    rect=@($rect.Left,$rect.Top,($rect.Right-$rect.Left),($rect.Bottom-$rect.Top))
  })
  return $true
}
[void][CDVsFocus]::EnumWindows($cb,[IntPtr]::Zero)
$match=@($found | Where-Object {
  ($TargetPid -eq 0 -or $_.pid -eq $TargetPid) -and
  ($WindowHandle -eq 0 -or $_.handle -eq $WindowHandle)
})
if ($Mode -eq 'Inventory') {
  [pscustomobject]@{ status='OBSERVED'; mode=$Mode; count=$match.Count; windows=$match } |
    ConvertTo-Json -Depth 5 -Compress
  exit 0
}
if ($match.Count -eq 0) { throw 'TARGET_WINDOW_NOT_FOUND: remap PID/HWND; neither is persistent.' }
if ($match.Count -gt 1) {
  $front=@($match | Where-Object foreground)
  if ($front.Count -eq 1) { $match=$front }
  else { throw 'TARGET_AMBIGUOUS: specify TargetPid and WindowHandle from fresh inventory.' }
}
$target=$match[0]
$h=[IntPtr]$target.handle
$focusOk=$null
if ($Mode -eq 'Focus' -or $Mode -eq 'FocusCapture') {
  $requested=[CDVsFocus]::SetForegroundWindow($h)
  Start-Sleep -Milliseconds 120
  $focusOk=($requested -and [CDVsFocus]::GetForegroundWindow().ToInt64() -eq $target.handle)
  if (-not $focusOk) { throw 'FOCUS_READBACK_FAILED: no keystroke/click dispatched.' }
}
$photo=$null
if ($Mode -eq 'Capture' -or $Mode -eq 'FocusCapture') {
  Add-Type -AssemblyName System.Drawing
  $r=New-Object CDVsFocus+RECT
  if (-not [CDVsFocus]::GetWindowRect($h,[ref]$r)) { throw 'WINDOW_RECT_UNAVAILABLE' }
  $width=$r.Right-$r.Left; $height=$r.Bottom-$r.Top
  if ($width -le 0 -or $height -le 0 -or $width -gt 10000 -or $height -gt 10000) { throw 'WINDOW_RECT_INVALID' }
  $bmp=[System.Drawing.Bitmap]::new($width,$height)
  $graphics=[System.Drawing.Graphics]::FromImage($bmp)
  try {
    $graphics.CopyFromScreen($r.Left,$r.Top,0,0,[System.Drawing.Size]::new($width,$height))
    $targetWidth=[Math]::Min(1440,$width)
    $targetHeight=[int][Math]::Max(1,[Math]::Round($height*$targetWidth/$width))
    $small=[System.Drawing.Bitmap]::new($targetWidth,$targetHeight)
    $drawing=[System.Drawing.Graphics]::FromImage($small)
    try {
      $drawing.DrawImage($bmp,0,0,$targetWidth,$targetHeight)
      if (-not $CapturePath) { $CapturePath=Join-Path $env:TEMP ("centraldark-vscode-window-"+$target.pid+".jpg") }
      $small.Save($CapturePath,[System.Drawing.Imaging.ImageFormat]::Jpeg)
      $photo=[pscustomobject]@{ path=$CapturePath; bytes=(Get-Item -LiteralPath $CapturePath).Length; capture_is_live=$true }
    } finally { $drawing.Dispose(); $small.Dispose() }
  } finally { $graphics.Dispose(); $bmp.Dispose() }
}
$observedFront=[CDVsFocus]::GetForegroundWindow().ToInt64()
[pscustomobject]@{
  status= $(if ($Mode -eq 'Capture') {'CAPTURED'} else {'FOCUS_READBACK_PASS'})
  mode=$Mode; pid=$target.pid; handle=$target.handle
  foreground=($observedFront -eq $target.handle)
  screenshot=$photo; no_terminal_input=$true
  note='CopyFromScreen captures visible pixels; occlusion is possible without FocusCapture. Screenshot != CLI execution.'
} | ConvertTo-Json -Depth 5 -Compress
