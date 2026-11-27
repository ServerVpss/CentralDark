---
title: "🔐 GOAL CD-BRIDGE-META40-2026r1109 — MCP OAuth/Pareamento"
status: "BLOCKED_RUNTIME"
date: 2026-11-09
updated: 2026-11-09T11:40:00Z
tags:
  - remote-bridge
  - mcp
  - oauth
  - pairing
  - caddy
  - meta-rsi-40
  - runtime
category: "RECEIPT"
sensitivity: INTERNAL
source: "CentralDark main + sessão Hermes Hostinger + probes públicos"
source_class: INTERNAL
source_rule: "DOCUMENTED != EXECUTED; HTTP200 != E2E_PROVED; UNKNOWN != PASS"
owner: "scripts/remote-bridge/ + infra/caddy/ + .github/workflows/caddy-telepainel-v2.yml"
consumer: "Remote Bridge / MCP nativo / Casa Commander"
writer: "HERMES"
---

# 🔐 GOAL CD-BRIDGE-META40-2026r1109

## Idempotência

```text
GOAL_ID=CD-BRIDGE-META40-2026r1109
DUPLICATE_ACTION=FORBIDDEN
ACTIVE_WRITER=HERMES
```

A sessão foi recuperada antes do delta. O dirty worktree de dependências permaneceu preservado e não entrou neste commit.

## Estado antes do delta

```text
https://mcp.centralldark.com/health = HTTP 200
backend observado = CentralDark Casa Commander / 9101
engine_connected = true
/.well-known/oauth-protected-resource = HTTP 404
/.well-known/oauth-authorization-server = HTTP 404
/device/pair/start = HTTP 404
/pair/start = HTTP 404
```

A causa observada é coerente com o drift documentado: o domínio público encaminhava para o Casa Commander 9101, enquanto OAuth e pareamento pertencem ao MCP nativo 9100.

## Fonte canônica encontrada

```text
apps/modulos/mcp/src/index.js
apps/modulos/mcp/dist/index.js
infra/caddy/mcp.Caddyfile
scripts/vps/main-pinned-microdeploy.sh
.github/workflows/vps-exec-selfhosted.yml
```

A fonte e o dist já contêm:

```text
/.well-known/oauth-protected-resource
/.well-known/oauth-authorization-server
/device/pair/start
/device/pair/status
/device/pair/approve
/device/heartbeat
/device/token/refresh
```

O `infra/caddy/mcp.Caddyfile` canônico aponta para:

```text
127.0.0.1:9100
```

## Delta aplicado

O owner existente `scripts/setup-centraldark-portal.sh` passou a incorporar o snippet MCP canônico no snippet Caddy já publicado pelo workflow existente.

Não foi criado:

```text
novo bridge
novo router
novo serviço
novo workflow publicado
novo executor
```

Commit publicado:

```text
9df00fbc0e2213c80150c824d005c9520fa1d596
```

Mensagem:

```text
fix: publish MCP OAuth routes with canonical Caddy owner
```

Readback GitHub:

```text
HEAD local = origin/main
9df00fbc0e2213c80150c824d005c9520fa1d596
```

## Prova de execução

O workflow Caddy existente foi disparado pelo push:

```text
run_id=42610884016
head=9df00fbc0e22
status=completed
conclusion=startup_failure
event=push
jobs=0
```

Interpretação:

```text
código publicado = PASS
workflow enfileirado = PASS
runner self-hosted executando = BLOCKED
Caddy reconciliado = UNKNOWN
runtime 9100 reconciliado = UNKNOWN
OAuth público corrigido = UNKNOWN
pareamento E2E = UNKNOWN
```

A API Hostinger consultada nesta superfície retornou lista de VPS vazia. O container Hermes não possui `tailscale` nem configuração SSH para acessar a Casa/VPS diretamente.

## Dirty worktree preservado

As alterações locais de dependências permanecem fora do commit:

```text
Bolt pnpm
npm package-locks
Poetry
Cargo.lock
Python urllib3
```

Não houve reset, clean, stash destrutivo ou sobrescrita.

## NEXT_CURSOR

```text
quando o runner self-hosted Linux estiver online:
→ executar run do workflow caddy-telepainel-v2.yml no HEAD 9df00fb
→ ler conclusão e logs
→ confirmar centraldark-native-mcp-http.service ativo
→ confirmar WorkingDirectory do runtime
→ confirmar 127.0.0.1:9100/health
→ confirmar domínio público não retorna 404 em OAuth discovery
→ POST /device/pair/start retorna 201 e schema válido
→ expirar o pair de probe
→ receipt final PASS ou BLOCKED causal
```

## Veredito

```text
SOURCE_DELTA=PASS
MAIN_SYNC=PASS
RUNTIME_DEPLOY=BLOCKED
PAIRING_E2E=UNKNOWN
FIXED_POINT_GLOBAL=NOT_REACHED
```
