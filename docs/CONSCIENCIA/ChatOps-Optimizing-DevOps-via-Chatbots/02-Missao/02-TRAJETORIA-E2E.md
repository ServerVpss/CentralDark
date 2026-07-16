# 03 — Trajetória END-TO-END (de fora a fora)

> Do zero (fora) até fluxo online (com evidência), **sem destruir infra**.  
> Cada fase = gate. Falha no gate = **stop**, não “força”.

---

## Mapa visual

```
FORA                          LIMITE                         DENTRO (só AUTH)
─────                         ──────                         ────────────────
[0] Intenção operador
[1] Plano + fio da missão
[2] Lab Docker isolado  ──────┐
[3] LLM + skills + agents     │  sandbox livre
[4] Loop critic/refino        │
[5] Critério de saída OK      │
[6] Demo/health no lab  ──────┘
[7] NOTIFY Telegram (lab OK)
[8] ═══ AUTH OPERADOR ═══
[9] Strangler: flag off em prod
[10] Espelho aditivo mínimo
[11] Observabilidade + breaker
[12] Flag on gradual
[13] NOTIFY Telegram (prod OK)
[14] Deprecação legado (se houver)
```

---

## FASE 0 — Intenção e escopo

| Item | Conteúdo |
|------|----------|
| Entrada | Mensagem do operador |
| Saída | Escopo escrito (lab only / prod depois) |
| BOOT | #6 |
| Gate | Escopo não menciona secrets nem force-push |
| Proibido | Começar a codar prod |

## FASE 1 — Congelar plano (este pacote)

| Item | Conteúdo |
|------|----------|
| Entrada | Ordem “cria o planão” |
| Saída | Arquivos em `mem/ChatOps-.../` |
| BOOT | #6 |
| Gate | Planos versionados no path mem |
| Status | **FASE ATUAL (documentação)** |

## FASE 2 — Preparar HOST (sem tocar prod)

| Item | Conteúdo |
|------|----------|
| Entrada | AUTH: “pode preparar lab path” |
| Saída | Path tipo `/root/chatops-lab/` (fora de apps protegidos) |
| BOOT | #1 + #6 |
| Gate | Path **não** é `apps/modulos/*` protegido; não altera ecosystem PM2 prod |
| Inclui | compose skeleton, volumes, rede interna, .env.example **sem secrets** |

## FASE 3 — Subir sandbox Docker

| Item | Conteúdo |
|------|----------|
| Entrada | AUTH: “sobe o lab” |
| Saída | Containers healthy: `orch`, `runner`, `critic`, (opcional) `llm-proxy` |
| BOOT | #1 + #6 |
| Gate | `docker compose ps` healthy; porta lab só bind local se pedido |
| Proibido | Mapear volume em `secrets/` de produção |

## FASE 4 — Wiring LLM + internet + websearch

| Item | Conteúdo |
|------|----------|
| Entrada | Endpoint LLM (local ou gateway) **já existente** |
| Saída | orch consegue 1 completion de teste |
| BOOT | #2 + #6 |
| Gate | Timeout + circuit breaker configurados; sem key em git |
| Nota | Operador injeta secret no runtime do lab, não no chat |

## FASE 5 — Materializar agentes por setor

| Item | Conteúdo |
|------|----------|
| Entrada | Matriz `06-MATRIZ-AGENTES-SETORES.md` |
| Saída | 1 processo/container ou 1 worker por papel + skills em volume |
| BOOT | #6 despacha; #5/#2/#4 implementam aditivo |
| Gate | Cada agente tem: prompt, tools permitidas, timeout, log path |
| Loop | Crítico recusa agente sem contrato de handoff |

## FASE 6 — Pipeline de missão (loop até critério)

| Item | Conteúdo |
|------|----------|
| Entrada | Missão exemplo (ex: “health report lab only”) |
| Saída | N iterações critic→refino até PASS |
| BOOT | #6 + #2 (code-exec) + #4 (scan) + #7 (telemetria lab) |
| Gate | Critérios em `05-...md` |
| Host | cron/webhook a cada N min enquanto `state=RUNNING` |

## FASE 7 — Evidência + artefato lab

| Item | Conteúdo |
|------|----------|
| Entrada | PASS do critério |
| Saída | `/lab/out/report.md` + logs + health JSON |
| BOOT | #6 |
| Gate | Report contém Feito/Evidência/Pendência |

## FASE 8 — Telegram (lab)

| Item | Conteúdo |
|------|----------|
| Entrada | EXIT_OK lab |
| Saída | 1 mensagem Card/texto autorizado (sem secrets) |
| BOOT | #6 |
| Gate | Usa canal de notify **já existente** e permitido; não inventa bot novo em prod |
| Proibido | Espalhar token; usar notify experimental sem ordem |

## FASE 9 — STOP HARD (produção)

| Item | Conteúdo |
|------|----------|
| Estado | `AWAIT_AUTH` |
| BOOT | #6 |
| Gate | Operador diz explicitamente escopo de produção |
| Sem AUTH | **Fim da trajetória automática** |

## FASE 10 — Strangler em produção (só AUTH)

| Item | Conteúdo |
|------|----------|
| Entrada | “PERMITO espelho fase X” |
| Saída | Feature flag `chatops_lab_bridge=false` no estado vivo |
| BOOT | #5 + #1 + #6 |
| Gate | Zero substituição de bot-telegram / hermes / hub core |
| Modo | Aditivo: rota ou worker novo ao lado |

## FASE 11 — Observabilidade + breaker (prod AUTH)

| Item | Conteúdo |
|------|----------|
| Saída | `trace_id` em logs leves; breaker em canais externos |
| BOOT | #7 + #4 + #6 |
| Gate | Não aumenta write storm no git; estado vivo em Supabase/log |

## FASE 12 — Flag on gradual (AUTH)

| Item | Conteúdo |
|------|----------|
| Saída | % tráfego ou admin-only |
| Gate | Rollback = flag false (sem reset hard) |

## FASE 13 — NOTIFY prod + handoff humano

| Item | Conteúdo |
|------|----------|
| Saída | Telegram: fluxo online + link evidência |
| BOOT | #6 |

## FASE 14 — Deprecação (opcional, AUTH forte)

| Item | Conteúdo |
|------|----------|
| Só se | Novo caminho 100% substitui e métricas estáveis |
| Modo | Strangler complete; não “delete all day 1” |

---

## Onde a falha destrói infra (e como a trajetória evita)

| Falha clássica | Mitigação na trajetória |
|----------------|-------------------------|
| Agente edita prod no loop | Fases 2–8 só lab; 9+ AUTH |
| `pm2 delete` / restart em massa | Gate BOOT #1 + inventário; proibido no prompt dos agents |
| Push main suja | Proibição global |
| Rewrite V3 | Fio da missão |
| Secret no log | BOOT #4 redaction |
| Loop infinito de custo LLM | max_rounds + budget no orch |
| Webhook abre o mundo | Bind local + auth no webhook |

---

## Ordem mínima de autorização (operador)

1. “Planão ok”  
2. “Pode criar path lab”  
3. “Sobe compose lab”  
4. “Liga LLM no lab”  
5. “Roda missão X no lab”  
6. (opcional) “PERMITO espelho prod fase N”  
