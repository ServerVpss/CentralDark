# Doutrina infra-extend — gaps para o GPT (GitHub)

**Data:** 2026-07-14  
**Para:** ChatGPT / IAs no GitHub  
**NÃO é ordem de executar na VPS sem PERMITO.** Só mapa do que ainda **não** tem a doutrina.

## Doutrina selada (Pivete)

```
Estabilidade de produção.
Alteração = extensão segura (nunca substituição / V3-V4).
Zero regressão.
Preservar DB e arquitetura legado.
Atualizar o que já existe — não inventar sistema paralelo.
```

Registro: `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` · `docs/RELATORIOS/2026-07-14-sessao-grok-registro-completo.md`

## Onde ainda falta a doutrina (auditoria sessão Grok)

| Área | Path | Gap |
|------|------|-----|
| Hermes Executor | `apps/modulos/HERMES-CORE/agents/Executor/` | Sem filtro “extend, not V3” no prompt/regras do agente |
| Deploy-Watcher | `apps/modulos/HERMES-CORE/agents/Deploy-Watcher/` | Idem |
| Auto-Diagnostico | `apps/modulos/HERMES-CORE/agents/Auto-Diagnostico/` | Idem |
| Critic / Knowledge / GraphRAG / Universal-Handler | `apps/modulos/HERMES-CORE/agents/*` | Revisar se instruções permitem “reconstruir do zero” |
| AGENTS.md MultiZap | `docs/AGENTS.md` | Ainda identidade **MultiZap monorepo** — desatualizado vs CentralDark |
| Planos RCD / free-LLM / auto-heal | planos web Grok (bridge) | Só depois da borda estável; não subir stack paralelo |

## O que **já** foi feito (não reabrir)

- Fail2ban harden 2026-07-14 (bantime 24h + recidive + ignoreip Pivete) — ver `docs/RELATORIOS/2026-07-14-fail2ban-harden.md`
- MCP TEMP público **fechado** (PERMITO Pivete)
- Handoff OAuth MCP: issue #204

## O que o GPT **pode** fazer no GitHub (read/propose)

1. Ler doutrina no histórico de decisões.  
2. Propor **patch mínimo** (diff) por agente Hermes: 1 bloco de regra “extend-only” no system/README do agente — **sem** reescrever o agente.  
3. Propor atualização de `docs/AGENTS.md` de MultiZap → CentralDark (só texto, sem apagar legado útil).  
4. **Não** aplicar na VPS, **não** PM2 restart, **não** Flink/Kafka.  
5. Entregar como PR ou comentário na issue — Pivete aprova.

## Fora de escopo desta issue

- PasswordAuthentication off (PERMITO separado)  
- Flink multi-agent SDR  
- Nova release plugin ChatGPT  
- MCP OAuth do ChatGPT (continua issue #204)

## Critério de pronto (doutrina)

- [ ] Cada agent Hermes listado tem 1 parágrafo explícito anti-V3 / extend-only  
- [ ] `docs/AGENTS.md` não se apresenta mais como MultiZap-only  
- [ ] Nenhum PR inventa serviço paralelo “V2/V3” do que já existe (Sentinela, Guardião, HermesVerificador, fail2ban)
