# CentralDark · VPS Route Census · 2026-10-22 (America/Bahia)

## Intent / authority
- INTENT: publish current MCP delta on VPS using minimum viable *authorized* existing route, without losing local data; accumulate proof on each attempted route.
- OWNER: ServerVpss/CentralDark · CentralDark MCP / VPS runtime.
- SOURCE_HEAD observed before reconciliation: `6092c3cc78ba8a0546aa0df2dea2eedd54f1d385`.
- TARGET_VPS_HEAD: `4b0ce5a7d` (stale; VPS status reported 35 commits behind origin/main at measurement).
- TESTS: six envelope tests passed in prior isolated evaluation; this does **not** prove VPS runtime.
- FIXED_POINT: NOT_CLAIMED.
- NO_SECRET_VALUES included.

## Route evidence / no silent skips

| Route / binding | Measured outcome | What it proves | What it does NOT prove |
|---|---|---|---|
| Native CentralDark MCP read | PASS: `vps_git_status` and `admin_git_status` returned VPS main `4b0ce5a`; local `apps/modulos/status/painel-data.json` modified; untracked files retained. | Authorized remote **read**, VPS repo observable. | Shell write, synchronization, build, restart. |
| Native MCP admin `admin_git_pull` | BLOCKED: `CONFIRMACAO_ADMIN_NECESSARIA`, `executionStatus=blocked`, `auditSeq=10991`, `auditHash=1a584d9fe46e6081add380ad35d60ccf9b93d90a3ff61522d2e9307873ce72f2`. | Runtime authorization gate currently applies; requested pull **not executed**. | Connectivity failure or user's lack of ownership. |
| Native `admin_shell_exec` | CATALOGUED, destructive=true; requires audited authorization. | Existing hardened command executor found. | Executed shell or service restart. |
| Native MAIN-PINNED fallback | CATALOGUED: `centraldark_deploy_micro_fallback`; 141 tools / 13 routes cataloged. Runtime guard also lists this fallback as quarantined, among 8 extra destructive tools vs manifest. | Recipe and capability discoverable. | Dispatchable mutation or canary PASS. |
| Tailscale OAuth broker bridge | PASS: `tailscale_bridge_status` HTTP 200, backend Running; VPS node `centraldark-os` and home `segredo` online; home RDP 3389 OPEN, SSH 22 CLOSED_OR_FILTERED. | Private tailnet bridge is responding, machines observed. | An authenticated remote SSH session for deployment. |
| Tailscale devices API | PROVIDER_HTTP_401 on `tailscale_status` and `tailscale_devices_list`. | API capability needs credentials/authorization fix. | Tailnet disconnected (bridge probe above succeeded). |
| VPS Remote Desktop Commander bridge | OS processes for versions `latest` and `0.2.48` observed; systemd unit query failed; no execution authority/receipt. | Remote bridge process presence. | A working user-connected remote session. |
| User connected Desktop Commander devices | Both SEGREDO and CENTRALDARK-OS reported Offline. `ping` returned MCP `Tool ping not found` for each. | Provider adapter lacks ping tool in current session and devices not online in last snapshot. | VPS powered off. |
| GitHub self-hosted deploy | [run #39879907445](https://github.com/ServerVpss/CentralDark/actions/runs/39879907445) for `6092c3cc` reported pending; earlier attempts cancelled. | Workflow dispatch/push accepted. | Runner online or deployment. |
| GitHub hosted wake workflow | [run #39878591831](https://github.com/ServerVpss/CentralDark/actions/runs/39878591831) failed; required `VPS_SSH_KEY_LOVABLE`, `VPS_HOST_LOVABLE`, `VPS_USER_LOVABLE` not found in repository secret-name inventory at measurement. | Existing wake route failed. | VPS not reachable through other transports. |
| VPS PM2 status | `deploy_status` returned `SyntaxError: Unexpected end of JSON input`; PM2 list empty in normalized output. | Monitoring parser currently broken. | All PM2 services stopped. |

## Next authorized cursor — minimum sufficient loop
1. Reuse **verified admin OAuth/Hub scope** in native `/admin/mcp`, if available, to invoke approved `admin_git_pull` / owner-specific redeploy; never synthesize a missing confirmation or bypass `guardDestructive`. If the live runtime is stale relative to committed MCP source, reconcile runtime authorization in an independently approved channel.
2. Before modifying tracked worktree with local changes, capture diff & commit identity and use owner/scratch recipe: `SOURCE_SHA` pinned, `FILESET_CAUSAL`, clean scratch, tests, owner-only restart, health, receipt/rollback. Do not blindly `reset --hard` or `git clean` the primary repo.
3. Alternative if admin cannot be made available: restore self-hosted runner or existing trusted remote Desktop Commander binding (device currently offline); evidence required before execution.
4. Report `PASS` only with deployed SHA, service state and runtime readback. Failure on one route does not imply failure of another.
5. Keep this evidence and next cursor; do not duplicate the control plane or mark pending CI as PASS.

## Recorded evidence boundary
This is a **route census / forensic receipt** prepared from tool returns, not a proof that deployment or synchronization occurred. Tool responses are the measurement layer, not user assertions. No VPS files, PM2 services or Tailscale configuration were altered by this receipt.
