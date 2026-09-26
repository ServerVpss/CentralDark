---
name: centraldark-install
description: Instala o CLI centraldark para o ambiente.
version: 1.0.0
author: Pivete
category: centraldark
---
# CentralDark CLI Installation

1. Download `centraldark` executable/script from official source.
2. Move it to a directory in your PATH (e.g., `C:\tools\centraldark`).
3. Add that directory to PATH:
   - Windows: System Properties → Environment Variables → Path → New → `C:\tools\centraldark`.
   - Linux/macOS: Add `export PATH="$PATH:/path/to/centraldark"` to `~/.bashrc` and run `source ~/.bashrc`.
4. Verify: run `centraldark --version` in a new terminal.

**Troubleshooting**: Ensure the executable is in PATH and has execute permissions.
---