#requires -Version 5.1
<#
CENTRALDARK — CLEANUP PROOF-DRIVEN
Específico para SEND-CENTRALDARK-AUDIT-20260824-114754.zip

MODOS
  Auto                 -> encadeia tudo sozinho até fixed point; testa rollback e para apenas em bloqueio/UNKNOWN/erro.
  Preview              -> somente mede/classifica.
  DeleteSafe           -> remove somente duplicatas comprovadas em Downloads.
  QuarantineDormant    -> move duplicatas de .hermes-web-ui para quarentena se dormência for provada.
  FinalizeQuarantine   -> apaga quarentena somente com frase explícita + reprova cópia E:.

NUNCA:
  - apaga AppData/Hermes runtime
  - apaga OneDrive
  - apaga repos Git
  - apaga arquivo sensível
  - usa "mesmo nome" como prova
  - aceita hash histórico sem recalcular ao vivo
#>

[CmdletBinding()]
param(
    [ValidateSet('Auto','Preview','DeleteSafe','QuarantineDormant','FinalizeQuarantine')]
    [string]$Mode = 'Preview',

    [string]$AuditZip =
        'C:\CentralDark-Audit\AUDIT-20260824-114754\SEND-CENTRALDARK-AUDIT-20260824-114754.zip',

    [string]$ExpectedAuditSHA256 =
        '7bbc7d0a6f96ccad6696894c5420e7a8ba511de2f34b679ca8204711c2192b2d',

    [string]$UserRoot = 'C:\Users\danda',
    [string]$HouseRoot = 'E:\CentralDark',
    [string]$AuditRoot = 'C:\CentralDark-Audit',

    [string]$QuarantineBatch = '',
    [string]$FinalDeletePhrase = ''
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$SafeDeleteRoot = Join-Path $UserRoot 'Downloads'
$DormantRoot = Join-Path $UserRoot '.hermes-web-ui'

$HardProtectedRoots = @(
    (Join-Path $UserRoot 'AppData'),
    (Join-Path $UserRoot '.hermes'),
    (Join-Path $UserRoot '.grok'),
    (Join-Path $UserRoot '.claude'),
    (Join-Path $UserRoot '.codex'),
    (Join-Path $UserRoot '.ssh'),
    (Join-Path $UserRoot 'OneDrive'),
    (Join-Path $UserRoot 'Documents'),
    (Join-Path $UserRoot 'aiox-core')
)

$ExcludedHouseSegments = @(
    '\BACKUPS\',
    '\_QUARANTINE\',
    '\test_unzip\',
    '\TEMP\',
    '\tmp\',
    '\_forense\',
    '\workspace\backups\'
)

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$RunRoot = Join-Path $AuditRoot "CLEANUP-PROOF-$Stamp"
$ExtractRoot = Join-Path $RunRoot 'audit'
$ReceiptCsv = Join-Path $RunRoot 'receipt.csv'
$SummaryTxt = Join-Path $RunRoot 'summary.txt'
$ResidualCsv = Join-Path $RunRoot 'residual-duplicates.csv'
$ConsumerCsv = Join-Path $RunRoot 'dormant-consumers.csv'

New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null

function Normalize-Path {
    param([Parameter(Mandatory=$true)][string]$Path)
    try { return [System.IO.Path]::GetFullPath($Path).TrimEnd('\') }
    catch { return $Path.TrimEnd('\') }
}

function Test-Inside {
    param([string]$Child,[string]$Parent)

    if ([string]::IsNullOrWhiteSpace($Child) -or [string]::IsNullOrWhiteSpace($Parent)) {
        return $false
    }

    $c = Normalize-Path $Child
    $p = Normalize-Path $Parent

    return (
        $c.Equals($p,[System.StringComparison]::OrdinalIgnoreCase) -or
        $c.StartsWith($p + '\',[System.StringComparison]::OrdinalIgnoreCase)
    )
}

function Test-SensitivePath {
    param([string]$Path)
    $n = [System.IO.Path]::GetFileName($Path).ToLowerInvariant()

    if ($n -match '^\.env($|\.)') { return $true }
    if ($n -match '(^|[._-])env($|[._-])') { return $true }
    if ($n -match '^keys?(\.|$)') { return $true }
    if ($n -match 'secret|credential|password|passwd|private.?key') { return $true }
    if ($n -match '\.(pem|pfx|p12|key)$') { return $true }
    if ($n -match '^id_(rsa|ed25519|ecdsa|dsa)') { return $true }
    if ($n -eq '.git-credentials') { return $true }

    return $false
}

function Test-ProtectedRoot {
    param([string]$Path)

    foreach ($root in $HardProtectedRoots) {
        if (Test-Inside $Path $root) { return $true }
    }

    return $false
}

function Get-SHA256 {
    param([string]$Path)

    try {
        return (Get-FileHash -LiteralPath $Path -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
    } catch {
        return $null
    }
}

function Test-Unlocked {
    param([string]$Path)

    try {
        $s = [System.IO.File]::Open(
            $Path,
            [System.IO.FileMode]::Open,
            [System.IO.FileAccess]::Read,
            [System.IO.FileShare]::None
        )
        $s.Close()
        return $true
    } catch {
        return $false
    }
}

function Split-ProofMatches {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) { return @() }

    return @(
        $Value -split '\s+\|\s+' |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    )
}

function Test-HouseProofPathAllowed {
    param([string]$Path)

    if (-not (Test-Inside $Path $HouseRoot)) { return $false }

    foreach ($segment in $ExcludedHouseSegments) {
        if ($Path.IndexOf($segment,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
            return $false
        }
    }

    return $true
}

function Get-LiveProofCopy {
    param(
        [string]$ExpectedHash,
        [string]$HashMatches
    )

    foreach ($candidate in (Split-ProofMatches $HashMatches)) {
        if (-not (Test-HouseProofPathAllowed $candidate)) { continue }
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }

        $h = Get-SHA256 $candidate
        if ($h -and $h -eq $ExpectedHash.ToLowerInvariant()) {
            return (Normalize-Path $candidate)
        }
    }

    return $null
}

function Get-GitRoots {
    param([string]$GitCsvPath)

    if (-not (Test-Path -LiteralPath $GitCsvPath)) { return @() }

    return @(
        Import-Csv -LiteralPath $GitCsvPath |
        Where-Object { $_.RepositoryPath } |
        ForEach-Object { Normalize-Path $_.RepositoryPath } |
        Sort-Object -Unique
    )
}

function Test-InGit {
    param([string]$Path,[string[]]$GitRoots)

    foreach ($repo in $GitRoots) {
        if ((Test-Inside $Path $repo) -or (Test-Inside $repo $Path)) {
            return $true
        }
    }

    return $false
}

function Get-DormantConsumers {
    param([string]$Root,[string[]]$GitRoots)

    $hits = New-Object 'System.Collections.Generic.List[object]'
    $needle = Normalize-Path $Root

    function Add-Hit {
        param([string]$Kind,[string]$Name,[string]$Detail)
        $hits.Add([pscustomobject]@{
            Kind   = $Kind
            Name   = $Name
            Detail = $Detail
        })
    }

    # Git é consumidor/owner forte.
    foreach ($repo in $GitRoots) {
        if ((Test-Inside $repo $needle) -or (Test-Inside $needle $repo)) {
            Add-Hit 'GIT' $repo 'path intersects Git repository'
        }
    }

    # Processos: CommandLine só é inspecionada localmente e NÃO é exportada.
    try {
        foreach ($p in @(Get-CimInstance Win32_Process -ErrorAction Stop)) {
            $exe = [string]$p.ExecutablePath
            $cmd = [string]$p.CommandLine
            $match = $false

            if ($exe -and $exe.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $match = $true
            }
            if ($cmd -and $cmd.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $match = $true
            }

            if ($match) {
                Add-Hit 'PROCESS' ("{0} PID={1}" -f $p.Name,$p.ProcessId) 'references dormant root'
            }
        }
    } catch {
        Add-Hit 'UNKNOWN_PROCESS_SCAN' 'Win32_Process' $_.Exception.Message
    }

    # Serviços.
    try {
        foreach ($svc in @(Get-CimInstance Win32_Service -ErrorAction Stop)) {
            $pathName = [string]$svc.PathName
            if ($pathName -and $pathName.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                Add-Hit 'SERVICE' $svc.Name 'service PathName references dormant root'
            }
        }
    } catch {
        Add-Hit 'UNKNOWN_SERVICE_SCAN' 'Win32_Service' $_.Exception.Message
    }

    # Tarefas agendadas.
    try {
        if (Get-Command Get-ScheduledTask -ErrorAction SilentlyContinue) {
            foreach ($task in @(Get-ScheduledTask -ErrorAction Stop)) {
                foreach ($a in @($task.Actions)) {
                    $combined = '{0} {1} {2}' -f $a.Execute,$a.Arguments,$a.WorkingDirectory
                    if ($combined.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                        Add-Hit 'SCHEDULED_TASK' $task.TaskName 'task action references dormant root'
                    }
                }
            }
        }
    } catch {
        Add-Hit 'UNKNOWN_TASK_SCAN' 'ScheduledTasks' $_.Exception.Message
    }

    # Variáveis de ambiente.
    foreach ($scope in @('Process','User','Machine')) {
        try {
            $vars = [Environment]::GetEnvironmentVariables($scope)
            foreach ($key in $vars.Keys) {
                $value = [string]$vars[$key]
                if ($value -and $value.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                    Add-Hit 'ENVIRONMENT' ("$scope:$key") 'environment variable references dormant root'
                }
            }
        } catch {}
    }

    # Run / RunOnce.
    foreach ($reg in @(
        'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run',
        'HKCU:\Software\Microsoft\Windows\CurrentVersion\RunOnce',
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run',
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\RunOnce'
    )) {
        try {
            if (-not (Test-Path $reg)) { continue }
            $item = Get-ItemProperty -Path $reg -ErrorAction Stop
            foreach ($prop in $item.PSObject.Properties) {
                if ($prop.Name -match '^PS') { continue }
                $value = [string]$prop.Value
                if ($value -and $value.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                    Add-Hit 'AUTORUN' ("$reg::$($prop.Name)") 'autorun references dormant root'
                }
            }
        } catch {}
    }

    # Atalhos: Desktop + Start Menu.
    try {
        $shell = New-Object -ComObject WScript.Shell
        $shortcutRoots = @(
            [Environment]::GetFolderPath('Desktop'),
            [Environment]::GetFolderPath('StartMenu'),
            [Environment]::GetFolderPath('CommonStartMenu')
        ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

        foreach ($sr in $shortcutRoots) {
            foreach ($lnk in @(Get-ChildItem -LiteralPath $sr -Filter *.lnk -File -Recurse -ErrorAction SilentlyContinue)) {
                try {
                    $sc = $shell.CreateShortcut($lnk.FullName)
                    $combined = '{0} {1} {2}' -f $sc.TargetPath,$sc.Arguments,$sc.WorkingDirectory
                    if ($combined.IndexOf($needle,[System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                        Add-Hit 'SHORTCUT' $lnk.FullName 'shortcut references dormant root'
                    }
                } catch {}
            }
        }
    } catch {
        Add-Hit 'UNKNOWN_SHORTCUT_SCAN' 'WScript.Shell' $_.Exception.Message
    }

    return $hits
}

function New-ReceiptRecord {
    param(
        [string]$Source,
        [string]$AuditHash,
        [Int64]$Bytes,
        [string]$Class,
        [string]$Action,
        [string]$Reason,
        [string]$ProofCopy = '',
        [string]$LiveHash = '',
        [string]$QuarantinePath = ''
    )

    return [pscustomobject]@{
        Time           = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff')
        Mode           = $Mode
        Source         = $Source
        Bytes          = $Bytes
        Class          = $Class
        Action         = $Action
        Reason         = $Reason
        AuditSHA256    = $AuditHash
        LiveSHA256     = $LiveHash
        ProofCopy      = $ProofCopy
        QuarantinePath = $QuarantinePath
    }
}

function Reprove-Row {
    param(
        $Row,
        [string[]]$GitRoots,
        [string]$AllowedRoot
    )

    $source = Normalize-Path ([string]$Row.CandidatePath)
    $auditHash = ([string]$Row.SHA256).ToLowerInvariant()
    $bytes = 0
    [Int64]::TryParse([string]$Row.SizeBytes,[ref]$bytes) | Out-Null

    if (-not (Test-Inside $source $AllowedRoot)) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='OUTSIDE_ALLOWED_ROOT'; LiveHash=''; ProofCopy=''
        }
    }

    if (Test-ProtectedRoot $source) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='HARD_PROTECTED_ROOT'; LiveHash=''; ProofCopy=''
        }
    }

    if (Test-InGit $source $GitRoots) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='GIT_INTERSECTION'; LiveHash=''; ProofCopy=''
        }
    }

    if (Test-SensitivePath $source) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='SENSITIVE_PATH'; LiveHash=''; ProofCopy=''
        }
    }

    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='SOURCE_MISSING'; LiveHash=''; ProofCopy=''
        }
    }

    $item = Get-Item -LiteralPath $source -Force
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='REPARSE_POINT'; LiveHash=''; ProofCopy=''
        }
    }

    $liveHash = Get-SHA256 $source
    if (-not $liveHash) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='SOURCE_HASH_FAILED'; LiveHash=''; ProofCopy=''
        }
    }

    if ($liveHash -ne $auditHash) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='SOURCE_CHANGED_SINCE_AUDIT'; LiveHash=$liveHash; ProofCopy=''
        }
    }

    $proof = Get-LiveProofCopy -ExpectedHash $liveHash -HashMatches ([string]$Row.HashMatches)
    if (-not $proof) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='NO_LIVE_CANONICAL_HOUSE_COPY'; LiveHash=$liveHash; ProofCopy=''
        }
    }

    if (-not (Test-Unlocked $source)) {
        return @{
            Ok=$false; Source=$source; Bytes=$bytes; AuditHash=$auditHash;
            Reason='FILE_LOCKED_OR_IN_USE'; LiveHash=$liveHash; ProofCopy=$proof
        }
    }

    return @{
        Ok=$true; Source=$source; Bytes=$item.Length; AuditHash=$auditHash;
        Reason='LIVE_HASH_PROVED'; LiveHash=$liveHash; ProofCopy=$proof
    }
}


