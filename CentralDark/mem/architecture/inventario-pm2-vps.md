---
name: Inventário PM2 VPS — snapshot histórico
description: Evidência histórica de 05/07/2026; não governa runtime atual sem medição viva.
type: architecture
status: HISTORICAL_SNAPSHOT
---

# Inventário PM2 — snapshot histórico de 05/07/2026

Este registro preserva proveniência de uma fotografia antiga da VPS. Ele **não autoriza inferir o estado PM2 atual** e não deve competir com medição viva.

O conteúdo detalhado anterior permanece disponível no histórico Git.

```text
PM2_RUNTIME_CURRENT=UNKNOWN_UNTIL_LIVE_MEASUREMENT
HISTORICAL_SNAPSHOT_GOVERNS_PRESENT=false
ROOT_ECOSYSTEM_CONFIG=UNKNOWN_UNTIL_VPS_PROVES
UNKNOWN_IS_NOT_PASS=true
```

## Divergências conhecidas

- este snapshot divergia de `docs/CONSCIENCIA/INVENTARIO-PM2-VPS.md` sobre `CentralDark-EliteHTTP`;
- superfícies diferentes usavam `MCP-CentralDark` e `CentralDark-MCP`;
- os snapshots históricos apontavam `ecosystem.config.js`, enquanto o repositório passou a versionar `ecosystem.config.cjs`; nenhum desses fatos isolados prova qual configuração está carregada na VPS;
- IDs, nomes, cwd, scripts, estado e env do snapshot devem ser tratados como **histórico**, não presente.

## Uso permitido

```text
SNAPSHOT_HISTORICO
→ COMPARAR COM MEDICAO VIVA AUTORIZADA
→ EXTRAIR DELTA
→ PRESERVAR PROVENIENCIA
```

Sem instrumento vivo, retornar `UNKNOWN/BLOCKED_EXTERNAL` para a fronteira PM2 dependente de VPS e continuar somente trabalho independente.

Nunca publicar dump bruto de ambiente, `pm2_env`, secrets, tokens ou credenciais em logs, comentários, receipts ou artefatos.
