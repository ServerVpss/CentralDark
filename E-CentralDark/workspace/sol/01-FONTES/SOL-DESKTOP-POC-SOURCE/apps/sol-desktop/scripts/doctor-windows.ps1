$ErrorActionPreference = "Stop"
Write-Host "=== SOL Desktop Doctor ===" -ForegroundColor Cyan
node --version
npm --version
if (Get-Command rustc -ErrorAction SilentlyContinue) { rustc --version } else { Write-Host "Rust ausente: instale via https://rustup.rs" -ForegroundColor Yellow }
if (Get-Command cargo -ErrorAction SilentlyContinue) { cargo --version }
Write-Host "WebView2 normalmente já vem no Windows 11. O comando npm run tauri dev fará a prova real." -ForegroundColor Green
