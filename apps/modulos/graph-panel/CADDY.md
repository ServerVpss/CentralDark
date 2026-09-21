# Exposição do graph-panel

O `graph-panel` **não possui subdomínio público próprio**.

## Rota canônica

```text
https://admin.centralldark.com/admin
→ aba 🌌 Grafo Celestial
→ /admin/grafo/*
→ proxy autenticado do MCP Admin
→ 127.0.0.1:3030
```

O Caddy continua expondo apenas a casca administrativa existente. Não criar bloco `grafo.centralldark.com`.

O processo `graph-panel` permanece local na VPS em `127.0.0.1:3030`; autenticação e superfície externa pertencem ao Admin CentralDark.
