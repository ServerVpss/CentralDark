# COMANDO - CONTRIBUTING.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\CONTRIBUTING.md
**SHA:** bd5498b3d1e8fe46
**Timestamp:** 2026-08-23T14:15:49.476188
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- we use this for our docs through mintlify, usually the output is broken and i use cursor agent to fix it using ths prompt:

### Contratos
- | **the paywall/lock screen** (forces entitlement check) | `NEXT_PUBLIC_SCREENPIPE_FORCE_BILLING_GATE=true` |

### Ouro Bruto (primeiros 5000 chars)
```
# contributing to screen pipe

first off, thank you for considering contributing to screen pipe!

btw, we prefer that you don't contribute if you are not using or will use the product and is just there for bounties, thank you.

## getting started

before you begin:
- try to run the [pre-built app](https://docs.screenpi.pe) to get familiar with the project
- familiarize yourself with the repository structure and architecture.
- new to contributing? the [beginner's onboarding guide](ONBOARDING.md) walks you from zero to a merged pr step by step (this file is the reference; that one is the walkthrough).

## installation and build guide

### macos

1. **install dependencies**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   brew install pkg-config ffmpeg jq cmake wget git-lfs
   ```
   Install Xcode via App Store (or elsewhere) and initialize. Xcode command line tools only installation is insufficent. 
   ```
   sudo xcodebuild -license
   xcodebuild -runFirstLaunch
   ```

2. **install bun cli**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **clone the repository**:
   ```bash
   git clone https://github.com/screenpipe/screenpipe
   cd screenpipe
   ```

4. **build the project**:
   ```bash
   cargo build --release --features metal
   ```

5. **run screenpipe**:
   ```bash
   ./target/release/screenpipe
   ```

6. **build the desktop app**:
   ```bash
   cd apps/screenpipe-app-tauri
   bun install
   bun run build:tauri:dev
   ```

#### sharing downloaded dependencies across worktrees

The desktop prebuild keeps immutable native downloads such as FFmpeg, FFprobe,
the Bun sidecars, MLX metallib, and Windows OpenBLAS in a machine-wide cache.
The default is `~/.cache/screenpipe/native-deps`. To put it elsewhere, set the
same absolute path in every worktree environment:

```bash
export SCREENPIPE_NATIVE_CACHE_DIR="$HOME/.cache/screenpipe/native-deps"
export SCREENPIPE_FRONTEND_CACHE_DIR="$HOME/.cache/screenpipe/frontend-out"
```

Cache entries are versioned, validated, and protected by per-artifact locks, so
concurrent worktree builds download each artifact at most once. Set either
variable to `off` to disable that cache. Keep Cargo's `target` directory local
to each worktree when running concurrent builds; do not set a shared
`CARGO_TARGET_DIR`.

### windows

These steps build the local NSIS installer (`*-setup.exe`). The default Tauri
configuration intentionally produces `screenpipe - Development`, which can live
next to the released app without taking over its identity or updater settings.

