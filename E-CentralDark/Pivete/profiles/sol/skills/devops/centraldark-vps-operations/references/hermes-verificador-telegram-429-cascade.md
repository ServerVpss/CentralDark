# HermesVerificador — Telegram 429 Rate-Limit Cascade Failure

**Data:** 2026-08-27  
**Sessão:** Subagent investigation  
**Estado final:** HermesVerificador STOPPED (intencional) até MCP fix + WebhookDeploy policy

---

## O que aconteceu

`CentralDark-HermesVerificador` atingiu **15.857 restarts** em loop próprio.

### Cadeia causal

1. **Telegram 429 (Too Many Requests)** — O daemon notifica via Telegram a cada scan (60s) + cada alerta novo + resumo horário. Quando múltiplos serviços entram em crash-loop simultâneo, o volume de notificações explode → API Telegram retorna 429 com `retry_after` decrescente (155s → 3s).

2. **Erro de notificação não tratado como fatal** — O `daemon.mjs` faz `try/catch` no `notifyFn` mas o erro 429 **não derruba o daemon** — ele só loga `warn`. Porém, o volume de tentativas de reenvio (sem backoff exponencial) satura o event loop.

3. **Auto-restart em cascata** — O daemon detecta crash-loop em outros serviços (ArsenalProxy 5.628 restarts, EliteHTTP 5.360, MCP 899, WebhookDeploy 328) e dispara `pm2 restart` para cada um (respeitando cooldown 30min e max 3/24h). Cada restart gera **novo alerta** → **nova notificação** → **mais 429**.

4. **Auto-detecção de crash-loop no próprio verificador** — A heurística `uptime < 5min && restarts > 20` (agent.mjs:107) flagava o **próprio HermesVerificador** como crash-loop → tentava se auto-restartar → reiniciava o daemon → perdia estado em memória (`estado` Map) → recomeçava do zero → loop infinito.

### Evidência (logs VPS)

```bash
# Error log - telegram 429 flood
tail /root/.pm2/logs/CentralDark-HermesVerificador-error.log
# 2026-08-26T04:58:09 até 05:00:44 — centenas de linhas "telegram falhou 429 retry after X"

# Out log - auto-restart cascade
tail /root/.pm2/logs/CentralDark-HermesVerificador-out.log
# "CRASH-LOOP detectado" para ArsenalProxy, EliteHTTP, MCP, WebhookDeploy
# "auto-restart: ✅ enviado (1/3 hoje)" para cada um
```

### PM2 status no momento da parada (2026-08-27 09:40)

| Serviço | Restarts | Status | Uptime |
|---------|----------|--------|--------|
| CentralDark-HermesVerificador | 15.865 | **stopped** | 0min |
| CentralDark-MCP | 899 | online | ~21h |
| CentralDark-WebhookDeploy | 328 | **stopped** | 0min |
| CentralDark-ArsenalProxy | 5.628 | online | ~21h |
| CentralDark-EliteHTTP | 5.360 | online | ~21h |

---

## Lições / Fixes necessários

### 1. Desabilitar auto-restart para serviços "conhecidamente instáveis"
O daemon não deve tentar restartar serviços que **já estão em crash-loop crônico** (ArsenalProxy, EliteHTTP). Adicionar lista de exclusão:

```js
const AUTO_RESTART_EXCLUDE = [
  'CentralDark-ArsenalProxy',
  'CentralDark-EliteHTTP',
  // adicionar conforme identificados
];
```

### 2. Backoff exponencial + jitter no notificador Telegram
Em `notify.mjs` (ou wrapper no daemon): ao receber 429, aguardar `retry_after + jitter` antes de reenviar. Não hammer a API.

### 3. Crash-loop detection: excluir o próprio verificador
O daemon não deve se monitorar para crash-loop (conflito de interesse). Opções:
- Ignorar `pm_id` do próprio processo no `escanear()` (já ignora `pm_id: 1` mas o verificador pode ter outro ID)
- Desabilitar auto-restart para `CentralDark-HermesVerificador`

### 4. Persistir estado de restarts 24h em disco (já faz) MAS carregar ANTES de decidir
O `autoRestart` lê `estado.restarts24h` do Map em memória, que zera no restart do daemon. O `.estado.json` é salvo mas **não é lido no `autoRestart`** — só no `carregarEstado()` do daemon. Fix: `autoRestart` deve ler do arquivo ou receber estado carregado.

### 5. Rate-limit interno de notificações
Max N notificações por janela (ex: 10/min), agrupar em digest se exceder.

---

## Decisão do CHEFE (2026-08-27)

> **Manter HermesVerificador PARADO** até:
> 1. MCP fix (porta 9100 EADDRINUSE resolvida — achar dono real da porta)
> 2. WebhookDeploy policy definida (parado por política, não deve ser revivido por "restart all" ou auto-restart)
>
> Depois: religar com **config limpa** (daemon.mjs corrigido + exclusões + backoff).

---

## Arquivos relacionados

- `/root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/daemon.mjs` — daemon principal
- `/root/CentralDark/apps/modulos/HERMES-CORE/agents/Log-Verificador/agent.mjs` — lógica de scan/auto-restart
- `/root/CentralDark/apps/modulos/HERMES-CORE/utils/notify.mjs` — notificador Telegram (precisa backoff)
- `scripts/vps/deploy-operational-guards.sh` — deploy do verificador (PM2_APP="CentralDark-HermesVerificador")

---

## Cross-ref

- Pitfall existente no SKILL.md: "RESTART ALL = CRASH-LOOP POR CIMA DE ÁRVORE QUEBRADA" — este caso é variação: **auto-restart em cascata** disparado pelo monitor, não por humano.
- Ver também: `centraldark-vps-runner` (runner self-hosted ≠ PM2 daemon management)