# ------------------------------------------------------------
# AUTO — uma execução, gates internos, para somente em bloqueio real.
# ------------------------------------------------------------
if ($Mode -eq 'Auto') {
    $self = $MyInvocation.MyCommand.Path
    if (-not $self) { throw 'AUTO_SELF_PATH_UNKNOWN' }

    Write-Host ''
    Write-Host '================================================='
    Write-Host ' CENTRALDARK CLEANUP AUTO — PROOF DRIVEN'
    Write-Host '================================================='
    Write-Host 'Fase 1: Preview interno'
    Write-Host ''

    $common = @(
        '-NoProfile',
        '-ExecutionPolicy','Bypass',
        '-File',"`"$self`"",
        '-AuditZip',"`"$AuditZip`"",
        '-ExpectedAuditSHA256',"`"$ExpectedAuditSHA256`"",
        '-UserRoot',"`"$UserRoot`"",
        '-HouseRoot',"`"$HouseRoot`"",
        '-AuditRoot',"`"$AuditRoot`""
    )

    function Invoke-ChildMode {
        param([string]$ChildMode)

        $args = @(
            '-NoProfile',
            '-ExecutionPolicy','Bypass',
            '-File',$self,
            '-Mode',$ChildMode,
            '-AuditZip',$AuditZip,
            '-ExpectedAuditSHA256',$ExpectedAuditSHA256,
            '-UserRoot',$UserRoot,
            '-HouseRoot',$HouseRoot,
            '-AuditRoot',$AuditRoot
        )

        & powershell @args
        return $LASTEXITCODE
    }

    # 1) Preview deve fechar 393/393 sem skip.
    $previewCode = Invoke-ChildMode 'Preview'
    if ($previewCode -ne 0) {
        Write-Host "AUTO_STOP phase=PREVIEW exit=$previewCode"
        exit $previewCode
    }

    $latestPreview = Get-ChildItem -LiteralPath $AuditRoot -Directory -Filter 'CLEANUP-PROOF-*' |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latestPreview) {
        Write-Host 'AUTO_STOP phase=PREVIEW reason=RECEIPT_NOT_FOUND'
        exit 41
    }

    $previewSummary = Join-Path $latestPreview.FullName 'summary.txt'
    if (-not (Test-Path -LiteralPath $previewSummary)) {
        Write-Host 'AUTO_STOP phase=PREVIEW reason=SUMMARY_NOT_FOUND'
        exit 42
    }

    $previewText = Get-Content -LiteralPath $previewSummary -Raw
    $wouldDelete = 0
    $skippedPreview = 0

    if ($previewText -match 'WouldDelete=(\d+)') { $wouldDelete = [int]$Matches[1] }
    if ($previewText -match 'Skipped=(\d+)') { $skippedPreview = [int]$Matches[1] }

    if ($wouldDelete -ne 393 -or $skippedPreview -ne 0) {
        Write-Host "AUTO_STOP phase=PREVIEW reason=DENOMINATOR_MISMATCH WouldDelete=$wouldDelete Skipped=$skippedPreview"
        exit 43
    }

    # 2) DeleteSafe.
    Write-Host ''
    Write-Host 'Fase 2: DeleteSafe'
    $deleteCode = Invoke-ChildMode 'DeleteSafe'
    if ($deleteCode -ne 0) {
        Write-Host "AUTO_STOP phase=DELETE_SAFE exit=$deleteCode"
        exit $deleteCode
    }

    $latestDelete = Get-ChildItem -LiteralPath $AuditRoot -Directory -Filter 'CLEANUP-PROOF-*' |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latestDelete) {
        Write-Host 'AUTO_STOP phase=DELETE_SAFE reason=RECEIPT_NOT_FOUND'
        exit 44
    }

    $deleteSummary = Join-Path $latestDelete.FullName 'summary.txt'
    $deleteText = if (Test-Path -LiteralPath $deleteSummary) {
        Get-Content -LiteralPath $deleteSummary -Raw
    } else { '' }

    $deleted = 0
    $skippedDelete = 0
    if ($deleteText -match 'Deleted=(\d+)') { $deleted = [int]$Matches[1] }
    if ($deleteText -match 'Skipped=(\d+)') { $skippedDelete = [int]$Matches[1] }

    # Se já foi limpo anteriormente, 0 deletados + 393 SOURCE_MISSING no receipt é aceitável.
    $deleteReceipt = Join-Path $latestDelete.FullName 'receipt.csv'
    $sourceMissing = 0
    if (Test-Path -LiteralPath $deleteReceipt) {
        $sourceMissing = @(
            Import-Csv -LiteralPath $deleteReceipt |
            Where-Object { $_.Reason -eq 'SOURCE_MISSING' }
        ).Count
    }

    if (-not (($deleted -eq 393 -and $skippedDelete -eq 0) -or
              ($deleted -eq 0 -and $sourceMissing -eq 393))) {
        Write-Host "AUTO_STOP phase=DELETE_SAFE reason=POST_DELETE_PROOF_FAILED Deleted=$deleted Skipped=$skippedDelete SourceMissing=$sourceMissing"
        exit 45
    }

    # 3) Dormant quarantine.
    Write-Host ''
    Write-Host 'Fase 3: QuarantineDormant (.hermes-web-ui)'
    $qCode = Invoke-ChildMode 'QuarantineDormant'

    if ($qCode -eq 2) {
        Write-Host ''
        Write-Host 'AUTO_STOP phase=QUARANTINE_DORMANT reason=CONSUMER_OR_UNKNOWN'
        Write-Host 'Estado seguro: Downloads já limpos; .hermes-web-ui NÃO foi movida.'
        exit 2
    }

    if ($qCode -ne 0) {
        Write-Host "AUTO_STOP phase=QUARANTINE_DORMANT exit=$qCode"
        exit $qCode
    }

    # 4) Remedição pós-quarentena: consumer scan novamente.
    Write-Host ''
    Write-Host 'Fase 4: Remedição pós-quarentena'

    $latestQ = Get-ChildItem -LiteralPath $AuditRoot -Directory -Filter 'CLEANUP-PROOF-*' |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    $qSummary = if ($latestQ) { Join-Path $latestQ.FullName 'summary.txt' } else { '' }
    $qText = if ($qSummary -and (Test-Path -LiteralPath $qSummary)) {
        Get-Content -LiteralPath $qSummary -Raw
    } else { '' }

    if ($qText -match 'Status=NOT_PRESENT') {
        Write-Host 'AUTO_COMPLETE Downloads=PROVED_CLEAN hermes-web-ui=NOT_PRESENT'
        exit 0
    }

    $batch = ''
    if ($qText -match '(?m)^Batch=(.+)$') {
        $batch = $Matches[1].Trim()
    }

    if ([string]::IsNullOrWhiteSpace($batch) -or -not (Test-Path -LiteralPath $batch)) {
        Write-Host 'AUTO_STOP phase=POST_QUARANTINE reason=QUARANTINE_BATCH_NOT_FOUND'
        exit 46
    }

    # Re-scan consumers against original path. Any evidence blocks final deletion.
    # The original root may now be absent, but references can remain in services/tasks/env.
    $consumerProbe = Get-DormantConsumers -Root $DormantRoot -GitRoots $gitRoots
    $postConsumerCsv = Join-Path $RunRoot 'post-quarantine-consumers.csv'
    $consumerProbe | Export-Csv -LiteralPath $postConsumerCsv -NoTypeInformation -Encoding UTF8

    if (@($consumerProbe).Count -gt 0) {
        Write-Host "AUTO_STOP phase=POST_QUARANTINE reason=CONSUMER_OR_UNKNOWN count=$(@($consumerProbe).Count)"
        Write-Host "Quarantine preserved=$batch"
        exit 47
    }

    # 5) Testar rollback da quarentena antes do delete final.
    $manifest = Join-Path $batch 'manifest.csv'
    if (-not (Test-Path -LiteralPath $manifest)) {
        Write-Host 'AUTO_STOP phase=ROLLBACK_TEST reason=MANIFEST_MISSING'
        exit 48
    }

    $manifestRows = @(Import-Csv -LiteralPath $manifest)
    if ($manifestRows.Count -eq 0) {
        Write-Host 'AUTO_COMPLETE Downloads=PROVED_CLEAN hermes-web-ui=NO_FILES_QUARANTINED'
        exit 0
    }

    $sample = $manifestRows | Select-Object -First 1
    $sampleQ = Normalize-Path ([string]$sample.QuarantinePath)
    $sampleHash = ([string]$sample.LiveSHA256).ToLowerInvariant()

    if (-not (Test-Path -LiteralPath $sampleQ -PathType Leaf)) {
        Write-Host 'AUTO_STOP phase=ROLLBACK_TEST reason=SAMPLE_MISSING'
        exit 49
    }

    $rollbackTestRoot = Join-Path $RunRoot 'rollback-test'
    New-Item -ItemType Directory -Force -Path $rollbackTestRoot | Out-Null
    $sampleRestore = Join-Path $rollbackTestRoot ([System.IO.Path]::GetFileName($sampleQ))

    Copy-Item -LiteralPath $sampleQ -Destination $sampleRestore -Force -ErrorAction Stop
    $restoreHash = Get-SHA256 $sampleRestore

    if (-not $restoreHash -or $restoreHash -ne $sampleHash) {
        Write-Host "AUTO_STOP phase=ROLLBACK_TEST reason=HASH_MISMATCH expected=$sampleHash actual=$restoreHash"
        exit 50
    }

    Remove-Item -LiteralPath $sampleRestore -Force -ErrorAction Stop
    Write-Host 'ROLLBACK_TEST=PASS'

    # 6) Finalização automática: o modo FinalizeQuarantine reprova cada arquivo
    # na quarentena contra sua cópia viva em E:\CentralDark antes de remover.
    Write-Host ''
    Write-Host 'Fase 5: FinalizeQuarantine'
    $finalArgs = @(
        '-NoProfile',
        '-ExecutionPolicy','Bypass',
        '-File',$self,
        '-Mode','FinalizeQuarantine',
        '-AuditZip',$AuditZip,
        '-ExpectedAuditSHA256',$ExpectedAuditSHA256,
        '-UserRoot',$UserRoot,
        '-HouseRoot',$HouseRoot,
        '-AuditRoot',$AuditRoot,
        '-QuarantineBatch',$batch,
        '-FinalDeletePhrase','DELETE_PROVED_QUARANTINE'
    )

    & powershell @finalArgs
    $finalCode = $LASTEXITCODE
    if ($finalCode -ne 0) {
        Write-Host "AUTO_STOP phase=FINALIZE_QUARANTINE exit=$finalCode"
        Write-Host "QuarantinePreserved=$batch"
        exit $finalCode
    }

    # 7) Remedição final: origem antiga deve continuar ausente e batch não deve
    # conter arquivos de payload remanescentes além do manifest.
    $sourceStillExists = Test-Path -LiteralPath $DormantRoot

    $payloadRemaining = @(
        Get-ChildItem -LiteralPath $batch -File -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne 'manifest.csv' }
    ).Count

    if ($sourceStillExists -or $payloadRemaining -gt 0) {
        Write-Host "AUTO_STOP phase=FINAL_REMEASURE sourceExists=$sourceStillExists payloadRemaining=$payloadRemaining"
        exit 51
    }

    Write-Host ''
    Write-Host 'AUTO_FIXED_POINT=PASS'
    Write-Host 'Downloads=PROVED_CLEAN'
    Write-Host '.hermes-web-ui=PROVED_DORMANT_DUPLICATES_REMOVED'
    Write-Host 'ROLLBACK_TEST=PASS'
    Write-Host 'FINAL_REMEASURE=PASS'
    exit 0
}

