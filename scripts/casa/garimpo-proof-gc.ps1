param(
  [string]$Root = 'E:\\CentralDark\\_MAPA_CASA\\GARIMPO-CHEFE',
  [switch]$Apply,
  [switch]$SelfTest
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-FileSha256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Get-StreamSha256([System.IO.Stream]$Stream) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = $sha.ComputeHash($Stream)
    ([BitConverter]::ToString($bytes)).Replace('-', '')
  } finally {
    $sha.Dispose()
    $Stream.Dispose()
  }
}

function Test-Protected([string]$Path) {
  $p = $Path.ToLowerInvariant()
  return (
    $p -match '(^|[\\/])\.ssh([\\/]|$)' -or
    $p -match '(^|[\\/])\.env($|\.)' -or
    $p -match 'client[_-]?secret|api[_-]?key|token|cookie|credential|session' -or
    $p -match 'permito segredo|cadeado'
  )
}

function Measure-Tree([string]$Path) {
  [int64]$bytes = 0
  [int64]$count = 0
  if (-not (Test-Path -LiteralPath $Path)) {
    return [pscustomobject]@{ Files = 0; Bytes = 0 }
  }
  foreach ($f in [System.IO.Directory]::EnumerateFiles($Path, '*', [System.IO.SearchOption]::AllDirectories)) {
    try {
      $i = [System.IO.FileInfo]$f
      $bytes += $i.Length
      $count++
    } catch {}
  }
  [pscustomobject]@{ Files = $count; Bytes = $bytes }
}

function Get-ReproducibleExtraction([System.IO.DirectoryInfo]$Dir, [string]$RootPath) {
  if (Test-Protected $Dir.FullName) { return $null }

  $base = $Dir.Name.Substring('.extracted_'.Length)
  $zipCandidates = @(
    (Join-Path $RootPath $base),
    (Join-Path $RootPath ($base + '.zip'))
  ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf -and $_.ToLowerInvariant().EndsWith('.zip') }

  if ($zipCandidates.Count -eq 0) { return $null }
  $zipPath = $zipCandidates[0]
  $files = @([System.IO.Directory]::EnumerateFiles($Dir.FullName, '*', [System.IO.SearchOption]::AllDirectories))
  if ($files.Count -eq 0) { return $null }

  $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
  try {
    $entries = @($zip.Entries | Where-Object { -not [string]::IsNullOrEmpty($_.Name) })
    foreach ($file in $files) {
      $rel = $file.Substring($Dir.FullName.Length).TrimStart('\\','/').Replace('\\','/')
      $matches = @($entries | Where-Object {
        $n = $_.FullName.Replace('\\','/').TrimStart('.','/')
        $n -eq $rel -or $n.EndsWith('/' + $rel)
      })
      if ($matches.Count -eq 0) { return $null }

      $len = ([System.IO.FileInfo]$file).Length
      $sameSize = @($matches | Where-Object { $_.Length -eq $len })
      if ($sameSize.Count -ne 1) { return $null }

      $entryHash = Get-StreamSha256 ($sameSize[0].Open())
      $fileHash = Get-FileSha256 $file
      if ($entryHash -ne $fileHash) { return $null }
    }

    $m = Measure-Tree $Dir.FullName
    return [pscustomobject]@{
      Type = 'REPRODUCIBLE_EXTRACTED_COPY'
      Path = $Dir.FullName
      Bytes = [int64]$m.Bytes
      Reason = 'all extracted files SHA256-identical to ZIP origin'
      Origin = $zipPath
    }
  } finally {
    $zip.Dispose()
  }
}

