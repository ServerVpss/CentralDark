# PRODUCTION GUARDRAILS CONTRACT — CentralDark

**MISSÃO:** Fechar o único gap que impede autonomia ponta-a-ponta real.
**BASE_SHA (main no momento da proposta):** `26d92270da4d5707dd378b942a36b07d4ef097c8`
**DATA:** 2026-08-05
**AUTOR:** Grok (contraproposta de revisão)

---

## 1. Diagnóstico (evidência no repositório)

### O que já funciona bem

| Componente | Arquivo | Status |
|---|---|---|
| Juiz / Promotor separados | `scripts/github-autonomia-promocao.mjs` | FORTE — receipt SHA-256, expected_head_sha, skipped ≠ PASS |
| Workflow de promoção | `.github/workflows/autonomia-promocao.yml` | FORTE — judge read-only → promote |
| Health pós-deploy (pontual) | `scripts/postdeploy-healthcheck.sh` | BOM — `/health/deep` score≥60 + stream + E2E opcional |
| Rollback MCP | `scripts/rollback-mcp.sh` | EXISTE — mas **manual** |
| Health VPS | `.github/workflows/vps-healthcheck.yml` | EXISTE — a cada **6h**, só **notifica** |
| Notificador | `scripts/agent-notify.mjs` | EXISTE — reutilizar |

### O gap real (FASE 9)

1. **Monitor contínuo de produção não dispara STOP_WRITE automático.**
2. **Rollback não é acionado por regra determinística** — só por comando manual.
3. **Sinais insuficientes:** o diagrama e o prompt exemplificam “3 erros 500/60s”. No código atual:
   - `postdeploy-healthcheck.sh` valida só no momento do deploy.
   - `vps-healthcheck.yml` olha PM2 online/errored + disco + load, a cada 6h, e **não executa rollback**.
4. **Evidência viva (CentralDark deploy_status em 2026-08-05):**
   - VPS **511 commits atrás** da main.
   - `CentralDark-ArsenalProxy` restarts=5576
   - `CentralDark-EliteHTTP` restarts=5308
   - `CentralDark-GraphPanel` restarts=260
   - `CentralDark-MCP` restarts=843
   - `CentralDark-WebhookDeploy` **stopped** (278 restarts)
   - `CentralDark-AiDiag` **stopped**

   Isso prova que o sistema **vê** anomalias, mas **não age** de forma autônoma (STOP_WRITE + rollback).

5. **PROMOTION_TOKEN:** no workflow ainda existe fallback `secrets.PROMOTION_TOKEN || github.token`. O contrato de autonomia proíbe o fallback silencioso.

6. **Segurança lateral:** `.env` aparece no root do tree da main (não deve estar versionado).

---

## 2. Contrato fechado (candidato)

Arquivo canônico proposto: `config/production-guardrails.json` (versionado).

```json
{
  "schema": "centraldark.production-guardrails.v1",
  "version": "1.0.0",
  "window_seconds": 60,
  "combine": "ANY",
  "cooldown_seconds": 300,
  "max_rollback_attempts": 1,
  "rollback_target": "PREVIOUS_PROVEN_ARTIFACT",
  "signals": {
    "http_5xx_count": {
      "threshold": 3,
      "window_seconds": 60,
      "action": "STOP_WRITE"
    },
    "http_5xx_rate": {
      "threshold": 0.05,
      "min_requests": 20,
      "window_seconds": 60,
      "action": "STOP_WRITE"
    },
    "latency_p99_ms": {
      "threshold": 2000,
      "window_seconds": 60,
      "action": "STOP_WRITE"
    },
    "health_deep_score": {
      "threshold_min": 60,
      "consecutive_failures": 3,
      "action": "STOP_WRITE"
    },
    "health_sha_mismatch": {
      "action": "STOP_WRITE",
      "note": "runtime SHA != last proven deploy SHA"
    },
    "pm2_restart_storm": {
      "threshold": 5,
      "window_seconds": 300,
      "processes_critical": ["CentralDark-MCP", "CentralDark-Hermes", "CentralDark-EliteHTTP"],
      "action": "STOP_WRITE"
    },
    "pm2_critical_stopped": {
      "processes": ["CentralDark-MCP", "CentralDark-WebhookDeploy"],
      "action": "STOP_WRITE"
    },
    "dependency_critical_down": {
      "action": "STOP_WRITE"
    }
  },
  "on_trigger": [
    "STOP_WRITE=true",
    "freeze_current_candidate",
    "rollback_to_previous_proven_artifact",
    "revalidate_health_and_sha",
    "emit_incident_receipt",
    "notify_telegram_painel"
  ],
  "on_rollback_failure": "PRODUCTION_BLOCKED"
}
```