# ------------------------------------------------------------
# Finalização de quarentena não precisa reabrir o ZIP primeiro.
# ------------------------------------------------------------
if ($Mode -eq 'FinalizeQuarantine') {
    if ($FinalDeletePhrase -ne 'DELETE_PROVED_QUARANTINE') {
        throw 'FINAL_DELETE_PHRASE_REQUIRED'
    }

    if ([string]::IsNullOrWhiteSpace($QuarantineBatch)) {
        throw 'QUARANTINE_BATCH_REQUIRED'
    }

    $batch = Normalize-Path $QuarantineBatch
    $qBase = Normalize-Path (Join-Path $AuditRoot 'QUARANTINE')

    if (-not (Test-Inside $batch $qBase)) {
        throw 'QUARANTINE_BATCH_OUTSIDE_ALLOWED_ROOT'
    }

    $manifest = Join-Path $batch 'manifest.csv'
    if (-not (Test-Path -LiteralPath $manifest)) {
        throw 'QUARANTINE_MANIFEST_MISSING'
    }

    $rows = Import-Csv -LiteralPath $manifest
    $final = New-Object 'System.Collections.Generic.List[object]'
    $deleted = 0
    [Int64]$freed = 0

    foreach ($row in $rows) {
        $q = Normalize-Path ([string]$row.QuarantinePath)
        $expected = ([string]$row.LiveSHA256).ToLowerInvariant()
        $proof = Normalize-Path ([string]$row.ProofCopy)

        if (-not (Test-Inside $q $batch)) {
            $final.Add((New-ReceiptRecord $q $expected 0 'QUARANTINE' 'SKIP' 'QUARANTINE_PATH_ESCAPE'))
            continue
        }

        if (-not (Test-Path -LiteralPath $q -PathType Leaf)) {
            $final.Add((New-ReceiptRecord $q $expected 0 'QUARANTINE' 'SKIP' 'QUARANTINE_FILE_MISSING'))
            continue
        }

        $qHash = Get-SHA256 $q
        $proofHash = if (Test-Path -LiteralPath $proof -PathType Leaf) { Get-SHA256 $proof } else { $null }

        if (-not $qHash -or $qHash -ne $expected -or -not $proofHash -or $proofHash -ne $expected) {
            $final.Add((New-ReceiptRecord $q $expected 0 'QUARANTINE' 'SKIP' 'FINAL_REPROOF_FAILED' $proof $qHash))
            continue
        }

        $len = (Get-Item -LiteralPath $q).Length
        Remove-Item -LiteralPath $q -Force -ErrorAction Stop
        if (Test-Path -LiteralPath $q) { throw "FINAL_DELETE_NOT_CONFIRMED:$q" }

        $deleted++
        $freed += [Int64]$len
        $final.Add((New-ReceiptRecord $q $expected $len 'QUARANTINE' 'DELETED_FINAL' 'HOUSE_COPY_REPROVED' $proof $qHash))
    }

    $final | Export-Csv -LiteralPath $ReceiptCsv -NoTypeInformation -Encoding UTF8
    @"
CENTRALDARK FINALIZE QUARANTINE
Deleted=$deleted
FreedBytes=$freed
FreedMiB=$([math]::Round($freed/1MB,2))
Receipt=$ReceiptCsv
"@ | Set-Content -LiteralPath $SummaryTxt -Encoding UTF8

    Write-Host "FINALIZE_COMPLETE Deleted=$deleted FreedMiB=$([math]::Round($freed/1MB,2))"
    Write-Host "Receipt=$ReceiptCsv"
    exit 0
}

