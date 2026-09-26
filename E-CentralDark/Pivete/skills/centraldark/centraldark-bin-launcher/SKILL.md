---
name: centraldark-bin-launcher
description: Launcher for !CENTRALDARK command.
version: 1.0.0
author: Pivete
category: centraldark
---

# CentralDark Bin Launcher

**Purpose**: Provides a Windows command `centraldark` that forwards to the Hermes executable.

**Requirements**: Hermès executable must be in the same folder as the launcher or on the system PATH.

**Usage**:
Add the `bin` folder (containing the launcher) to the PATH, then run:
```cmd
> centraldark
```
The launcher runs `hermes.exe run "!CENTRALDARK" %*`.

**Implementation**: The script is stored in `references/launcher.cmd`.
