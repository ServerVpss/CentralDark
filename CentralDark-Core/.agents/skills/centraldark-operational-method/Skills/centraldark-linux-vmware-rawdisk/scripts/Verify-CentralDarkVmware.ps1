#Requires -Version 5.1
<#
.SYNOPSIS
  CentralDark VMware/Kingston: inventario e contraprova SOMENTE LEITURA.
.DESCRIPTION
  Confere VMX, partitionedDevice, extents, SSD fisico, NTFS host, execucao da VM e
  SSH opcional. Nao formata, nao reinicia, nao ajusta cache, nao escreve em disco.
.EXAMPLE
  .\Verify-CentralDarkVmware.ps1 -VmxPath 'D:\CENTRALDARK-OSh\CENTRALDARK-OSh.vmx' -ExpectedDiskModel 'KINGSTON' -NtfsLabel 'VMWARE' -TestSsh -SshConfigPath 'F:\CentralDark\.ssh\config_openkylin'
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$VmxPath,
    [string]$ExpectedDiskModel = 'KINGSTON',
    [string]$NtfsLabel = 'VMWARE',
    [switch]$TestSsh,
    [string]$SshConfigPath,
    [string]$SshHost = 'openkylin-root'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Emit([string]$Key, [object]$Value) { Write-Output ('{0}={1}' -f $Key, $Value) }
Emit 'OWNER' 'centraldark-linux-vmware-rawdisk'
Emit 'MODE' 'READ_ONLY_DIAGNOSTICS'

if (-not (Test-Path -LiteralPath $VmxPath -PathType Leaf)) { Emit 'VMX' 'MISSING'; exit 2 }
$vmxFull = [IO.Path]::GetFullPath($VmxPath)
$vmx = [IO.File]::ReadAllText($vmxFull)
Emit 'VMX' $vmxFull
if ($vmx -notmatch '(?m)^scsi0:0\.fileName\s*=\s*"([^"]+)"') { Emit 'DESCRIPTOR' 'NOT_REFERENCED'; exit 3 }
$descriptorName = $Matches[1]
if ([IO.Path]::IsPathRooted($descriptorName)) { $descriptorPath = $descriptorName }
else { $descriptorPath = Join-Path (Split-Path -Parent $vmxFull) $descriptorName }
if (-not (Test-Path -LiteralPath $descriptorPath -PathType Leaf)) { Emit 'DESCRIPTOR' 'MISSING'; exit 4 }
Emit 'DESCRIPTOR' $descriptorPath
$descriptor = [IO.File]::ReadAllText($descriptorPath)
$partitioned = $descriptor.Contains('createType="partitionedDevice"')
Emit 'DESCRIPTOR_PARTITIONED' $(if($partitioned){'PASS'}else{'FAIL'})
if (-not $partitioned) { exit 5 }