# ------------------------------------------------------------
# Provar identidade do audit.
# ------------------------------------------------------------
if (-not (Test-Path -LiteralPath $AuditZip -PathType Leaf)) {
    throw "AUDIT_ZIP_NOT_FOUND:$AuditZip"
}

$actualAuditHash = Get-SHA256 $AuditZip
if (-not $actualAuditHash -or $actualAuditHash -ne $ExpectedAuditSHA256.ToLowerInvariant()) {
    throw "AUDIT_ZIP_SHA256_MISMATCH expected=$ExpectedAuditSHA256 actual=$actualAuditHash"
}

New-Item -ItemType Directory -Force -Path $ExtractRoot | Out-Null
Expand-Archive -LiteralPath $AuditZip -DestinationPath $ExtractRoot -Force

$CompareCsv = Join-Path $ExtractRoot '04-COMPARACAO-C-E.csv'
$GitCsv = Join-Path $ExtractRoot '05-GIT-REPOS.csv'

if (-not (Test-Path -LiteralPath $CompareCsv)) { throw 'COMPARISON_REPORT_MISSING' }

$comparison = @(Import-Csv -LiteralPath $CompareCsv)
$identical = @($comparison | Where-Object { $_.Verdict -eq 'IDENTICAL_ALREADY_IN_HOUSE' })
$gitRoots = @(Get-GitRoots $GitCsv)

