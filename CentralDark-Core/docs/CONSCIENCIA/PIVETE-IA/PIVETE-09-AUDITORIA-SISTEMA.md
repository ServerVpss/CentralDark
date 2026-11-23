---
title: "PIVETE 09 AUDITORIA SISTEMA"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-09 · SISTEMA DE AUDITORIA

## Módulo central — `apps/modulos/mcp/dist/lib/audit.js`

Função exportada:

```js
auditLog({
  usuario,      // string — quem disparou (ex: 'hermes', 'pivete', 'webui')
  ip,           // string — IP de origem (ex: '127.0.0.1', IP público do WebUI)
  tool,         // string — 'vps-lazy' | 'vps-run-once' | outro
  command,      // string — comando/script rodado
  status,       // 'ok' | 'error' | 'timeout' | 'blocked'
  durationMs,   // number — quanto durou
  exitCode      // number — 0 = sucesso
})
```

Escreve em `/root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl` (JSONL, uma linha por ação).

## Integração automática
- `vps-lazy.js` chama `auditLog()` em: **Success**, **Failure**, **Timeout**, **Blocked**.
- `vps-run-once.js` idem.
- Qualquer nova ferramenta MCP deve seguir o padrão: importar `auditLog` e chamar em cada exit path.

## Rotas no Elite Gateway
`apps/modulos/elite-gateway/scripts/elite_http_gateway.py` — servidor `api.centralldark.com`.

| Rota | Retorno |
|------|---------|
| `GET /hermes/audit/dias` | Lista de datas com logs disponíveis: `["2026-07-04", "2026-07-03", …]` |
| `GET /hermes/audit?dia=YYYY-MM-DD&limit=200` | Últimas N linhas do JSONL do dia. Usa `tail -n` na VPS pra ler rápido |
| `GET /hermes/audit/stats?dia=YYYY-MM-DD` | Agregado: `{ok: N, error: N, blocked: N, timeout: N, total: N}` |

## Painel WebUI
`apps/modulos/WebUI/custom-css/hermes-panel.js`

### Aba "Auditoria" — layout
```
┌──────────────────────────────────────────────┐
│  📅 [Seletor de dia]                          │
├──────────────────────────────────────────────┤
│  ✅ OK: 47   ⚠️ Erro: 3   🚫 Blocked: 1       │
├──────────────────────────────────────────────┤
│  🔍 [Buscar…]  [Filtrar por status ▾]         │
├──────────────────────────────────────────────┤
│  Hora │ Usuário │ Tool     │ Comando │ Status│
│  22:14│ hermes  │ vps-lazy │ pm2 …   │ ✅    │
│  22:13│ pivete  │ vps-r-o  │ deploy… │ ✅    │
│  …                                            │
└──────────────────────────────────────────────┘
Auto-refresh a cada 10s
```

## Retenção
- JSONL diário → arquivo por dia.
- Sem rotação automática hoje. Regra futura: comprimir logs > 30 dias.

## Consulta rápida via terminal VPS
```bash
# últimas 20 ações
tail -n 20 /root/CentralDark/logs/mcp-audit-$(date +%F).jsonl | jq -c

# só as bloqueadas hoje
grep '"status":"blocked"' /root/CentralDark/logs/mcp-audit-$(date +%F).jsonl | jq

# contagem por status hoje
jq -r '.status' /root/CentralDark/logs/mcp-audit-$(date +%F).jsonl | sort | uniq -c
```

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
