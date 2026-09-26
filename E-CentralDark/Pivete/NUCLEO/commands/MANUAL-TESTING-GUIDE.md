# COMANDO - MANUAL-TESTING-GUIDE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\tests\macos\MANUAL-TESTING-GUIDE.md
**SHA:** 1dd6fd323bb6db37
**Timestamp:** 2026-08-28T02:19:43.538557
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- # Run: aios --version
- # Run: aios --version

### Ouro Bruto (primeiros 5000 chars)
```
# Manual Testing Guide for macOS

**Story 1.10b - macOS Testing & Validation**

This guide provides step-by-step instructions for manually testing AIOS on macOS (Intel and Apple Silicon).

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Test Environment Setup](#test-environment-setup)
- [AC1: Intel Mac Installation](#ac1-intel-mac-installation)
- [AC2: Apple Silicon Installation](#ac2-apple-silicon-installation)
- [AC3: Shell Compatibility](#ac3-shell-compatibility)
- [AC4: Path Handling](#ac4-path-handling)
- [AC5: Line Endings](#ac5-line-endings)
- [AC6: File Permissions](#ac6-file-permissions)
- [AC7: Homebrew Integration](#ac7-homebrew-integration)
- [AC8: Performance](#ac8-performance)
- [AC9: Security Compliance](#ac9-security-compliance)
- [AC10: Error Recovery](#ac10-error-recovery)
- [Troubleshooting](#troubleshooting)
- [Reporting Issues](#reporting-issues)

---

## Prerequisites

### Required Software

- **macOS Version:** 10.15 (Catalina) or newer
- **Node.js:** Version 18 or higher
- **npm:** Included with Node.js
- **Terminal:** Built-in Terminal.app or iTerm2

### Optional Software

- **Homebrew:** Package manager for macOS
- **Git:** Version control (usually pre-installed)

### System Information Collection

Before starting tests, collect your system information:

```bash
# Run this command and save the output
sw_vers
uname -a
node --version
npm --version
file $(which node)
```

**Save this output** to include in test reports.

---

## Test Environment Setup

### 1. Clean Environment Preparation

```bash
# Backup existing AIOS installation (if any)
if [ -d "$HOME/.aios" ]; then
    mv "$HOME/.aios" "$HOME/.aios.backup.$(date +%Y%m%d-%H%M%S)"
fi

# Verify backup
ls -la "$HOME/.aios.backup"*
```

### 2. Navigate to Test Directory

```bash
cd path/to/@synkra/aios-core/tests/macos
chmod +x *.sh
```

---

## AC1: Intel Mac Installation

**Platform:** macOS Intel (x86_64)
**Duration:** ~10 minutes
**Automated Script:** `test-intel-installation.sh`

### Manual Steps

#### 1. Verify Architecture

```bash
uname -m
# Expected output: x86_64
```

#### 2. Run Installer

```bash
npx @synkraai/aios@latest init
```

**Follow the wizard prompts:**

- Accept default settings unless specific configuration is needed
- Note any errors or warnings
- Record installation time

#### 3. Verify Installation

```bash
# Check AIOS command availability
which aios
# Expected: /usr/local/bin/aios or similar

# Verify version
aios --version

# Run health check
aios health
```

**Expected Health Check Output:**

```
✓ Browser - Healthy
✓ Context7 - Healthy
✓ Exa - Healthy
✓ Desktop Commander - Healthy
```

#### 4. Verify Architecture

```bash
file $(which node)
# Should contain: x86_64
```

### ✅ Pass Criteria

- [ ] Installation completes without errors
- [ ] All 4 MCPs show as healthy
- [ ] `aios` command works
- [ ] Running on correct architecture (x86_64)

---

## AC2: Apple Silicon Installation

**Platform:** macOS Apple Silicon (arm64) - M1/M2/M3
**Duration:** ~10 minutes
**Automated Script:** `test-apple-silicon-installation.sh`

### Manual Steps

#### 1. Verify Architecture

```bash
uname -m
# Expected output: arm64

# Check chip info
sysctl -n machdep.cpu.brand_string
# Expected: Apple M1/M2/M3...
```

#### 2. Run Installer

```bash
npx @synkraai/aios@latest init
```

#### 3. Verify Native ARM Execution

```bash
file $(which node)
# Should contain: arm64
# NOT x86_64 (which would indicate Rosetta)
```

If running under Rosetta:

```bash
# This is acceptable but not optimal
# Recommend installing native ARM Node.js
```

#### 4. Check Rosetta Availability

```bash
# Verify Rosetta 2 is installed (for compatibility)
/usr/bin/pgrep -q oahd && echo "Rosetta 2 installed" || echo "Rosetta 2 not installed"
```

#### 5. Run Health Check

```bash
aios health
```

### ✅ Pass Criteria

- [ ] Installation completes without errors
- [ ] All 4 MCPs show as healthy
- [ ] Node.js runs natively on ARM (preferred)
- [ ] Or runs under Rosetta (acceptable fallback)

---

## AC3: Shell Compatibility

**Duration:** ~5 minutes
**Automated Script:** `test-shell-compatibility.sh`

### Manual Steps

#### 1. Test in Zsh (Default on modern macOS)

```bash
# Verify current shell
echo $SHELL
# Expected: /bin/zsh

# Check if .zshrc was updated
cat ~/.zshrc | grep -i aios

# Open new terminal window
# Run: aios --version
# Should work without errors
```

#### 2. Test in Bash

```bash
# Switch to bash
bash

# Check if profile was updated
cat ~/.bashrc | grep -i aios
# Or check ~/.bash_profile

# Run AIOS command
aios --version

# Exit bash
exit
```

#### 3. Test PATH Persistence

```bash
# Close terminal completely
# Open new terminal
# Run: aios --version
# Should work immediately without sourcing profiles
```

### ✅ Pass Criteria

- [ ] Works in zsh
- [ ] Works in bash
- [ ] PATH persists across sessions
- [ ] No manual `source` needed

---

## AC4: Path Handling

**Duration:** ~3 minutes
**Automated Script:** `test-path-handlin
```