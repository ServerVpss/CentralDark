# OUTRO - docker-compose.override.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\WebUI\docker-compose.override.yml
**SHA:** 042b2700e2091e37
**Timestamp:** 2026-08-28T02:56:40.920921
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- restart: unless-stopped

### Ouro Bruto (primeiros 5000 chars)
```
# Override automático — fixa o MCP CentralDark no Open-WebUI via mcpo sidecar
# + injeta o tema 3D Esmeralda (light) via custom.css versionado
services:
  webui:
    environment:
      - 'TOOL_SERVER_CONNECTIONS=[{"url":"http://mcpo:8000/centraldark","path":"openapi.json","auth_type":"none","key":""}]'
      - ENABLE_OPENAPI_SERVERS=true
    volumes:
      - ./custom-css/esmeralda.css:/app/backend/static/custom.css:ro
      - ./custom-css/hermes-panel.css:/app/backend/static/hermes-panel.css:ro
      - ./custom-css/hermes-panel.js:/app/backend/static/hermes-panel.js:ro
    depends_on:
      - mcpo
  mcpo:
    image: ghcr.io/open-webui/mcpo:main
    container_name: CentralDark-MCPO
    command: ["--host","0.0.0.0","--port","8000","--config","/config/config.json"]
    volumes:
      - ./mcpo-config:/config:ro
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    restart: unless-stopped
    labels:
      centraldark.app: mcpo

```