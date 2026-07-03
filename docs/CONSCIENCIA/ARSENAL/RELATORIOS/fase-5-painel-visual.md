---
title: "Fase 5 Painel Visual"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

# Fase 5 — Painel Visual "Conselho Vivo"

**Data:** 03/07/2026
**Status:** ✅ concluída

## O que foi feito

Página dedicada `https://status.centralldark.com/conselho.html` mostrando o Arsenal Council ao vivo, sem tocar nos arquivos protegidos do painel principal.

## Arquivos criados

| Arquivo | Papel |
|---|---|
| `apps/modulos/status/conselho.html` | Página dedicada (dark theme, mesmo `styles.css`) |
| `apps/modulos/status/conselho-vivo.js` | Renderer que consome o JSON |
| `apps/modulos/status/conselho-vivo.json` | Feed (gerado por cron a cada 5min) |
| `docs/CONSCIENCIA/ARSENAL/scripts/atualizar-conselho-vivo.mjs` | Script que lê `DEBATES/` + `EVOLUCAO/` + `regras.json` e escreve o JSON |

## O que aparece na página

- **Slots de Modelos** (router / voz1_pro / voz2_gpt / voz3_flash / juiz) — lidos ao vivo do `regras.json`
- **Timeouts** — idem
- **Stats** — totalDebates, totalEvolucoes
- **Últimos 8 Debates** — arquivo + data + preview
- **Últimas 8 Evoluções (Hermes)** — idem

## Cron

```cron
*/5 * * * * /usr/bin/node /root/CentralDark/docs/CONSCIENCIA/ARSENAL/scripts/atualizar-conselho-vivo.mjs >> /var/log/conselho-vivo.log 2>&1
```

## Como testar

```bash
node docs/CONSCIENCIA/ARSENAL/scripts/atualizar-conselho-vivo.mjs
curl -s https://status.centralldark.com/conselho-vivo.json | jq '.stats'
```

Depois abre https://status.centralldark.com/conselho.html no navegador.

## Zero-impacto no painel protegido

Nenhuma linha alterada em `index.html`, `app.js`, `atualizar-painel-vivo.mjs` ou `painel-data.json`. Só adição de arquivos novos com prefixo `conselho-*`.

Volta pro [índice do Arsenal](../README.md).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
