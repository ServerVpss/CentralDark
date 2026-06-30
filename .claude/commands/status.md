---
description: Estado do sistema — PM2, MCP e Sincronia 5-point
allowed-tools: Bash
---

Mostre o estado atual do CentralDark de forma leiga e visual. Rode:
1. `pm2 list` — pegue os processos principais (online/stopped), sem poluir.
2. `curl -s http://localhost:9100/health` — versão e nº de tools do MCP.
3. `git -C /root/CentralDark status -sb` — working tree limpo ou sujo?

Entregue DOIS cards monospace:

```
╔═══════════════════════════════════════════════╗
║   📊 ESTADO DO SISTEMA                          ║
╠═══════════════════════════════════════════════╣
║   MCP ........... 🟢 v<versão> · <n> tools      ║
║   PM2 críticos .. 🟢 <online>/<total>           ║
║   Git ........... 🟢/🟡 <limpo ou N mudanças>   ║
╚═══════════════════════════════════════════════╝
```

E a Sincronia 5-point (GitHub, VPS, Cérebro Vivo, Lovable=🔴 se sem front, Notion).
Use bolinhas 🟢🟡🔴. PT-BR, zero enrolação.