function Get-GcCandidates([string]$RootPath) {
  if (-not (Test-Path -LiteralPath $RootPath -PathType Container)) {
    throw "GARIMPO_ROOT_NOT_FOUND: $RootPath"
  }

  $items = [System.Collections.Generic.List[object]]::new()

  # Empty derived top-level directories.
  $derivedDirs = Get-ChildItem -LiteralPath $RootPath -Directory -Force | Where-Object {
    $_.Name -like '.extracted_*' -or
    $_.Name -like '*_files' -or
    $_.Name -match '^(?i:tmp|temp)$'
  }
  foreach ($d in $derivedDirs) {
    if (Test-Protected $d.FullName) { continue }
    $m = Measure-Tree $d.FullName
    if ($m.Files -eq 0) {
      $items.Add([pscustomobject]@{
        Type='EMPTY_DERIVED_DIR'; Path=$d.FullName; Bytes=[int64]0
        Reason='derived directory contains zero files'; Origin=$null
      })
    }
  }

  # Exact duplicate top-level files; only copy-suffix variants are candidates.
  $allowedExt = @('.zip','.7z','.rar','.tar','.gz','.tgz','.html','.htm','.md','.txt','.json','.csv','.ps1','.bat','.cmd')
  $topFiles = @(Get-ChildItem -LiteralPath $RootPath -File -Force | Where-Object {
    $_.Length -gt 0 -and $allowedExt -contains $_.Extension.ToLowerInvariant() -and -not (Test-Protected $_.FullName)
  })
  foreach ($sizeGroup in ($topFiles | Group-Object Length | Where-Object { $_.Count -gt 1 })) {
    $hashed = @($sizeGroup.Group | ForEach-Object {
      [pscustomobject]@{ File=$_; Hash=(Get-FileSha256 $_.FullName) }
    })
    foreach ($hashGroup in ($hashed | Group-Object Hash | Where-Object { $_.Count -gt 1 })) {
      $members = @($hashGroup.Group | ForEach-Object { $_.File })
      $baseKeepers = @($members | Where-Object { $_.BaseName -notmatch ' \(\d+\)$' } | Sort-Object LastWriteTime,Name)
      $keeper = if ($baseKeepers.Count -gt 0) { $baseKeepers[0] } else { @($members | Sort-Object LastWriteTime,Name)[0] }

      foreach ($f in $members) {
        if ($f.FullName -eq $keeper.FullName) { continue }
        if ($f.BaseName -match ' \(\d+\)$') {
          $items.Add([pscustomobject]@{
            Type='EXACT_DUPLICATE_COPY'; Path=$f.FullName; Bytes=[int64]$f.Length
            Reason=('SHA256=' + (Get-FileSha256 $f.FullName) + '; keeper=' + $keeper.Name)
            Origin=$keeper.FullName
          })
        }
      }
    }
  }

  # Reproducible .extracted_* directories backed by ZIP.
  foreach ($d in (Get-ChildItem -LiteralPath $RootPath -Directory -Force | Where-Object { $_.Name -like '.extracted_*' })) {
    $candidate = Get-ReproducibleExtraction $d $RootPath
    if ($null -ne $candidate) { $items.Add($candidate) }
  }

  # NPM/NPX isolated cache only when structure is recognized and no process uses it.
  $cacheRoot = Join-Path $RootPath 'cache'
  if (Test-Path -LiteralPath $cacheRoot -PathType Container) {
    foreach ($d in (Get-ChildItem -LiteralPath $cacheRoot -Directory -Force | Where-Object { $_.Name -like 'desktop-commander-isolated*' })) {
      if (Test-Protected $d.FullName) { continue }
      $live = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -and $_.ProcessId -ne $PID -and $_.CommandLine.Contains($d.FullName)
      })
      if ($live.Count -gt 0) { continue }

      $allowedChildren = @('_cacache','_logs','_npx','_update-notifier-last-checked')
      $children = @(Get-ChildItem -LiteralPath $d.FullName -Force)
      $unknown = @($children | Where-Object { $allowedChildren -notcontains $_.Name })
      if ($unknown.Count -eq 0) {
        $m = Measure-Tree $d.FullName
        $items.Add([pscustomobject]@{
          Type='EPHEMERAL_NPX_CACHE_NOT_IN_USE'; Path=$d.FullName; Bytes=[int64]$m.Bytes
          Reason='recognized npm/npx cache structure; no live process references this path'; Origin=$null
        })
      }
    }
  }

  @($items)
}

