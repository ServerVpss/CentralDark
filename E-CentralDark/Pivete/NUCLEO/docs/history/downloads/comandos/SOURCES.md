# SOURCES USED

CentralDark:
- ServerVpss/CentralDark
- main SHA: 0af4e2f9f4ef0c33ad6fde00f51fcce8a641b81f
- package.json: npm@10.9.7, Vite/React, build/lint/test scripts.
- observed modules: HERMES-CORE, WebUI, arsenal-openai-adapter, centraldark-voice,
  elite-gateway, graph-panel, hub, mcp, mcp-admin-ui, memoria-api, etc.
- docs/PENDENCIAS.md: portal/domain migration still pending execution.
- docs/INSTALADOR/13-centraldark-portal.md: Caddy/build paths.

Buzz:
- block/buzz
- main SHA observed: f88cda9eb886500ec7d205e1d265ac6f654aa433
- inspected README, ARCHITECTURE, VISION_AGENT, TESTING, VISION_PROJECTS.
- reusable: self-hosted relay, agents, channels, threads, workflows, Git events,
  ACP/MCP, Postgres, Redis, S3/MinIO, audit/search, desktop/mobile.

Not invented:
- current live VPS secrets
- current live ports
- current DB topology
- current provider balances
These must be measured by P0.
