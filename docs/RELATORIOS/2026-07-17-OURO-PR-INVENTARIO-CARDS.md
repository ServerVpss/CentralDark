# Ouro PR — Inventário read-only + regras de entrega Telegram

**Data:** 2026-07-17  
**Base:** `origin/main` (branch limpa — sem VPS monstro)  
**Main:** https://github.com/ServerVpss/CentralDark/tree/main

## O que foi encontrado (resumo)

| Categoria | Achado |
|-----------|--------|
| Saudável | api→8090, mcp→9100, status/elite-proxy→8082, arsenal-api→8083, grafo→3030, builder→3090 |
| Kill switch 503 | bridge, ui, install, api/speech (“desligado”) |
| Fantasma | LovableBridge (PM2 online, server.mjs ausente); elite.* → :8080 morto |
| Nome enganoso | PM2 `EliteHTTP` = elite-anthropic-proxy :8082 (não gateway :8080) |
| Risco | ecosystem.config.cjs diverge do PM2 live; restarts históricos altos em proxies |
| Modo missão | 100% READ-ONLY — zero alteração de estado |

## Preferências Pivete seladas

1. Card Hermes sempre (ação relevante / estudo)
2. Anexo `.md` e/ou `.txt` em entregas grandes/segurança
3. Versionar ouro em branch limpa de main (não empurrar 1400+ commits VPS)

## Arquivos neste PR

- `.grok/rules/01-…` e `06-…`
- `mem/preferences/entrega-telegram-anexo-e-cards-hermes.md`
- Inventário completo MD+TXT em `docs/RELATORIOS/`
- APRENDIZADOS / HISTORICO (append ouro)