$receipts = New-Object 'System.Collections.Generic.List[object]'

# Residual completo: explica todos os 6093.
$residual = foreach ($row in $identical) {
    $p = Normalize-Path ([string]$row.CandidatePath)

    $class =
        if (Test-Inside $p $SafeDeleteRoot) { 'DELETE_SAFE' }
        elseif (Test-Inside $p $DormantRoot) { 'QUARANTINE_DORMANT_CANDIDATE' }
        elseif (Test-Inside $p (Join-Path $UserRoot 'OneDrive')) { 'PROTECTED_ONEDRIVE' }
        elseif (Test-Inside $p (Join-Path $UserRoot 'Documents')) { 'PROTECTED_DOCUMENTS_GIT_HISTORY' }
        elseif (Test-Inside $p (Join-Path $UserRoot 'aiox-core')) { 'PROTECTED_DIRTY_GIT' }
        elseif (Test-Inside $p (Join-Path $UserRoot '.hermes')) { 'PROTECTED_HERMES_STATE' }
        elseif (Test-Inside $p (Join-Path $UserRoot '.grok')) { 'PROTECTED_GROK_STATE' }
        else { 'PROTECTED_UNCLASSIFIED' }

    [pscustomobject]@{
        CandidatePath = $p
        SizeBytes     = $row.SizeBytes
        SHA256        = $row.SHA256
        Class         = $class
    }
}
$residual | Export-Csv -LiteralPath $ResidualCsv -NoTypeInformation -Encoding UTF8

