---
title: "PIVETE 10 INFRA VPS"
date: 2026-07-05
tags: ["consciencia"]
updated: 2026-07-05
---

# PIVETE-10 · INFRA VPS

## Raiz do projeto
`/root/CentralDark/` — espelho do repo `ServerVpss/CentralDark` (sync via webhook GitHub → VPS).

## Sincronia 4-Point
```
Lovable ──▶ GitHub ──▶ VPS (/root/CentralDark/) ──▶ Cérebro Vivo (docs/CONSCIENCIA/ + .claude/)
   ▲                                                        │
   └────────────────────────────────────────────────────────┘
```
`pm2 save` obrigatório após qualquer mudança de estado no PM2.

## PM2 (processos vivos)

| ID | Nome | Papel | Estado desejado |
|----|------|-------|-----------------|
| 1 | `whatsapp-server` | Legado WhatsApp | **stopped** (não subir, não reportar erro) |
| 27 | `CentralDark-HubBot` | `@srver1bot` do HUB | online |
| 33 | `mcp` | Servidor MCP | online |
| 50 | `elite-ws` | Fabler Elite WebSocket | online (fallback) |
| 51 | `elite-http` | Fabler Elite HTTP | online (fallback) |
| 52 | `elite-anthropic` | Fabler EliteAnthropic (Claude via api.centralldark.com) | online (principal) |
| 60 | `elite-gateway` | Gateway HTTP api.centralldark.com | online |

Consultar sempre com: `pm2 list` na VPS.

## Subdomínios (Caddy)
`infra/caddy/` (🔒 protegido)

| Subdomínio | Rota |
|------------|------|
| `centralldark.com` | Landing |
| `status.centralldark.com` | Página oficial de status |
| `ui.centralldark.com` | Open WebUI (chat) |
| `api.centralldark.com` | Elite Gateway (chat com Fabler, auditoria Hermes) |
| `builder.centralldark.com` | Construtor Bolt (`apps/modulos/Bolt/`) |

## Caminhos importantes
- **Logs MCP**: `/root/CentralDark/logs/mcp-audit-YYYY-MM-DD.jsonl`
- **Scripts one-shot**: `/root/CentralDark/scripts/`
- **Secrets** (nunca commitar): `/root/CentralDark/secrets/`
- **Backups**: `/root/CentralDark-backups/`
- **Custom WebUI**: `/root/CentralDark/apps/modulos/WebUI/custom-css/`

## Fluxo de deploy
1. Editar no Lovable (ou local) → commit.
2. GitHub → webhook dispara `scripts/webhook/` na VPS.
3. VPS: `git pull` no `/root/CentralDark/`.
4. PM2: reinicia processo afetado.
5. `pm2 save`.
6. Notificação Telegram (privado admin + canal Status).

## Comandos operacionais frequentes
```bash
# Ver status geral
pm2 list
pm2 logs 33 --lines 50    # log do MCP
pm2 logs 60 --lines 50    # log do Gateway

# Reiniciar serviço
pm2 restart 33 && pm2 save

# Puxar update sem reiniciar
cd /root/CentralDark && git pull

# Ver últimas auditorias
tail -n 20 /root/CentralDark/logs/mcp-audit-$(date +%F).jsonl | jq -c
```

## Base militar (Linux root)
🟢 **ABERTA** por decisão do Pivete (turno 5).
Sem `nftables` novo, sem guardian, sem DENY_ETERNO.
Proteção é comportamental — pivete não roda comando suicida, ponto.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
