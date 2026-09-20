---
title: "INVENTÁRIO PM2 VPS — snapshot histórico"
date: 2026-07-05
tags: ["consciencia", "historico", "pm2"]
updated: 2026-08-14
status: "HISTORICAL_SNAPSHOT"
---

# Inventário PM2 — snapshot histórico de 05/07/2026

Este arquivo **não é mais fonte da verdade do runtime PM2 atual**. Ele registra um snapshot histórico de 05/07/2026 cuja topologia diverge de outros artefatos da mesma época e do código/automação versionados depois.

O conteúdo detalhado anterior permanece preservado no histórico Git deste arquivo.

```text
PM2_RUNTIME_CURRENT=UNKNOWN_UNTIL_LIVE_MEASUREMENT
SNAPSHOT_DATE=2026-07-05
HISTORICAL_SNAPSHOT_GOVERNS_PRESENT=false
ROOT_ECOSYSTEM_CONFIG=UNKNOWN_UNTIL_VPS_PROVES
UNKNOWN_IS_NOT_PASS=true
```

## Divergências preservadas

- o processo `CentralDark-EliteHTTP` tinha script/status conflitante entre este snapshot e `mem/architecture/inventario-pm2-vps.md`;
- o nome do MCP divergia entre `MCP-CentralDark` e `CentralDark-MCP` em superfícies diferentes;
- referências históricas apontavam `ecosystem.config.js` como configuração raiz, enquanto o repositório atual contém `ecosystem.config.cjs`; isso **não prova** qual arquivo a VPS realmente carrega;
- processos, IDs, cwd, env e scripts do snapshot não devem ser reutilizados como estado vivo.

## Regra operacional atual

Antes de qualquer decisão sobre PM2/VPS:

```text
MEDIR_RUNTIME_AUTORIZADO
→ SANITIZAR SOMENTE CAMPOS NECESSARIOS
→ LIGAR EVIDENCIA A TARGET + TIMESTAMP + HEAD
→ COMPARAR COM SNAPSHOT/HISTORICO
→ CLASSIFICAR DELTA
→ SOMENTE ENTAO PROPOR MUTACAO
```

Sem medição viva, a fronteira fica `UNKNOWN/BLOCKED`; não se escolhe um dos inventários antigos por narrativa.

Não publicar dump bruto de ambiente, `pm2_env`, secrets, tokens ou credenciais.

SEGREDO/CHEFE permanece autoridade final para mutações fora do escopo já autorizado.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
