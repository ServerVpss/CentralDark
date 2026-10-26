# MCP OAuth in non-interactive Hermes services

Use this reference when a VPS, gateway, worker, or messaging integration reports an MCP OAuth error while running without an interactive terminal.

## Diagnostic sequence

1. Capture the surrounding log window, not only the reported source line:
   ```bash
   tail -200 /root/.hermes/logs/errors.log
   tail -200 /root/.hermes/logs/gateway.log
   ```
   Redact token values, authorization codes, cookies, and client secrets before returning output.

2. Classify the first causal event:
   - `401`, `invalid_grant`, `invalid_client`, or refresh `400`: stale, revoked, malformed, or otherwise rejected refresh state.
   - Browser/authorization required with no interactive session: the service has entered an OAuth recovery flow it cannot complete in batch mode.
   - Service restart, disk, SQLite, or network errors: investigate those independently; do not label them OAuth failures without a causal log edge.

3. Attribute the failure to a server before changing anything. Correlate the timestamp and request context with the MCP server name, then inspect only token metadata such as file name, modification time, scope, and expiry presence. Never expose token or refresh-token values.

4. Verify service health independently:
   ```bash
   systemctl --no-pager --type=service --all | grep -i hermes || true
   df -h / /root
   df -i / /root
   ```
   A running gateway proves process liveness only; it does not prove that OAuth refresh or the affected MCP call works.

5. Complete authorization from an interactive Hermes session, using the exact server identifier:
   ```bash
   hermes mcp login <server>
   ```
   Complete the provider's browser flow in the interactive session. Do not run this through `ssh -o BatchMode=yes`, a systemd unit, or another non-interactive worker.

6. Read back the result without exposing secrets, then restart/reload only the owning service if required by its lifecycle. Verify the exact service state and inspect fresh logs for the affected server's next call. Claim recovery only after a real MCP operation succeeds or a provider-specific health check returns success.

7. If interactive authorization is unavailable but the affected server is sufficiently attributed, contain the failure without destroying OAuth state:
   ```bash
   cp /root/.hermes/config.yaml /root/.hermes/config.yaml.bak-before-oauth-isolation
   # Edit only the attributed server blocks: add or set `enabled: false`.
   systemctl restart hermes-gateway.service
   hermes mcp list
   journalctl -u hermes-gateway.service --since "<restart-time>" --no-pager
   ```
   Verify that only the intended servers are disabled, both the gateway process and its owning service remain active, and fresh logs no longer contain the refresh/recovery loop. Keep the token files intact. This proves containment and gateway stabilization, not successful reauthorization; leave the OAuth repair claim `UNKNOWN` until an interactive login and functional MCP readback pass.

   Do not use a broad `reauth --all` as a containment strategy: it can disturb healthy providers and does not remove the failing server from the background recovery path.

## Decision table

| Observation | Meaning | Next action |
|---|---|---|
| Refresh request rejected | OAuth state is not usable | Attribute server, then interactive login |
| Non-interactive authorization exception | Recovery needs a browser/session | Do not retry in batch; use interactive login |
| Gateway active/running | Supervisor process is alive | Continue with functional MCP verification |
| Disk or SQLite error | Separate persistence/runtime problem | Preserve evidence and diagnose independently |
| Server cannot be identified | Attribution is unknown | Keep claim scoped as UNKNOWN; gather adjacent logs |

## Receipt

```text
MCP_SERVER=
FIRST_CAUSAL_EVENT=
NON_INTERACTIVE_SYMPTOM=
TOKEN_VALUES_EXPOSED=NO
GATEWAY_PROCESS=
DISK_STATE=
INTERACTIVE_LOGIN=
FUNCTIONAL_READBACK=
FIXED_POINT=
UNKNOWN=
```
