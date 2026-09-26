$ErrorActionPreference = 'Stop'
$path = 'E:\CentralDark\CentralDark\scripts\lupa\pdf-conformance-cc2003.mjs'
$code = @'
using System;
using System.Runtime.InteropServices;

public static class RmUtil {
  [StructLayout(LayoutKind.Sequential)]
  public struct RM_UNIQUE_PROCESS { public int dwProcessId; public System.Runtime.InteropServices.ComTypes.FILETIME ProcessStartTime; }
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct RM_PROCESS_INFO {
    public RM_UNIQUE_PROCESS Process;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)] public string strAppName;
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)] public string strServiceShortName;
    public int ApplicationType; public uint AppStatus; public uint TSSessionId;
    [MarshalAs(UnmanagedType.Bool)] public bool bRestartable;
  }
  [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)] public static extern int RmStartSession(out uint pSessionHandle, int dwSessionFlags, string strSessionKey);
  [DllImport("rstrtmgr.dll", CharSet = CharSet.Unicode)] public static extern int RmRegisterResources(uint pSessionHandle, uint nFiles, string[] rgsFilenames, uint nApplications, RM_UNIQUE_PROCESS[] rgApplications, uint nServices, string[] rgsServiceNames);
  [DllImport("rstrtmgr.dll")] public static extern int RmGetList(uint dwSessionHandle, out uint pnProcInfoNeeded, ref uint pnProcInfo, [In, Out] RM_PROCESS_INFO[] rgAffectedApps, ref uint lpdwRebootReasons);
  [DllImport("rstrtmgr.dll")] public static extern int RmEndSession(uint pSessionHandle);
}
'@
Add-Type $code
$key = [Guid]::NewGuid().ToString()
$h = 0
$rc = [RmUtil]::RmStartSession([ref]$h, 0, $key)
if ($rc -ne 0) { throw "RmStartSession=$rc" }
try {
  $files = @($path)
  $rc = [RmUtil]::RmRegisterResources($h, 1, $files, 0, $null, 0, $null)
  if ($rc -ne 0) { throw "RmRegisterResources=$rc" }
  $needed = 0; $count = 0; $reason = 0
  $dummy = New-Object RmUtil+RM_PROCESS_INFO[] 1
  $rc = [RmUtil]::RmGetList($h, [ref]$needed, [ref]$count, $dummy, [ref]$reason)
  $count = $needed
  $apps = New-Object RmUtil+RM_PROCESS_INFO[] $count
  if ($count -gt 0) {
    $rc = [RmUtil]::RmGetList($h, [ref]$needed, [ref]$count, $apps, [ref]$reason)
  }
  $out = @()
  for ($i=0; $i -lt $count; $i++) {
    $lockerPid = $apps[$i].Process.dwProcessId
    $p = Get-Process -Id $lockerPid -ErrorAction SilentlyContinue
    $out += [pscustomobject]@{ pid=$lockerPid; app=$apps[$i].strAppName; service=$apps[$i].strServiceShortName; process=$p.ProcessName; path=$p.Path }
  }
  [pscustomobject]@{ file=$path; lockers=$out; rebootReason=$reason } | ConvertTo-Json -Depth 5
} finally {
  [void][RmUtil]::RmEndSession($h)
}

