---
title: "🧭 Auditoria de estados parciais e desconhecidos — CentralDark"
status: "AUDIT_RECEIPT"
date: 2026-11-09
updated: 2026-11-09T10:44:06Z
tags:
  - centraldark
  - auditoria
  - pending
  - unknown
  - partial
  - runtime
category: "RECEIPT"
sensitivity: INTERNAL
source: "main + Gemini exploration agents + read-only repository scan"
source_class: INTERNAL
source_rule: "DOCUMENTED != EXECUTED; UNKNOWN != PASS"
owner: "docs/CONSCIENCIA/RECEIPTS/"
consumer: "SOL/HERMES/orchestrator"
writer: "HERMES"
---

# 🧭 Auditoria de estados parciais e desconhecidos

## Intenção

Mapear estados `PENDING`, `PARTIAL`, `UNKNOWN`, `BLOCKED`, `NOT_PROVEN`, `QUEUED`, `TRUNCATED` e `INCOMPLETE` no escopo CentralDark, separando documentação, código, scheduler, processo e runtime.

## Método

```text
Frente A: documentação, owners e receipts
Frente B: scripts, gates, workflows, PM2, cron, locale, sandbox e runtime
Modo: somente leitura
Modelos: Gemini 3.6 Flash (duas frentes)
Writer: Hermes/orquestrador
```

## Resultado medido

```text
Documentos escaneados: 2247
Fontes atuais de estado identificadas: 8
Fontes históricas/legadas: 3
Achados de código/runtime: 17
```

Estados documentais atuais:

```text
PENDING: 5
PARTIAL: 5
UNKNOWN: 5
BLOCKED: 2
LOADED/ACTIVE/CURRENT: 4
ABERTA/OPEN: 3
```

Estados de código/runtime:

```text
BLOCKED: 6
PENDING: 3
UNKNOWN: 6
PARTIAL: 2
```

## Owners e próximos testes

| Owner / caminho | Estado | Evidência | Próximo teste |
|---|---|---|---|
| `docs/PENDENCIAS.md` | PENDING | DNS/Caddy e módulos sem produto provado; legado de 234 docs ainda não reconciliado | Testes HTTP, definição de escopo e decisão item a item |
| `docs/CENTRALDARK-MAPA-ANCORADO.md` | PENDING/UNKNOWN/BLOCKED/PARTIAL | H1–H6 abertas; TLC23/HORN bloqueado; vários gates sem promoção | Validar hipóteses, executar HORN e registrar contraprova |
| `CENTRALDARK_AI_BOOT.yaml` | LOADED/ACTIVE/CURRENT | Invariantes carregadas; não substitui prova de runtime | Resolver HEAD, owner, writer e evidência em cada boot |
| `.agents/skills/centraldark-operational-method/SKILL.md` | PARTIAL | Matriz de estados existe | Aplicar a matriz ao mesmo delta e readback |
| `docs/AGENTS.md` | PENDING/UNKNOWN | HUD exige prova atual | Readback do mesmo SHA/consumer |
| `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` | CURRENT | Snapshot documental, não runtime universal | Recalibrar contra PENDENCIAS e runtime |
| `docs/ARQUITETURA/API-ROTAS-PUBLICAS.md` | UNKNOWN | Estados de API definidos, live não medido | Medir reconnect/circuit breaker |
| `docs/TRIGGER-FABRIC/LIVE_STATE.md` | UNKNOWN/NOT_PROVEN | fixed point e deploy não provados | Medir heartbeat/status real |
| `docs/INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md` | PENDING | S1–S8 e build/VPS não provados | Executar gates de build e deploy |
| `scripts/agent-call.mjs` | BLOCKED/PENDING | Gate bloqueia sem contexto real | Rodar gate com dados válidos e contraprova |
| `scripts/centraldark-inventory-reconcile.sh` | UNKNOWN | CLI/Hermes/MCP runtime ainda não provados | Executar `--pulse --plan` e `--diff` |
| `scripts/trigger-fabric/centraldark_full_trigger_boot.py` | BLOCKED | recipe/entry/router execution gaps | Rodar `--self-test` sem mutação |
| `scripts/trigger-fabric/engine_gap_fixed_point.py` | UNKNOWN | runtime/CI/CP/invocation ausentes | Fornecer valores reais e contraprova |
| `scripts/lupa/horn-reuse-fixed-point.mjs` | BLOCKED | header/gate desconhecido ou stale | Executar teste do HORN com header válido |
| `MODULES/HUB/hub-connections.registry.json` | PARTIAL | conexões declaradas, runtime não provado | Readback de cada owner |
| `.github/workflows/hermes-core-signal-watch.yml` | BLOCKED | PM2 verify falha ou candidato não provado | `pm2 describe` e workflow no mesmo HEAD |
| `.github/workflows/vps-exec-selfhosted.yml` | BLOCKED | PM2/systemd runtime não provado | `pm2 jlist`, systemd e health |
| `infra/systemd/centraldark-desktop-commander-watchdog.sh` | PENDING | timer documentado; estado local não provado | `systemctl is-active` e processo remoto |
| `docs/CRON_JOBS_SETUP.md` | UNKNOWN | jobs declarados; receipts de execução ausentes | Consultar `cron.job_run_details` |
| `configs/hermes-desktop-plugins/locale-pt-br/plugin.js` | UNKNOWN | payloads e registry não provados | Teste de chaves e carregamento |
| `apps/modulos/Bolt/docker-compose.yml` | UNKNOWN | compose declarativo | `docker compose config` e health readback |
| `.pm2/contracts/hermes-operational-lock.json` | PARTIAL | locks existem; estado vivo não confirmado | `pm2 jlist`, `pm2 describe` e health |
| `MODULES/HUB/receipts/2026-09-24-bot-hermes-gateway-fix.md` | BLOCKED | receipt histórico sem execução comprovada | Executar gateway e readback |
| `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` | UNKNOWN | Casa Commander/Tailscale/Supabase não provados nesta superfície | Executar na Casa e medir health |

## Histórico separado

```text
docs/STATE.md = HISTORICAL
 docs/CONSCIENCIA/07-PENDENCIAS-E-HORARIO.md = HISTORICAL/SUBSTITUÍDO
 .artifacts/meta-lupa-mission/*.receipt.json = HISTORICAL/ARQUIVADO
```

Esses itens não entram como estado vivo.

## Limitações

```text
Runtime Hostinger/VPS: UNKNOWN
Casa: não acessada nesta auditoria
Nenhum segredo lido
Nenhuma mutação executada
Um artefato temporário pedido por subagente em /tmp foi recusado pelo guard; nenhuma alteração ocorreu
```

## Veredito

```text
AUDITORIA_DOCUMENTAL = PASS
AUDITORIA_CODIGO = PASS
RUNTIME_GLOBAL = UNKNOWN
FIXED_POINT_GLOBAL = UNKNOWN
PROMOÇÃO_AUTOMÁTICA = NÃO
```

## NEXT_CURSOR

```text
SELECIONAR UM OWNER
→ PESQUISAR NA WEB SE HOUVER LACUNA ATUAL
→ EXECUTAR O TESTE DISCRIMINANTE
→ READBACK
→ CONTRAPROVA
→ ATUALIZAR PENDENCIA OU PROMOVER ESTADO
→ RECEIPT
```
