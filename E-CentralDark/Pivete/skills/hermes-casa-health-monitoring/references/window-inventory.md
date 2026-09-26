# Visible-window causal inventory

Use this recipe when programs remain visible around Hermes or CentralDark. The target is the exact visible window and its launch chain, not a generic process list.

## 1. Capture visible windows

Run PowerShell without profile and emit machine-readable JSON:

```powershell
Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle } |
  Select-Object Id, ProcessName, MainWindowTitle, StartTime, SessionId |
  ConvertTo-Json -Depth 3
```

Preserve the snapshot timestamp. A title count proves only what was visible at that instant.

## 2. Enrich each PID

For every visible PID, query CIM rather than guessing from the process name:

```powershell
$pidSet = @(1234, 5678)
Get-CimInstance Win32_Process |
  Where-Object { $pidSet -contains $_.ProcessId } |
  Select-Object ProcessId, ParentProcessId, ExecutablePath, CommandLine, CreationDate, SessionId |
  ConvertTo-Json -Depth 3
```

Then resolve each parent and direct child:

```powershell
$all = Get-CimInstance Win32_Process
$all | Where-Object { $pidSet -contains $_.ProcessId -or $pidSet -contains $_.ParentProcessId } |
  Select-Object ProcessId, ParentProcessId, Name, ExecutablePath, CommandLine, CreationDate, SessionId |
  ConvertTo-Json -Depth 3
```

Do not print environment blocks or credential-bearing command arguments. Redact sensitive values before recording evidence.

## 3. Correlate ports and sessions

```powershell
Get-NetTCPConnection -State Listen |
  Where-Object { $pidSet -contains $_.OwningProcess } |
  Select-Object OwningProcess, LocalAddress, LocalPort, State |
  ConvertTo-Json -Depth 3

quser
```

Classify remote-control windows and remote sessions separately. A local AnyDesk/RDP/VNC window does not prove which remote host launched a process; identify the session/host through the remote tool or an authorized read-only probe. If the VPS or Casa peer is unreachable, record `UNKNOWN`, not absence.

## 4. Classify, then test causality

Per visible window record:

```text
WINDOW_TITLE=
PID=
EXECUTABLE_PATH=
COMMAND_LINE_REDACTED=
PARENT_PID=
PARENT_EXECUTABLE=
SESSION_ID=
START_TIME=
CHILDREN=
LISTENING_PORTS=
ORIGIN=LOCAL_CASA|REMOTE_SESSION|VPS|OTHER|UNKNOWN
ROLE=USER_APP|HERMES_SURFACE|ACP_MCP_CHILD|MONITOR_OVERLAY|REMOTE_CONTROL|UNKNOWN
HERMES_CAUSAL_LINK=PROVEN|NOT_PROVEN|UNKNOWN
SAFE_TO_CLOSE=YES|NO|UNKNOWN
EVIDENCE=
```

A Hermes causal link requires at least one discriminant: observed parent/child lineage, a matching launch command/receipt, or a controlled lifecycle test showing the exact window starts and exits with the Hermes component.

For a Job Object warning, use a non-destructive lifecycle test on a disposable child: record parent and child PIDs, stop only the test parent through its supported shutdown path, then check whether the child remains. Do not use production agents for this test. `ACCESS_DENIED` plus an unrelated visible window is not causal proof.

## 5. Remediation gate

Never use broad `taskkill /IM`, name-based termination, or mass window closure. Before closing one exact PID:

- prove its owner and role;
- verify it is not an active user/agent/remote task;
- prefer the application's supported close/shutdown path;
- record before/after visible-window counts;
- remeasure Hermes health and relevant ports separately.

## Output

```text
VISIBLE_CLUTTER=PASS|FAIL|UNKNOWN
HERMES_HEALTH=PASS|FAIL|UNKNOWN
REMOTE_DISTRIBUTED_STATE=PASS|FAIL|UNKNOWN
HERMES_CAUSED_VISIBLE_WINDOWS=<exact PIDs or NOT_PROVEN>
SAFE_CLOSE_SET=<exact PIDs or empty>
RESIDUAL_UNKNOWN=<items>
```
