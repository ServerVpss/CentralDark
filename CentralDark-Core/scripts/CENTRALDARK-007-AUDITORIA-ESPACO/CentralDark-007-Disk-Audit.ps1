# CentralDark | Agente 007 | Auditoria de espaco READ-ONLY
# PowerShell 5.1+ / 7+; scans local fixed drives + explicit K: if mounted.
# Does not delete, restart, install, hash, modify system files, or upload content.
[CmdletBinding()]
param([string]$OutputDirectory = '')
$ErrorActionPreference = 'Continue'
$threshold = [int64]1073741824
$started = Get-Date
$stamp = $started.ToString('yyyyMMdd-HHmmss')
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  # O relatório nasce no PC que executa este script, NÃO no computador do ChatGPT.
  # Preferência pedida: D: quando existir e estiver acessível.
  $destinoBase = if (Test-Path -LiteralPath 'D:\' -PathType Container) { 'D:\' } else {
    Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads'
  }
  $OutputDirectory = Join-Path $destinoBase "CentralDark-007-Disk-Audit-$stamp"
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

function GiB([long]$bytes) { [Math]::Round(($bytes / 1GB), 3) }
function CsvExport($records, [string]$filename) {
  $p = Join-Path $OutputDirectory $filename
  @($records) | Export-Csv -LiteralPath $p -NoTypeInformation -Encoding UTF8
  return $p
}
function Add-Bucket([hashtable]$buckets, [string]$path, [long]$bytes) {
  if (-not $buckets.ContainsKey($path)) { $buckets[$path] = [pscustomobject]@{ Path=$path; Bytes=[long]0; Files=[long]0 } }
  $buckets[$path].Bytes += $bytes
  $buckets[$path].Files += 1
}

