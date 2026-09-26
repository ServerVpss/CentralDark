param(
    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    [string]$WindowTitle = "ChatGPT",

    [ValidateRange(0.0, 1.0)]
    [double]$TabXRatio = 0.62,

    [ValidateRange(0.0, 1.0)]
    [double]$TabYRatio = 0.055,

    [ValidateRange(0.0, 1.0)]
    [double]$PromptXRatio = 0.60,

    [ValidateRange(0.0, 1.0)]
    [double]$PromptYRatio = 0.625
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;

public static class SolTerminalInput {
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
}
'@

$targets = @(Get-Process | Where-Object {
    $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like "*$WindowTitle*"
})

if ($targets.Count -ne 1) {
    throw "Expected exactly one window matching '$WindowTitle'; found $($targets.Count)."
}

$target = $targets[0]
$bounds = New-Object SolTerminalInput+RECT
if (-not [SolTerminalInput]::GetWindowRect($target.MainWindowHandle, [ref]$bounds)) {
    throw "Could not read the target window bounds."
}

$width = $bounds.Right - $bounds.Left
$height = $bounds.Bottom - $bounds.Top
$tabX = $bounds.Left + [int]($width * $TabXRatio)
$tabY = $bounds.Top + [int]($height * $TabYRatio)
$promptX = $bounds.Left + [int]($width * $PromptXRatio)
$promptY = $bounds.Top + [int]($height * $PromptYRatio)
$previousClipboard = [System.Windows.Forms.Clipboard]::GetDataObject()

try {
    [SolTerminalInput]::SetForegroundWindow($target.MainWindowHandle) | Out-Null
    Start-Sleep -Milliseconds 500

    [SolTerminalInput]::SetCursorPos($tabX, $tabY) | Out-Null
    [SolTerminalInput]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
    [SolTerminalInput]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 500

    [SolTerminalInput]::SetCursorPos($promptX, $promptY) | Out-Null
    [SolTerminalInput]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
    [SolTerminalInput]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 400

    [System.Windows.Forms.Clipboard]::SetText($Prompt)
    [System.Windows.Forms.SendKeys]::SendWait("^v")
    Start-Sleep -Milliseconds 700
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Start-Sleep -Milliseconds 700
}
finally {
    if ($null -ne $previousClipboard) {
        [System.Windows.Forms.Clipboard]::SetDataObject($previousClipboard, $true)
    }
}

[pscustomobject]@{
    WindowTitle = $target.MainWindowTitle
    ProcessId = $target.Id
    TabPoint = "$tabX,$tabY"
    PromptPoint = "$promptX,$promptY"
    SentCharacters = $Prompt.Length
    VerificationRequired = $true
} | ConvertTo-Json -Compress
