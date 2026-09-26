---
title: "SOL Desktop Tauri — Windows App Control Blocker (os error 4551)"
date: 2026-08-23
status: BLOCKED
---

# Blocker
**Erro:** `os error 4551` — política de Controle de Aplicativo do Windows bloqueia build script Rust não assinado (`build-script-build` nunca executado).

```text
error: failed to run custom build command for `sol-desktop v0.1.0`
Caused by:
  could not execute process `...\\target\\debug\\build\\sol-desktop-...\\build-script-build` (never executed)
Caused by:
  Uma política de Controle de Aplicativo bloqueou este arquivo. (os error 4551)
```

---

## Status POC (2026-08-23)

| Componente | Status |
|------------|--------|
| Frontend Build (`npm run build`) | ✅ PASS (7.55s) |
| Tauri Dev (`npm run tauri dev`) | ❌ BLOCKED (Windows App Control) |
| Build TypeScript | ✅ PASS |

---

## Workarounds Conhecidos

### 1. Excluir `target/` do Windows Defender / App Control (Recomendado)
```powershell
# PowerShell como Admin
Add-MpPreference -ExclusionPath "E:\CentralDark\workspace\sol\sol-desktop-poc-source\apps\sol-desktop\src-tauri\target"
Add-MpPreference -ExclusionPath "C:\Users\<USER>\.cargo"
Add-MpPreference -ExclusionPath "C:\Users\<USER>\.rustup"
```

### 2. Tauri CLI Direto
```bash
cargo install tauri-cli
cd apps/sol-desktop
tauri dev
```

### 3. Build em WSL2 / Linux (Tauri Nativo)
```bash
# No WSL2
cd /mnt/c/Users/<USER>/CentralDark/workspace/sol/sol-desktop-poc-source/apps/sol-desktop
npm install
npm run tauri dev
```

---

## Configuração de Conexão (Pronta no README)

Quando o build passar, o SOL Desktop se conecta via:
- **Gateway SOL:** endpoint CentralDark que recebe intenção e devolve `{ text, receipt }`
- **Bridge TTS:** `https://bridge.centralldark.com/v1/audio/speech` (padrão)
- Chaves armazenadas no localStorage da WebView (não versionadas)

---

## Regra
**Não reescrever Tauri.** Registrar workaround canônico e seguir. O blocker é de ambiente, não de código.

---

## Próximo Passo
Quando CHEFE fixar ambiente (excluir `target/` do Defender/App Control ou usar WSL2):
1. `tauri dev` deve passar
2. Wire `Gateway SOL` + `Bridge TTS` no BFF (já validado em `:8787`)
3. Testar 1 fluxo: Desktop → BFF `:8787` → `chat/start` OU `kanban`

---

## Referência
- Missão: `CENTRALDARK_RUNTIME_WIRING`
- Checkpoint: `2026-08-23-runtime-wiring-checkpoint.md`
- Pasta POC: `E:\CentralDark\workspace\sol\sol-desktop-poc-source\apps\sol-desktop\`