# Arquitetura

```text
grafo.centralldark.com
        ↓
      Caddy
        ↓
127.0.0.1:3030
        ↓
apps/modulos/graph-panel/server.js
        ↓
public/ + data/
```

## Componentes

- `server.js`: servidor HTTP Node sem dependência externa.
- `public/`: tela do painel com vis-network.
- `data/`: grafo, relatório, auditoria e histórico.
- `scripts/`: pipelines Lovable, graphifyy reserva, auditoria e menu.
- `logs/`: saída do PM2.

## Segurança

O parser ignora arquivos sensíveis por padrão. O painel não precisa abrir `.env`, tokens, sessões, chaves ou bancos locais.
