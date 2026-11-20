---
title: "REGRA OFICIAL GUARDIAO V2 ANALISTA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Regra Oficial — Guardião v2 + Analista (Sub-agente)

- **Título:** Arquitetura de 2 camadas: Guardião (olho) + Analista (cérebro/fila)
- **Data:** 25/06/2026
- **Responsável pela decisão:** Pivete
- **Onde foi registrado:** este arquivo + espelho em `mem://features/guardiao-v2-analista`
- **Prioridade:** ALTA — define como notificações do Guardião devem operar daqui pra frente

---

## 1. Por que essa regra existe

O Guardião v1 só vigiava arquivos em `docs/CONSCIENCIA/` e enviava notificação direta ao Telegram. Ao expandir o escopo (Docker, PM2, anomalias), o risco de **spam/banimento no Telegram** ficou real. A solução é separar **detecção** de **despacho**.

## 2. Arquitetura oficial

```text
GUARDIÃO (detecta) ──► fila JSONL ──► ANALISTA (decide+envia) ──► Telegram
                                                              └─► Mega Painel (direto, sem fila)
```

- **Guardião** (`infra/guardiao/guardiao.py` + `detectores/`):
  - Vigia arquivos, Docker e PM2.
  - **Nunca** chama Telegram direto (exceto erro fatal do próprio Guardião).
  - Publica eventos em `infra/guardiao/queue/events.jsonl` (append-only).
  - Continua mandando heartbeat direto pro Mega Painel.

- **Analista** (`infra/guardiao/analista/`, processo PM2 separado `guardiao-analista`):
  - Lê a fila, deduplica, agrupa, prioriza, formata e despacha pro Telegram.
  - Aplica rate-limit pra não tomar ban.

## 3. Rate-limit oficial

| Parâmetro | Valor |
|---|---|
| Burst máximo | 5 mensagens / 60s |
| Cooldown após burst | 90 segundos |
| Jitter entre envios | 5–15s aleatório |
| Severidade `critico` | ignora rate-limit (mas dedupa) |

## 4. Severidades e dedup

| Severidade | Rate-limit | Janela dedup | Exemplo |
|---|---|---|---|
| `critico` | ignora | 60s | OOM, container morto sem restart |
| `erro` | aplica | 300s | restart loop, PM2 errored |
| `aviso` | aplica | 600s | CPU/MEM alto sustentado |
| `info` | aplica + agrupa | 900s | container start/stop normal |

Quando um mesmo `event.key` se repete dentro da janela, o Analista **agrega** num contador (`"⚠️ pm2.restart × 7 nos últimos 5min"`) em vez de mandar várias mensagens.

## 5. Thresholds de anomalia (default)

Editáveis em `guardiao_rules.yaml`, seção `anomalia:`

- PM2 `restart_time` aumenta ≥3 em 5min → `erro`
- PM2 status `errored` → `critico`
- PM2 status `stopped` (não whitelistado) → `aviso`
- Docker container `died` sem restart em 30s → `critico`
- Docker `oom_killed` → `critico`
- CPU >90% por 3 amostras seguidas (90s) → `aviso`
- MEM >85% do limite por 3 amostras → `aviso`

## 6. Whitelists

`guardiao_rules.yaml`:
```yaml
ignorar:
  pm2: ["whatsapp-server"]   # stopped é estado desejado
  docker: []
```

## 7. Mega Painel

Continua recebendo heartbeat **direto** (sem fila), a cada 60s. Campos novos:
- `docker_containers_ok` / `docker_alertas`
- `pm2_processes_ok` / `pm2_alertas`
- `eventos_na_fila`
- `ultimo_evento_critico`

## 8. Trava de segurança mantida

O modo `auto` do Guardião continua **bloqueado até 08/07/2026** (ver `REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md`). Esta regra v2 não altera essa trava.

## 9. Referências cruzadas

- [Hierarquia de Memória](./REGRA-OFICIAL-HIERARQUIA-MEMORIA.md)
- [Guardião — modo propor](./REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md)
- [GUARDIAO-DA-CONSCIENCIA.md](./GUARDIAO-DA-CONSCIENCIA.md)
- [APRENDIZADOS.md](./APRENDIZADOS.md) — aprendizado #253

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
