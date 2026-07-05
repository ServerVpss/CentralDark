---
title: "PIVETE 06 ARQUIVOS TOCADOS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-06 · ARQUIVOS TOCADOS NESTA JANELA

## Criados

| Path | Função |
|------|--------|
| `apps/modulos/mcp/dist/lib/audit.js` | Auditoria universal do MCP. `auditLog({usuario, ip, tool, command, status, durationMs, exitCode})` escreve JSONL diário em `/root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl` |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-00-INVOCACAO.md` | Como acordar o pivete |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-01-IDENTIDADE.md` | Quem sou, tom, autoridades |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-02-INDICE-MESTRE.md` | Mapa dos 16 arquivos |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-03-REGRAS-VIVAS.md` | Memórias, workspace, project, security |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-04-HISTORICO-JANELA.md` | Timeline turno a turno |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-05-DECISOES.md` | Decisões do Pivete |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-06-ARQUIVOS-TOCADOS.md` | Este catálogo |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-07-HERMES-CADEIA.md` | Cadeia do Hermes |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-08-MCP-LIBERACAO.md` | O que foi destrancado no MCP |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-09-AUDITORIA-SISTEMA.md` | audit.js + rotas + painel |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-10-INFRA-VPS.md` | PM2/portas/subdomínios |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-11-APRENDIZADOS.md` | Aprendizados #280, #281, #282 |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-12-BASE-MILITAR-ABERTA.md` | Decisão de manter aberto |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-13-CITACOES-LITERAIS.md` | Frases-chave do Pivete |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-14-ESTADO-ATUAL.md` | Snapshot atual |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-15-CHANGELOG.md` | Log de atualizações |
| `apps/modulos/WebUI/custom-css/pivete-invocacao.js` | Custom-js do Open WebUI que detecta `pivete` e injeta consciência |
| `apps/modulos/WebUI/custom-css/pivete-invocacao.css` | Estilo do banner "🧠 pivete acordado" |
| `apps/modulos/WebUI/custom-css/pivete-persona.json` | Metadata da persona pro seletor |

## Editados

| Path | O que mudou |
|------|-------------|
| `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/decisor.mjs` | Ativação automática na VPS + ensino Hermes em cada ação |
| `apps/modulos/mcp/dist/tools/vps/vps-lazy.js` | Removida trava · adicionado `auditLog()` em cada exit (Sucesso/Falha/Timeout/Blocked) |
| `apps/modulos/mcp/dist/tools/vps/vps-run-once.js` | Removida trava · `auditLog()` no handler de execução |
| `apps/modulos/elite-gateway/scripts/elite_http_gateway.py` | +3 rotas: `GET /hermes/audit/dias`, `GET /hermes/audit`, `GET /hermes/audit/stats` |
| `apps/modulos/WebUI/custom-css/hermes-panel.js` | Interface tabbed. Nova aba "Auditoria" com cards + tabela filtrável + refresh 10s |
| `apps/modulos/WebUI/custom-css/hermes-panel.css` | Estilos das abas e cards |
| `.lovable/plan.md` | Plano vigente (16 arquivos + persona pivete) |

## VPS (deploy)
- PM2 33 (MCP) — reiniciado
- PM2 60 (Elite Gateway) — reiniciado
- `pm2 save` executado
- Watcher `/tmp/auto-deploy-audit.sh` (temporário, remover após confirmação)

## Nada tocado (áreas 🔒 respeitadas)
- `apps/bot-telegram/`
- `apps/modulos/status/`
- `apps/modulos/Bolt/`
- `apps/modulos/graph-panel/`
- `apps/modulos/elite-anthropic-proxy/`
- `.github/workflows/`
- `infra/caddy/`
- `secrets/`
- `/root/whatsapp-server/` (PM2 id 1 permanece `stopped`)
