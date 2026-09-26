#requires -Version 5.1
<#
CENTRALDARK — AUDITORIA LOCAL WINDOWS READ-ONLY v2
==================================================
Objetivo:
  Medir C:\Users\<usuario> e E:\CentralDark antes de qualquer movimento/sincronia.

GARANTIAS:
  - NÃO move, copia, renomeia ou apaga dados dos roots medidos.
  - NÃO faz git pull/push/reset/checkout.
  - NÃO lê conteúdo textual de .env/tokens/chaves.
  - NÃO exporta command line completa de processos.
  - NÃO exporta credenciais embutidas em Git remote.
  - Só escreve dentro de AuditRoot.

Mede:
  - volumes C:/E:
  - inventário de arquivos/pastas com timestamps e atributos
  - junctions/symlinks/reparse points
  - roots Git, branch, HEAD, origin sanitizado, dirty state
  - variáveis de caminho selecionadas (HERMES_HOME etc.)
  - consumidores/processos relevantes sem vazar argumentos
  - candidatos CentralDark no perfil C:
  - comparação C -> E por SHA256/nome
  - runtime probes seletivos dentro de AppData
  - pacote SEND sanitizado para revisão externa

IMPORTANTE:
  A auditoria NÃO decide migração.
  ACTIVE/COMPATIBILITY/HISTORICAL/BACKUP/CANDIDATE continuam exigindo prova de consumidor.
#>

