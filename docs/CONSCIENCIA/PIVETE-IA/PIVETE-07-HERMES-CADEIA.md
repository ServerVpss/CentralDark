# PIVETE-07 · HERMES — CADEIA AUTÔNOMA

## Localização
`docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/`

Hermes é o **construtor principal**. Roda em loop:

```
decisor → executor → validador → registra aprendizado → decisor…
```

## Componentes

| Arquivo | Papel |
|---------|-------|
| `decisor.mjs` | Analisa contexto e escolhe próxima ação. **Editado nesta janela** pra: (1) sempre ativar na VPS logo após edit, (2) ensinar Hermes registrando aprendizado a cada ciclo |
| `executor.mjs` | Roda a ação decidida (via MCP `vps-lazy` / `vps-run-once`) |
| `validador.mjs` | Confere resultado, decide se aprendeu ou se precisa retry |

## Integração com auditoria
Toda ação do Hermes passa por `vps-lazy` / `vps-run-once`, que agora chamam `auditLog()`. Logo, **cada passo do Hermes vira linha JSONL** em `/root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl` com:

```json
{
  "timestamp": "2026-07-04T22:15:00Z",
  "usuario": "hermes",
  "ip": "127.0.0.1",
  "tool": "vps-lazy",
  "command": "pm2 restart 33",
  "status": "ok",
  "durationMs": 342,
  "exitCode": 0
}
```

## Painel Hermes (WebUI)
`apps/modulos/WebUI/custom-css/hermes-panel.js` + `.css`

Abas:
1. **Status** — heartbeat, ciclos rodados, última ação
2. **Auditoria** (nova) — sumário (✅ OK / ⚠️ Falha / 🚫 Blocked), tabela filtrável, refresh 10s
3. **Aprendizados** — feed de `APRENDIZADOS.md`

Cards de sumário puxam de `GET /hermes/audit/stats?dia=YYYY-MM-DD`.
Tabela puxa `GET /hermes/audit?dia=YYYY-MM-DD&limit=200` (usa `tail` na VPS pra ler rápido).

## PM2
- **id 33** — `mcp` (servidor MCP)
- **id 60** — `elite-gateway` (roteador HTTP `api.centralldark.com`)

Reinício silencioso permitido a qualquer momento.

## Regra herdada
> "Sempre que a gente for fazendo qualquer tipo de serviço, pode ir aplicando e ativando. Sempre ir ensinando o Hermes sobre tudo."
