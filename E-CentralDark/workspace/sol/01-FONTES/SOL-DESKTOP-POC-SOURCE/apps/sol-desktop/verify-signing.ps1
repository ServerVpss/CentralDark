# verify-signing.ps1
# Verifica configuração de code signing para Tauri

param(
    [string]$Thumbprint = "",
    [string]$PfxPath = "",
    [string]$PfxPassword = ""
)

Write-Host "=== VERIFICAÇÃO CODE SIGNING TAURI ===" -ForegroundColor Cyan

# 1. Verificar signtool
$signtool = Get-Command signtool.exe -ErrorAction SilentlyContinue
if (-not $signtool) {
    Write-Host "❌ signtool.exe não encontrado no PATH" -ForegroundColor Red
    Write-Host "   Instale Windows SDK ou adicione ao PATH" -ForegroundColor Yellow
} else {
    Write-Host "✅ signtool.exe: $($signtool.Source)" -ForegroundColor Green
}

# 2. Verificar certificado no store CurrentUser
Write-Host "`n=== CERTIFICADOS NO STORE CURRENTUSER\MY ===" -ForegroundColor Cyan
$certs = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue
if ($certs.Count -eq 0) {
    Write-Host "❌ Nenhum certificado de code signing no CurrentUser\My" -ForegroundColor Red
} else {
    $certs | Select-Object Thumbprint, Subject, NotAfter, HasPrivateKey | Format-Table -AutoSize
}

# 3. Verificar certificado no store LocalMachine
Write-Host "`n=== CERTIFICADOS NO STORE LOCALMACHINE\MY ===" -ForegroundColor Cyan
$certsLM = Get-ChildItem Cert:\LocalMachine\My -CodeSigningCert -ErrorAction SilentlyContinue
if ($certsLM.Count -eq 0) {
    Write-Host "⚠️ Nenhum certificado no LocalMachine\My (precisa admin)" -ForegroundColor Yellow
} else {
    $certsLM | Select-Object Thumbprint, Subject, NotAfter, HasPrivateKey | Format-Table -AutoSize
}

# 4. Se thumbprint fornecido, validar
if ($Thumbprint) {
    Write-Host "`n=== VALIDAÇÃO THUMBPRINT: $Thumbprint ===" -ForegroundColor Cyan
    $cleanThumbprint = $Thumbprint.Replace(" ", "").ToUpper()
    $found = Get-ChildItem Cert:\CurrentUser\My, Cert:\LocalMachine\My -CodeSigningCert -ErrorAction SilentlyContinue |
             Where-Object { $_.Thumbprint.ToUpper() -eq $cleanThumbprint }
    if ($found) {
        Write-Host "✅ Thumbprint encontrado!" -ForegroundColor Green
        $found | Select-Object Thumbprint, Subject, NotAfter, HasPrivateKey, PSParentPath | Format-List
    } else {
        Write-Host "❌ Thumbprint NÃO encontrado em nenhum store" -ForegroundColor Red
    }
}

# 5. Se .pfx fornecido, validar
if ($PfxPath -and (Test-Path $PfxPath)) {
    Write-Host "`n=== VALIDAÇÃO ARQUIVO .PFX ===" -ForegroundColor Cyan
    try {
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($PfxPath, $PfxPassword)
        Write-Host "✅ .pfx válido" -ForegroundColor Green
        Write-Host "   Subject: $($cert.Subject)"
        Write-Host "   Thumbprint: $($cert.Thumbprint)"
        Write-Host "   NotAfter: $($cert.NotAfter)"
        Write-Host "   HasPrivateKey: $($cert.HasPrivateKey)"
    } catch {
        Write-Host "❌ Erro ao ler .pfx: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Testar signtool se certificado disponível
if ($certs.Count -gt 0 -or $certsLM.Count -gt 0) {
    Write-Host "`n=== TESTE SIGNTOOL (dry-run) ===" -ForegroundColor Cyan
    $testFile = "$env:TEMP\tauri_sign_test.exe"
    if (Test-Path $testFile) { Remove-Item $testFile }
    # Criar executável dummy
    @"
#include <windows.h>
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    return 0;
}
"@ | Set-Content "$env:TEMP\dummy.c"
    & "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\*\bin\Hostx64\x64\cl.exe" "$env:TEMP\dummy.c" /Fe$testFile /link /SUBSYSTEM:WINDOWS /ENTRY:WinMain 2>$null
    if (Test-Path $testFile) {
        $result = & signtool.exe sign /a /tr http://timestamp.sectigo.com /td sha256 /fd sha256 $testFile 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ signtool sign OK" -ForegroundColor Green
            & signtool.exe verify /pa /v $testFile
        } else {
            Write-Host "❌ signtool sign FALHOU:" -ForegroundColor Red
            Write-Host $result
        }
        Remove-Item $testFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️ Não foi possível compilar teste (VC++ não encontrado)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Para usar no tauri.conf.json:"
Write-Host '  "bundle": { "windows": { "certificateThumbprint": "SEU_THUMBPRINT", "digestAlgorithm": "sha256", "timestampUrl": "http://timestamp.sectigo.com", "tsp": false } }'
Write-Host ""
Write-Host "Variáveis de ambiente para CI:"
Write-Host '  TAURI_SIGNING_WINDOWS_CERT_THUMBPRINT'
Write-Host '  TAURI_SIGNING_WINDOWS_CERT_PASSWORD'
Write-Host '  TAURI_SIGNING_WINDOWS_TIMESTAMP_URL'
Write-Host '  TAURI_SIGNING_WINDOWS_DIGEST_ALGORITHM'
Write-Host '  TAURI_PRIVATE_KEY (para updater)'