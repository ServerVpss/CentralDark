---
title: "INFRA MAP"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# 🗺️ Mapa Vivo de Infraestrutura CentralDark

> **Gerado automaticamente em:** 2026-07-05T14:40:00-03:00
> **Fonte:** `scripts/get-infra-map.sh` (roda `pm2`+`docker`+`systemctl`+`ss`)
> **Regenerar:** `bash scripts/get-infra-map.sh > docs/CONSCIENCIA/INFRA-MAP.md`

## 🚀 Serviços PM2 (Node.js)

```
┌────┬─────────────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 2  │ CentralDark-ArsenalAdapter      │ default     │ 1.0.0   │ fork    │ 3626001  │ 30m    │ 2    │ online    │ 0%       │ 64.9mb   │ root     │ disabled │
│ 12 │ CentralDark-ArsenalProxy        │ default     │ 0.0.0   │ fork    │ 3532568  │ 3h     │ 0    │ online    │ 0%       │ 41.3mb   │ root     │ disabled │
│ 1  │ CentralDark-ArtifactsBuilder    │ default     │ 0.0.0   │ fork    │ 3526324  │ 3h     │ 0    │ online    │ 0%       │ 69.9mb   │ root     │ disabled │
│ 0  │ CentralDark-ArtifactsCrafter    │ default     │ 0.0.0   │ fork    │ 3525767  │ 3h     │ 0    │ online    │ 0%       │ 65.2mb   │ root     │ disabled │
│ 14 │ CentralDark-EliteHTTP           │ default     │ 0.0.0   │ fork    │ 3619439  │ 49m    │ 30   │ online    │ 0%       │ 46.6mb   │ root     │ disabled │
│ 5  │ CentralDark-GrafoVivo           │ default     │ 0.0.0   │ fork    │ 3526408  │ 3h     │ 0    │ online    │ 0%       │ 67.7mb   │ root     │ disabled │
│ 4  │ CentralDark-GraphPanel          │ default     │ 0.1.0   │ fork    │ 3526387  │ 3h     │ 0    │ online    │ 0%       │ 73.5mb   │ root     │ disabled │
│ 3  │ CentralDark-Hermes              │ default     │ 0.0.0   │ fork    │ 3626768  │ 29m    │ 2    │ online    │ 0%       │ 68.0mb   │ root     │ disabled │
│ 7  │ CentralDark-HubBot              │ default     │ 0.0.0   │ cluster │ 3532144  │ 3h     │ 0    │ online    │ 0%       │ 67.9mb   │ root     │ disabled │
│ 17 │ CentralDark-MCP                 │ default     │ 0.3.0   │ fork    │ 3617324  │ 55m    │ 0    │ online    │ 0%       │ 100.4mb  │ root     │ disabled │
│ 10 │ CentralDark-Memoria             │ default     │ 1.0.0   │ fork    │ 3532377  │ 3h     │ 0    │ online    │ 0%       │ 67.5mb   │ root     │ disabled │
│ 16 │ CentralDark-OAuthBroker         │ default     │ 0.0.0   │ fork    │ 3551557  │ 2h     │ 6    │ online    │ 0%       │ 93.8mb   │ root     │ disabled │
│ 18 │ CentralDark-PiveteSync          │ default     │ N/A     │ fork    │ 3626039  │ 30m    │ 0    │ online    │ 0%       │ 81.3mb   │ root     │ disabled │
└────┴─────────────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

## 🐳 Serviços Docker (containers)

```
NAMES                               IMAGE                                                  STATUS                  PORTS
CentralDark-HermesThinker           hermes-thinker-hermes-thinker                          Up 13 hours             127.0.0.1:7801->7801/tcp
CentralDark-WebUI                   ghcr.io/open-webui/open-webui:main                     Up 28 hours (healthy)   0.0.0.0:3000->8080/tcp
CentralDark-Tools                   webui-cd-tools                                         Up 2 days               
CentralDark-MCPO                    ghcr.io/open-webui/mcpo:main                           Up 41 hours             8000/tcp
CentralDark-Builder                 centraldark-builder-bolt-dev-builder-bolt-dev:latest   Up 4 days               127.0.0.1:5175->5175/tcp, 127.0.0.1:5174->5173/tcp
portainer                           portainer/portainer-ce:latest                          Up 13 days              127.0.0.1:8000->8000/tcp, 127.0.0.1:9443->9443/tcp, 9000/tcp
multizap-gateway-wuzapi-1           asternic/wuzapi:latest                                 Up 13 days              127.0.0.1:8081->8080/tcp
multizap-gateway-postgreswuzapi-1   postgres:16-alpine                                     Up 13 days (healthy)    5432/tcp
```

## ⚙️ Serviços systemd (relevantes)

```
  actions.runner.ServerVpss-CentralDark.vmi3256920-centraldark.service loaded active running GitHub Actions Runner (ServerVpss-CentralDark.vmi3256920-centraldark)
  caddy.service                                                        loaded active running Caddy
```

## 🔌 Portas em uso (LISTEN)

```
*:443                          caddy,pid=3508428,fd=48
*:80                           caddy,pid=3508428,fd=28
*:9000                         webhook,pid=745,fd=6
0.0.0.0:22                     sshd,pid=1264,fd=3
0.0.0.0:3000                   docker-proxy,pid=3234486,fd=8
0.0.0.0:3090                   node
0.0.0.0:8082                   uvicorn,pid=3619439,fd=8
0.0.0.0:8083                   uvicorn,pid=3532568,fd=7
0.0.0.0:8899                   node
0.0.0.0:9077                   uvicorn,pid=3573434,fd=11
0.0.0.0:9876                   python3,pid=1385280,fd=3
127.0.0.1:16565                node,pid=1194969,fd=168
127.0.0.1:2019                 caddy,pid=3508428,fd=47
127.0.0.1:3030                 node
127.0.0.1:3101                 node
127.0.0.1:40493                code-f6cfa2ea24,pid=24263,fd=11
127.0.0.1:45117                node,pid=1194969,fd=35
127.0.0.1:5174                 docker-proxy,pid=3841366,fd=8
127.0.0.1:5175                 docker-proxy,pid=3841382,fd=8
127.0.0.1:8000                 docker-proxy,pid=2022,fd=8
127.0.0.1:8081                 docker-proxy,pid=2479,fd=8
127.0.0.1:8090                 node
127.0.0.1:8098                 node
127.0.0.1:9100                 node
127.0.0.1:9443                 docker-proxy,pid=2042,fd=8
127.0.0.53%lo:53               systemd-resolve,pid=721,fd=14
[::]:22                        sshd,pid=1264,fd=4
```

## 📊 Resumo

- **PM2:** 13 processos
- **Docker:** 8 containers
- **systemd (relevantes):** 2 serviços
- **Portas LISTEN únicas:** 27

---
_Este arquivo é regerado a cada execução. NÃO editar manualmente._

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
