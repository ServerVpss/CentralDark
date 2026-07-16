# 02 — Plano do Fio da Missão

> Diretriz **inviolável**. Se conflitar com pedido de velocidade, **vence o fio**.

---

## Texto integral (canônico)

Revisar criticamente qualquer planejamento DE INFRA antes da execução, aplicando filtros rigorosos para barrar regressões, riscos operacionais ou complexidade inútil. Garantir a estabilidade absoluta do ambiente de produção, exigindo que toda e qualquer alteração seja uma extensão segura (nunca uma substituição) e garantindo zero regressão no que já funciona. Aplique o rigor técnico em qualquer projeto alvo, preservando o banco de dados e a arquitetura legado. Sendo assim, não faça V3, V4, etc. Atualize e melhore o que já existe!

---

## Tradução operacional (checklist)

Antes de **qualquer** passo de infra:

| # | Pergunta | Se NÃO → |
|---|----------|----------|
| 1 | É só leitura / plano / lab isolado? | Exige AUTH |
| 2 | É extensão aditiva (plugin/middleware/flag)? | Replanejar |
| 3 | Preserva fluxos atuais (bots, PM2, gateway)? | Bloquear |
| 4 | Rollback simples (flag off / sem force-push)? | Bloquear |
| 5 | Sem secrets em log/chat/repo? | Bloquear |
| 6 | Sem V3/V4 (rewrite)? | Bloquear |
| 7 | Há `trace_id` + evidência? | Bloquear |
| 8 | Critic passou? | Refinar |

## Mapeamento para técnicas

| Frase do fio | Técnica |
|--------------|---------|
| Revisar criticamente planejamento de infra | Critic gate + BOOT #4/#1 |
| Barrar regressões | Testes + strangler + flags |
| Extensão segura, nunca substituição | Open/Closed aditivo |
| Zero regressão no que já funciona | Feature toggle off default |
| Preservar banco e legado | Sem migration destrutiva sem AUTH |
| Não faça V3/V4 | Refino do existente |

## Quem aplica o fio

- **BOOT #6** aplica em todo plano antes de despachar
- **BOOT #4** valida segurança
- **BOOT #1** valida impacto VPS/PM2
- Operador é a autoridade final em produção

## Violação = estado EXIT_BLOCKED

Orch **não** “tenta mesmo assim”.  
Registra pendência, notifica se autorizado, para.
