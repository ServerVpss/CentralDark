$out = "C:\Users\danda\cua_list.txt"
$err = "C:\Users\danda\cua_err.txt"
try {
    $p = Start-Process -FilePath "C:\Users\danda\AppData\Local\hermes\bin\cua-driver.exe" `
        -ArgumentList "list_windows" -Wait -PassThru `
        -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden
    Add-Content -Path $out -Value "`nEXITCODE=$($p.ExitCode)"
} catch {
    "FAILED: $_" | Out-File -FilePath $err -Append
}
