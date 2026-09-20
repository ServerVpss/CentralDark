---
title: "EliteHTTP ≠ elite-anthropic-proxy — não confundir"
date: 2026-07-07
tags: ["consciencia", "gateway", "elite", "aprendizado"]
updated: 2026-07-07
---

# ⚠️ EliteHTTP ≠ elite-anthropic-proxy — não confundir

Três coisas com nome parecido, funções DIFERENTES. IA que confunde vai mexer no lugar errado.

## Mapa rápido

| Nome PM2 | Domínio | Provedor | Papel |
|----------|---------|----------|-------|
| **CentralDark-EliteHTTP** (id 14) | `elite.centralldark.com` (público) | ChatGPT Plus via Zendriver | Gateway **OpenAI-compatível PÚBLICO** pra plugar Cline/Bolt/Cursor/Continue/Aider em qualquer campo "OpenAI compatible base URL" sem pagar API. Usa conta ChatGPT Plus logada por noVNC no painel contas-admin. |
| **elite-anthropic-proxy** | interno (localhost) | Anthropic (Claude api oficial) | Proxy Claude INTERNO, uso do ecossistema. Nada a ver com gateway público. |
| **elite-gateway (api.centralldark.com)** | `api.centralldark.com` | Fabler Elite (legado) | Gateway HTTP antigo, PM2 id 60 no inventário histórico. Documentação em `docs/GATEWAY/README.md`. |

## Estado atual (07/07/2026)

- **EliteHTTP (id 14):** errored desde incidente 05/07 (venv `/root/dark/venv` apagado). Fica dormindo. Pendência #35 registrada em `docs/PENDENCIAS.md`. Só ressuscitar quando o Pivete mandar um agente dedicado tocar até o fim.
- **elite-anthropic-proxy:** operacional, não mexer sem ordem (protegido — Seção 9 do CLAUDE.md).
- **api.centralldark.com:** legado ativo, documentação em `docs/GATEWAY/README.md`.

## Regra pra próxima IA

Antes de mexer em qualquer coisa chamada "elite":
1. Ler ESTE arquivo.
2. Ler `docs/GATEWAY/ELITE_ENDPOINT_PUBLICO.md` (documentação oficial do EliteHTTP público).
3. Confirmar QUAL dos três é.
4. NÃO chutar caminhos nem recriar venv sem ordem explícita.

---

## Conexões Rápidas
- [[00-LEIA-PRIMEIRO]]
- `docs/PENDENCIAS.md` #35 — evolução agendada do EliteHTTP
- `mem/architecture/inventario-pm2-vps.md` — inventário PM2 oficial
- `.lovable/memory/architecture/elite-gateway-endpoint-publico.md` — resumo memória
