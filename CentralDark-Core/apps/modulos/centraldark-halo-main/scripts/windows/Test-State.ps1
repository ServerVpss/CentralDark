# #OBSERVACOES# @owner: centraldark-halo-main @doc_ref: docs/RELEASE.md
# @last_updated: 2026-11-19T10:28:17Z
# Receita do mesmo binario: all, -Monitor legado, -DisplayId auto Windows, janela/foreground.
# Cua opcional; sem overlay Hermes. Conserva JSON legado sem alvo selecionado.
param(
    [ValidateSet("idle", "working", "attention", "completed")]
    [string]$State,
    [ValidateRange(1, 4)][int]$Monitor,
    [ValidateRange(1, 99)][int]$DisplayId,
    [switch]$ListDisplays,
    [switch]$ForegroundWindow,
    [string]$WindowTitle,
    [uint32]$WindowPid,
    [uint64]$WindowHwnd,
    [switch]$BlinkCursor
)

$ErrorActionPreference = "Stop"
$CanonicalDir = Join-Path $env:USERPROFILE ".centraldark-halo"
$LegacyDir = Join-Path $env:USERPROFILE ".codex-halo"
$HaloDir = if ((Test-Path $CanonicalDir) -or -not (Test-Path $LegacyDir)) { $CanonicalDir } else { $LegacyDir }
$StateFile = Join-Path $HaloDir "state.json"

# Descoberta portatil: usar IDs DISPLAYn reais do Windows, sem topologia fixa.
if ($ListDisplays) {
    if ($State -or $Monitor -or $DisplayId -or $ForegroundWindow -or $WindowTitle -or
        $WindowPid -or $WindowHwnd -or $BlinkCursor) {
        throw "HALO_DISCOVERY_READONLY: nao combine -ListDisplays com emissao de estado"
    }
    Add-Type -AssemblyName System.Windows.Forms
    @([System.Windows.Forms.Screen]::AllScreens) | ForEach-Object {
        $matchId = [regex]::Match($_.DeviceName, 'DISPLAY([0-9]+)$')
        [pscustomobject]@{ DisplayId = if ($matchId.Success) { [int]$matchId.Groups[1].Value } else { 0 };
            Device = $_.DeviceName; Primary = $_.Primary; X = $_.Bounds.X; Y = $_.Bounds.Y;
            Width = $_.Bounds.Width; Height = $_.Bounds.Height }
    } | Sort-Object DisplayId | Format-Table -AutoSize
    return
}
if (-not $State) { throw "HALO_STATE_REQUIRED" }
if (($Monitor -and ($DisplayId -or $ForegroundWindow -or $WindowTitle -or $WindowPid -or $WindowHwnd)) -or
    ($DisplayId -and ($ForegroundWindow -or $WindowTitle -or $WindowPid -or $WindowHwnd))) {
    throw "HALO_AMBIGUOUS_TARGET: escolha monitor, DISPLAY ou janela"
}
if ($ForegroundWindow -and ($WindowTitle -or $WindowPid -or $WindowHwnd)) {
    throw "HALO_AMBIGUOUS_WINDOW: escolha foreground, titulo OU pid+hwnd"
}
if ($WindowTitle -and ($WindowPid -or $WindowHwnd)) {
    throw "HALO_AMBIGUOUS_WINDOW: escolha titulo OU pid+hwnd"
}
if ([bool]$WindowPid -xor [bool]$WindowHwnd) {
    throw "HALO_WINDOW_IDENTITY_INCOMPLETE: informe PID e HWND juntos"
}
if ($BlinkCursor -and $State -ne "working") {
    throw "HALO_CURSOR_REQUIRES_WORKING"
}

