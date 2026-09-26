# OUTRO - ISSUE_DRAFT_P0_missing_module.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.github\ISSUE_DRAFT_P0_missing_module.md
**SHA:** 1a1f6adeb6dab8a3
**Timestamp:** 2026-08-28T02:02:28.374008
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- console.error('Please run: npm install');

### Ouro Bruto (primeiros 5000 chars)
```
# [P0] Missing AIOS Core module: utils/repository-detector - Blocks Linux Installation

## 🔴 Priority: P0 (CRITICAL - Installation Blocked)

**Severity:** CRITICAL - Blocks all installation testing on Linux
**Platform:** Linux (Ubuntu 24.04 WSL)
**Story:** [Story 1.10c - Linux Testing](../docs/stories/v2.1/sprint-1/story-1.10c-linux-testing.md)
**Discovered By:** @qa (Quinn) - QA Test Architect
**Date Discovered:** 2025-01-23
**Assigned To:** @dev (Dex) - Development Lead

---

## 📋 Description

The AIOS installer fails immediately on Linux systems with a module not found error, preventing any installation or testing. The installer cannot locate the AIOS Core module `utils/repository-detector`, blocking all Linux platform validation for Story 1.10c.

**Impact:** This is a **CRITICAL BLOCKER** for Sprint 1 completion, as Story 1.10c cannot proceed without a working installer on Linux.

---

## 🐛 Error Details

### Error Message

```
Error: Cannot find AIOS Core module: utils/repository-detector
Searched: ${PROJECT_ROOT}/.aios-core/utils/repository-detector
Please ensure @synkra/aios-core is installed correctly.
    at loadAIOSCore (${PROJECT_ROOT}/bin/aios-init.js:43:11)
```

### Stack Trace Location

- **File:** `bin/aios-init.js`
- **Line:** 43
- **Function:** `loadAIOSCore`

---

## 🔬 Reproduction Steps

### Prerequisites

- Ubuntu 24.04 LTS (WSL) or native Linux
- Node.js v18.20.8+
- AIOS-Fullstack repository cloned

### Steps to Reproduce

1. Open WSL Ubuntu terminal or native Linux shell
2. Create test directory:

   ```bash
   mkdir -p /tmp/aios-test-install
   cd /tmp/aios-test-install
   ```

3. Execute installer:

   ```bash
   node ${PROJECT_ROOT}/bin/aios-init.js --help
   ```

4. **Observe:** Installation fails with module not found error

### Expected Behavior

- Installer should locate AIOS Core module successfully
- Help text should display (with `--help` flag)
- Installation wizard should launch (without flags)
- Installation should proceed normally

### Actual Behavior

- Installation crashes immediately on module import
- Error points to missing `utils/repository-detector` module
- No installation wizard launched
- No help text displayed

---

## 🎯 Impact Assessment

### User Impact

- **Installation:** ❌ Completely blocked on Linux platforms
- **Testing:** ❌ Cannot validate installer functionality
- **Story 1.10c:** ⛔ Blocked - 0% test completion
- **Sprint 1:** ⚠️ At risk if not resolved immediately

### Affected Platforms

- ✅ **Windows:** Unknown (not tested in this context)
- ✅ **macOS:** Unknown (not tested in this context)
- ❌ **Linux (Ubuntu):** FAILS - Module not found
- ❌ **Linux (Debian):** Likely fails (untested due to P0)
- ❌ **Linux (Fedora):** Likely fails (untested due to P0)

### Test Coverage Impact

- **Planned Test Scenarios:** 14
- **Executed:** 1 (7%)
- **Blocked:** 13 (93%)
- **Estimated Time Lost:** 6-7 hours of testing time

---

## 🔍 Root Cause Analysis

### Suspected Issues

1. **Module Path Resolution (Most Likely)**
   - Path may be constructed incorrectly for Linux filesystem structure
   - WSL mounted drives (`/mnt/c/...`) may not be handled correctly
   - Cross-platform path separator issues (Windows `\` vs Linux `/`)

2. **Missing File/Directory**
   - `.aios-core/utils/repository-detector.js` may not exist in repository
   - Module may have been renamed or moved in recent commits
   - Build/install process may not create required directory structure

3. **Incorrect Module Import**
   - `require()` statement may use hard-coded Windows path
   - Relative path resolution may fail in WSL environment
   - Missing path normalization before module require

### Investigation Needed

- [ ] Verify `.aios-core/utils/repository-detector.js` exists in repo
- [ ] Check `bin/aios-init.js:43` for path construction logic
- [ ] Review recent commits for module renames/moves
- [ ] Test module loading on Windows vs Linux
- [ ] Verify build process creates required directory structure

---

## 💡 Recommended Fix

### Short-Term (Immediate Fix)

1. **Verify module exists:**

   ```bash
   ls -la .aios-core/utils/repository-detector.js
   ```

2. **Fix path resolution in `bin/aios-init.js:43`:**

   ```javascript
   // Before (suspected):
   const detector = require('./.aios-core/utils/repository-detector');

   // After (cross-platform):
   const path = require('path');
   const detectorPath = path.resolve(__dirname, '..', '.aios-core', 'utils', 'repository-detector');
   const detector = require(detectorPath);
   ```

3. **Add file existence check:**

   ```javascript
   const fs = require('fs');
   if (!fs.existsSync(detectorPath + '.js')) {
     console.error('AIOS Core module not found.');
     console.error('Please run: npm install');
     process.exit(1);
   }
   ```

4. **Test in WSL Ubuntu:**
   ```bash
   wsl bash -c "cd /tmp/aios-test-install && node /mnt/c/.../bin/aios-init.js --help"
   ```

### Long-Term (Prevention)

1. **Add pre-flight checks to installer:**
   - 
```