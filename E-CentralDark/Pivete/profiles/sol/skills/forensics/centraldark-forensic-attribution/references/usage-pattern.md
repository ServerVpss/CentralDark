# Forensic Attribution — Usage Pattern

## When to invoke

Use `scripts/vps/forensics-attribution.sh` when:
- A deploy failed or a runtime/service on the VPS is behaving unexpectedly
- You need forensic evidence before declaring the cause
- You have an event (T0) and need to attribute it to a worker/PID/runtime

## How to invoke

```bash
bash scripts/vps/forensics-attribution.sh "deploy-falhou-no-health-check" "/tmp/centraldark-forensics-$(date +%Y%m%d-%H%M%S)"
```

The script:
1. Creates the output directory if needed
2. Records the event and timestamp
3. Tries to attribute the event to a worker/PID via pgrep
4. Records Git HEAD at the time of forensics (from /root/CentralDark)
5. Records dist mtime and hash (from /root/CentralDark/apps/modulos/mcp/dist/index.js)
6. Records port 9100 listening status (via ss)

## Reading results

After the script runs, read the attribution.json file:

```bash
cat /tmp/centraldark-forensics-*/attribution.json
```

The file contains key=value pairs, one per line.

## Interpreting results

- If `FORENSICS_PID` is set: the event was attributed to a specific PID
- If `FORENSICS_PID` is empty: the event could not be attributed to a specific PID
- If `FORENSICS_RUNTIME_GIT_HEAD` is set: the Git HEAD at the time of forensics is known
- If `FORENSICS_RUNTIME_GIT_HEAD` is "UNKNOWN": Git HEAD could not be determined
- If `FORENSICS_DIST_HASH` is set: the dist hash is known
- If `FORENSICS_DIST_HASH` is "UNKNOWN": dist hash could not be determined
- If `FORENSICS_PORT_9100` is "LISTENING": the MCP port is listening
- If `FORENSICS_PORT_9100` is "ABSENT": the MCP port is not listening

## Drift investigation variant

When the incident is "service down due to config drift" (not deploy/runtime failure), use this pattern instead of the attribution script:

1. Locate ALL automatic restart mechanisms that touch the service's config persistence directory
2. Inspect each mechanism's credential access
3. Confirm the diagnosis: drift + recovery inability = root cause
4. Write diagnostic + correction files to `docs/` and `scripts/<servico>-drift/`
5. Create branch `pivete/work/<servico>-drift-rootcause` and commit

See SKILL.md body for the full drift investigation pattern, commands, and pitfalls.

## Next steps after forensics

After capturing forensic state:
1. If attribution is complete: diagnose root cause from the linked worker/code/state
2. If attribution is incomplete: the cause remains UNKNOWN — do not convert to a cause
3. Use the forensic evidence when discussing the issue or opening a PR