$allDrives = @([System.IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady -and $_.DriveType -eq [System.IO.DriveType]::Fixed })
foreach ($letter in @('K','E')) {
  $name = "$letter`:"
  if (Test-Path -LiteralPath "$name\") {
    $already = @($allDrives | Where-Object { $_.Name.Substring(0,1) -eq $letter }).Count -gt 0
    if (-not $already) {
      try { $allDrives += [System.IO.DriveInfo]::new($name) } catch {}
    }
  }
}
$allDrives = @($allDrives | Sort-Object Name -Unique)
$volumes = [System.Collections.Generic.List[object]]::new()
$large = [System.Collections.Generic.List[object]]::new()
$oldScreenpipe = [System.Collections.Generic.List[object]]::new()
$screenpipeBuckets = @{}
$dirBuckets = @{}
$errors = [System.Collections.Generic.List[object]]::new()
$filesSeen = [long]0
$bytesSeen = [long]0
$dirsSeen = [long]0
$skippedLinks = [long]0
$reportPrefix = [System.IO.Path]::GetFullPath($OutputDirectory).TrimEnd('\') + '\'
Write-Host "[007] START $($started.ToString('s'))  READ-ONLY" -ForegroundColor Cyan
Write-Host '[007] NO DELETE | NO CHANGES TO SYSTEM | NO EXTERNAL UPLOAD' -ForegroundColor Cyan
Write-Host '[007] Roots:' ($allDrives.Name -join ', ')

foreach ($drive in $allDrives) {
  $root = $drive.Name
  try {
    $volumes.Add([pscustomobject]@{ Drive=$root; Name=$drive.VolumeLabel; TotalGiB=(GiB $drive.TotalSize); FreeGiB=(GiB $drive.AvailableFreeSpace); UsedGiB=(GiB ($drive.TotalSize - $drive.AvailableFreeSpace)); ObservedAt=$started.ToString('o') })
  } catch {
    $errors.Add([pscustomobject]@{Path=$root; Error='VolumeMetadataUnavailable'})
  }
  Write-Host "[007] Scanning $root ..." -ForegroundColor Yellow
  $stack = [System.Collections.Generic.Stack[string]]::new()
  $stack.Push($root)
  while ($stack.Count -gt 0) {
    $dir = $stack.Pop()
    $dirsSeen++
    # Each unreadable directory is skipped independently; junctions/symlinks are never followed.
    try { $names = [System.IO.Directory]::EnumerateFiles($dir) } catch {
      $errors.Add([pscustomobject]@{Path=$dir; Error='DirectoryFilesAccessDeniedOrUnavailable'})
      $names = @()
    }
    try {
      foreach($file in $names) {
        try {
          if ($file.StartsWith($reportPrefix,[StringComparison]::OrdinalIgnoreCase)) { continue }
          $fi = [System.IO.FileInfo]::new($file)
          $size = [long]$fi.Length
          $filesSeen++; $bytesSeen += $size
          $lw = $fi.LastWriteTime
          if ($size -ge $threshold) {
            $large.Add([pscustomobject]@{
              Drive=$root; GiB=(GiB $size); Bytes=$size; LastModified=$lw.ToString('yyyy-MM-dd HH:mm:ss'); Path=$file
            })
          }
          # Top storage by directory prefix, 1..5 levels (keeps owner visible under Users\name\AppData\Local).
          $rel = $file.Substring($root.Length).TrimStart('\')
          $parts = $rel -split '\\'
          $maxPrefix = [Math]::Min(5, [Math]::Max(0,$parts.Length-1))
          if ($maxPrefix -gt 0) {
            for($depth = 1; $depth -le $maxPrefix; $depth++) {
              $prefix = ($parts[0..($depth-1)] -join '\')
              Add-Bucket $dirBuckets ($root + $prefix) $size
            }
          }
          # Inventory Screenpipe by the first directory segment containing screenpipe, screen-pipe or .screenpipe.
          $sp = [regex]::Match($file,'(?i)(^|\\)[^\\]*screen[ -]?pipe[^\\]*(?=\\|$)')
          if ($sp.Success) {
            $group = $file.Substring(0,$sp.Index + $sp.Length)
            Add-Bucket $screenpipeBuckets $group $size
            $ageDays = [Math]::Floor(($started - $lw).TotalDays)
            if ($ageDays -ge 30 -and $size -ge 10MB) {
              $oldScreenpipe.Add([pscustomobject]@{Path=$file; GiB=(GiB $size); AgeDays=$ageDays; LastModified=$lw.ToString('yyyy-MM-dd HH:mm:ss'); PotentiallyOld='YES_NOT_SAFE_TO_DELETE_AUTOMATICALLY'})
            }
          }
          if ($filesSeen % 50000 -eq 0) { Write-Host "[007] $filesSeen files | $dirsSeen dirs | $($large.Count) files >= 1GiB" }
        } catch { $errors.Add([pscustomobject]@{Path='[unreadable file]';Error='FileMetadataUnavailable'}) }
      }
    } catch { $errors.Add([pscustomobject]@{Path=$dir;Error='DirectoryFilesEnumerationInterrupted'}) }
    try { $dirs = [System.IO.Directory]::EnumerateDirectories($dir) } catch {
      $errors.Add([pscustomobject]@{Path=$dir;Error='DirectorySubdirsAccessDeniedOrUnavailable'})
      $dirs = @()
    }
    try {
      foreach($sub in $dirs) {
        try {
          if ($sub.StartsWith($reportPrefix,[StringComparison]::OrdinalIgnoreCase)) { continue }
          $attrs = [System.IO.File]::GetAttributes($sub)
          if (($attrs -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { $skippedLinks++; continue }
          $stack.Push($sub)
        } catch { $errors.Add([pscustomobject]@{Path=$sub;Error='DirectoryMetadataUnavailable'}) }
      }
    } catch { $errors.Add([pscustomobject]@{Path=$dir;Error='DirectorySubdirsEnumerationInterrupted'}) }
  }
}
$biggest = @($large | Sort-Object Bytes -Descending)
$byDirectory = @($dirBuckets.Values | Sort-Object Bytes -Descending | ForEach-Object { [pscustomobject]@{GiB=(GiB $_.Bytes); Files=$_.Files; Path=$_.Path} })
$byScreenpipe = @($screenpipeBuckets.Values | Sort-Object Bytes -Descending | ForEach-Object { [pscustomobject]@{GiB=(GiB $_.Bytes); Files=$_.Files; Path=$_.Path} })
$old = @($oldScreenpipe | Sort-Object GiB -Descending)
$volumesCsv = CsvExport $volumes 'volumes.csv'
$largeCsv = CsvExport $biggest 'files-over-1gib.csv'
$dirCsv = CsvExport $byDirectory 'largest-directories.csv'
$screenpipeCsv = CsvExport $byScreenpipe 'screenpipe-by-location.csv'
$oldCsv = CsvExport $old 'screenpipe-30days-candidates.csv'
$errorCsv = CsvExport $errors 'scan-errors.csv'
$ended = Get-Date
$report = [ordered]@{
  Schema='centraldark.007.disk-audit.v1'; Scope='READ_ONLY'; StartedAt=$started.ToString('o'); EndedAt=$ended.ToString('o');
  ThresholdGiB=1; FilesScanned=$filesSeen; DirectoriesScanned=$dirsSeen; BytesScanned=$bytesSeen;
  ReparsePointsSkipped=$skippedLinks; ErrorsCount=$errors.Count; Volumes=@($volumes);
  LargeFilesCount=$biggest.Count; LargeFilesGiB=(GiB ([long](($biggest | Measure-Object -Property Bytes -Sum).Sum)));
  ScreenpipeLocations=$byScreenpipe.Count; ScreenpipeOldCandidates=$old.Count;
  TopFiles=@($biggest | Select-Object -First 100); TopDirectories=@($byDirectory | Select-Object -First 100);
  Screenpipe=@($byScreenpipe | Select-Object -First 100);
  Warning='Size by file length is logical, NOT reclaimable disk space. Hardlinks, sparse files and app active state need separate proof. Do not auto-delete.'
}
$report | ConvertTo-Json -Depth 9 | Out-File -LiteralPath (Join-Path $OutputDirectory 'summary.json') -Encoding utf8
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# CentralDark 007 | Disk Audit - READ ONLY')
$lines.Add('')
$lines.Add("- Start: $($started.ToString('o'))")
$lines.Add("- End: $($ended.ToString('o'))")
$lines.Add("- Files scanned: $filesSeen; directories: $dirsSeen; errors: $($errors.Count); links skipped: $skippedLinks")
$lines.Add("- Files >= 1GiB: $($biggest.Count); logical GiB: $([math]::Round($report.LargeFilesGiB,2))")
$lines.Add('- No deletion or modification of target files.')
$lines.Add('')
$lines.Add('## Drives')
foreach($v in $volumes){$lines.Add("- $($v.Drive): $($v.UsedGiB) GiB used / $($v.TotalGiB) GiB total, $($v.FreeGiB) GiB free")}
$lines.Add('')
$lines.Add('## Top 60 large files')
foreach($i in @($biggest | Select-Object -First 60)){$lines.Add("- $($i.GiB) GiB | $($i.LastModified) | $($i.Path)")}
$lines.Add('')
$lines.Add('## Top 50 storage buckets')
foreach($i in @($byDirectory | Select-Object -First 50)){$lines.Add("- $($i.GiB) GiB | $($i.Files) files | $($i.Path)")}
$lines.Add('')
$lines.Add('## Screenpipe locations')
foreach($i in $byScreenpipe){$lines.Add("- $($i.GiB) GiB | $($i.Files) files | $($i.Path)")}
$lines.Add('')
$lines.Add('## Interpreting evidence')
$lines.Add('- A directory named Screenpipe or an old modification date is a candidate, not proof that data is unused.')
$lines.Add('- A service listening on port 3030 can be active while older recordings exist elsewhere; do not delete the current capture owner.')
$lines.Add('- Windows pagefile, hiberfil, virtual disks, databases, .vhdx, .wsl and backups need independent owner review.')
$lines.Add('- Repeated file sizes are not byte-for-byte duplicates; comparing hashes is a separate authorized step.')
$lines.Add('- ERROR and access-denied counts mean this inventory may be incomplete.')
$lines.Add('- Reports may contain private file/folder names: keep them local; share only with the authorized operator.')
$lines | Out-File -LiteralPath (Join-Path $OutputDirectory 'REPORT.md') -Encoding UTF8
Write-Host ''
Write-Host '[007] FINISHED - no files modified or deleted.' -ForegroundColor Green
Write-Host "[007] Report folder: $OutputDirectory" -ForegroundColor Green
Write-Host "[007] Files >=1GiB: $($biggest.Count) | Screenpipe locations: $($byScreenpipe.Count) | Errors: $($errors.Count)" -ForegroundColor Green
Write-Host '[007] Read REPORT.md / summary.json / files-over-1gib.csv / screenpipe-by-location.csv' -ForegroundColor Green