### Regras invioláveis

- Todo sinal coletado por **código**, nunca por IA no caminho crítico.
- Health profundo = HTTP 200 **+** schema do body **+** score **+** **SHA do artefato**.
- SKIPPED / UNKNOWN / ausência de medição **nunca** viram PASS.
- Cooldown após STOP_WRITE para evitar flip-flop.
- Um único rollback automático; se falhar → PRODUCTION_BLOCKED + alerta crítico.
- Receipt de incidente preso a: mission_id (se houver), HEAD, artefato, causa, timestamp.

---

## 3. O que implementar (mínimo, sem paralelizar sistema)

1. **Evoluir** `scripts/postdeploy-healthcheck.sh` → incluir checagem de SHA do artefato.
2. **Criar** `scripts/production-guardrails.mjs` (loop curto ou cron 1m) que:
   - lê a política versionada;
   - coleta sinais (Caddy/logs, PM2 jlist, /health/deep, SHA);
   - se ANY → STOP_WRITE + chama rollback canônico + `agent-notify`.
3. **Evoluir** `scripts/rollback-mcp.sh` (ou unificar) para exigir artefato comprovado (hash + receipt).
4. **Endurecer** `.github/workflows/autonomia-promocao.yml`:
   - `PROMOTION_TOKEN` **obrigatório** (sem fallback para `github.token`).
5. **Testes de contrato** (adicionar aos existentes):
   - injetar 5xx → STOP_WRITE
   - injetar restart storm → STOP_WRITE
   - injetar SHA mismatch → STOP_WRITE
   - rollback OK → incidente registrado
   - rollback fail → PRODUCTION_BLOCKED
6. **Remover** `.env` do tracking (se ainda versionado) e garantir no `.gitignore`.

Não criar V2 paralelo. Melhorar o que já existe.

---

## 4. Resposta direta à pergunta “só HTTP 500 seria suficiente?”

**Não.**

HTTP 5xx é **necessário** mas **não suficiente**. Em produção real você precisa no mínimo de:

| Sinal | Por quê |
|---|---|
| 5xx count/rate | Erro clássico |
| Latency p99 | Serviço “vivo” mas inutilizável |
| Health deep + score | Lógica quebrada com 200 |
| SHA mismatch | Deploy errado / drift |
| PM2 restart storm | Crash loop sem 5xx visível no edge |
| Processo crítico stopped | WebhookDeploy/MCP parados |
| Dependência crítica | DB/Redis/provedor |

O diagrama e o prompt atual enfatizam 5xx; o código atual notifica mas **não fecha o loop** STOP_WRITE → rollback automático. Esse é o erro a corrigir.

---

## 5. VERDICT desta revisão

```
MISSION_ID=CENTRALDARK-AUTONOMIA-DETERMINISTICA-END-TO-END
BASE_SHA=26d92270da4d5707dd378b942a36b07d4ef097c8
COMPONENTES_CANÔNICOS_REUSED=github-autonomia-promocao, agent-notify, postdeploy-healthcheck, rollback-mcp, vps-healthcheck
NEW_COMPONENTS_JUSTIFIED=production-guardrails.mjs + config/production-guardrails.json (contrato fechado)
GAP=FASE 9 (monitor contínuo + auto STOP_WRITE + auto rollback)
SECURITY_NOTES=.env no tree; PROMOTION_TOKEN com fallback
VERDICT=VERIFIED_WITH_CAVEATS
```

Autonomia de promoção (merge) está em nível alto.  
Autonomia de **produção** (observar → parar → reverter) ainda não está fechada por código.

---

## 6. Próximo passo autorizado

Após merge deste PR documental (ou aprovação do contrato):

1. Implementar `config/production-guardrails.json` + coletor.
2. Ligar ao notificador e ao rollback existentes.
3. Adicionar testes de contrato.
4. Provar ciclo em ambiente seguro antes de declarar autonomia completa.

**Pivete não aperta botão de rotina.** Código fecha o loop.
