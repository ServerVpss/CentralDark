# 04 — Gates de segurança (anti-destruição)

> Se **um** gate falhar → estado `EXIT_BLOCKED`. Sem “override” do agente.

---

## Gate G0 — Identidade do alvo

- [ ] Alvo é `lab` ou `prod`?
- [ ] Se `prod` → AUTH explícita com escopo escrito
- [ ] Path não invade áreas 🔒 sem PERMITO

## Gate G1 — Superfície de escrita

| Permitido sem AUTH extra | Proibido sem AUTH |
|--------------------------|-------------------|
| `mem/ChatOps-...` (planos) | `apps/bot-telegram/` |
| lab path dedicado | `apps/modulos/HERMES-CORE/` |
| docs de plano sob ordem | `apps/modulos/hub/` |
| | `ecosystem.config.cjs` |
| | `infra/caddy` |
| | secrets/ |

## Gate G2 — Git

- [ ] Sem force-push  
- [ ] Sem push de main suja da VPS  
- [ ] Branch/PR se for código de prod  

## Gate G3 — Runtime

- [ ] Sem `pm2 delete all` / `kill` / `reset --hard`  
- [ ] Sem restart em massa  
- [ ] whatsapp-server permanece no estado desejado (stopped)  

## Gate G4 — Secrets

- [ ] Nenhum token no chat  
- [ ] Nenhum `.env` commitado  
- [ ] BOOT #4 redige outputs  

## Gate G5 — Arquitetura

- [ ] Mudança é **extensão** (aditivo)  
- [ ] Não é V3/V4 rewrite  
- [ ] Rollback = flag / revert PR, não destruição  

## Gate G6 — Observabilidade

- [ ] `trace_id` presente  
- [ ] Evidência em path de lab/out  
- [ ] Critério de saída mensurável  

## Gate G7 — Circuit breaker

- [ ] LLM: timeout + max retries  
- [ ] Telegram notify: fail soft (não derruba orch)  
- [ ] Webhook: auth + rate limit  

## Assinatura de gate (orch)

```
gate_id: G0-G7
result: PASS | FAIL
blocker: string | null
trace_id: string
```
