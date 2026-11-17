# Security Policy

## Supported versions

Security fixes are provided for the latest release.

## Report a vulnerability

Please use GitHub's private security advisory form instead of opening a public
issue. Include the affected version, platform, reproduction steps, and impact.
Do not include prompts, source code, tokens, or other sensitive user data.

## Trust boundary

The historical Halo v0.1.8 subsystem has no HTTP server, cloud service, update downloader, account, or
telemetry. Its hook adapter writes only lifecycle state metadata to
`~/.codex-halo/state.json`. Installation changes only Halo's entries in
`~/.codex/hooks.json` after creating a timestamped backup.

<!-- CENTRALDARK_ROOT_DOCS_SYNC_20261115 -->
## Remote Agent candidate v0.1.9 — additional trust boundaries

LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
**Status:** candidate code in DEV, not a released or fully validated remote-access product. The local-only description above applies to the historical Halo v0.1.8 subsystem, **not** to the new account-connected Remote Agent candidate.

The candidate has Supabase authentication, Windows DPAPI session storage and device pairing commands in source. Network health (local agent, private network and Cloudflare MCP) is distinct from authorization to use tools or control a screen. Do not infer remote-access permission from HTTP 200, connection indicators, or account sign-in.

No implicit administrative elevation or unattended takeover is authorized. Installation scope and any UAC prompt require deliberate user approval; device pairing, remote-session consent and action authorization remain separate. Session refresh after restart, revocation, authorized engine end-to-end testing and installer rollback are still **NOT PROVEN**. Preserve the existing Electron application and do not expose secrets in logs or issue reports.

Use docs/PRIVACY.md and docs/RELEASE_NOTES_v0.1.9.md for the candidate state. Report vulnerabilities privately through the existing security advisory channel.
<!-- /CENTRALDARK_ROOT_DOCS_SYNC_20261115 -->

<!-- CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
## Seguranca da arvore Windows target v0.1.9
TREE_LAST_UPDATED_UTC=2026-11-15T04:14:35.517Z
TREE_CANONICAL=docs/INSTALLATION.md
O modo perMachine nao permite acesso remoto automaticamente
nem substitui autorizacao ou UAC. A sessao DPAPI por usuario
nao pode ser copiada entre perfis. Nenhum token em Roaming,
logs, receipts ou junto ao exe. A implementacao de subpastas
session/pairing, ACL, migracao/rollback, revogacao e purge
requer testes E2E antes de liberar o instalador.
<!-- /CENTRALDARK_AGENT_WINDOWS_TREE_20261115 -->
