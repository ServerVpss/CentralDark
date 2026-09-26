---
title: Tauri Windows App Control / WDAC Blocking
captured_at: "2026-08-22"
source: "Session debugging sol-desktop-poc-source"
---

# Tauri Windows App Control / WDAC Blocking

## Sintoma
```
error: failed to run custom build command for `sol-desktop v0.1.0`
Caused by:
  could not execute process `...target\debug\build\sol-desktop-...\build-script-build`
  (never executed)
Caused by:
  Uma política de Controle de Aplicativo bloqueou este arquivo. (os error 4551)
```

## Causa Raiz
**Windows Defender Application Control (WDAC) / AppLocker** bloqueando execução de binário não assinado na pasta `target/debug/build/`. O script de build do Tauri (`build.rs`) compila código Rust em tempo de build e tenta executar — o Windows bloqueia porque:
- Binário não assinado
- Executando de pasta temporária (`target/debug/build/`)
- Política de organização/PC ativa

## O que NÃO É
- ❌ Vírus / malware
- ❌ Bug do Tauri/Rust
- ❌ Dependência faltando
- ❌ Cargo quebrado

## Workarounds (sem desativar segurança)

| Opção | Comando | Notas |
|-------|---------|-------|
| **1. Build release direto** | `cd src-tauri && cargo build --release` | Pode passar pela política (binário final assinado pelo Windows) |
| **2. Frontend only (Vite)** | `npm run dev` | WebView no browser — Web Speech API funciona |
| **3. Assinar com certificado** | `signtool sign /f cert.p12 /p senha target/release/sol-desktop.exe` | Requer certificado de desenvolvedor válido |
| **4. Configurar WDAC/AppLocker** | Policy allow path `target/debug/build/` | **Requer admin + autorização do CHEFE** |

## Verificação Rápida
```powershell
# Verificar se WDAC ativo
Get-CimInstance -Namespace root\Microsoft\Windows\CI -ClassName Policy

# Verificar AppLocker
Get-AppLockerPolicy -Effective -Xml
```

## Referência para Próximas Sessões
- **Não** tentar `npm run tauri dev` sem antes verificar política
- **Não** sugerir desativar WDAC/Defender/AppLocker (regra: não desativar segurança)
- Frontend Vite (`npm run dev`) **sempre funciona** — usar para validar UI/STT/TTS/gateway
- Build Tauri é **empacotamento** — não necessário para validar lógica