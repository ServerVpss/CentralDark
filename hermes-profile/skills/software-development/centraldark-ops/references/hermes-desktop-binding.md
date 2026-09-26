# Hermes Desktop session binding (Casa)

Identify THIS device's Hermes Desktop without inventing IDs.

## Process tree

Multiple `Hermes.exe` exist (main, gpu, renderer, utilities). Binding PID is the **browser main** whose `ExecutablePath` is under the Administrador install and whose `ParentProcessId` is `explorer.exe` (user-launched), not a helper whose parent is another Hermes.

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-WmiObject Win32_Process -Filter "Name='Hermes.exe'" |
  Select-Object ProcessId, ParentProcessId, ExecutablePath, CommandLine |
  Format-List
```

Two install trees can coexist (`C:\Users\Administrador\...` vs another profile path). Bind the process whose path matches the live user (`whoami`) and `AppData\Local\hermes\logs`.

## Session IDs (three different things)

| Field | Where | Notes |
|---|---|---|
| stored_session_id / HUD hash | `C:\Users\Administrador\AppData\Local\hermes\logs\desktop.log` | Pattern `YYYYMMDD_HHMMSS_<hex>`. HUD URL `#/<id>` is current UI session. |
| jsonrpc `session_id` | same log, `session.reclaimed` | Short hex; not the stored id. |
| Windows PID | WMI | Never equal to session id. |

Do not use the oldest match in the log. Reclaim loops replay a stored id for hours. Prefer the **HUD hash in a recent load URL** or the newest non-reclaim open line, then dual-sample.

Logs: `desktop.log` + `agent.log`. Agent lines tagged `[YYYYMMDD_HHMMSS_hex]` correlate tool calls to the stored session.

## Dual measurement

PASS only if two consecutive samples agree on: plane=CASA, host, PID, agent_session_id, workspace `E:\CentralDark`, log_source. Write `LOGS/CASA/HERMES_DESKTOP/SESSION/CURRENT.json` only after agreement. Do not crystallize as a global rule if they diverge.

## Preview vs runtime

Hermes file preview `file:///...` failing is not Casa or VPS identity. Session binding does not require that pane.
