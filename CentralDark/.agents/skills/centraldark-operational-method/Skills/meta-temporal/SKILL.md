---
name: centraldark-meta-temporal-adapter
description: "Adaptador da Skill Mae para META-TEMPORAL; preserva owner original e utiliza Hermes existente."
owner: centraldark-operational-method
canonical_source: "AGENTS.md"
status: OPERATIONAL_ADAPTER
---

# META-TEMPORAL

**Finalidade:** Verificar tempo e causalidade.

**Owner canonico:** AGENTS.md. Consultar antes de aplicar; nao copiar runtime nem criar gatilho ou executor paralelo.

**Procedimento:** INTENCAO -> CURRENT -> OWNER -> PROVA -> APLICAR METODO ORIGINAL -> CONTRAPROVA -> RECEIPT -> NEXT_CURSOR.

**Gates:** SOURCE_PRESENT, OWNER_RESOLVED, RUNTIME_OBSERVED avaliados separadamente. Metodo documentado nao prova execucao. Se nao aplicavel nesta rodada 40/40: NOOP_JUSTIFIED.

**Conexoes:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.

**Compatibilidade:** preservar a fonte e os aliases em .agents/skills ate validar todos os loaders.