$Target = @{ kind = "all" }
if ($DisplayId) {
    Add-Type -AssemblyName System.Windows.Forms
    $screens = @([System.Windows.Forms.Screen]::AllScreens)
    $matching = @($screens | Where-Object {
        $_.DeviceName -match 'DISPLAY([0-9]+)$' -and [int]$Matches[1] -eq $DisplayId
    })
    if ($matching.Count -ne 1) {
        throw "HALO_DISPLAY_NOT_FOUND_OR_AMBIGUOUS: DISPLAY$DisplayId"
    }
    $bounds = $matching[0].Bounds
    $Target = @{ kind = "monitor"; x = [int]$bounds.X; y = [int]$bounds.Y;
                 width = [int]$bounds.Width; height = [int]$bounds.Height }
} elseif ($Monitor) {
    # Formula existente na Skill Mae preservada para os quatro monitores da Casa.
    # Nunca adivinhar apenas pelo sufixo DISPLAY; falha se a topologia mudar.
    Add-Type -AssemblyName System.Windows.Forms
    $screens = @([System.Windows.Forms.Screen]::AllScreens)
    $portrait = @($screens | Where-Object { $_.Bounds.Height -gt $_.Bounds.Width } | Sort-Object { $_.Bounds.X })
    $landscape = @($screens | Where-Object { $_.Bounds.Width -gt $_.Bounds.Height } | Sort-Object { $_.Bounds.Y })
    if ($screens.Count -ne 4 -or $portrait.Count -ne 2 -or $landscape.Count -ne 2 -or
        $portrait[0].Bounds.X -ge $landscape[0].Bounds.X -or
        $portrait[1].Bounds.X -le $landscape[0].Bounds.X -or
        $landscape[0].Bounds.X -ne $landscape[1].Bounds.X -or
        $landscape[0].Bounds.Y -eq $landscape[1].Bounds.Y) {
        throw "HALO_TOPOLOGY_CHANGED: reidentifique os monitores antes de acender"
    }
    $mapping = @{ 1 = $portrait[1]; 2 = $landscape[0]; 3 = $portrait[0]; 4 = $landscape[1] }
    $bounds = $mapping[$Monitor].Bounds
    $Target = @{ kind = "monitor"; x = [int]$bounds.X; y = [int]$bounds.Y;
                 width = [int]$bounds.Width; height = [int]$bounds.Height }
} elseif ($WindowTitle -or $WindowPid -or $ForegroundWindow) {
    if ($WindowTitle -or $ForegroundWindow) {
        # !RASTRO: janela real ou foreground, sem alterar o foco do aplicativo.
        # @owner: centraldark-halo-main @doc_ref: docs/RELEASE.md
        # O identificador Win32 acompanha o alvo; nao altera foco nem cursor.
        if (-not ('CentralDarkHaloWindowLookup' -as [type])) {
            Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public static class CentralDarkHaloWindowLookup {
    public delegate bool EnumProc(IntPtr hwnd, IntPtr data);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc callback, IntPtr data);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int max);
    public static string ResolveForeground() {
        var hwnd = GetForegroundWindow();
        if (hwnd == IntPtr.Zero || !IsWindowVisible(hwnd) || IsIconic(hwnd))
            throw new InvalidOperationException("HALO_FOREGROUND_NOT_AVAILABLE");
        uint pid; GetWindowThreadProcessId(hwnd, out pid);
        if (pid == 0) throw new InvalidOperationException("HALO_FOREGROUND_PID_MISSING");
        return pid.ToString() + "|" + hwnd.ToInt64().ToString();
    }
    public static string Resolve(string name) {
        var matches = new List<string>();
        EnumWindows(delegate(IntPtr hwnd, IntPtr ignored) {
            if (!IsWindowVisible(hwnd) || IsIconic(hwnd)) return true;
            var title = new StringBuilder(512);
            GetWindowText(hwnd, title, title.Capacity);
            if (title.ToString().Equals("CentralDark Halo", StringComparison.OrdinalIgnoreCase)) return true;
            if (title.ToString().IndexOf(name, StringComparison.OrdinalIgnoreCase) < 0) return true;
            uint pid; GetWindowThreadProcessId(hwnd, out pid);
            if (pid != 0) matches.Add(pid.ToString() + "|" + hwnd.ToInt64().ToString());
            return true;
        }, IntPtr.Zero);
        if (matches.Count != 1) throw new InvalidOperationException("HALO_WINDOW_NOT_UNIQUE_OR_MISSING: count=" + matches.Count);
        return matches[0];
    }
}
'@
        }
        $identity = if ($ForegroundWindow) {
            [CentralDarkHaloWindowLookup]::ResolveForeground().Split('|')
        } else {
            [CentralDarkHaloWindowLookup]::Resolve($WindowTitle).Split('|')
        }
        $WindowPid = [uint32]$identity[0]
        $WindowHwnd = [uint64]$identity[1]
    }
    $Target = @{ kind = "window"; pid = [uint32]$WindowPid; hwnd = [uint64]$WindowHwnd }
}

# !RASTRO: completed/attention conserva o alvo selecionado pelo working anterior.
# Nao reacender todas as telas ao concluir uma tarefa localizada.
if ($State -in @("completed", "attention") -and $Target.kind -eq "all" -and (Test-Path $StateFile)) {
    $previousEvent = Get-Content -Raw $StateFile | ConvertFrom-Json
    if ($previousEvent.target -and $previousEvent.target.kind -in @("monitor", "window")) {
        $Target = $previousEvent.target
    }
}

New-Item -ItemType Directory -Force -Path $HaloDir | Out-Null
$Timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
if (Test-Path $StateFile) {
    try {
        $Previous = [long](Get-Content -Raw $StateFile | ConvertFrom-Json).updatedAt
        if ($Previous -ge $Timestamp) { $Timestamp = $Previous + 1 }
    } catch {}
}
$Data = @{ state = $State; updatedAt = $Timestamp; event = "ManualTest" }
if ($Target.kind -ne "all") { $Data.target = $Target }
if ($BlinkCursor) { $Data.blinkCursor = $true }
$Temp = Join-Path $HaloDir ("state.json.{0}.tmp" -f [Guid]::NewGuid().ToString("N"))
try {
    [IO.File]::WriteAllText($Temp, ($Data | ConvertTo-Json -Compress -Depth 6),
        (New-Object Text.UTF8Encoding($false)))
    Move-Item -Force $Temp $StateFile
} finally {
    Remove-Item -Force -ErrorAction SilentlyContinue $Temp
}
Write-Host "[OK] $State scope=$($Target.kind) blink=$([bool]$BlinkCursor) -> $StateFile"