[CmdletBinding()]
param(
    [string]$UserRoot = $env:USERPROFILE,
    [string]$HouseRoot = 'E:\CentralDark',
    [string]$AuditRoot = 'C:\CentralDark-Audit',
    [Int64]$MaxHashBytes = 268435456, # 256 MB
    [int]$RuntimeProbeDepth = 4
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

if ($env:OS -ne 'Windows_NT') {
    throw 'Este script foi desenhado para Windows.'
}

function Normalize-Root {
    param([Parameter(Mandatory=$true)][string]$Path)
    try {
        return [System.IO.Path]::GetFullPath($Path).TrimEnd('\')
    } catch {
        return $Path.TrimEnd('\')
    }
}

$UserRoot  = Normalize-Root $UserRoot
$HouseRoot = Normalize-Root $HouseRoot
$AuditRoot = Normalize-Root $AuditRoot

function Test-PathInside {
    param([string]$Child, [string]$Parent)
    $c = (Normalize-Root $Child) + '\'
    $p = (Normalize-Root $Parent) + '\'
    return $c.StartsWith($p, [System.StringComparison]::OrdinalIgnoreCase)
}

if ((Test-PathInside $AuditRoot $UserRoot) -or (Test-PathInside $AuditRoot $HouseRoot)) {
    throw "AuditRoot deve ficar FORA dos roots medidos. Atual: $AuditRoot"
}

$Stamp      = Get-Date -Format 'yyyyMMdd-HHmmss'
$Out        = Join-Path $AuditRoot "AUDIT-$Stamp"
$PrivateDir = Join-Path $Out 'LOCAL-PRIVATE-NAO-ENVIAR'
$SendDir    = Join-Path $Out 'SEND-ME'

New-Item -ItemType Directory -Force -Path $PrivateDir | Out-Null
New-Item -ItemType Directory -Force -Path $SendDir    | Out-Null

$LogFile = Join-Path $Out 'AUDIT.log'

$Inventory = New-Object 'System.Collections.Generic.List[object]'
$Errors    = New-Object 'System.Collections.Generic.List[object]'
$Links     = New-Object 'System.Collections.Generic.List[object]'
$RepoMap   = @{}
$SeenScanRoots = @{}

function Log {
    param([string]$Message)
    $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'), $Message
    Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
    Write-Host $line
}

function Add-AuditError {
    param(
        [string]$Stage,
        [string]$Path,
        [string]$Message
    )
    $Errors.Add([pscustomobject]@{
        Time    = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff')
        Stage   = $Stage
        Path    = $Path
        Message = $Message
    })
    Log "ERROR stage=$Stage path=$Path message=$Message"
}

function Get-RelativePathSafe {
    param([string]$Root, [string]$Path)

    try {
        $r = (Normalize-Root $Root)
        $p = [System.IO.Path]::GetFullPath($Path)

        if ($p.Equals($r, [System.StringComparison]::OrdinalIgnoreCase)) {
            return '.'
        }

        $prefix = $r + '\'
        if ($p.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $p.Substring($prefix.Length)
        }
    } catch {}

    return $Path
}

function Test-SensitiveName {
    param([string]$Name)

    $n = $Name.ToLowerInvariant()

    $exact = @(
        '.env',
        '.git-credentials',
        '.emulator_console_auth_token',
        'id_rsa',
        'id_ed25519',
        'id_ecdsa',
        'id_dsa'
    )

    if ($exact -contains $n) { return $true }

    if ($n -match '^\.env\.') { return $true }
    if ($n -match '(^|[._-])env($|[._-])') { return $true }
    if ($n -match '^keys?(\.|$)') { return $true }
    if ($n -match 'secret|credential|password|passwd|private.?key') { return $true }
    if ($n -match '\.(pem|pfx|p12|key)$') { return $true }

    return $false
}

function Test-PrivateConfigName {
    param([string]$Name)

    $n = $Name.ToLowerInvariant()

    if ($n -like '.claude.json*') { return $true }
    if ($n -like '.npmrc*') { return $true }

    return $n -in @(
        '.gitconfig',
        '.bash_history',
        '.lesshst',
        '.yarnrc',
        '.minttyrc'
    )
}

function Test-WindowsProfileState {
    param([string]$Name)

    $n = $Name.ToLowerInvariant()

    if ($n -eq 'ntuser.dat') { return $true }
    if ($n -eq 'ntuser.ini') { return $true }
    if ($n -like 'ntuser.dat*') { return $true }
    if ($n -like 'usrclass.dat*') { return $true }

    return $false
}

function Test-ToolStatePath {
    param([string]$FullName)

    $p = $FullName.ToLowerInvariant()

    if ($p -match '\\\.(claude|codex|copilot|gemini|cursor|vscode|vscode-server|ssh|docker|config|cargo|rustup|gradle|nuget|pm2)(\\|$)') {
        return $true
    }

    if ($p -match '\\appdata(\\|$)') {
        return $true
    }

    return $false
}

function Get-MaterialClass {
    param(
        [string]$FullName,
        [string]$Name,
        [bool]$IsDirectory,
        [string]$RootLabel
    )

    if (Test-SensitiveName $Name) {
        return 'SENSITIVE_PRIVATE_CONFIG'
    }

    if (Test-WindowsProfileState $Name) {
        return 'WINDOWS_PROFILE_STATE'
    }

    if (Test-PrivateConfigName $Name) {
        return 'PRIVATE_TOOL_CONFIG_NO_HASH'
    }

    if ($RootLabel -eq 'RUNTIME_PROBE') {
        return 'TOOL_RUNTIME_STATE'
    }

    if ($RootLabel -eq 'HOUSE') {
        if (Test-ToolStatePath $FullName) {
            return 'HOUSE_RUNTIME_OR_DERIVED'
        }
        return 'HOUSE_MATERIAL'
    }

    if (Test-ToolStatePath $FullName) {
        return 'TOOL_RUNTIME_STATE'
    }

    $n = $Name.ToLowerInvariant()
    $p = $FullName.ToLowerInvariant()

    if (-not $IsDirectory -and $n -match '\.(zip|rar|7z|tar|tgz|gz|bz2)$') {
        return 'ARCHIVE_REVIEW'
    }

    if ($n -match ' - copia|copia \([0-9]+\)|copy \([0-9]+\)|\.bak$|\.backup$|\.old$|\.tmp$') {
        return 'LEGACY_DUPLICATE_CANDIDATE'
    }

    if (
        $p -match 'centraldark|hermes|pivete|jarvis|aiox|mcp' -or
        $n -match 'centraldark|hermes|pivete|jarvis|aiox|mcp|soul' -or
        $n -in @('claude.md','codex.md','agents.md')
    ) {
        return 'CENTRALDARK_CANDIDATE'
    }

    return 'GENERAL_USER_MATERIAL'
}

function Test-PruneDirectory {
    param(
        [System.IO.DirectoryInfo]$Directory,
        [string]$RootLabel
    )

    $name = $Directory.Name.ToLowerInvariant()
    $path = $Directory.FullName.ToLowerInvariant()

    if (($Directory.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        return 'REPARSE_POINT'
    }

    if ($name -in @(
        '.git',
        'node_modules',
        '.cache',
        '.rustup',
        '.gradle',
        '.nuget',
        '.pytest_cache',
        '.vscode-server'
    )) {
        return "NOISE_TREE:$name"
    }

    if ($path -match '\\\.cargo\\(registry|git)(\\|$)') {
        return 'CARGO_CACHE'
    }

    if ($path -match '\\\.pm2\\logs(\\|$)') {
        return 'PM2_LOG_TREE'
    }

    # AppData completa é grande e contém estado do Windows/apps.
    # Ela é medida via probes seletivos abaixo.
    if ($RootLabel -eq 'USER_PROFILE' -and $name -eq 'appdata') {
        return 'APPDATA_TARGETED_PROBES_ONLY'
    }

    return $null
}

function Get-LinkInfo {
    param([System.IO.FileSystemInfo]$Item)

    $linkType = ''
    $target   = ''

    try {
        $prop = $Item.PSObject.Properties['LinkType']
        if ($null -ne $prop) { $linkType = [string]$prop.Value }
    } catch {}

    try {
        $prop = $Item.PSObject.Properties['Target']
        if ($null -ne $prop) {
            if ($prop.Value -is [System.Array]) {
                $target = ($prop.Value -join ' | ')
            } else {
                $target = [string]$prop.Value
            }
        }
    } catch {}

    return [pscustomobject]@{
        LinkType = $linkType
        Target   = $target
    }
}

function Get-SafeHash {
    param(
        [System.IO.FileInfo]$File,
        [string]$Class,
        [string]$RootLabel
    )

    if ($Class -in @(
        'SENSITIVE_PRIVATE_CONFIG',
        'PRIVATE_TOOL_CONFIG_NO_HASH',
        'WINDOWS_PROFILE_STATE',
        'TOOL_RUNTIME_STATE',
        'HOUSE_RUNTIME_OR_DERIVED'
    )) {
        return 'SKIPPED_CLASS'
    }

    if ($RootLabel -eq 'USER_PROFILE' -and $Class -notin @(
        'CENTRALDARK_CANDIDATE',
        'LEGACY_DUPLICATE_CANDIDATE',
        'ARCHIVE_REVIEW'
    )) {
        return 'SKIPPED_NONCANDIDATE'
    }

    if ($File.Length -gt $MaxHashBytes) {
        return "SKIPPED_GT_$MaxHashBytes"
    }

    try {
        return (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA256 -ErrorAction Stop).Hash
    } catch {
        Add-AuditError -Stage 'HASH' -Path $File.FullName -Message $_.Exception.Message
        return 'HASH_ERROR'
    }
}

function Add-InventoryRecord {
    param(
        [System.IO.FileSystemInfo]$Item,
        [string]$Root,
        [string]$RootLabel,
        [string]$Traversal = ''
    )

    $isDir = $Item.PSIsContainer
    $class = Get-MaterialClass -FullName $Item.FullName -Name $Item.Name -IsDirectory $isDir -RootLabel $RootLabel

    $hash = ''
    if (-not $isDir) {
        $hash = Get-SafeHash -File ([System.IO.FileInfo]$Item) -Class $class -RootLabel $RootLabel
    }

    $isReparse = (($Item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)
    $link = [pscustomobject]@{ LinkType=''; Target='' }

    if ($isReparse) {
        $link = Get-LinkInfo -Item $Item
        $Links.Add([pscustomobject]@{
            RootLabel = $RootLabel
            Path      = $Item.FullName
            ItemType  = if ($isDir) { 'Directory' } else { 'File' }
            LinkType  = $link.LinkType
            Target    = $link.Target
        })
    }

    $Inventory.Add([pscustomobject]@{
        RootLabel       = $RootLabel
        Root            = $Root
        FullName        = $Item.FullName
        RelativePath    = Get-RelativePathSafe -Root $Root -Path $Item.FullName
        Name            = $Item.Name
        ItemType        = if ($isDir) { 'Directory' } else { 'File' }
        Extension       = if ($isDir) { '' } else { $Item.Extension }
        LengthBytes     = if ($isDir) { $null } else { $Item.Length }
        CreationLocal   = $Item.CreationTime.ToString('yyyy-MM-dd HH:mm:ss.fff')
        CreationUtc     = $Item.CreationTimeUtc.ToString('yyyy-MM-dd HH:mm:ss.fffZ')
        LastWriteLocal  = $Item.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss.fff')
        LastWriteUtc    = $Item.LastWriteTimeUtc.ToString('yyyy-MM-dd HH:mm:ss.fffZ')
        LastAccessLocal = $Item.LastAccessTime.ToString('yyyy-MM-dd HH:mm:ss.fff')
        LastAccessUtc   = $Item.LastAccessTimeUtc.ToString('yyyy-MM-dd HH:mm:ss.fffZ')
        Attributes      = $Item.Attributes.ToString()
        IsReparsePoint  = $isReparse
        LinkType        = $link.LinkType
        LinkTarget      = $link.Target
        Traversal       = $Traversal
        MaterialClass   = $class
        SHA256          = $hash
    })
}

function Register-GitRepo {
    param([string]$RepoPath)

    try {
        $key = (Normalize-Root $RepoPath).ToLowerInvariant()
        $RepoMap[$key] = Normalize-Root $RepoPath
    } catch {}
}

function Scan-Root {
    param(
        [string]$Root,
        [string]$RootLabel,
        [int]$MaxDepth = 0
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        Add-AuditError -Stage 'ROOT' -Path $Root -Message 'ROOT_NOT_FOUND'
        return
    }

    $rootKey = ((Normalize-Root $Root) + '|' + $RootLabel).ToLowerInvariant()
    if ($SeenScanRoots.ContainsKey($rootKey)) {
        return
    }
    $SeenScanRoots[$rootKey] = $true

    Log "SCAN_START label=$RootLabel root=$Root maxDepth=$MaxDepth"

    try {
        $rootItem = Get-Item -LiteralPath $Root -Force -ErrorAction Stop
    } catch {
        Add-AuditError -Stage 'ROOT_GET_ITEM' -Path $Root -Message $_.Exception.Message
        return
    }

    if (-not $rootItem.PSIsContainer) {
        Add-InventoryRecord -Item $rootItem -Root $Root -RootLabel $RootLabel
        return
    }

    Add-InventoryRecord -Item $rootItem -Root $Root -RootLabel $RootLabel -Traversal 'ROOT'

    $stack = New-Object System.Collections.Stack
    $stack.Push([pscustomobject]@{ Dir=$rootItem; Depth=0 })

    while ($stack.Count -gt 0) {
        $node  = $stack.Pop()
        $dir   = $node.Dir
        $depth = [int]$node.Depth

        try {
            $children = @(Get-ChildItem -LiteralPath $dir.FullName -Force -ErrorAction Stop)
        } catch {
            Add-AuditError -Stage 'ENUMERATE' -Path $dir.FullName -Message $_.Exception.Message
            continue
        }

        foreach ($item in $children) {
            $isDir = $item.PSIsContainer
            $traversal = ''

            if ($item.Name -eq '.git') {
                Register-GitRepo -RepoPath $dir.FullName
            }

            if ($isDir) {
                $pruneReason = Test-PruneDirectory -Directory ([System.IO.DirectoryInfo]$item) -RootLabel $RootLabel

                if ($null -ne $pruneReason) {
                    $traversal = "PRUNED:$pruneReason"
                    Add-InventoryRecord -Item $item -Root $Root -RootLabel $RootLabel -Traversal $traversal
                    continue
                }

                if ($MaxDepth -gt 0 -and ($depth + 1) -ge $MaxDepth) {
                    $traversal = 'PRUNED:MAX_DEPTH'
                    Add-InventoryRecord -Item $item -Root $Root -RootLabel $RootLabel -Traversal $traversal
                    continue
                }

                Add-InventoryRecord -Item $item -Root $Root -RootLabel $RootLabel -Traversal 'SCANNED'
                $stack.Push([pscustomobject]@{ Dir=$item; Depth=($depth + 1) })
            }
            else {
                Add-InventoryRecord -Item $item -Root $Root -RootLabel $RootLabel -Traversal 'FILE'
            }
        }
    }

    Log "SCAN_END label=$RootLabel root=$Root"
}

function Sanitize-GitRemote {
    param([string]$Remote)

    if ([string]::IsNullOrWhiteSpace($Remote)) { return '' }

    try {
        if ($Remote -match '^(https?|ftp)://') {
            $uri = New-Object System.Uri($Remote)
            $portPart = ''
            if (-not $uri.IsDefaultPort) { $portPart = ':' + $uri.Port }
            return '{0}://{1}{2}{3}' -f $uri.Scheme, $uri.Host, $portPart, $uri.AbsolutePath
        }
    } catch {}

    # Sanitiza também a parte "user@" de remotes SCP/SSH.
    if ($Remote -match '^([^@\s]+)@([^:]+):(.*)$') {
        return '[USER]@' + $Matches[2] + ':' + $Matches[3]
    }

    return $Remote
}

function Measure-GitRepos {
    $rows = New-Object 'System.Collections.Generic.List[object]'

    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($null -eq $git) {
        $rows.Add([pscustomobject]@{
            RepositoryPath = ''
            Branch         = ''
            HEAD           = ''
            Origin         = ''
            WorkTree       = 'GIT_CLI_UNAVAILABLE'
            UntrackedCount = ''
        })
        return $rows
    }

    foreach ($repo in ($RepoMap.Values | Sort-Object -Unique)) {
        $branch = ''
        $head   = ''
        $remote = ''
        $state  = 'UNKNOWN'
        $untrackedCount = ''

        try {
            $branch = [string]((& git -C $repo branch --show-current 2>$null | Select-Object -First 1))
            $head   = [string]((& git -C $repo rev-parse HEAD 2>$null | Select-Object -First 1))
            $remote = [string]((& git -C $repo remote get-url origin 2>$null | Select-Object -First 1))
            $remote = Sanitize-GitRemote $remote

            $status = @(& git -C $repo status --porcelain=v1 2>$null)
            $state  = if ($status.Count -gt 0) { 'DIRTY' } else { 'CLEAN' }

            $untrackedCount = @($status | Where-Object { $_ -match '^\?\?' }).Count
        } catch {
            Add-AuditError -Stage 'GIT' -Path $repo -Message $_.Exception.Message
        }

        $rows.Add([pscustomobject]@{
            RepositoryPath = $repo
            Branch         = $branch
            HEAD           = $head
            Origin         = $remote
            WorkTree       = $state
            UntrackedCount = $untrackedCount
        })
    }

    return $rows
}

function Measure-Volumes {
    $rows = New-Object 'System.Collections.Generic.List[object]'

    foreach ($device in @('C:','E:')) {
        try {
            $disk = Get-CimInstance Win32_LogicalDisk -Filter ("DeviceID='{0}'" -f $device) -ErrorAction Stop
            if ($null -eq $disk) {
                $rows.Add([pscustomobject]@{
                    DeviceID=''; VolumeName=''; FileSystem=''; SizeBytes=''; FreeBytes=''; VolumeSerialNumber=''; Status='NOT_FOUND'
                })
                continue
            }

            $rows.Add([pscustomobject]@{
                DeviceID           = $disk.DeviceID
                VolumeName         = $disk.VolumeName
                FileSystem         = $disk.FileSystem
                SizeBytes          = $disk.Size
                FreeBytes          = $disk.FreeSpace
                VolumeSerialNumber = $disk.VolumeSerialNumber
                Status             = 'OBSERVED'
            })
        } catch {
            Add-AuditError -Stage 'VOLUME' -Path $device -Message $_.Exception.Message
        }
    }

    return $rows
}

function Measure-SelectedEnvironment {
    $rows = New-Object 'System.Collections.Generic.List[object]'

    $names = @(
        'USERPROFILE',
        'LOCALAPPDATA',
        'APPDATA',
        'HERMES_HOME',
        'CENTRALDARK_HOME',
        'CENTRALDARK_ROOT',
        'CLAUDE_CONFIG_DIR',
        'CODEX_HOME'
    )

    foreach ($name in $names) {
        foreach ($scope in @('Process','User','Machine')) {
            try {
                $value = [Environment]::GetEnvironmentVariable($name, $scope)
                if (-not [string]::IsNullOrWhiteSpace($value)) {
                    $rows.Add([pscustomobject]@{
                        Name  = $name
                        Scope = $scope
                        Value = $value
                    })
                }
            } catch {}
        }
    }

    return $rows
}

function String-ContainsPath {
    param([string]$Text, [string]$Path)

    if ([string]::IsNullOrWhiteSpace($Text)) { return $false }
    if ([string]::IsNullOrWhiteSpace($Path)) { return $false }

    return ($Text.IndexOf($Path, [System.StringComparison]::OrdinalIgnoreCase) -ge 0)
}

function Measure-RuntimeConsumers {
    $rows = New-Object 'System.Collections.Generic.List[object]'

    try {
        $processes = @(Get-CimInstance Win32_Process -ErrorAction Stop)
    } catch {
        Add-AuditError -Stage 'PROCESS' -Path 'Win32_Process' -Message $_.Exception.Message
        return $rows
    }

    foreach ($p in $processes) {
        $name = [string]$p.Name
        $exe  = [string]$p.ExecutablePath
        $cmd  = [string]$p.CommandLine

        $nameMatch = ($name -match '(?i)hermes|claude|codex|centraldark|obsidian|electron')
        $refUser   = (String-ContainsPath $exe $UserRoot)  -or (String-ContainsPath $cmd $UserRoot)
        $refHouse  = (String-ContainsPath $exe $HouseRoot) -or (String-ContainsPath $cmd $HouseRoot)

        if ($nameMatch -or $refUser -or $refHouse) {
            $evidenceClass = if ($refHouse) {
                'HOUSE_ROOT_REFERENCE'
            } elseif ($refUser) {
                'USER_ROOT_REFERENCE'
            } else {
                'PROCESS_NAME_MATCH_ONLY'
            }

            $rows.Add([pscustomobject]@{
                ProcessName         = $name
                PID                 = $p.ProcessId
                ExecutablePath      = $exe
                NameMatch           = $nameMatch
                ReferencesUserRoot  = $refUser
                ReferencesHouseRoot = $refHouse
                EvidenceClass       = $evidenceClass
                CommandLineExported = $false
            })
        }
    }

    return $rows
}

function Measure-KnownPaths {
    $rows = New-Object 'System.Collections.Generic.List[object]'

    $known = New-Object 'System.Collections.Generic.List[string]'
    foreach ($p in @(
        $HouseRoot,
        (Join-Path $HouseRoot 'vault'),
        (Join-Path $HouseRoot 'Pivete'),
        (Join-Path $HouseRoot '.hermes'),
        (Join-Path $HouseRoot 'workspace'),
        (Join-Path $UserRoot '.hermes'),
        (Join-Path $UserRoot 'hermes-web-ui'),
        (Join-Path $UserRoot 'workspace')
    )) {
        if (-not [string]::IsNullOrWhiteSpace($p)) { $known.Add($p) }
    }

    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $known.Add((Join-Path $env:LOCALAPPDATA 'hermes'))
    }
    if (-not [string]::IsNullOrWhiteSpace($env:APPDATA)) {
        $known.Add((Join-Path $env:APPDATA 'hermes'))
    }

    foreach ($path in ($known | Sort-Object -Unique)) {
        $exists = Test-Path -LiteralPath $path
        $itemType = ''
        $isReparse = $false
        $linkType = ''
        $target = ''
        $lastWriteUtc = ''

        if ($exists) {
            try {
                $item = Get-Item -LiteralPath $path -Force -ErrorAction Stop
                $itemType = if ($item.PSIsContainer) { 'Directory' } else { 'File' }
                $isReparse = (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0)
                $lastWriteUtc = $item.LastWriteTimeUtc.ToString('yyyy-MM-dd HH:mm:ss.fffZ')
                if ($isReparse) {
                    $li = Get-LinkInfo -Item $item
                    $linkType = $li.LinkType
                    $target = $li.Target
                }
            } catch {
                Add-AuditError -Stage 'KNOWN_PATH' -Path $path -Message $_.Exception.Message
            }
        }

        $rows.Add([pscustomobject]@{
            Path         = $path
            Exists       = $exists
            ItemType     = $itemType
            IsReparse    = $isReparse
            LinkType     = $linkType
            LinkTarget   = $target
            LastWriteUtc = $lastWriteUtc
            ActiveStatus = 'UNKNOWN_UNTIL_CONSUMER_PROOF'
        })
    }

    return $rows
}

function Build-RuntimeProbePaths {
    $paths = New-Object 'System.Collections.Generic.List[string]'

    $candidates = New-Object 'System.Collections.Generic.List[string]'

    foreach ($p in @($env:HERMES_HOME, $env:CENTRALDARK_HOME, $env:CENTRALDARK_ROOT)) {
        if (-not [string]::IsNullOrWhiteSpace($p)) { $candidates.Add($p) }
    }

    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $candidates.Add((Join-Path $env:LOCALAPPDATA 'hermes'))
        $candidates.Add((Join-Path $env:LOCALAPPDATA 'CentralDark'))
        $candidates.Add((Join-Path $env:LOCALAPPDATA 'Claude'))
    }

    if (-not [string]::IsNullOrWhiteSpace($env:APPDATA)) {
        $candidates.Add((Join-Path $env:APPDATA 'hermes'))
        $candidates.Add((Join-Path $env:APPDATA 'CentralDark'))
        $candidates.Add((Join-Path $env:APPDATA 'Claude'))
    }

    foreach ($p in $candidates) {
        if ([string]::IsNullOrWhiteSpace($p)) { continue }
        try {
            $normalized = Normalize-Root $p
            if (Test-Path -LiteralPath $normalized) {
                if (-not $paths.Contains($normalized)) {
                    $paths.Add($normalized)
                }
            }
        } catch {}
    }

    return $paths
}

Log 'CENTRALDARK_AUDIT_V2_BEGIN'
Log "UserRoot=$UserRoot"
Log "HouseRoot=$HouseRoot"
Log "AuditRoot=$AuditRoot"
Log 'MODE=READ_ONLY_SOURCE_ROOTS'
Log 'MUTATION=AUDIT_OUTPUT_ONLY'

# 1) Estado físico básico.
$Volumes    = Measure-Volumes
$EnvRows    = Measure-SelectedEnvironment
$Runtime    = Measure-RuntimeConsumers
$KnownPaths = Measure-KnownPaths

# 2) Inventário principal.
Scan-Root -Root $UserRoot  -RootLabel 'USER_PROFILE'
Scan-Root -Root $HouseRoot -RootLabel 'HOUSE'

# 3) Probes seletivos para AppData/runtime que foi propositalmente podado.
$ProbePaths = Build-RuntimeProbePaths
foreach ($probe in $ProbePaths) {
    Scan-Root -Root $probe -RootLabel 'RUNTIME_PROBE' -MaxDepth $RuntimeProbeDepth
}

# 4) Git.
$GitRows = Measure-GitRepos

# 5) Comparação C -> E por hash/nome.
$HouseFiles = @($Inventory | Where-Object {
    $_.RootLabel -eq 'HOUSE' -and $_.ItemType -eq 'File'
})

$UserCandidateFiles = @($Inventory | Where-Object {
    $_.RootLabel -eq 'USER_PROFILE' -and
    $_.ItemType -eq 'File' -and
    $_.MaterialClass -in @(
        'CENTRALDARK_CANDIDATE',
        'LEGACY_DUPLICATE_CANDIDATE',
        'ARCHIVE_REVIEW'
    )
})

$HouseByHash = @{}
$HouseByName = @{}

foreach ($h in $HouseFiles) {
    if (
        -not [string]::IsNullOrWhiteSpace([string]$h.SHA256) -and
        $h.SHA256 -notmatch '^SKIPPED_' -and
        $h.SHA256 -ne 'HASH_ERROR'
    ) {
        if (-not $HouseByHash.ContainsKey($h.SHA256)) {
            $HouseByHash[$h.SHA256] = New-Object 'System.Collections.Generic.List[string]'
        }
        $HouseByHash[$h.SHA256].Add($h.FullName)
    }

    $nameKey = $h.Name.ToLowerInvariant()
    if (-not $HouseByName.ContainsKey($nameKey)) {
        $HouseByName[$nameKey] = New-Object 'System.Collections.Generic.List[string]'
    }
    $HouseByName[$nameKey].Add($h.FullName)
}

$Comparisons = New-Object 'System.Collections.Generic.List[object]'

foreach ($c in $UserCandidateFiles) {
    $hashMatches = @()
    $nameMatches = @()

    if ($HouseByHash.ContainsKey([string]$c.SHA256)) {
        $hashMatches = @($HouseByHash[[string]$c.SHA256])
    }

    $nameKey = $c.Name.ToLowerInvariant()
    if ($HouseByName.ContainsKey($nameKey)) {
        $nameMatches = @($HouseByName[$nameKey])
    }

    if ($hashMatches.Count -gt 0) {
        $verdict = 'IDENTICAL_ALREADY_IN_HOUSE'
    }
    elseif ($nameMatches.Count -gt 0) {
        $verdict = 'SAME_NAME_REVIEW_DELTA'
    }
    elseif ([string]$c.SHA256 -match '^SKIPPED_') {
        $verdict = 'NOT_HASHED_REVIEW_BY_NAME_METADATA'
    }
    elseif ($c.SHA256 -eq 'HASH_ERROR') {
        $verdict = 'HASH_ERROR_UNKNOWN'
    }
    else {
        $verdict = 'NOT_FOUND_IN_HOUSE_BY_HASH_OR_NAME'
    }

    $Comparisons.Add([pscustomobject]@{
        CandidatePath  = $c.FullName
        MaterialClass  = $c.MaterialClass
        SizeBytes      = $c.LengthBytes
        LastWriteUtc   = $c.LastWriteUtc
        SHA256         = $c.SHA256
        Verdict        = $verdict
        HashMatches    = ($hashMatches -join ' | ')
        NameMatches    = ($nameMatches -join ' | ')
    })
}

# 6) Top-level do perfil: ótimo para decidir o que é app/runtime vs projeto/material.
$TopLevel = @($Inventory | Where-Object {
    $_.RootLabel -eq 'USER_PROFILE' -and
    $_.RelativePath -ne '.' -and
    $_.RelativePath -notmatch '\\'
} | Select-Object FullName,ItemType,LengthBytes,LastWriteUtc,Attributes,IsReparsePoint,LinkType,LinkTarget,Traversal,MaterialClass)

$TopLevelSend = @($TopLevel | Where-Object {
    $_.MaterialClass -notin @(
        'SENSITIVE_PRIVATE_CONFIG',
        'PRIVATE_TOOL_CONFIG_NO_HASH',
        'WINDOWS_PROFILE_STATE'
    )
})

# 7) Export privado local — NÃO ENVIAR.
$Inventory |
    Export-Csv -LiteralPath (Join-Path $PrivateDir 'FULL-INVENTORY.csv') -NoTypeInformation -Encoding UTF8

$Inventory |
    ConvertTo-Json -Depth 5 |
    Set-Content -LiteralPath (Join-Path $PrivateDir 'FULL-INVENTORY.json') -Encoding UTF8

# 8) Pacote sanitizado para enviar.
$Volumes |
    Export-Csv -LiteralPath (Join-Path $SendDir '01-VOLUMES.csv') -NoTypeInformation -Encoding UTF8

$TopLevelSend |
    Export-Csv -LiteralPath (Join-Path $SendDir '02-TOPO-C-USUARIO.csv') -NoTypeInformation -Encoding UTF8

$UserCandidateFiles |
    Select-Object FullName,RelativePath,Name,Extension,LengthBytes,CreationUtc,LastWriteUtc,Attributes,MaterialClass,SHA256 |
    Export-Csv -LiteralPath (Join-Path $SendDir '03-CANDIDATOS-CENTRALDARK.csv') -NoTypeInformation -Encoding UTF8

$Comparisons |
    Export-Csv -LiteralPath (Join-Path $SendDir '04-COMPARACAO-C-E.csv') -NoTypeInformation -Encoding UTF8

$GitRows |
    Export-Csv -LiteralPath (Join-Path $SendDir '05-GIT-REPOS.csv') -NoTypeInformation -Encoding UTF8

$Runtime |
    Export-Csv -LiteralPath (Join-Path $SendDir '06-RUNTIME-CONSUMERS.csv') -NoTypeInformation -Encoding UTF8

$EnvRows |
    Export-Csv -LiteralPath (Join-Path $SendDir '07-PATH-ENVIRONMENT.csv') -NoTypeInformation -Encoding UTF8

$Links |
    Export-Csv -LiteralPath (Join-Path $SendDir '08-JUNCTIONS-SYMLINKS.csv') -NoTypeInformation -Encoding UTF8

$Errors |
    Export-Csv -LiteralPath (Join-Path $SendDir '09-ERROS-ACESSO.csv') -NoTypeInformation -Encoding UTF8

$ProbePaths |
    ForEach-Object { [pscustomobject]@{ ProbePath = $_ } } |
    Export-Csv -LiteralPath (Join-Path $SendDir '10-RUNTIME-PROBES.csv') -NoTypeInformation -Encoding UTF8

$KnownPaths |
    Export-Csv -LiteralPath (Join-Path $SendDir '11-KNOWN-PATH-PROBES.csv') -NoTypeInformation -Encoding UTF8

$SummaryPath = Join-Path $SendDir '00-RESUMO.txt'

$summary = @"
CENTRALDARK — AUDITORIA LOCAL WINDOWS v2
========================================
Timestamp local:      $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
UserRoot:             $UserRoot
HouseRoot:            $HouseRoot
AuditRoot:            $AuditRoot

MODO
----------------------------------------
SOURCE_ROOTS_READ_ONLY=TRUE
FILES_MOVED=0
FILES_DELETED=0
FILES_RENAMED=0
GIT_PULL=0
GIT_PUSH=0
GIT_RESET=0
PROCESS_COMMANDLINE_EXPORTED=FALSE
SECRET_CONTENT_EXPORTED=FALSE

MEDIÇÃO
----------------------------------------
Inventory records:    $($Inventory.Count)
User candidates:      $($UserCandidateFiles.Count)
Git repositories:     $(@($GitRows | Where-Object { $_.RepositoryPath }).Count)
Reparse links:        $($Links.Count)
Runtime consumers:    $($Runtime.Count)
Runtime probes:       $($ProbePaths.Count)
Errors captured:      $($Errors.Count)
Protected top-level omitted from SEND:
$($TopLevel.Count - $TopLevelSend.Count)

COMPARAÇÃO C -> E
----------------------------------------
Identical already in House:
$(@($Comparisons | Where-Object Verdict -eq 'IDENTICAL_ALREADY_IN_HOUSE').Count)

Same name / review delta:
$(@($Comparisons | Where-Object Verdict -eq 'SAME_NAME_REVIEW_DELTA').Count)

Not found by hash/name:
$(@($Comparisons | Where-Object Verdict -eq 'NOT_FOUND_IN_HOUSE_BY_HASH_OR_NAME').Count)

Not hashed / metadata review:
$(@($Comparisons | Where-Object Verdict -eq 'NOT_HASHED_REVIEW_BY_NAME_METADATA').Count)

Hash error / UNKNOWN:
$(@($Comparisons | Where-Object Verdict -eq 'HASH_ERROR_UNKNOWN').Count)

CONTRATO
----------------------------------------
CURRENT_C_PHYSICAL_LAYOUT=PARTIAL_WITH_DECLARED_PRUNES
CURRENT_E_PHYSICAL_LAYOUT=PARTIAL_WITH_DECLARED_PRUNES
CURRENT_HERMES_HOME=EVIDENCE_ONLY_IF_ENV_OR_RUNTIME_PROBE_PRESENT
CURRENT_ACTIVE_VAULT=UNKNOWN_UNLESS_RUNTIME_OR_LINK_EVIDENCE
ACTIVE_CONSUMER=EVIDENCE_ONLY_IF_ROOT_REFERENCE_PRESENT
PROCESS_NAME_MATCH_ONLY_IS_NOT_CONSUMER_PROOF=TRUE
PATH_FOUND_DOES_NOT_MEAN_ACTIVE=TRUE
RECOVERY_PATH_DOES_NOT_MEAN_MIGRATION=TRUE
NO_DATA_MOVE_WITHOUT_REVIEW=TRUE
NO_FALSE_GREEN=TRUE

NÃO ENVIAR
----------------------------------------
$PrivateDir

ENVIAR
----------------------------------------
Somente o ZIP SEND sanitizado gerado ao final.
"@

$summary | Set-Content -LiteralPath $SummaryPath -Encoding UTF8

$DecisionPath = Join-Path $SendDir '12-DECISION-GATE.txt'
@"
DECISION_GATE=READ_ONLY_COMPLETE_PENDING_EXTERNAL_REVIEW
MOVE_ALLOWED=FALSE
DELETE_ALLOWED=FALSE
QUARANTINE_ALLOWED=FALSE
GITHUB_SYNC_ALLOWED=FALSE

NEXT:
1. Revisar candidatos, repos Git, runtime consumers, links e probes.
2. Classificar caminhos com evidência:
   ACTIVE | COMPATIBILITY | HISTORICAL | BACKUP | CANDIDATE | UNKNOWN
3. Só depois definir absorção mínima em E:\CentralDark.
4. Só depois reconciliar Casa <-> GitHub.
"@ | Set-Content -LiteralPath $DecisionPath -Encoding UTF8

# 9) ZIP sanitizado.
$SendZip = Join-Path $Out ("SEND-CENTRALDARK-AUDIT-{0}.zip" -f $Stamp)
try {
    Compress-Archive -Path (Join-Path $SendDir '*') -DestinationPath $SendZip -CompressionLevel Optimal -Force
} catch {
    Add-AuditError -Stage 'ZIP' -Path $SendZip -Message $_.Exception.Message
}

Log 'CENTRALDARK_AUDIT_V2_COMPLETE'

Write-Host ''
Write-Host '============================================'
Write-Host ' CENTRALDARK AUDITORIA v2 CONCLUIDA'
Write-Host '============================================'
Write-Host "Saida: $Out"
Write-Host "ENVIE SOMENTE: $SendZip"
Write-Host ''
Write-Host "NAO envie: $PrivateDir"
Write-Host ''
Write-Host 'Nenhum arquivo-fonte foi movido/apagado.'
Write-Host 'Nenhum pull/push/reset Git foi executado.'
Write-Host '============================================'
