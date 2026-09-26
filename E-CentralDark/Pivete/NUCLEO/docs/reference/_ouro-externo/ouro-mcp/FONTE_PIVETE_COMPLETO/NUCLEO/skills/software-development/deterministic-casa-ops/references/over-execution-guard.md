# Over-Execution Guard — Regra Dura

**Origem:** Incidente #6 (caderno-de-incidentes), 06/08/2026.

**Padrão:** Usuário mandou "Desliga" (referindo-se ao projeto `recargas-brasil-v2`). Agente matou o projeto alvo **E** o Hermes gateway (3 instâncias) — infraestrutura da Casa.

**Causa raiz:** Não separou "projeto alvo" de "infraestrutura base". Assumiu "desliga tudo" em vez de "desliga o alvo". Não confirmou antes de matar infraestrutura.

**Regra dura:**
```
"mata X" = mata SÓ X.
Infraestrutura (Hermes, gateway, cron, cronjob, api_server, vps processes) só com ordem explícita.
Separar "projeto alvo" de "infraestrutura base" ANTES de executar kill.
```

**Checklist antes de kill:**
- [ ] Qual o alvo exato do pedido?
- [ ] O que é projeto vs infraestrutura?
- [ ] Infraestrutura requer ordem explícita separada?
- [ ] Se dúvida → confirmar com Pivete antes de matar.

**Punição:** Incidente registrado no caderno-de-incidentes #6. Reincidência = perde ponto.