1. **install winget**:
   - `winget` ships with App Installer on current Windows 10 and Windows 11. If
     the command is missing, follow the [official Windows Package Manager
     installation guide](https://learn.microsoft.com/windows/package-manager/winget/).

2. **install the required tools**:
   ```powershell
   winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
   winget install -e --id Rustlang.Rustup
   winget install -e --id LLVM.LLVM
   winget install -e --id Kitware.CMake
   winget install -e --id Git.Git
   winget install -e --id 7zip.7zip
   irm https://bun.sh/install.ps1 | iex
   ```

   The Visual Studio package alone is not enough: Tauri needs the **Desktop
   development with C++** workload. The `--override` above installs that workload,
   including MSVC and a Windows SDK. This is also the workload named in the
   [official Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/#windows).

   Close and reopen PowerShell after the installers finish so the new commands
   are on `PATH`.

3. **configure and verify the toolchain**:
   ```powershell
   $llvmBin = 'C:\Program Files\LLVM\bin'
   $env:LIBCLANG_PATH = $llvmBin
   [System.Environment]::SetEnvironmentVariable('LIBCLANG_PATH', $llvmBin, 'User')

   bun --version
   cargo --version
   cmake --version
   if (-not (Test-Path "$env:LIBCLANG_PATH\libclang.dll")) { throw 'libclang.dll not found' }

   $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
   if (-not (& $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath)) {
     throw 'install the Visual Studio Desktop development with C++ workload'
   }
   ```

   Setting the user environment variable only affects future terminals, so the
   `$env:LIBCLANG_PATH` assignment is required for the current one.

4. **clone the project**:
   ```powershell
   git clone https://github.com/screenpipe/screenpipe.git
   cd screenpipe
   ```

5. **build the Tauri installer**:
   ```powershell
   cd apps/screenpipe-app-tauri
   bun install --frozen-lockfile
   bun tauri build
   ```

   Do not run the repository-root `cargo build --release` first unless you also
   need the standalone CLI. The desktop app is a separate Cargo workspace with
   its own `src
```

---

# COMANDO - CONTRIBUTING.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\CONTRIBUTING.md
**SHA:** bd5498b3d1e8fe46f08ce5c8282a8d40482dd9ab36da3cb9d39bd08c579f8ca2
**Timestamp:** 2026-08-23T23:43:05.295907
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- we use this for our docs through mintlify, usually the output is broken and i use cursor agent to fix it using ths prompt:

### Contratos
- | **the paywall/lock screen** (forces entitlement check) | `NEXT_PUBLIC_SCREENPIPE_FORCE_BILLING_GATE=true` |

### Ouro Bruto (primeiros 5000 chars)
```
# contributing to screen pipe

first off, thank you for considering contributing to screen pipe!

btw, we prefer that you don't contribute if you are not using or will use the product and is just there for bounties, thank you.

## getting started

before you begin:
- try to run the [pre-built app](https://docs.screenpi.pe) to get familiar with the project
- familiarize yourself with the repository structure and architecture.
- new to contributing? the [beginner's onboarding guide](ONBOARDING.md) walks you from zero to a merged pr step by step (this file is the reference; that one is the walkthrough).

## installation and build guide

### macos

1. **install dependencies**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   brew install pkg-config ffmpeg jq cmake wget git-lfs
   ```
   Install Xcode via App Store (or elsewhere) and initialize. Xcode command line tools only installation is insufficent. 
   ```
   sudo xcodebuild -license
   xcodebuild -runFirstLaunch
   ```

2. **install bun cli**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **clone the repository**:
   ```bash
   git clone https://github.com/screenpipe/screenpipe
   cd screenpipe
   ```

4. **build the project**:
   ```bash
   cargo build --release --features metal
   ```

5. **run screenpipe**:
   ```bash
   ./target/release/screenpipe
   ```

6. **build the desktop app**:
   ```bash
   cd apps/screenpipe-app-tauri
   bun install
   bun run build:tauri:dev
   ```

#### sharing downloaded dependencies across worktrees

The desktop prebuild keeps immutable native downloads such as FFmpeg, FFprobe,
the Bun sidecars, MLX metallib, and Windows OpenBLAS in a machine-wide cache.
The default is `~/.cache/screenpipe/native-deps`. To put it elsewhere, set the
same absolute path in every worktree environment:

```bash
export SCREENPIPE_NATIVE_CACHE_DIR="$HOME/.cache/screenpipe/native-deps"
export SCREENPIPE_FRONTEND_CACHE_DIR="$HOME/.cache/screenpipe/frontend-out"
```

Cache entries are versioned, validated, and protected by per-artifact locks, so
concurrent worktree builds download each artifact at most once. Set either
variable to `off` to disable that cache. Keep Cargo's `target` directory local
to each worktree when running concurrent builds; do not set a shared
`CARGO_TARGET_DIR`.

### windows

These steps build the local NSIS installer (`*-setup.exe`). The default Tauri
configuration intentionally produces `screenpipe - Development`, which can live
next to the released app without taking over its identity or updater settings.

1. **install winget**:
   - `winget` ships with App Installer on current Windows 10 and Windows 11. If
     the command is missing, follow the [official Windows Package Manager
     installation guide](https://learn.microsoft.com/windows/package-manager/winget/).

2. **install the required tools**:
   ```powershell
   winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
   winget install -e --id Rustlang.Rustup
   winget install -e --id LLVM.LLVM
   winget install -e --id Kitware.CMake
   winget install -e --id Git.Git
   winget install -e --id 7zip.7zip
   irm https://bun.sh/install.ps1 | iex
   ```

   The Visual Studio package alone is not enough: Tauri needs the **Desktop
   development with C++** workload. The `--override` above installs that workload,
   including MSVC and a Windows SDK. This is also the workload named in the
   [official Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/#windows).

   Close and reopen PowerShell after the installers finish so the new commands
   are on `PATH`.

3. **configure and verify the toolchain**:
   ```powershell
   $llvmBin = 'C:\Program Files\LLVM\bin'
   $env:LIBCLANG_PATH = $llvmBin
   [System.Environment]::SetEnvironmentVariable('LIBCLANG_PATH', $llvmBin, 'User')

   bun --version
   cargo --version
   cmake --version
   if (-not (Test-Path "$env:LIBCLANG_PATH\libclang.dll")) { throw 'libclang.dll not found' }

   $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
   if (-not (& $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath)) {
     throw 'install the Visual Studio Desktop development with C++ workload'
   }
   ```

   Setting the user environment variable only affects future terminals, so the
   `$env:LIBCLANG_PATH` assignment is required for the current one.

4. **clone the project**:
   ```powershell
   git clone https://github.com/screenpipe/screenpipe.git
   cd screenpipe
   ```

5. **build the Tauri installer**:
   ```powershell
   cd apps/screenpipe-app-tauri
   bun install --frozen-lockfile
   bun tauri build
   ```

   Do not run the repository-root `cargo build --release` first unless you also
   need the standalone CLI. The desktop app is a separate Cargo workspace with
   its own `src
```