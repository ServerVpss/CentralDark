---
title: "PIVETE-16 — secrets/connectors histórico"
status: "HISTORICAL_SNAPSHOT"
updated: 2026-08-14
---

# PIVETE-16 · SECRETS / CONNECTORS — HISTÓRICO

Este arquivo já inventariou nomes, IDs, contagens e conectores de uma fase anterior. Ele **não é catálogo atual de credenciais, tools, connectors ou permissões** e não entra mais no boot/context loader.

## Identidade atual

```text
SEGREDO/CHEFE = humano e autoridade final
SOL = coordenadora
PIVETE/HERMES = executor, preservação e continuidade
```

## Regras atuais

```text
SECRET_VALUE_NUNCA_NO_GIT=true
SECRET_VALUE_NUNCA_NO_CHAT=true
SECRET_VALUE_NUNCA_NO_LOG=true
TOOL_AVAILABILITY=MEDIR_NO_RUNTIME
CONNECTOR_STATE=MEDIR_NO_RUNTIME
DOCUMENTADO != ATIVO
UNKNOWN != PASS
```

Não reutilizar automaticamente desta fotografia antiga:

```text
nomes/quantidades de secrets
IDs de usuário/canal/projeto
quantidade de tools
connectors ativos
providers/modelos
paths de VPS
endpoints
cron/sync HUB
permissões
```

O antigo sync bidirecional `PIVETE-IA ↔ HUB` foi neutralizado no código canônico. Git permanece fonte estrutural da verdade; memória histórica remota não reescreve identidade/regra no repo.

Para qualquer integração atual:

```text
#ACORDAR
→ medir tool/connector disponível
→ trabalhar apenas com presença/status sanitizado
→ nunca ler ou reproduzir valor de credencial
```

O conteúdo anterior continua preservado no histórico Git para proveniência sem permanecer como instrução operacional viva.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