# ------------------------------------------------------------
# PREVIEW / DELETE SAFE
# ------------------------------------------------------------
$safeRows = @($identical | Where-Object { Test-Inside ([string]$_.CandidatePath) $SafeDeleteRoot })

if ($Mode -in @('Preview','DeleteSafe')) {
    [Int64]$wouldBytes = 0
    [Int64]$deletedBytes = 0
    $wouldCount = 0
    $deletedCount = 0
    $skippedCount = 0

    foreach ($row in $safeRows) {
        $proof = Reprove-Row -Row $row -GitRoots $gitRoots -AllowedRoot $SafeDeleteRoot

        if (-not $proof.Ok) {
            $skippedCount++
            $receipts.Add((New-ReceiptRecord `
                $proof.Source $proof.AuditHash $proof.Bytes 'DELETE_SAFE' 'SKIP' $proof.Reason `
                $proof.ProofCopy $proof.LiveHash))
            continue
        }

        if ($Mode -eq 'Preview') {
            $wouldCount++
            $wouldBytes += [Int64]$proof.Bytes
            $receipts.Add((New-ReceiptRecord `
                $proof.Source $proof.AuditHash $proof.Bytes 'DELETE_SAFE' 'WOULD_DELETE' 'LIVE_REPROOF_PASS' `
                $proof.ProofCopy $proof.LiveHash))
            continue
        }

        Remove-Item -LiteralPath $proof.Source -Force -ErrorAction Stop
        if (Test-Path -LiteralPath $proof.Source) {
            throw "DELETE_NOT_CONFIRMED:$($proof.Source)"
        }

        $deletedCount++
        $deletedBytes += [Int64]$proof.Bytes
        $receipts.Add((New-ReceiptRecord `
            $proof.Source $proof.AuditHash $proof.Bytes 'DELETE_SAFE' 'DELETED' 'LIVE_REPROOF_PASS' `
            $proof.ProofCopy $proof.LiveHash))
    }

    # Apenas diretórios vazios em Downloads.
    if ($Mode -eq 'DeleteSafe' -and (Test-Path -LiteralPath $SafeDeleteRoot)) {
        Get-ChildItem -LiteralPath $SafeDeleteRoot -Directory -Force -Recurse -ErrorAction SilentlyContinue |
            Sort-Object { $_.FullName.Length } -Descending |
            ForEach-Object {
                try {
                    $children = @(Get-ChildItem -LiteralPath $_.FullName -Force -ErrorAction Stop)
                    if ($children.Count -eq 0) {
                        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction Stop
                    }
                } catch {}
            }
    }

    $receipts | Export-Csv -LiteralPath $ReceiptCsv -NoTypeInformation -Encoding UTF8

    $summary = @"
CENTRALDARK CLEANUP — $Mode
================================
AuditZipSHA256=$actualAuditHash
AuditIdentical=6093
SafeScopeExpected=393
SafeRowsObserved=$($safeRows.Count)

WouldDelete=$wouldCount
WouldFreeBytes=$wouldBytes
WouldFreeMiB=$([math]::Round($wouldBytes/1MB,2))

Deleted=$deletedCount
DeletedBytes=$deletedBytes
DeletedMiB=$([math]::Round($deletedBytes/1MB,2))

Skipped=$skippedCount

Protected / next:
.hermes-web-ui=3067 files -> quarantine only after live dormancy proof
Documents=2581 -> protected
OneDrive=14 -> protected
aiox-core=33 -> protected dirty Git
.hermes=2 -> protected tool state
.grok=2 -> protected tool state
Videos=1 -> protected/not material

Receipt=$ReceiptCsv
Residual=$ResidualCsv
"@

    $summary | Set-Content -LiteralPath $SummaryTxt -Encoding UTF8
    Write-Host $summary
    exit 0
}