$rawExtents = New-Object System.Collections.ArrayList
foreach ($line in ($descriptor -split "[\r\n]+")) {
    if ($line -notmatch '^(RW|RDONLY)\s+(\d+)\s+FLAT\s+"([^"]+)"\s+(\d+)') { continue }
    $mode = $Matches[1]
    [long]$sectors = [long]$Matches[2]
    $devicePath = $Matches[3]
    [long]$start = [long]$Matches[4]
    if ($devicePath -notmatch 'PhysicalDrive(\d+)') { continue }
    $diskNumber = [int]$Matches[1]
    $null = $rawExtents.Add([pscustomobject]@{Mode=$mode;Disk=$diskNumber;StartSector=$start;SectorCount=$sectors})
}
$rwExtents = @($rawExtents | Where-Object { $_.Mode -eq 'RW' })
Emit 'RAW_EXTENTS_TOTAL' $rawExtents.Count
Emit 'RAW_EXTENTS_RW' $rwExtents.Count
$disks = @(Get-Disk | Where-Object { $_.FriendlyName -match [regex]::Escape($ExpectedDiskModel) })
if ($disks.Count -ne 1) { Emit 'DISK_IDENTITY' ('UNKNOWN_MATCHES_' + $disks.Count); exit 6 }
$disk = $disks[0]
Emit 'DISK' ('PhysicalDrive{0} {1} {2}' -f $disk.Number, $disk.FriendlyName, $disk.PartitionStyle)
$matchingExtents = @($rawExtents | Where-Object { $_.Disk -eq $disk.Number })
Emit 'EXTENTS_MATCH_DISK' $(if($matchingExtents.Count -eq $rawExtents.Count -and $rwExtents.Count -eq 4){'PASS'}else{'FAIL'})
$volume = @(Get-Volume | Where-Object { $_.FileSystemLabel -eq $NtfsLabel -and $_.FileSystem -eq 'NTFS' })
if ($volume.Count -ne 1) { Emit 'HOST_NTFS' ('UNKNOWN_MATCHES_' + $volume.Count); exit 7 }
$vol = $volume[0]
Emit 'HOST_NTFS' ('{0}: {1} {2} {3}' -f $vol.DriveLetter, $vol.FileSystemLabel, $vol.FileSystem, $vol.HealthStatus)
$part = @(Get-Partition -DiskNumber $disk.Number | Where-Object { $_.DriveLetter -eq $vol.DriveLetter })
if ($part.Count -ne 1) { Emit 'NTFS_ON_EXPECTED_DISK' 'UNKNOWN'; exit 8 }
[long]$ntfsStart = [long]($part[0].Offset / 512)
[long]$ntfsEnd = $ntfsStart + [long]($part[0].Size / 512)
$collision = @($rawExtents | Where-Object {
    $_.Disk -eq $disk.Number -and $_.StartSector -lt $ntfsEnd -and
    ($_.StartSector + $_.SectorCount) -gt $ntfsStart
})
Emit 'HOST_NTFS_OUTSIDE_GUEST_EXTENTS' $(if($collision.Count -eq 0){'PASS'}else{'FAIL'})
$vmxProcesses = @(Get-CimInstance Win32_Process -Filter "name='vmware-vmx.exe'" | Where-Object {
    $_.CommandLine -and $_.CommandLine.IndexOf($vmxFull,[StringComparison]::OrdinalIgnoreCase) -ge 0
})
Emit 'VMWARE_PROCESS_FOR_VMX' $(if($vmxProcesses.Count -gt 0){'PASS'}else{'NOT_RUNNING'})
$vmrun = 'C:\Program Files\VMware\VMware Workstation\vmrun.exe'
if (Test-Path -LiteralPath $vmrun) {
    $running = & $vmrun -T ws list 2>&1
    $listed = @($running | Where-Object { $_.Trim() -eq $vmxFull })
    Emit 'VMRUN_ACTIVE_VMX' $(if($listed.Count -gt 0){'PASS'}else{'NOT_LISTED'})
} else { Emit 'VMRUN_ACTIVE_VMX' 'UNKNOWN_TOOL_MISSING' }
if ($TestSsh) {
    if ([string]::IsNullOrWhiteSpace($SshConfigPath) -or -not (Test-Path -LiteralPath $SshConfigPath)) {
        Emit 'SSH' 'UNKNOWN_CONFIG_MISSING'
    } else {
        $sshOutput = @(& ssh -T -o BatchMode=yes -o ConnectTimeout=6 -F $SshConfigPath $SshHost 'echo SSH_OK; hostname; id; lsblk -o NAME,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINTS /dev/sda; findmnt -no SOURCE,FSTYPE /; swapon --show' 2>&1)
        $sshText = $sshOutput -join ' '
        $sshPass = $LASTEXITCODE -eq 0 -and $sshText.Contains('SSH_OK') -and $sshText.Contains('uid=0(root)')
        Emit 'SSH' $(if($sshPass){'PASS_ROOT'}else{'FAIL_OR_UNREACHABLE'})
        if ($sshPass) { $sshOutput | ForEach-Object { Write-Output ('GUEST: ' + $_) } }
    }
} else { Emit 'SSH' 'NOT_REQUESTED' }
Emit 'CHECK_RESULT' 'READBACK_COMPLETE'
