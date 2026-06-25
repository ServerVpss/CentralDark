# Plano — Guardião v2 + Analista (Sub-agente)

## Visão geral

Hoje o Guardião só vigia arquivos em `docs/CONSCIENCIA/`. Vamos transformá-lo em um **sistema de 2 camadas**:

```text
┌─────────────────────────┐      ┌──────────────────────────┐      ┌──────────────┐
│   GUARDIÃO (olho)       │ ───▶ │  ANALISTA (cérebro+fila) │ ───▶ │   Telegram   │
│  - vigia arquivos       │      │  - dedup / agrupa        │      │   Mega Painel│
│  - vigia Docker         │      │  - prioriza              │      │              │
│  - vigia PM2            │      │  - formata bonito        │      │              │
│  - detecta anomalias    │      │  - fila com rate-limit   │      │              │
└─────────────────────────┘      └──────────────────────────┘      └──────────────┘
         publica eventos              consome eventos,
         em um arquivo de fila        despacha controlado
         (JSONL append-only)
```

O Guardião **só detecta e enfileira**. O Analista **decide se, quando e como** notifica. O Mega Painel continua recebendo heartbeat em tempo real (sem fila), porque painel não spamma ninguém.

---

## Etapa 1 — Registrar a regra oficial (antes de codar)

Seguindo a hierarquia de memória (`docs/CONSCIENCIA/` primeiro):

- Criar `docs/CONSCIENCIA/REGRA-OFICIAL-GUARDIAO-V2-ANALISTA.md` com:
  - Arquitetura das 2 camadas
  - Regras de rate-limit (máx 5 msgs / 60s, cooldown 90s, jitter 5–15s)
  - Política de dedup e agrupamento
  - Severidades e prioridades
- Espelhar em `mem://features/guardiao-v2-analista`
- Adicionar entrada em `APRENDIZADOS.md` (#253)

## Etapa 2 — Detectores novos no Guardião

Novos módulos em `infra/guardiao/detectores/`:

- `docker_watcher.py` — usa `docker events` + `docker stats --no-stream` a cada 30s. Detecta:
  - container `died` / `oom`
  - restarts ≥3 em 5min
  - CPU >90% por 3 amostras seguidas
  - MEM >85% do limite por 3 amostras
- `pm2_watcher.py` — usa `pm2 jlist` a cada 30s. Detecta:
  - `restart_time` subindo ≥3 em 5min
  - status `errored` / `stopped` (exceto whitelist como `whatsapp-server`)
  - `memory` acima de threshold do `ecosystem`
  - `unstable_restarts` >0
- `anomaly_engine.py` — janela deslizante em memória + thresholds do YAML.

Whitelist editável em `guardiao_rules.yaml`:
```yaml
ignorar:
  pm2: ["whatsapp-server"]   # stopped é estado desejado
  docker: []
```

## Etapa 3 — Fila de eventos (handoff Guardião → Analista)

Arquivo: `infra/guardiao/queue/events.jsonl` (append-only, rotacionado a 5MB).

Cada linha:
```json
{"ts":"...","source":"pm2","severity":"warning","key":"pm2.restart.guardiao-consciencia","title":"...","body":"...","dedup_window_s":300,"payload":{...}}
```

Guardião **só escreve**. Nunca chama Telegram direto (exceto erro fatal do próprio Guardião).

## Etapa 4 — Analista (novo processo PM2)

Novo serviço: `infra/guardiao/analista/`

- `analista.py` — loop principal, lê `events.jsonl` (tail -f style), processa fila in-memory
- `formatter.py` — templates Markdown bonitos por tipo de evento (com emoji, seção, timestamp BR, link pro painel)
- `rate_limiter.py` — token bucket:
  - **5 mensagens / 60s** (burst)
  - Após burst esgotado → cooldown **90s**
  - Jitter aleatório **5–15s** entre envios
  - Severidade `critico` ignora rate-limit (mas dedupa)
- `dedup.py` — chave = `event.key`; janela default 5min; se repetir, **agrupa** (`"⚠️ pm2.restart × 7 nos últimos 5min"`) em vez de spammar
- `priority_queue.py` — heap por severidade: `critico` > `erro` > `aviso` > `info`
- PM2: `guardiao-analista` separado do `guardiao-consciencia`

## Etapa 5 — Mega Painel continua em tempo real

`heartbeat.py` do Guardião continua direto pro painel (sem passar pelo Analista). Adicionar campos novos:
- `docker_containers_ok` / `_alerta`
- `pm2_processes_ok` / `_alerta`
- `eventos_na_fila`
- `ultimo_evento_critico`

## Etapa 6 — Testes

- `tests/test_anomaly_engine.py` — janela deslizante, thresholds
- `tests/test_rate_limiter.py` — burst, cooldown, jitter
- `tests/test_dedup.py` — agrupamento, janela
- `tests/test_formatter.py` — snapshot dos templates

## Etapa 7 — Deploy

1. Commit + push
2. VPS: `git pull`, `pip install -r requirements.txt` (adicionar `docker` SDK)
3. `pm2 start ecosystem.config.cjs` → sobe `guardiao-analista`
4. `pm2 restart guardiao-consciencia`
5. `pm2 save`
6. Validação: forçar 10 eventos seguidos e confirmar que chegam **agrupados/rate-limited** no Telegram

---

## Detalhes técnicos

**Dependências novas:** `docker` (SDK Python). PM2 já dá pra ler via `subprocess` (`pm2 jlist`).

**Permissões:** Guardião precisa do socket Docker (`/var/run/docker.sock`) — rodar como root (já é o caso) ou adicionar ao grupo `docker`.

**Persistência da fila:** JSONL append-only sobrevive a restart do Analista — ele relê do offset salvo em `queue/.offset`.

**Severidades:**
| Severidade | Rate-limit | Dedup | Exemplo |
|---|---|---|---|
| `critico` | ignora | 60s | OOM, container morto sem restart |
| `erro` | aplica | 300s | restart loop, PM2 errored |
| `aviso` | aplica | 600s | CPU/MEM alto sustentado |
| `info` | aplica + agrupa | 900s | container started/stopped normal |

**Não vou mexer em:** `notifier.py` (continua funcional, mas só o Analista chama agora), `classificador.py`, `guardiao_rules.yaml` (só adiciona seção, não remove).

---

## O que NÃO está no escopo desta entrega

- Modo `auto` do Guardião (continua travado até 08/07/2026)
- Auto-restart de containers/processos com problema (só notifica; ação humana)
- Dashboard web do Analista (só Telegram + Mega Painel)

---

## Confirma o plano?

Se OK, começo pela **Etapa 1** (registrar regra oficial em `docs/CONSCIENCIA/`) e sigo na ordem. Cada etapa eu te aviso antes de pular pra próxima nas que envolvem deploy na VPS.