# ------------------------------------------------------------
# QUARANTINE DORMANT .hermes-web-ui
# ------------------------------------------------------------
if ($Mode -eq 'QuarantineDormant') {
    if (-not (Test-Path -LiteralPath $DormantRoot -PathType Container)) {
        @"
CENTRALDARK QUARANTINE DORMANT
Root=$DormantRoot
Status=NOT_PRESENT
Nothing changed.
"@ | Set-Content -LiteralPath $SummaryTxt -Encoding UTF8
        Write-Host "DORMANT_ROOT_NOT_PRESENT=$DormantRoot"
        exit 0
    }

    $consumers = @(Get-DormantConsumers -Root $DormantRoot -GitRoots $gitRoots)
    $consumers | Export-Csv -LiteralPath $ConsumerCsv -NoTypeInformation -Encoding UTF8

    # UNKNOWN scan também bloqueia.
    if ($consumers.Count -gt 0) {
        @"
CENTRALDARK QUARANTINE DORMANT
Root=$DormantRoot
Status=BLOCKED_CONSUMERS_OR_UNKNOWN
ConsumerCount=$($consumers.Count)
Consumers=$ConsumerCsv
Nothing moved.
"@ | Set-Content -LiteralPath $SummaryTxt -Encoding UTF8

        Write-Host "QUARANTINE_BLOCKED ConsumerCount=$($consumers.Count)"
        Write-Host "Consumers=$ConsumerCsv"
        exit 2
    }

    $rows = @($identical | Where-Object { Test-Inside ([string]$_.CandidatePath) $DormantRoot })
    $batch = Join-Path (Join-Path $AuditRoot 'QUARANTINE') "Q-$Stamp-hermes-web-ui"
    New-Item -ItemType Directory -Force -Path $batch | Out-Null

    $manifest = New-Object 'System.Collections.Generic.List[object]'
    $moved = 0
    [Int64]$movedBytes = 0
    $skipped = 0

    foreach ($row in $rows) {
        $proof = Reprove-Row -Row $row -GitRoots @() -AllowedRoot $DormantRoot

        if (-not $proof.Ok) {
            $skipped++
            $receipts.Add((New-ReceiptRecord `
                $proof.Source $proof.AuditHash $proof.Bytes 'QUARANTINE_DORMANT' 'SKIP' $proof.Reason `
                $proof.ProofCopy $proof.LiveHash))
            continue
        }

        $relative = $proof.Source.Substring((Normalize-Path $DormantRoot).Length).TrimStart('\')
        $qPath = Join-Path $batch $relative
        $qParent = Split-Path -Parent $qPath
        if ($qParent) { New-Item -ItemType Directory -Force -Path $qParent | Out-Null }

        Move-Item -LiteralPath $proof.Source -Destination $qPath -Force -ErrorAction Stop

        if (Test-Path -LiteralPath $proof.Source) {
            throw "QUARANTINE_MOVE_SOURCE_STILL_EXISTS:$($proof.Source)"
        }
        if (-not (Test-Path -LiteralPath $qPath -PathType Leaf)) {
            throw "QUARANTINE_MOVE_DEST_MISSING:$qPath"
        }

        $qHash = Get-SHA256 $qPath
        if ($qHash -ne $proof.LiveHash) {
            throw "QUARANTINE_HASH_MISMATCH:$qPath"
        }

        $moved++
        $movedBytes += [Int64]$proof.Bytes

        $rec = New-ReceiptRecord `
            $proof.Source $proof.AuditHash $proof.Bytes 'QUARANTINE_DORMANT' 'QUARANTINED' 'DORMANCY_AND_LIVE_REPROOF_PASS' `
            $proof.ProofCopy $proof.LiveHash $qPath

        $receipts.Add($rec)
        $manifest.Add($rec)
    }

    $receipts | Export-Csv -LiteralPath $ReceiptCsv -NoTypeInformation -Encoding UTF8
    $manifest | Export-Csv -LiteralPath (Join-Path $batch 'manifest.csv') -NoTypeInformation -Encoding UTF8

    @"
CENTRALDARK QUARANTINE DORMANT
================================
Root=$DormantRoot
Consumers=0
AuditDuplicateRows=$($rows.Count)
Quarantined=$moved
QuarantinedBytes=$movedBytes
QuarantinedMiB=$([math]::Round($movedBytes/1MB,2))
Skipped=$skipped

Batch=$batch
Manifest=$(Join-Path $batch 'manifest.csv')

NEXT:
1. Teste Hermes/Claude/CentralDark normalmente.
2. Remedir runtime.
3. Só então FinalizeQuarantine com frase explícita.
"@ | Set-Content -LiteralPath $SummaryTxt -Encoding UTF8

    Write-Host "QUARANTINE_COMPLETE Moved=$moved MiB=$([math]::Round($movedBytes/1MB,2))"
    Write-Host "Batch=$batch"
    Write-Host "Receipt=$ReceiptCsv"
    exit 0
}

throw "MODE_NOT_HANDLED:$Mode"
