# CENTRALDARK REMOTE MCP GATEWAY
status: ATIVO_2026-09-07
owner: CENTRALDARK

## Rota operacional

- MCP da Casa: `https://mcp.centralldark.com/mcp`
- Remote Desktop Commander: `https://mcp.desktopcommander.app/mcp`
- Screenpipe local: `http://127.0.0.1:3030`
- Device: `SEGREDO`

## Regra

Desktop Commander e transporte/capacidade local. CentralDark continua owner/control plane.
Nao expor token do Screenpipe, shell irrestrito ou secrets no repo.

## Contexto local pelo MCP remoto

`CentralDark-Context-Sidecar.ps1` consulta o Screenpipe autenticado e grava um snapshot enxuto em
`GARIMPO-CHEFE/context/screenpipe-latest.json`. O Desktop Commander remoto pode ler esse arquivo
quando o agente precisar de contexto recente de tela/navegador, mantendo o dado na Casa.

`CentralDark-Remote-Bridge.ps1` sobe o sidecar e mantem `@wonderwhy-er/desktop-commander@latest remote`
reconectando sempre pela rota oficial do Desktop Commander.

Config canônica: `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json`.