function Invoke-GarimpoGc([string]$RootPath, [bool]$DoApply) {
  $candidates = @(Get-GcCandidates $RootPath)
  [int64]$planned = ($candidates | Measure-Object Bytes -Sum).Sum
  $removed = [System.Collections.Generic.List[object]]::new()
  [int64]$actual = 0

  if ($DoApply) {
    foreach ($c in $candidates) {
      if (Test-Protected $c.Path) { continue }
      if (-not (Test-Path -LiteralPath $c.Path)) { continue }
      if ((Get-Item -LiteralPath $c.Path).PSIsContainer) {
        Remove-Item -LiteralPath $c.Path -Recurse -Force
      } else {
        Remove-Item -LiteralPath $c.Path -Force
      }
      if (-not (Test-Path -LiteralPath $c.Path)) {
        $actual += [int64]$c.Bytes
        $removed.Add($c)
      }
    }
  }

  [pscustomobject]@{
    schema='centraldark.garimpo-gc.v1'
    mode=if($DoApply){'APPLY'}else{'DRY_RUN'}
    root=$RootPath
    candidate_count=$candidates.Count
    planned_reclaim_bytes=$planned
    removed_count=$removed.Count
    removed_bytes=$actual
    protected_fail_closed=$true
    candidates=$candidates
    removed=@($removed)
  }
}

function Invoke-SelfTest {
  $t = Join-Path ([System.IO.Path]::GetTempPath()) ('centraldark-garimpo-gc-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $t | Out-Null
  try {
    New-Item -ItemType Directory -Path (Join-Path $t '.extracted_empty') | Out-Null
    [IO.File]::WriteAllText((Join-Path $t 'alpha.txt'),'same')
    Copy-Item (Join-Path $t 'alpha.txt') (Join-Path $t 'alpha (1).txt')

    $src = Join-Path $t 'pack-src'
    New-Item -ItemType Directory -Path $src | Out-Null
    [IO.File]::WriteAllText((Join-Path $src 'x.txt'),'crystal')
    Compress-Archive -Path (Join-Path $src 'x.txt') -DestinationPath (Join-Path $t 'pack.zip')
    $ext = Join-Path $t '.extracted_pack'
    New-Item -ItemType Directory -Path $ext | Out-Null
    Copy-Item (Join-Path $src 'x.txt') (Join-Path $ext 'x.txt')

    [IO.File]::WriteAllText((Join-Path $t 'openai-api-key.txt'),'do-not-delete')

    $cache = Join-Path $t 'cache\desktop-commander-isolated'
    New-Item -ItemType Directory -Path (Join-Path $cache '_logs') -Force | Out-Null
    [IO.File]::WriteAllText((Join-Path $cache '_logs\x.log'),'cache')

    $dry = Invoke-GarimpoGc $t $false
    $types = @($dry.candidates.Type)
    foreach ($required in @('EMPTY_DERIVED_DIR','EXACT_DUPLICATE_COPY','REPRODUCIBLE_EXTRACTED_COPY','EPHEMERAL_NPX_CACHE_NOT_IN_USE')) {
      if ($types -notcontains $required) { throw "SELF_TEST_MISSING=$required" }
    }
    if ($dry.removed_count -ne 0) { throw 'SELF_TEST_DRY_RUN_MUTATED' }
    if (-not (Test-Path -LiteralPath (Join-Path $t 'openai-api-key.txt'))) { throw 'SELF_TEST_PROTECTED_FILE_LOST' }

    [pscustomobject]@{ status='PASS'; tests=6; candidate_types=($types | Sort-Object -Unique) }
  } finally {
    Remove-Item -LiteralPath $t -Recurse -Force -ErrorAction SilentlyContinue
  }
}

if ($SelfTest) {
  Invoke-SelfTest | ConvertTo-Json -Depth 8
  exit 0
}

Invoke-GarimpoGc $Root ([bool]$Apply) | ConvertTo-Json -Depth 10
