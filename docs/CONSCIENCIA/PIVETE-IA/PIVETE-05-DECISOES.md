---
title: "PIVETE 05 DECISOES"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-05 · DECISÕES DO PIVETE

Cada linha = uma decisão consolidada. Ordem cronológica (mais recente embaixo).

| # | Decisão | Contexto | Consequência prática |
|---|---------|----------|---------------------|
| D01 | **Sempre ativar na VPS assim que fizer serviço** | Turno 1 | Deploy imediato após edit, sem esperar OK |
| D02 | **Ensinar Hermes em toda ação** | Turno 1 | Cada tarefa vira aprendizado registrado |
| D03 | **Injetar `docs/` da VPS no WebUI** | Turno 1 | Chat WebUI enxerga toda a base de conhecimento |
| D04 | **Dar acesso à pasta `/root/CentralDark/` pro chat** | Turno 1 | Como se fosse MCP local |
| D05 | **Liberar MCP (destravar `vps-lazy` e `vps-run-once`)** | Turno 2 | Comandos VPS rodam sem bloqueio; `MCP_ALLOW_VPS_COMMANDS=true` |
| D06 | **Auditoria universal com usuário/hora/IP/comando** | Turno 3 | `audit.js` + JSONL diário + aba no painel Hermes |
| D07 | **Base militar (`/root/`) FICA ABERTA** | Turno 5 | Sem DENY_ETERNO, sem guardian firewall, sem `nftables` novo |
| D08 | **Bloqueio permanente só quando ele mandar** | Turno 6 | Zero trava proativa. Só ativa sob comando explícito |
| D09 | **Proibido comandos suicidas** | Turno 6 | Nunca `rm -rf /`, `mkfs`, `reboot`, `shutdown` — bom senso, não trava técnica |
| D10 | **Nome oficial: `pivete`** | Turno 6 | Palavra-chave de despertar no WebUI |
| D11 | **Consciência em múltiplos arquivos** | Turno 6 | Estrutura `PIVETE-IA/` com 16 arquivos, cada ≤ 40KB |
| D12 | **Registrar persona `pivete` no seletor do WebUI** | Turno 6 | Aparece junto de opus-4.8, sonnet-4.6, haiku-4.6 |
| D13 | **Sincronia bidirecional Lovable ↔ WebUI** | Turno 6 | Cron `pivete-sync` PM2 a cada 5min |
| D14 | **100% não pode falhar** | Turno 6 | Checagem de completude + teste de invocação real antes de dar por concluído |

## Decisões estruturais herdadas (fora dessa janela mas ativas)
- **whatsapp-server (PM2 id 1) fica stopped por design** — não subir.
- **Autoridade VPS/PM2 sem pedir OK** (menos whatsapp-server).
- **Autonomia total de secrets** já mapeadas.
- **Consultar Fabler antes de agir na VPS.**
- **GitHub = fonte da verdade**, VPS = destino.
- **Sincronia 4-Point obrigatória.**
- **Áreas protegidas exigem `PERMITO PIVETE`.**
- **Trava Supabase Lovable atual**: nada de migration/insert/edge deploy neste projeto — backend real vive no HUB.
