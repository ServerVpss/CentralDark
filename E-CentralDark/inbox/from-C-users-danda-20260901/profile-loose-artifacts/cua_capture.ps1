$out = "C:\Users\danda\cua_capture.txt"
$err = "C:\Users\danda\cua_capture_err.txt"
try {
    $p = Start-Process -FilePath "C:\Users\danda\AppData\Local\hermes\bin\cua-driver.exe" `
        -ArgumentList "capture","--help" -Wait -PassThru `
        -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden
    Add-Content -Path $out -Value "`nEXITCODE=$($p.ExitCode)"
} catch {
    "FAILED: $_" | Out-File -FilePath $err -Append
}
